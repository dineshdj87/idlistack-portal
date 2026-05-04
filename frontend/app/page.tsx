import Link from 'next/link'
import { ArrowRight, Zap, Shield, Globe, Users, Heart } from 'lucide-react'

const tools = [
  { name: 'WordPress', desc: 'Website & CMS', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Ghost', desc: 'Newsletter & Blog', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { name: 'Mattermost', desc: 'Team Chat', color: 'bg-green-50 text-green-700 border-green-200' },
  { name: 'Listmonk', desc: 'Email Campaigns', color: 'bg-orange-50 text-orange-700 border-orange-200' },
]

const features = [
  { icon: Zap, title: 'One-Click Deploy', desc: 'Spin up WordPress, Ghost, Mattermost or Listmonk in under 60 seconds. No DevOps expertise needed.' },
  { icon: Globe, title: 'Auto Subdomain', desc: 'Every app gets its own subdomain instantly — e.g. yourorg.idlistack.com — with SSL included.' },
  { icon: Shield, title: 'Always Secure', desc: 'HTTPS by default, automated backups, and role-based access so your data stays safe.' },
  { icon: Users, title: 'Built for NGOs', desc: 'Pricing and tooling designed around the real constraints nonprofits face every day.' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream grain">
      {/* Nav */}
      <nav className="border-b border-cream-dark bg-white/70 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🫙</span>
            <span className="font-display font-bold text-xl text-ink">Idlistack</span>
            <span className="text-xs bg-brand-100 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-full font-semibold">Beta</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin" className="btn-ghost text-sm">Sign in</Link>
            <Link href="/onboarding" className="btn-primary text-sm">
              Get Started <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-full px-4 py-1.5 text-sm font-medium text-brand-700 mb-8">
          <Heart size={14} className="fill-brand-500 text-brand-500" />
          Tech That Gives a Damn — now with a self-service portal
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-bold text-ink leading-tight mb-6">
          Open-source tools,<br />
          <span className="text-brand-600">deployed in seconds.</span>
        </h1>
        <p className="text-ink/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          No engineers. No complexity. No surprise bills. Just powerful open-source software,
          ready for your nonprofit in one click.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/onboarding" className="btn-primary px-8 py-3 text-base">
            Start for free <ArrowRight size={16} />
          </Link>
          <Link href="/dashboard" className="btn-secondary px-8 py-3 text-base">
            View Demo Dashboard
          </Link>
        </div>

        {/* Tool pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-14">
          {tools.map(t => (
            <span key={t.name} className={`inline-flex items-center gap-2 border rounded-full px-4 py-2 text-sm font-semibold ${t.color}`}>
              {t.name}
              <span className="font-normal opacity-70">{t.desc}</span>
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 hover:shadow-md transition-shadow duration-200">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
                <Icon size={20} className="text-brand-700" />
              </div>
              <h3 className="font-display font-bold text-lg text-ink mb-2">{title}</h3>
              <p className="text-ink/60 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-ink rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900/30 to-transparent" />
          <div className="relative z-10">
            <h2 className="font-display text-4xl font-bold text-cream mb-4">
              Ready to simplify your tech stack?
            </h2>
            <p className="text-cream/60 text-lg mb-8">
              Join nonprofits already building impact with Idlistack.
            </p>
            <Link href="/onboarding" className="btn-primary bg-brand-400 hover:bg-brand-300 text-ink px-10 py-3.5 text-base">
              Become an Early Stacker <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cream-dark py-8 text-center text-ink/40 text-sm">
        <span>🫙 Idlistack — by </span>
        <a href="https://idlistack.com" className="underline hover:text-ink/70">Tech4Good Community</a>
        <span> · Made with ♥ in Bengaluru</span>
      </footer>
    </div>
  )
}
