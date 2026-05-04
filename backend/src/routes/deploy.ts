import { FastifyInstance } from 'fastify'
import { query } from '../db/client'
import { deployApp } from '../services/docker.service'
import { v4 as uuidv4 } from 'uuid'

const VALID_TOOLS = ['wordpress', 'ghost', 'mattermost', 'listmonk']

export async function deployRoutes(app: FastifyInstance) {
  // POST /deploy — trigger a deployment
  app.post('/', async (req, res) => {
    const { tool, org_slug, app_name } = req.body as any

    // Validate tool
    if (!VALID_TOOLS.includes(tool)) {
      return res.status(400).send({ error: `Invalid tool. Choose from: ${VALID_TOOLS.join(', ')}` })
    }

    // Get org
    const orgResult = await query('SELECT * FROM organisations WHERE slug = $1', [org_slug])
    if (orgResult.rows.length === 0) {
      return res.status(404).send({ error: 'Organisation not found' })
    }
    const org = orgResult.rows[0]

    // Create deployment record
    const deploymentId = uuidv4()
    const subdomain = `${org_slug}.${process.env.BASE_DOMAIN || 'idlistack.com'}`
    const name = app_name || tool

    await query(
      `INSERT INTO deployments (id, org_id, tool, name, subdomain, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')`,
      [deploymentId, org.id, tool, name, subdomain]
    )

    // Fire deployment asynchronously
    deployApp({ tool, orgSlug: org_slug, appName: name, deploymentId })
      .then(async ({ url }) => {
        await query(
          `UPDATE deployments SET status = 'running', subdomain = $1, updated_at = NOW() WHERE id = $2`,
          [url, deploymentId]
        )
      })
      .catch(async (err) => {
        app.log.error('Deployment failed:', err)
        await query(
          `UPDATE deployments SET status = 'error', updated_at = NOW() WHERE id = $1`,
          [deploymentId]
        )
      })

    return res.status(202).send({
      deployment_id: deploymentId,
      url: subdomain,
      status: 'pending',
      message: 'Deployment started. Your app will be ready in ~60 seconds.',
    })
  })

  // GET /deploy/:id/status — poll deployment status
  app.get('/:id/status', async (req, res) => {
    const { id } = req.params as any
    const result = await query('SELECT status, subdomain, deployed_at FROM deployments WHERE id = $1', [id])
    if (result.rows.length === 0) return res.status(404).send({ error: 'Deployment not found' })
    return result.rows[0]
  })
}
