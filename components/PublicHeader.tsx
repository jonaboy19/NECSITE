import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function PublicHeader() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is logged in, don't show public header (sidebar handles nav)
  if (user) return null

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12 py-4 bg-kaf-bg/80 backdrop-blur-xl border-b border-kaf-border/50">
      <Link href="/" className="flex items-center gap-3 group">
        <img src="/kaf-logo.png" alt="KAFConnect" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
        <span className="text-lg font-black tracking-widest text-brand-cyan">KAFCONNECT</span>
      </Link>
      <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
        <Link href="/tournaments" className="hover:text-white transition-colors">Tournaments</Link>
        <Link href="/clans" className="hover:text-white transition-colors">Clans</Link>
        <Link href="/rankings" className="hover:text-white transition-colors">Rankings</Link>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/auth/login" className="px-4 py-2 rounded-xl text-sm font-bold text-slate-300 border border-kaf-border hover:text-white hover:border-white/20 transition-all">
          Sign In
        </Link>
        <Link href="/auth/register" className="px-4 py-2 rounded-xl text-sm font-black bg-brand-cyan text-kaf-bg hover:bg-white hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)]">
          Join
        </Link>
      </div>
    </nav>
  )
}
