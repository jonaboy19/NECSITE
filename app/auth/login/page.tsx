'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Login() {
  const supabase = createClient()
  const [email, setEmail] = useState('')

  const handleLogin = async () => {
    await supabase.auth.signInWithOtp({ email })
    alert('Check your email for login link')
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="kaf-card p-6 space-y-4">
        <h1 className="text-xl font-bold">Login</h1>
        <input
          className="bg-black p-2 border"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleLogin} className="bg-cyan-500 px-4 py-2">
          Send Magic Link
        </button>
      </div>
    </div>
  )
}