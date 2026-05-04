import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

export const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'idlistack',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 10,
  idleTimeoutMillis: 30000,
})

db.on('error', (err) => {
  console.error('Unexpected database error:', err)
})

export async function query(sql: string, params?: any[]) {
  const client = await db.connect()
  try {
    return await client.query(sql, params)
  } finally {
    client.release()
  }
}
