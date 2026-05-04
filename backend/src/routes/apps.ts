import { FastifyInstance } from 'fastify'
import { query } from '../db/client'
import { startApp, stopApp, restartApp, removeApp } from '../services/docker.service'

export async function appRoutes(app: FastifyInstance) {
  // GET /apps/:id
  app.get('/:id', async (req, res) => {
    const { id } = req.params as any
    const result = await query('SELECT * FROM deployments WHERE id = $1', [id])
    if (result.rows.length === 0) return res.status(404).send({ error: 'App not found' })
    return result.rows[0]
  })

  // POST /apps/:id/start
  app.post('/:id/start', async (req, res) => {
    const { id } = req.params as any
    await startApp(id)
    await query(`UPDATE deployments SET status = 'running', updated_at = NOW() WHERE id = $1`, [id])
    return { message: 'App started', status: 'running' }
  })

  // POST /apps/:id/stop
  app.post('/:id/stop', async (req, res) => {
    const { id } = req.params as any
    await stopApp(id)
    await query(`UPDATE deployments SET status = 'stopped', updated_at = NOW() WHERE id = $1`, [id])
    return { message: 'App stopped', status: 'stopped' }
  })

  // POST /apps/:id/restart
  app.post('/:id/restart', async (req, res) => {
    const { id } = req.params as any
    await restartApp(id)
    await query(`UPDATE deployments SET status = 'running', updated_at = NOW() WHERE id = $1`, [id])
    return { message: 'App restarted', status: 'running' }
  })

  // DELETE /apps/:id
  app.delete('/:id', async (req, res) => {
    const { id } = req.params as any
    await removeApp(id)
    await query('DELETE FROM deployments WHERE id = $1', [id])
    return { message: 'App deleted' }
  })
}
