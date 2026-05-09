import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function PublicHeader() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is logged in, don't show public header (sidebar handles nav)
  if (user) return null

  return (
    <nav aria-label="Public navigation" className="sticky top-0 z-50 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-12 py-4 bg-kaf-bg/80 backdrop-blur-xl border-b border-kaf-border/50">
      <Link href="/" className="flex items-center gap-3 group">
        <Image src="/kaf-logo.png" alt="KAFConnect" width={32} height={32} className="object-contain group-hover:scale-110 transition-transform" />
        <span className="text-base sm:text-lg font-black tracking-widest text-white">KAF<span className="text-brand-lime">CONNECT</span></span>
      </Link>
      <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
        <Link href="/tournaments" className="hover:text-white transition-colors">Tournaments</Link>
        <Link href="/features" className="hover:text-white transition-colors">Features</Link>
        <Link href="/clans" className="hover:text-white transition-colors">Clans</Link>
        <Link href="/rankings" className="hover:text-white transition-colors">Rankings</Link>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/auth/login" className="px-3 sm:px-4 py-2 rounded-lg text-sm font-bold text-slate-300 border border-kaf-border hover:text-white hover:border-white/20 transition-all">
          Sign In
        </Link>
        <Link href="/auth/register" className="px-3 sm:px-4 py-2 rounded-lg text-sm font-black bg-brand-cyan text-white hover:bg-brand-lime transition-all shadow-glow-green-sm">
          Join
        </Link>
      </div>
    </nav>
  )
}
