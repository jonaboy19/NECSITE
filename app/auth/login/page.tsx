'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/Header'

export default function Login() {
  const supabase = createClient()
  const [email, setEmail] = useState('')

  const handleLogin = async () => {
    await supabase.auth.signInWithOtp({ email })
    alert('Check your email for login link')
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header />
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="kaf-card p-8 rounded-2xl w-full max-w-md">
            <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
            <div className="space-y-4">
              <input
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                onClick={handleLogin}
                className="w-full rounded-lg bg-cyan-400 px-4 py-3 font-bold text-slate-950 hover:bg-cyan-300 transition"
              >
                Send Magic Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}