import nodemailer from 'nodemailer'
import axios from 'axios'

const LISTMONK_URL = process.env.LISTMONK_URL || 'http://localhost:9000'
const LISTMONK_USER = process.env.LISTMONK_USER || 'admin'
const LISTMONK_PASS = process.env.LISTMONK_PASS || 'admin'

/**
 * Send a transactional alert email via Listmonk (Idlistack's own tool!)
 * Falls back to SMTP if Listmonk is unavailable.
 */
export async function sendAlert(opts: {
  to: string
  orgName: string
  appName: string
  type: 'down' | 'high_cpu' | 'high_ram' | 'recovered'
  detail?: string
}) {
  const { to, orgName, appName, type, detail } = opts

  const subjects: Record<typeof type, string> = {
    down: `🔴 App Down: ${appName}`,
    high_cpu: `⚠️ High CPU Alert: ${appName}`,
    high_ram: `⚠️ High RAM Alert: ${appName}`,
    recovered: `✅ App Recovered: ${appName}`,
  }

  const bodies: Record<typeof type, string> = {
    down: `Your app <strong>${appName}</strong> on Idlistack is currently unreachable. We're looking into it.`,
    high_cpu: `<strong>${appName}</strong> is experiencing high CPU usage${detail ? `: ${detail}` : ''}. Consider restarting or scaling up.`,
    high_ram: `<strong>${appName}</strong> is running low on memory${detail ? `: ${detail}` : ''}. Consider restarting or scaling up.`,
    recovered: `Great news! <strong>${appName}</strong> has recovered and is running normally again.`,
  }

  const html = `
    <div style="font-family: DM Sans, sans-serif; max-width: 480px; margin: 0 auto;">
      <div style="background: #1a1208; padding: 24px; border-radius: 16px 16px 0 0;">
        <p style="color: #fdf8f0; font-size: 20px; font-weight: bold; margin: 0;">🫙 Idlistack Alert</p>
        <p style="color: #fdf8f0; opacity: 0.5; font-size: 12px; margin: 4px 0 0;">${orgName}</p>
      </div>
      <div style="background: #fdf8f0; padding: 24px; border-radius: 0 0 16px 16px; border: 1px solid #f5ede0;">
        <p style="font-size: 16px; color: #1a1208;">${bodies[type]}</p>
        <p style="font-size: 12px; color: #1a1208; opacity: 0.4; margin-top: 24px;">
          Sent from Idlistack Portal · ${new Date().toLocaleString('en-IN')}
        </p>
      </div>
    </div>
  `

  // Try Listmonk transactional API first
  try {
    await axios.post(
      `${LISTMONK_URL}/api/tx`,
      {
        subscriber_email: to,
        template_id: 1,
        data: { subject: subjects[type], body: html },
      },
      {
        auth: { username: LISTMONK_USER, password: LISTMONK_PASS },
        timeout: 5000,
      }
    )
    return
  } catch {
    // Fall back to SMTP
  }

  // SMTP fallback
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })

  await transporter.sendMail({
    from: `"Idlistack" <${process.env.EMAIL_FROM || 'noreply@idlistack.com'}>`,
    to,
    subject: subjects[type],
    html,
  })
}
