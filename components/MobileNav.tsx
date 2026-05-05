'use client'
import Link from 'next/link'
import { Trophy, Users, BarChart3, Home } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function MobileNav(){
 const pathname = usePathname()
 const isActive = (path: string) => pathname.startsWith(path)

 return(
  <nav className='fixed bottom-0 left-0 right-0 bg-black border-t border-slate-800 flex justify-around p-3 text-sm'>
   <Link href='/dashboard' className={`flex flex-col items-center gap-1 ${isActive('/dashboard') ? 'text-cyan-200' : 'text-slate-400'}`}>
    <Home size={20} />
    Home
   </Link>
   <Link href='/tournaments' className={`flex flex-col items-center gap-1 ${isActive('/tournaments') ? 'text-cyan-200' : 'text-slate-400'}`}>
    <Trophy size={20} />
    Tournaments
   </Link>
   <Link href='/clans' className={`flex flex-col items-center gap-1 ${isActive('/clans') ? 'text-cyan-200' : 'text-slate-400'}`}>
    <Users size={20} />
    Clans
   </Link>
   <Link href='/rankings' className={`flex flex-col items-center gap-1 ${isActive('/rankings') ? 'text-cyan-200' : 'text-slate-400'}`}>
    <BarChart3 size={20} />
    Rankings
   </Link>
  </nav>
 )
}