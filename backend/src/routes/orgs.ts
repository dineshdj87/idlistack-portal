import { FastifyInstance } from 'fastify'
import { query } from '../db/client'
import { v4 as uuidv4 } from 'uuid'

export async function orgRoutes(app: FastifyInstance) {
  // Create a new organisation (onboarding)
  app.post('/', async (req, res) => {
    const { name, slug, type, size, website, tools, admin_name, admin_email } = req.body as any

    // Validate slug uniqueness
    const existing = await query('SELECT id FROM organisations WHERE slug = $1', [slug])
    if (existing.rows.length > 0) {
      return res.status(409).send({ error: 'Slug already taken. Please choose a different organisation name.' })
    }

    // Create org
    const orgId = uuidv4()
    await query(
      'INSERT INTO organisations (id, name, slug, type, size, website) VALUES ($1,$2,$3,$4,$5,$6)',
      [orgId, name, slug, type, size, website]
    )

    // Create admin user
    await query(
      'INSERT INTO users (org_id, name, email, role) VALUES ($1,$2,$3,$4)',
      [orgId, admin_name, admin_email, 'admin']
    )

    return res.status(201).send({ id: orgId, slug, message: 'Organisation created successfully' })
  })

  // Get org details
  app.get('/:slug', async (req, res) => {
    const { slug } = req.params as any
    const result = await query('SELECT * FROM organisations WHERE slug = $1', [slug])
    if (result.rows.length === 0) return res.status(404).send({ error: 'Organisation not found' })
    return result.rows[0]
  })

  // List all deployments for an org
  app.get('/:slug/deployments', async (req, res) => {
    const { slug } = req.params as any
    const org = await query('SELECT id FROM organisations WHERE slug = $1', [slug])
    if (org.rows.length === 0) return res.status(404).send({ error: 'Organisation not found' })

    const deployments = await query(
      'SELECT * FROM deployments WHERE org_id = $1 ORDER BY deployed_at DESC',
      [org.rows[0].id]
    )
    return deployments.rows
  })
}
