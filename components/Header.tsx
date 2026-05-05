'use client'
import Link from 'next/link'
import { Trophy, Users, BarChart3, Home, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  return (
    <nav className="flex items-center justify-between rounded-2xl border border-cyan-300/10 bg-slate-950/70 px-4 py-3 backdrop-blur">
      <Link href="/" className="font-black tracking-[0.35em] text-cyan-200">KAFConnect</Link>
      <div className="hidden gap-6 text-sm text-slate-300 md:flex">
        <Link href="/tournaments" className="flex items-center gap-2 hover:text-cyan-200 transition">
          <Trophy size={16} />
          Tournaments
        </Link>
        <Link href="/clans" className="flex items-center gap-2 hover:text-cyan-200 transition">
          <Users size={16} />
          Clans
        </Link>
        <Link href="/rankings" className="flex items-center gap-2 hover:text-cyan-200 transition">
          <BarChart3 size={16} />
          Rankings
        </Link>
        {user && (
          <Link href="/dashboard" className="flex items-center gap-2 hover:text-cyan-200 transition">
            <Home size={16} />
            Dashboard
          </Link>
        )}
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        {user ? (
          <Link href="/profile" className="flex items-center gap-2 text-sm text-slate-300 hover:text-cyan-200 transition">
            <User size={16} />
            Profile
          </Link>
        ) : (
          <Link href="/auth/register" className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300 transition">
            Join
          </Link>
        )}
      </div>
    </nav>
  )
}