'use client'
import { useState } from 'react'
import { ExternalLink, Play, Square, Trash2, RefreshCw } from 'lucide-react'
import axios from 'axios'

const TOOL_META: Record<string, { icon: string; color: string }> = {
  wordpress: { icon: '🌐', color: 'bg-blue-50 border-blue-100' },
  ghost: { icon: '👻', color: 'bg-purple-50 border-purple-100' },
  mattermost: { icon: '💬', color: 'bg-green-50 border-green-100' },
  listmonk: { icon: '📧', color: 'bg-orange-50 border-orange-100' },
}

interface App {
  id: string; tool: string; name: string; url: string;
  status: string; cpu: number; ram: number; uptime: string; deployedAt: string;
}

export default function AppCard({ app, onUpdate }: { app: App; onUpdate: any }) {
  const [loading, setLoading] = useState(false)
  const meta = TOOL_META[app.tool] || { icon: '📦', color: 'bg-gray-50 border-gray-100' }

  async function controlApp(action: 'start' | 'stop' | 'restart') {
    setLoading(true)
    try {
      await axios.post(`${process.env.BACKEND_URL}/apps/${app.id}/${action}`)
      onUpdate((prev: App[]) => prev.map(a =>
        a.id === app.id
          ? { ...a, status: action === 'stop' ? 'stopped' : 'running' }
          : a
      ))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`card p-5 border ${meta.color} hover:shadow-md transition-shadow duration-200`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{meta.icon}</span>
          <div>
            <p className="font-semibold text-ink text-sm">{app.name}</p>
            <a
              href={`https://${app.url}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-brand-600 hover:underline flex items-center gap-1"
            >
              {app.url} <ExternalLink size={10} />
            </a>
          </div>
        </div>
        <span className={app.status === 'running' ? 'badge-running' : app.status === 'stopped' ? 'badge-stopped' : 'badge-pending'}>
          <span className={`w-1.5 h-1.5 rounded-full ${app.status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
          {app.status}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        {[
          { label: 'CPU', value: `${app.cpu}%` },
          { label: 'RAM', value: `${app.ram}%` },
          { label: 'Uptime', value: app.uptime },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-lg py-2 px-1 border border-white/70">
            <p className="text-base font-bold font-display text-ink">{m.value}</p>
            <p className="text-xs text-ink/40">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {app.status === 'running' ? (
          <button onClick={() => controlApp('stop')} disabled={loading} className="flex-1 btn-secondary text-xs py-2 justify-center">
            <Square size={13} /> Stop
          </button>
        ) : (
          <button onClick={() => controlApp('start')} disabled={loading} className="flex-1 btn-primary text-xs py-2 justify-center">
            <Play size={13} /> Start
          </button>
        )}
        <button onClick={() => controlApp('restart')} disabled={loading} className="btn-ghost p-2">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
        <button className="btn-ghost p-2 text-red-400 hover:text-red-600 hover:bg-red-50">
          <Trash2 size={14} />
        </button>
      </div>

      <p className="text-xs text-ink/30 mt-3">Deployed {new Date(app.deployedAt).toLocaleDateString('en-IN')}</p>
    </div>
  )
}
