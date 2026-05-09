'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, CheckCircle, Loader2, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email) return

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-kaf-bg text-white">
      <nav className="flex items-center justify-between border-b border-kaf-border/50 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/kaf-logo.png" alt="KAFConnect" width={32} height={32} className="object-contain" />
          <span className="text-lg font-black tracking-widest text-white">KAF<span className="text-brand-lime">CONNECT</span></span>
        </Link>
        <Link href="/auth/login" className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white">
          <ArrowLeft size={16} /> Back to sign in
        </Link>
      </nav>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-brand-cyan/50 bg-brand-cyan/10 shadow-[0_0_30px_rgba(25,133,59,0.24)]">
                <CheckCircle size={36} className="text-brand-cyan" />
              </div>
              <h1 className="mb-3 text-3xl font-black text-white">Check Your Email</h1>
              <p className="mb-6 text-slate-400">
                If password sign-in is enabled for your account, a reset link was sent to <span className="font-bold text-white">{email}</span>.
              </p>
              <Link href="/auth/login" className="text-sm font-bold text-brand-cyan hover:underline">
                Return to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="mb-3 text-4xl font-black tracking-tight text-white">
                  RESET <span className="text-brand-cyan">PASSWORD</span>
                </h1>
                <p className="text-slate-400">Enter your email and we will send a reset link if your account uses password login.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      className="w-full rounded-xl border border-kaf-border bg-kaf-card py-4 pl-12 pr-4 text-sm text-white placeholder-slate-500 transition-all focus:border-brand-cyan focus:outline-none"
                      placeholder="player@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm font-medium text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-cyan px-4 py-4 text-sm font-black text-white shadow-glow-green transition-all hover:bg-brand-lime disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
