import Dockerode from 'dockerode'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const docker = new Dockerode({ socketPath: '/var/run/docker.sock' })

const TEMPLATES_DIR = path.join(__dirname, '../../../infra/templates')
const BASE_DOMAIN = process.env.BASE_DOMAIN || 'idlistack.com'

export interface DeployOptions {
  tool: string
  orgSlug: string
  appName: string
  deploymentId: string
}

export interface ContainerStats {
  cpu: number
  ram: number
  containerId: string
}

/**
 * Deploy an app using Docker Compose template
 */
export async function deployApp(opts: DeployOptions): Promise<{ url: string; containerId?: string }> {
  const { tool, orgSlug, deploymentId } = opts
  const subdomain = `${orgSlug}.${BASE_DOMAIN}`

  const templatePath = path.join(TEMPLATES_DIR, `${tool}.yml`)
  if (!fs.existsSync(templatePath)) {
    throw new Error(`No template found for tool: ${tool}`)
  }

  // Read and interpolate template
  let compose = fs.readFileSync(templatePath, 'utf-8')
    .replace(/\{\{ORG_SLUG\}\}/g, orgSlug)
    .replace(/\{\{DOMAIN\}\}/g, subdomain)
    .replace(/\{\{DEPLOYMENT_ID\}\}/g, deploymentId)

  // Write temporary compose file
  const tmpPath = `/tmp/idlistack-${deploymentId}.yml`
  fs.writeFileSync(tmpPath, compose)

  try {
    // Create network if not exists
    await ensureNetwork('idlistack-net')

    // Deploy via docker compose
    execSync(`docker compose -f ${tmpPath} up -d`, { stdio: 'pipe' })

    return { url: subdomain }
  } finally {
    // Cleanup temp file
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath)
  }
}

/**
 * Stop a running deployment
 */
export async function stopApp(deploymentId: string): Promise<void> {
  const containers = await docker.listContainers({
    filters: { label: [`idlistack.deployment=${deploymentId}`] }
  })

  await Promise.all(
    containers.map(c => docker.getContainer(c.Id).stop())
  )
}

/**
 * Start a stopped deployment
 */
export async function startApp(deploymentId: string): Promise<void> {
  const containers = await docker.listContainers({
    all: true,
    filters: { label: [`idlistack.deployment=${deploymentId}`] }
  })

  await Promise.all(
    containers.map(c => docker.getContainer(c.Id).start())
  )
}

/**
 * Restart a deployment
 */
export async function restartApp(deploymentId: string): Promise<void> {
  const containers = await docker.listContainers({
    filters: { label: [`idlistack.deployment=${deploymentId}`] }
  })

  await Promise.all(
    containers.map(c => docker.getContainer(c.Id).restart())
  )
}

/**
 * Remove all containers for a deployment
 */
export async function removeApp(deploymentId: string): Promise<void> {
  const containers = await docker.listContainers({
    all: true,
    filters: { label: [`idlistack.deployment=${deploymentId}`] }
  })

  for (const c of containers) {
    const container = docker.getContainer(c.Id)
    try { await container.stop() } catch {}
    await container.remove({ v: true })
  }
}

/**
 * Get CPU and RAM stats for a deployment
 */
export async function getStats(containerId: string): Promise<{ cpu: number; ram: number }> {
  try {
    const container = docker.getContainer(containerId)
    const stats = await container.stats({ stream: false }) as any

    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage
    const sysDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage
    const numCPUs = stats.cpu_stats.online_cpus || 1
    const cpu = (cpuDelta / sysDelta) * numCPUs * 100

    const memUsed = stats.memory_stats.usage - (stats.memory_stats.stats?.cache || 0)
    const memLimit = stats.memory_stats.limit
    const ram = (memUsed / memLimit) * 100

    return {
      cpu: Math.round(cpu * 10) / 10,
      ram: Math.round(ram * 10) / 10,
    }
  } catch {
    return { cpu: 0, ram: 0 }
  }
}

async function ensureNetwork(name: string) {
  const networks = await docker.listNetworks({ filters: { name: [name] } })
  if (networks.length === 0) {
    await docker.createNetwork({ Name: name, Driver: 'bridge' })
  }
}
