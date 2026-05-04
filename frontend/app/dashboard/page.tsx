'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, TrendingUp, Server, Zap, DollarSign } from 'lucide-react'
import AppCard from '@/components/dashboard/AppCard'
import StatsRow from '@/components/dashboard/StatsRow'
import { useSearchParams } from 'next/navigation'

// Mock data for demo — in production this comes from the backend API
const MOCK_APPS = [
  {
    id: '1',
    tool: 'wordpress',
    name: 'Main Website',
    url: 'pratham.idlistack.com',
    status: 'running',
    cpu: 12,
    ram: 38,
    uptime: '99.9%',
    deployedAt: '2024-04-01',
  },
  {
    id: '2',
    tool: 'listmonk',
    name: 'Newsletter',
    url: 'mail.pratham.idlistack.com',
    status: 'running',
    cpu: 5,
    ram: 22,
    uptime: '100%',
    deployedAt: '2024-04-03',
  },
  {
    id: '3',
    tool: 'mattermost',
    name: 'Team Chat',
    url: 'chat.pratham.idlistack.com',
    status: 'stopped',
    cpu: 0,
    ram: 0,
    uptime: '97.2%',
    deployedAt: '2024-04-05',
  },
]

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const isWelcome = searchParams.get('welcome') === 'true'
  const [apps, setApps] = useState(MOCK_APPS)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome banner */}
      {isWelcome && (
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5 flex items-center gap-4">
          <span className="text-3xl">🎉</span>
          <div>
            <p className="font-display font-bold text-ink">Welcome to Idlistack Portal!</p>
            <p className="text-ink/60 text-sm">Your organisation is set up. Deploy your first tool below.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Dashboard</h1>
          <p className="text-ink/50 text-sm mt-1">Manage your deployed apps</p>
        </div>
        <Link href="/deploy" className="btn-primary">
          <Plus size={16} /> Deploy App
        </Link>
      </div>

      {/* Stats */}
      <StatsRow apps={apps} />

      {/* Apps Grid */}
      <div>
        <h2 className="font-display font-bold text-xl text-ink mb-4">Your Apps</h2>
        {apps.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-4xl mb-4">🚀</p>
            <p className="font-display font-bold text-xl text-ink mb-2">No apps yet</p>
            <p className="text-ink/50 text-sm mb-6">Deploy your first open-source tool in one click.</p>
            <Link href="/deploy" className="btn-primary">
              <Plus size={15} /> Deploy your first app
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {apps.map(app => (
              <AppCard key={app.id} app={app} onUpdate={setApps} />
            ))}
          </div>
        )}
      </div>

      {/* Cost savings */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
            <DollarSign size={18} className="text-green-700" />
          </div>
          <h2 className="font-display font-bold text-lg text-ink">Monthly Savings</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'vs Wix Pro', saved: '₹3,500' },
            { label: 'vs Mailchimp', saved: '₹2,100' },
            { label: 'vs Slack Pro', saved: '₹4,200' },
          ].map(s => (
            <div key={s.label} className="bg-cream-dark rounded-xl p-4">
              <p className="text-2xl font-bold text-green-700 font-display">{s.saved}</p>
              <p className="text-xs text-ink/50 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-ink/40 mt-4 text-center">
          Total saved this month: <strong className="text-green-700">₹9,800</strong>
        </p>
      </div>
    </div>
  )
}
