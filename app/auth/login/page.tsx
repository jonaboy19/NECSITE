'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, ArrowLeft, Loader2, CheckCircle, Info } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

export default function Login() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const callbackError = params.get('error')
    const callbackMessage = params.get('message')
    if (callbackError) setError(callbackError)
    if (callbackMessage) setMessage(callbackMessage)
  }, [])

  const getRedirectTo = () => {
    const params = new URLSearchParams(window.location.search)
    const next = params.get('redirect') || params.get('next') || '/dashboard'
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: {
        emailRedirectTo: getRedirectTo(),
        shouldCreateUser: false,
      }
    })

    if (error) {
      setError(error.message)
      trackEvent('auth_login_failed', { method: 'magic_link', reason: error.message })
    } else {
      setSent(true)
      trackEvent('auth_magic_link_sent', { flow: 'login' })
    }
    setLoading(false)
  }

  const handleGithubLogin = async () => {
    setOauthLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: getRedirectTo(),
      },
    })
    if (error) {
      setError(error.message)
      setOauthLoading(false)
      trackEvent('auth_login_failed', { method: 'github', reason: error.message })
    }
  }

  return (
    <div className="min-h-screen bg-kaf-bg text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-kaf-border/50">
        <Link href="/" className="flex items-center gap-3 group">
          <Image src="/kaf-logo.png" alt="KAFConnect" width={32} height={32} className="object-contain" />
          <span className="text-lg font-black tracking-widest text-white">KAF<span className="text-brand-lime">CONNECT</span></span>
        </Link>
        <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2">
          <ArrowLeft size={16} /> Back
        </Link>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {sent ? (
            /* Success State */
            <div className="text-center">
              <div className="w-20 h-20 bg-brand-cyan/10 border-2 border-brand-cyan/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(25,133,59,0.24)]">
                <CheckCircle size={36} className="text-brand-cyan" />
              </div>
              <h1 className="text-3xl font-black text-white mb-3">Check Your Email</h1>
              <p className="text-slate-400 mb-6">We've sent a magic link to <span className="text-white font-bold">{email}</span>. Click the link to sign in.</p>
              <button onClick={() => { setSent(false); setEmail('') }} className="text-sm text-brand-cyan hover:underline font-bold">
                Use a different email
              </button>
            </div>
          ) : (
            /* Login Form */
            <>
              <div className="text-center mb-8">
                <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
                  WELCOME <span className="text-brand-cyan">BACK</span>
                </h1>
                <p className="text-slate-400">Sign in with your email to continue</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {message && (
                  <div className="flex gap-3 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 p-3 text-sm text-slate-200">
                    <Info size={18} className="mt-0.5 shrink-0 text-brand-lime" />
                    <span>{message}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      className="w-full bg-kaf-card border border-kaf-border rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:border-brand-cyan focus:outline-none focus:shadow-[0_0_20px_rgba(25,133,59,0.12)] transition-all text-sm"
                      placeholder="player@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full rounded-xl bg-brand-cyan px-4 py-4 font-black text-white hover:bg-brand-lime transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-glow-green"
                >
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : 'Send Magic Link'}
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-kaf-border/50"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-kaf-bg px-2 text-slate-500 uppercase font-bold tracking-widest">Or</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGithubLogin}
                  disabled={oauthLoading}
                  className="w-full rounded-xl bg-slate-800 border border-kaf-border px-4 py-4 font-black text-white hover:bg-slate-700 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {oauthLoading ? <><Loader2 size={18} className="animate-spin" /> Opening GitHub...</> : 'Continue with GitHub'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <Link href="/auth/reset-password" className="mb-4 inline-block text-sm text-slate-400 hover:text-brand-lime transition-colors">
                  Need a password reset?
                </Link>
                <p className="text-slate-500 text-sm">
                  Don't have an account?{' '}
                  <Link href="/auth/register" className="text-brand-cyan font-bold hover:underline">
                    Register
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
