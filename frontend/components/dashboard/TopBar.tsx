'use client'
import { Bell, LogOut } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'

export default function TopBar() {
  const { data: session } = useSession()

  return (
    <header className="h-14 bg-white border-b border-cream-dark px-6 flex items-center justify-between shrink-0">
      <p className="text-sm text-ink/40">
        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      <div className="flex items-center gap-3">
        <button className="btn-ghost p-2 relative">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-cream-dark">
          <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">
            {session?.user?.name?.[0] || 'U'}
          </div>
          <span className="text-sm font-medium text-ink">{session?.user?.name || 'Admin'}</span>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/' })} className="btn-ghost p-2 text-ink/40">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
