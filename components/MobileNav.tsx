'use client'
import Link from 'next/link'
import { Home, Play, Trophy, LayoutList, User, Users } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function MobileNav() {
  const pathname = usePathname()
  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false
    return pathname.startsWith(path)
  }

  return (
    <>
      {/* Floating Action Button (for quick posts/matches) - visible only on mobile */}
      <button className="fixed bottom-24 right-4 z-50 w-14 h-14 bg-brand-cyan text-kaf-bg rounded-full shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center hover:scale-110 transition-transform lg:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-kaf-border bg-kaf-panel/95 pb-safe pt-2 px-2 pb-6 backdrop-blur-xl lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <Link href="/" className={`flex flex-col items-center gap-1 transition-all ${isActive('/') ? 'text-brand-cyan scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
          <Home size={22} strokeWidth={isActive('/') ? 2.5 : 2} className={isActive('/') ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]' : ''} />
          <span className="text-[9px] font-bold tracking-wide">Home</span>
        </Link>
        <Link href="/tournaments" className={`flex flex-col items-center gap-1 transition-all ${isActive('/tournaments') ? 'text-brand-cyan scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
          <Trophy size={22} strokeWidth={isActive('/tournaments') ? 2.5 : 2} className={isActive('/tournaments') ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]' : ''} />
          <span className="text-[9px] font-bold tracking-wide">Events</span>
        </Link>
        <div className="relative -top-6">
          <Link href="/feed" className="flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-brand-cyan to-blue-500 rounded-full shadow-[0_0_20px_rgba(0,240,255,0.5)] text-white hover:scale-110 transition-transform">
             <LayoutList size={26} strokeWidth={2.5} />
          </Link>
        </div>
        <Link href="/clans" className={`flex flex-col items-center gap-1 transition-all ${isActive('/clans') ? 'text-brand-cyan scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
          <Users size={22} strokeWidth={isActive('/clans') ? 2.5 : 2} className={isActive('/clans') ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]' : ''} />
          <span className="text-[9px] font-bold tracking-wide">Clans</span>
        </Link>
        <Link href="/dashboard" className={`flex flex-col items-center gap-1 transition-all ${isActive('/dashboard') ? 'text-brand-cyan scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
          <User size={22} strokeWidth={isActive('/dashboard') ? 2.5 : 2} className={isActive('/dashboard') ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]' : ''} />
          <span className="text-[9px] font-bold tracking-wide">Profile</span>
        </Link>
      </nav>
    </>
  )
}