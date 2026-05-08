'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Play, Trophy, BarChart3, Users, GitMerge, RefreshCw, Video, MessageSquare, Bell, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Tournaments', href: '/tournaments', icon: Trophy },
  { name: 'Draft Room', href: '/drafts', icon: GitMerge },
  { name: 'Scrims', href: '/scrims', icon: Users },
  { name: 'Match Center', href: '/matches/report', icon: Play },
  { name: 'Rankings', href: '/rankings', icon: BarChart3 },
  { name: 'Clans', href: '/clans', icon: Users },
  { name: 'KAF TV', href: '/remotion', icon: Video },
]

const socialItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Settings },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function LeftSidebar() {
  const pathname = usePathname()
  const [userProfile, setUserProfile] = useState<any>(null)
  
  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setUserProfile(profile || { username: 'Player', role: 'Member' })
      }
    }
    loadUser()
  }, [])

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col overflow-y-auto border-r border-kaf-border bg-kaf-panel p-4 no-scrollbar lg:flex">
      <Link href="/" className="mb-8 px-2 flex items-center gap-3 group">
        <img src="/kaf-logo.png" alt="KAF Connect Logo" className="w-12 h-12 object-contain group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(0,255,102,0.4)]" />
        <div>
          <span className="text-xl font-black tracking-widest text-brand-green block">KAFCONNECT</span>
          <span className="text-[9px] text-white uppercase tracking-[0.2em] font-bold block -mt-1">Arena Hub</span>
        </div>
      </Link>
      
      <nav className="flex flex-1 flex-col gap-8">
        <div>
          <h3 className="mb-3 px-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Discover</h3>
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link key={item.name} href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition-all ${isActive ? 'bg-gradient-to-r from-brand-cyan/20 to-transparent text-brand-cyan border-l-2 border-brand-cyan shadow-[inset_20px_0_20px_-20px_rgba(0,255,102,0.15)]' : 'text-slate-400 hover:bg-kaf-card hover:text-white border-l-2 border-transparent'}`}>
                  <item.icon size={20} className={isActive ? 'text-brand-cyan drop-shadow-[0_0_5px_rgba(0,255,102,0.8)]' : 'text-slate-500'} />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>

        <div>
          <h3 className="mb-3 px-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Account</h3>
          <div className="flex flex-col gap-1">
            {socialItems.map((item) => (
              <Link key={item.name} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-slate-400 transition-all hover:bg-kaf-card hover:text-white border-l-2 border-transparent">
                <item.icon size={20} className="text-slate-500" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="mt-8">
        {userProfile ? (
          <Link href="/profile" className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-kaf-card to-transparent p-3 border border-kaf-border cursor-pointer hover:border-brand-cyan/40 transition-colors group">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-800 border-2 border-transparent group-hover:border-brand-cyan transition-all" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.username}')`, backgroundSize: 'cover' }}>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-black text-white group-hover:text-brand-cyan transition-colors">{userProfile.username}</p>
              <p className="truncate text-[10px] uppercase tracking-wider text-slate-400 font-bold">{userProfile.role}</p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3 rounded-xl bg-kaf-card p-3 border border-kaf-border">
            <div className="h-10 w-10 rounded-full bg-slate-800 animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 w-16 bg-slate-800 rounded animate-pulse mb-1"></div>
              <div className="h-3 w-12 bg-slate-800 rounded animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
