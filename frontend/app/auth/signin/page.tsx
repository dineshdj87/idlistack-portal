'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowRight, Chrome } from 'lucide-react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await signIn('email', { email, callbackUrl: '/dashboard', redirect: false })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream grain flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🫙</span>
            <span className="font-display font-bold text-2xl text-ink">Idlistack</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-ink mb-2">Welcome back</h1>
          <p className="text-ink/50">Sign in to your portal</p>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-4">📬</div>
              <h2 className="font-display font-bold text-xl text-ink mb-2">Check your inbox</h2>
              <p className="text-ink/60 text-sm">We sent a magic link to <strong>{email}</strong>. Click it to sign in.</p>
            </div>
          ) : (
            <>
              {/* Google */}
              <button
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                className="w-full btn-secondary justify-center mb-4 py-3"
              >
                <Chrome size={18} />
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-cream-dark" />
                <span className="text-xs text-ink/30 font-medium">OR</span>
                <div className="flex-1 h-px bg-cream-dark" />
              </div>

              {/* Email magic link */}
              <form onSubmit={handleEmailSignIn} className="space-y-3">
                <input
                  type="email"
                  className="input"
                  placeholder="your@ngo.org"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary justify-center py-3"
                >
                  {loading ? 'Sending...' : <>Continue with Email <ArrowRight size={15} /></>}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-ink/40 mt-6">
          New here?{' '}
          <Link href="/onboarding" className="underline hover:text-ink/70">
            Create your organisation
          </Link>
        </p>
      </div>
    </div>
  )
}
