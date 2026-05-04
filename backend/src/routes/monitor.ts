import { FastifyInstance } from 'fastify'
import { query } from '../db/client'
import { getStats } from '../services/docker.service'
import { sendAlert } from '../services/email.service'

const CPU_THRESHOLD = 80  // percent
const RAM_THRESHOLD = 85  // percent

export async function monitorRoutes(app: FastifyInstance) {
  // GET /monitor/:orgSlug — get stats for all org deployments
  app.get('/:orgSlug', async (req, res) => {
    const { orgSlug } = req.params as any

    const org = await query('SELECT id FROM organisations WHERE slug = $1', [orgSlug])
    if (org.rows.length === 0) return res.status(404).send({ error: 'Organisation not found' })

    const deployments = await query(
      'SELECT * FROM deployments WHERE org_id = $1',
      [org.rows[0].id]
    )

    // Fetch live stats for running containers
    const results = await Promise.all(
      deployments.rows.map(async (d) => {
        if (d.status === 'running' && d.container_id) {
          const stats = await getStats(d.container_id)
          return { ...d, ...stats }
        }
        return d
      })
    )

    return results
  })

  /**
   * Background monitoring job — call this on a cron (e.g. every 60s)
   * GET /monitor/cron/run
   */
  app.get('/cron/run', async (req, res) => {
    const deployments = await query(
      `SELECT d.*, o.name as org_name, u.email as admin_email
       FROM deployments d
       JOIN organisations o ON o.id = d.org_id
       JOIN users u ON u.org_id = o.id AND u.role = 'admin'
       WHERE d.status = 'running' AND d.container_id IS NOT NULL
       LIMIT 100`
    )

    let checked = 0
    let alerts = 0

    for (const d of deployments.rows) {
      try {
        const stats = await getStats(d.container_id)

        // Update stats in DB
        await query(
          'UPDATE deployments SET cpu_percent = $1, ram_percent = $2, updated_at = NOW() WHERE id = $3',
          [stats.cpu, stats.ram, d.id]
        )

        // Check CPU threshold
        if (stats.cpu > CPU_THRESHOLD) {
          await sendAlert({
            to: d.admin_email,
            orgName: d.org_name,
            appName: d.name,
            type: 'high_cpu',
            detail: `${stats.cpu}% CPU usage`,
          })
          alerts++
        }

        // Check RAM threshold
        if (stats.ram > RAM_THRESHOLD) {
          await sendAlert({
            to: d.admin_email,
            orgName: d.org_name,
            appName: d.name,
            type: 'high_ram',
            detail: `${stats.ram}% RAM usage`,
          })
          alerts++
        }

        checked++
      } catch (err) {
        app.log.error(`Monitor error for deployment ${d.id}:`, err)
      }
    }

    return { checked, alerts, timestamp: new Date().toISOString() }
  })

  // GET /monitor/alerts/:orgSlug
  app.get('/alerts/:orgSlug', async (req, res) => {
    const { orgSlug } = req.params as any
    const org = await query('SELECT id FROM organisations WHERE slug = $1', [orgSlug])
    if (org.rows.length === 0) return res.status(404).send({ error: 'Not found' })

    const alerts = await query(
      `SELECT a.*, d.name as app_name FROM alerts a
       JOIN deployments d ON d.id = a.deployment_id
       WHERE a.org_id = $1
       ORDER BY a.sent_at DESC LIMIT 50`,
      [org.rows[0].id]
    )
    return alerts.rows
  })
}
