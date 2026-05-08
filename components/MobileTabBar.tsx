'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, Users, LayoutDashboard, User } from 'lucide-react'

const tabs = [
  { href: '/',           label: 'Home',        Icon: Home },
  { href: '/tournaments',label: 'Tournaments', Icon: Trophy },
  { href: '/clans',      label: 'Clans',       Icon: Users },
  { href: '/dashboard',  label: 'Dashboard',   Icon: LayoutDashboard },
  { href: '/profile',    label: 'Profile',     Icon: User },
]

export function MobileTabBar() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-950/95 backdrop-blur-lg border-t border-kaf-border safe-area-pb">
      <div className="flex items-stretch">
        {tabs.map(({ href, label, Icon }) => {
          const active = path === href || (href !== '/' && path.startsWith(href))
          return (
            <Link key={href} href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2 pt-2.5 gap-0.5 transition-all active:scale-95 ${
                active ? 'text-brand-cyan' : 'text-slate-500 hover:text-slate-300'
              }`}>
              <div className={`relative transition-all ${active ? 'scale-110' : ''}`}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                {active && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-brand-cyan" />
                )}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider transition-all ${active ? 'opacity-100' : 'opacity-60'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
