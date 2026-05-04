import { Server, CheckCircle2, XCircle, TrendingUp } from 'lucide-react'

interface App { status: string; cpu: number; ram: number }

export default function StatsRow({ apps }: { apps: App[] }) {
  const running = apps.filter(a => a.status === 'running').length
  const stopped = apps.filter(a => a.status === 'stopped').length
  const avgCpu = apps.length ? Math.round(apps.reduce((s, a) => s + a.cpu, 0) / apps.length) : 0

  const stats = [
    { label: 'Total Apps', value: apps.length, icon: Server, color: 'bg-blue-50 text-blue-700' },
    { label: 'Running', value: running, icon: CheckCircle2, color: 'bg-green-50 text-green-700' },
    { label: 'Stopped', value: stopped, icon: XCircle, color: 'bg-red-50 text-red-700' },
    { label: 'Avg CPU', value: `${avgCpu}%`, icon: TrendingUp, color: 'bg-brand-50 text-brand-700' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="stat-card">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color} mb-3`}>
            <Icon size={18} />
          </div>
          <p className="text-2xl font-bold font-display text-ink">{value}</p>
          <p className="text-xs text-ink/50 font-medium">{label}</p>
        </div>
      ))}
    </div>
  )
}
