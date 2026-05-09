import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Grid2X2, Shield, Search, UserRound } from 'lucide-react'

export default async function PublicHeader() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is logged in, don't show public header (sidebar handles nav)
  if (user) return null

  return (
    <nav aria-label="Public navigation" className="sticky top-0 z-50 flex h-20 items-center justify-between gap-4 border-b border-white/[0.07] bg-[#070908]/86 px-4 backdrop-blur-2xl sm:px-6 lg:px-14">
      <Link href="/" className="flex items-center gap-3 group">
        <Image src="/kaf-logo.png" alt="KAFConnect" width={30} height={30} className="object-contain group-hover:scale-110 transition-transform" />
        <div className="leading-none">
          <div className="text-base font-black tracking-wide text-white">KAF <span className="text-brand-lime">Connect</span></div>
          <div className="mt-1 font-mono text-[9px] font-black uppercase tracking-[0.34em] text-slate-500">eFootball operations</div>
        </div>
      </Link>
      <div className="hidden xl:flex items-center gap-1 text-[12px] font-black uppercase tracking-[0.14em] text-slate-500">
        <Link href="/" className="rounded-lg px-4 py-3 transition-colors hover:bg-white/[0.03] hover:text-white">Feed</Link>
        <Link href="/messages" className="rounded-lg px-4 py-3 transition-colors hover:bg-white/[0.03] hover:text-white">Messages</Link>
        <Link href="/news" className="rounded-lg px-4 py-3 transition-colors hover:bg-white/[0.03] hover:text-white">News</Link>
        <Link href="/tournaments" className="rounded-lg px-4 py-3 transition-colors hover:bg-white/[0.03] hover:text-white">Tournaments</Link>
        <Link href="/clans" className="rounded-lg px-4 py-3 transition-colors hover:bg-white/[0.03] hover:text-white">Clans</Link>
        <Link href="/e-league" className="rounded-lg px-4 py-3 transition-colors hover:bg-white/[0.03] hover:text-white">KAF E-League</Link>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/features" aria-label="Search" className="hidden h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-slate-300 transition-colors hover:border-brand-cyan/40 hover:text-brand-lime sm:flex">
          <Search size={18} />
        </Link>
        <Link href="/admin" className="hidden h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-4 font-mono text-[11px] font-black uppercase tracking-wider text-slate-300 transition-colors hover:border-white/20 hover:text-white md:flex">
          <Shield size={15} /> Admin
        </Link>
        <Link href="/dashboard" className="inline-flex h-11 items-center gap-2 rounded-xl border border-brand-lime/30 bg-brand-lime/10 px-4 font-mono text-[11px] font-black uppercase tracking-wider text-brand-lime transition-all hover:bg-brand-lime hover:text-[#041006]">
          <Grid2X2 size={15} /> Dashboard
        </Link>
        <Link href="/auth/login" aria-label="Account" className="hidden h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-slate-300 transition-colors hover:border-brand-cyan/40 hover:text-white sm:flex">
          <UserRound size={17} />
        </Link>
      </div>
    </nav>
  )
}
