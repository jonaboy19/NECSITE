'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Trophy, Users, BarChart3, Home, User, Compass } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import ThemeToggle from './ThemeToggle'
import NotificationBell from './NotificationBell'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  return (
    <nav className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[#070908]/80 px-4 py-3 backdrop-blur-2xl">
      <Link href="/" className="flex items-center gap-2 font-black tracking-[0.18em] text-white">
        <Image src="/kaf-logo.png" alt="KAFConnect" width={28} height={28} className="object-contain" />
        <span>KAF<span className="text-brand-lime">Connect</span></span>
      </Link>
      <div className="hidden gap-6 text-sm font-bold text-slate-400 md:flex">
        <Link href="/tournaments" className="flex items-center gap-2 hover:text-brand-lime transition">
          <Trophy size={16} />
          Tournaments
        </Link>
        <Link href="/features" className="flex items-center gap-2 hover:text-brand-lime transition">
          <Compass size={16} />
          Start
        </Link>
        <Link href="/clans" className="flex items-center gap-2 hover:text-brand-lime transition">
          <Users size={16} />
          Clans
        </Link>
        <Link href="/rankings" className="flex items-center gap-2 hover:text-brand-lime transition">
          <BarChart3 size={16} />
          Rankings
        </Link>
        {user && (
          <Link href="/dashboard" className="flex items-center gap-2 hover:text-brand-lime transition">
            <Home size={16} />
            Dashboard
          </Link>
        )}
      </div>
      <div className="flex items-center gap-4">
        {user && <NotificationBell />}
        <ThemeToggle />
        {user ? (
          <Link href="/profile" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-brand-lime transition">
            <User size={16} />
            Profile
          </Link>
        ) : (
          <Link href="/auth/register" className="rounded-xl bg-brand-lime px-4 py-2 text-sm font-black text-[#041006] hover:bg-brand-neon transition">
            Join
          </Link>
        )}
      </div>
    </nav>
  )
}
