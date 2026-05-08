'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, Users, Play, UserCircle } from 'lucide-react'

const bottomNavItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Events', href: '/tournaments', icon: Trophy },
  { name: 'Feed', href: '/feed', icon: Play },
  { name: 'Clans', href: '/clans', icon: Users },
  { name: 'Profile', href: '/dashboard', icon: UserCircle },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-kaf-panel/90 backdrop-blur-md border-t border-kaf-border/50 lg:hidden pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
                isActive ? 'text-brand-cyan scale-110 drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <item.icon size={22} className={isActive ? 'fill-brand-cyan/20' : ''} />
              <span className="text-[10px] font-bold tracking-wider">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
