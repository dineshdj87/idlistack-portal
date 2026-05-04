import Fastify from 'fastify'
import cors from '@fastify/cors'
import dotenv from 'dotenv'
import { orgRoutes } from './routes/orgs'
import { deployRoutes } from './routes/deploy'
import { appRoutes } from './routes/apps'
import { monitorRoutes } from './routes/monitor'

dotenv.config()

const app = Fastify({ logger: true })

// Register CORS
app.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
})

// Health check
app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

// Register routes
app.register(orgRoutes, { prefix: '/orgs' })
app.register(deployRoutes, { prefix: '/deploy' })
app.register(appRoutes, { prefix: '/apps' })
app.register(monitorRoutes, { prefix: '/monitor' })

// Start server
const PORT = parseInt(process.env.PORT || '4000', 10)
app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`🚀 Idlistack backend running on port ${PORT}`)
})
