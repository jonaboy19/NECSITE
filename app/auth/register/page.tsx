'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Mail, User, AtSign, ArrowLeft, Loader2, CheckCircle, Shield } from 'lucide-react'

export default function Register() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !username) return
    
    // Basic validation
    if (username.length < 3 || username.length > 20) {
      setError('Username must be between 3-20 characters')
      return
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError('Username can only contain letters, numbers, underscores, and dashes')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          username,
          display_name: displayName || username,
        },
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  const handleGithubLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen bg-kaf-bg text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-kaf-border/50">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/kaf-logo.png" alt="KAFConnect" className="w-8 h-8 object-contain" />
          <span className="text-lg font-black tracking-widest text-brand-cyan">KAFCONNECT</span>
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
              <div className="w-20 h-20 bg-brand-cyan/10 border-2 border-brand-cyan/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,255,102,0.2)]">
                <CheckCircle size={36} className="text-brand-cyan" />
              </div>
              <h1 className="text-3xl font-black text-white mb-3">Verify Your Email</h1>
              <p className="text-slate-400 mb-6">We've sent a confirmation link to <span className="text-white font-bold">{email}</span>. Click the link to activate your account.</p>
              <button onClick={() => { setSent(false); setEmail('') }} className="text-sm text-brand-cyan hover:underline font-bold">
                Use a different email
              </button>
            </div>
          ) : (
            /* Register Form */
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-brand-cyan/10 border-2 border-brand-cyan/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield size={28} className="text-brand-cyan" />
                </div>
                <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
                  JOIN THE <span className="text-brand-cyan">ARENA</span>
                </h1>
                <p className="text-slate-400">Create your competitive profile</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      className="w-full bg-kaf-card border border-kaf-border rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:border-brand-cyan focus:outline-none focus:shadow-[0_0_20px_rgba(0,255,102,0.1)] transition-all text-sm"
                      placeholder="player@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Gamertag / Username</label>
                  <div className="relative">
                    <AtSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      className="w-full bg-kaf-card border border-kaf-border rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:border-brand-cyan focus:outline-none focus:shadow-[0_0_20px_rgba(0,255,102,0.1)] transition-all text-sm"
                      placeholder="YourGamertag"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      minLength={3}
                      maxLength={20}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5 ml-1">3-20 characters. Letters, numbers, underscores, dashes only.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Display Name <span className="text-slate-600">(optional)</span></label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      className="w-full bg-kaf-card border border-kaf-border rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:border-brand-cyan focus:outline-none focus:shadow-[0_0_20px_rgba(0,255,102,0.1)] transition-all text-sm"
                      placeholder="How you want to be shown"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
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
                  disabled={loading || !email || !username}
                  className="w-full rounded-xl bg-brand-cyan px-4 py-4 font-black text-kaf-bg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(0,255,102,0.3)]"
                >
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Creating Account...</> : 'Create Account'}
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
                  className="w-full rounded-xl bg-slate-800 border border-kaf-border px-4 py-4 font-black text-white hover:bg-slate-700 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  Sign up with GitHub
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-slate-500 text-sm">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-brand-cyan font-bold hover:underline">
                    Sign In
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