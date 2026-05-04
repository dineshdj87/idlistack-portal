'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Check, Building2, Globe, Wrench } from 'lucide-react'
import axios from 'axios'

const TOOLS = [
  { id: 'wordpress', name: 'WordPress', desc: 'Website & content management', icon: '🌐' },
  { id: 'ghost', name: 'Ghost', desc: 'Newsletter & memberships', icon: '👻' },
  { id: 'mattermost', name: 'Mattermost', desc: 'Team communication', icon: '💬' },
  { id: 'listmonk', name: 'Listmonk', desc: 'Email campaigns', icon: '📧' },
]

const ORG_SIZES = ['1–5 people', '6–20 people', '21–100 people', '100+ people']
const ORG_TYPES = ['NGO / Nonprofit', 'Social Enterprise', 'Community Group', 'Educational Institution', 'Other']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    orgName: '',
    orgSlug: '',
    orgType: '',
    orgSize: '',
    website: '',
    selectedTools: [] as string[],
    adminName: '',
    adminEmail: '',
  })

  const totalSteps = 3
  const progress = (step / totalSteps) * 100

  function updateForm(key: string, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (key === 'orgName') {
      setForm(prev => ({
        ...prev,
        orgName: value,
        orgSlug: value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      }))
    }
  }

  function toggleTool(id: string) {
    setForm(prev => ({
      ...prev,
      selectedTools: prev.selectedTools.includes(id)
        ? prev.selectedTools.filter(t => t !== id)
        : [...prev.selectedTools, id]
    }))
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      await axios.post(`${process.env.BACKEND_URL}/orgs`, {
        name: form.orgName,
        slug: form.orgSlug,
        type: form.orgType,
        size: form.orgSize,
        website: form.website,
        tools: form.selectedTools,
        admin_name: form.adminName,
        admin_email: form.adminEmail,
      })
      router.push('/dashboard?welcome=true')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream grain flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-3xl mb-3 block">🫙</span>
          <h1 className="font-display text-3xl font-bold text-ink mb-1">Set up your organisation</h1>
          <p className="text-ink/50 text-sm">Takes less than 2 minutes</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-ink/40 mb-2 font-medium">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full h-1.5 bg-cream-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="card p-8">
          {/* Step 1: Org Info */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                  <Building2 size={20} className="text-brand-700" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-ink">About your organisation</h2>
                  <p className="text-ink/50 text-xs">Tell us who you are</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-ink/70 mb-1.5 block">Organisation Name *</label>
                <input
                  className="input"
                  placeholder="Pratham Foundation"
                  value={form.orgName}
                  onChange={e => updateForm('orgName', e.target.value)}
                />
                {form.orgSlug && (
                  <p className="text-xs text-ink/40 mt-1.5 font-mono">
                    Your URL: <span className="text-brand-600">{form.orgSlug}.idlistack.com</span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-ink/70 mb-1.5 block">Organisation Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {ORG_TYPES.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateForm('orgType', type)}
                      className={`text-sm px-3 py-2.5 rounded-xl border text-left transition-all duration-150 ${
                        form.orgType === type
                          ? 'bg-brand-50 border-brand-400 text-brand-700 font-semibold'
                          : 'border-cream-dark hover:border-brand-200 text-ink/60'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-ink/70 mb-1.5 block">Team Size *</label>
                <div className="grid grid-cols-2 gap-2">
                  {ORG_SIZES.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updateForm('orgSize', size)}
                      className={`text-sm px-3 py-2.5 rounded-xl border transition-all duration-150 ${
                        form.orgSize === size
                          ? 'bg-brand-50 border-brand-400 text-brand-700 font-semibold'
                          : 'border-cream-dark hover:border-brand-200 text-ink/60'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-ink/70 mb-1.5 block">Website (optional)</label>
                <input
                  className="input"
                  placeholder="https://yourorg.org"
                  value={form.website}
                  onChange={e => updateForm('website', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Tool Selection */}
          {step === 2 && (
            <div className="animate-fade-in-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                  <Wrench size={20} className="text-brand-700" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-ink">Pick your tools</h2>
                  <p className="text-ink/50 text-xs">You can add more later</p>
                </div>
              </div>

              <div className="space-y-3">
                {TOOLS.map(tool => {
                  const selected = form.selectedTools.includes(tool.id)
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => toggleTool(tool.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${
                        selected
                          ? 'bg-brand-50 border-brand-400'
                          : 'bg-white border-cream-dark hover:border-brand-200'
                      }`}
                    >
                      <span className="text-2xl">{tool.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-ink text-sm">{tool.name}</div>
                        <div className="text-ink/50 text-xs">{tool.desc}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selected ? 'bg-brand-500 border-brand-500' : 'border-cream-dark'
                      }`}>
                        {selected && <Check size={12} className="text-white" />}
                      </div>
                    </button>
                  )
                })}
              </div>

              {form.selectedTools.length > 0 && (
                <div className="mt-5 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-700 font-medium">
                    💡 You'll save approx. <strong>₹{form.selectedTools.length * 1800}/month</strong> vs paid alternatives
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Admin Details */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                  <Globe size={20} className="text-brand-700" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-ink">Your details</h2>
                  <p className="text-ink/50 text-xs">Almost there!</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-ink/70 mb-1.5 block">Your Name *</label>
                <input
                  className="input"
                  placeholder="Ananya Sharma"
                  value={form.adminName}
                  onChange={e => updateForm('adminName', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-ink/70 mb-1.5 block">Work Email *</label>
                <input
                  type="email"
                  className="input"
                  placeholder="ananya@pratham.org"
                  value={form.adminEmail}
                  onChange={e => updateForm('adminEmail', e.target.value)}
                />
              </div>

              {/* Summary */}
              <div className="bg-cream-dark rounded-xl p-4 space-y-2 text-sm">
                <p className="font-semibold text-ink text-xs uppercase tracking-wide mb-2">Summary</p>
                <div className="flex justify-between"><span className="text-ink/60">Organisation</span><span className="font-medium">{form.orgName || '—'}</span></div>
                <div className="flex justify-between"><span className="text-ink/60">URL</span><span className="font-mono text-brand-600 text-xs">{form.orgSlug}.idlistack.com</span></div>
                <div className="flex justify-between"><span className="text-ink/60">Tools</span><span className="font-medium">{form.selectedTools.length} selected</span></div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)} className="btn-ghost">
                <ArrowLeft size={15} /> Back
              </button>
            ) : <div />}

            {step < totalSteps ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="btn-primary"
                disabled={
                  step === 1 && (!form.orgName || !form.orgType || !form.orgSize)
                }
              >
                Continue <ArrowRight size={15} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !form.adminName || !form.adminEmail}
                className="btn-primary"
              >
                {loading ? 'Setting up...' : <>Launch Portal <ArrowRight size={15} /></>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
