'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Rocket, BarChart2, Settings, Bell, HelpCircle } from 'lucide-react'
import { clsx } from 'clsx'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/deploy', label: 'Deploy', icon: Rocket },
  { href: '/dashboard/monitor', label: 'Monitor', icon: BarChart2 },
  { href: '/dashboard/alerts', label: 'Alerts', icon: Bell },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-cream-dark flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-cream-dark">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🫙</span>
          <span className="font-display font-bold text-lg text-ink">Idlistack</span>
        </Link>
      </div>

      {/* Org badge */}
      <div className="px-5 py-4 border-b border-cream-dark">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700">P</div>
          <div>
            <p className="text-sm font-semibold text-ink leading-tight">Pratham Foundation</p>
            <p className="text-xs text-ink/40">pratham.idlistack.com</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={clsx('sidebar-link', active && 'active')}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Help */}
      <div className="px-3 py-4 border-t border-cream-dark">
        <a
          href="https://idlistack.com"
          target="_blank"
          rel="noreferrer"
          className="sidebar-link"
        >
          <HelpCircle size={17} />
          Help & Docs
        </a>
      </div>
    </aside>
  )
}
