'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Register() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')

  const handleRegister = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: {
          username,
          display_name: displayName,
        },
      },
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Check your email to confirm registration')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="kaf-card p-6 space-y-4">
        <h1 className="text-xl font-bold">Register</h1>

        <input
          className="bg-black p-2 border"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="bg-black p-2 border"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="bg-black p-2 border"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

        <button onClick={handleRegister} className="bg-cyan-500 px-4 py-2">
          Register
        </button>
      </div>
    </div>
  )
}