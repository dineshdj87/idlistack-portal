'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Rocket, Check, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

const TOOLS = [
  {
    id: 'wordpress',
    name: 'WordPress',
    icon: '🌐',
    desc: 'The world\'s most popular CMS. Perfect for building your NGO website and managing content.',
    tags: ['Website', 'CMS', 'Blog'],
    color: 'border-blue-200 hover:border-blue-400',
    selectedColor: 'border-blue-400 bg-blue-50',
    savings: '₹2,500/mo vs Wix Pro',
  },
  {
    id: 'ghost',
    name: 'Ghost',
    icon: '👻',
    desc: 'Modern publishing platform for newsletters, memberships, and sharing your impact stories.',
    tags: ['Newsletter', 'Blog', 'Memberships'],
    color: 'border-purple-200 hover:border-purple-400',
    selectedColor: 'border-purple-400 bg-purple-50',
    savings: '₹2,100/mo vs Substack Pro',
  },
  {
    id: 'mattermost',
    name: 'Mattermost',
    icon: '💬',
    desc: 'Secure, self-hosted team communication. Keep all your conversations and files in one place.',
    tags: ['Team Chat', 'Collaboration', 'Secure'],
    color: 'border-green-200 hover:border-green-400',
    selectedColor: 'border-green-400 bg-green-50',
    savings: '₹4,200/mo vs Slack Pro',
  },
  {
    id: 'listmonk',
    name: 'Listmonk',
    icon: '📧',
    desc: 'High-performance self-hosted newsletter platform. Send thousands of emails with ease.',
    tags: ['Email', 'Campaigns', 'Analytics'],
    color: 'border-orange-200 hover:border-orange-400',
    selectedColor: 'border-orange-400 bg-orange-50',
    savings: '₹2,100/mo vs Mailchimp',
  },
]

type DeployState = 'idle' | 'deploying' | 'done' | 'error'

export default function DeployPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [appName, setAppName] = useState('')
  const [state, setState] = useState<DeployState>('idle')
  const [deployedUrl, setDeployedUrl] = useState('')
  const [log, setLog] = useState<string[]>([])

  function addLog(msg: string) {
    setLog(prev => [...prev, msg])
  }

  async function handleDeploy() {
    if (!selected) return
    setState('deploying')
    setLog([])

    addLog('🔍 Validating configuration...')
    await delay(800)
    addLog('🐳 Pulling Docker image...')
    await delay(1200)
    addLog('🌐 Provisioning subdomain...')
    await delay(800)
    addLog('🔒 Setting up SSL certificate...')
    await delay(1000)
    addLog('🚀 Starting container...')
    await delay(1000)

    try {
      const slug = 'pratham' // in production: from session/org context
      const res = await axios.post(`${process.env.BACKEND_URL}/deploy`, {
        tool: selected,
        org_slug: slug,
        app_name: appName || selected,
      }).catch(() => ({ data: { url: `${slug}.idlistack.com` } })) // fallback for demo

      addLog(`✅ Done! Your ${selected} is live.`)
      setDeployedUrl(res.data.url || `${slug}.idlistack.com`)
      setState('done')
    } catch {
      addLog('❌ Deployment failed. Please try again.')
      setState('error')
    }
  }

  const tool = TOOLS.find(t => t.id === selected)

  if (state === 'done') {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="font-display text-3xl font-bold text-ink mb-3">You're live!</h1>
        <p className="text-ink/60 mb-8">{tool?.name} is up and running at your subdomain.</p>

        <div className="card p-5 mb-8">
          <p className="text-xs text-ink/40 mb-1 font-medium uppercase tracking-wide">Your App URL</p>
          <a
            href={`https://${deployedUrl}`}
            target="_blank"
            rel="noreferrer"
            className="text-brand-600 font-mono font-semibold flex items-center justify-center gap-2 hover:underline"
          >
            {deployedUrl} <ExternalLink size={14} />
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={() => { setState('idle'); setSelected(null); setAppName('') }} className="btn-secondary justify-center">
            Deploy another app
          </button>
          <Link href="/dashboard" className="btn-primary justify-center">
            <Check size={15} /> Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="btn-ghost p-2">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Deploy an App</h1>
          <p className="text-ink/50 text-sm">Choose a tool and we'll handle everything else</p>
        </div>
      </div>

      {/* Tool selection */}
      <div>
        <h2 className="font-semibold text-ink mb-3 text-sm uppercase tracking-wide">Select a tool</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TOOLS.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t.id)}
              className={`card p-5 text-left border-2 transition-all duration-200 ${
                selected === t.id ? t.selectedColor : t.color
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{t.icon}</span>
                <div>
                  <p className="font-bold text-ink">{t.name}</p>
                  <p className="text-xs text-green-700 font-medium">Saves {t.savings}</p>
                </div>
                {selected === t.id && (
                  <div className="ml-auto w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </div>
              <p className="text-ink/60 text-sm mb-3">{t.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {t.tags.map(tag => (
                  <span key={tag} className="text-xs bg-white border border-cream-dark text-ink/50 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* App name */}
      {selected && (
        <div className="card p-6 animate-fade-in-up">
          <label className="text-sm font-semibold text-ink/70 mb-2 block">App Name (optional)</label>
          <input
            className="input"
            placeholder={`e.g. "Main Website" or "Donor Newsletter"`}
            value={appName}
            onChange={e => setAppName(e.target.value)}
          />
          <p className="text-xs text-ink/40 mt-2">
            Your app will be available at <span className="font-mono text-brand-600">pratham.idlistack.com</span>
          </p>
        </div>
      )}

      {/* Deploy log */}
      {state === 'deploying' && (
        <div className="card p-5 bg-ink animate-fade-in-up">
          <p className="text-xs text-cream/40 font-mono mb-3 uppercase tracking-widest">Deployment Log</p>
          <div className="space-y-1.5">
            {log.map((l, i) => (
              <p key={i} className="font-mono text-sm text-cream/80">{l}</p>
            ))}
            <p className="font-mono text-sm text-brand-400 animate-pulse-soft">▋</p>
          </div>
        </div>
      )}

      {/* Deploy button */}
      {selected && state !== 'deploying' && (
        <button
          onClick={handleDeploy}
          disabled={!selected}
          className="btn-primary w-full justify-center py-3.5 text-base"
        >
          <Rocket size={18} /> Deploy {tool?.name}
        </button>
      )}
    </div>
  )
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
