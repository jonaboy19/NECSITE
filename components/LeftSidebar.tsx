'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Play, Trophy, BarChart3, Users, GitMerge, Video, MessageSquare,
  Bell, Settings, UserPlus, Film, Shield, AlertTriangle, Newspaper,
  Star, Swords, ChevronDown, ChevronRight
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type NavItem = { name: string; href: string; icon: any; badge?: string }
type NavSection = { label: string; items: NavItem[]; collapsible?: boolean }

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Compete',
    items: [
      { name: 'Home', href: '/', icon: Home },
      { name: 'Tournaments', href: '/tournaments', icon: Trophy },
      { name: 'Match Center', href: '/matches/report', icon: Play },
      { name: 'Scrims', href: '/scrims', icon: Swords },
      { name: 'Draft Room', href: '/drafts', icon: GitMerge },
      { name: 'Rankings', href: '/rankings', icon: BarChart3 },
    ],
  },
  {
    label: 'Community',
    items: [
      { name: 'Players', href: '/players', icon: Users },
      { name: 'Clans', href: '/clans', icon: Shield },
      { name: 'Free Agents', href: '/free-agents', icon: UserPlus },
      { name: 'Community', href: '/community', icon: Star },
      { name: 'News', href: '/news', icon: Newspaper },
    ],
  },
  {
    label: 'Media',
    collapsible: true,
    items: [
      { name: 'KAF TV', href: '/remotion', icon: Video },
      { name: 'VOD Library', href: '/vod-library', icon: Film },
      { name: 'Sponsors', href: '/sponsors', icon: Star },
    ],
  },
  {
    label: 'Account',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: Settings },
      { name: 'Messages', href: '/messages', icon: MessageSquare },
      { name: 'Notifications', href: '/notifications', icon: Bell },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]

export default function LeftSidebar() {
  const pathname = usePathname()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({ Media: true })

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setUserProfile(profile || { username: 'Player', role: 'member' })
      }
    }
    loadUser()
  }, [])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col overflow-y-auto border-r border-kaf-border bg-kaf-panel p-4 no-scrollbar lg:flex">
      {/* Logo */}
      <Link href="/" className="mb-6 px-2 flex items-center gap-3 group">
        <img src="/kaf-logo.png" alt="KAF Connect Logo" className="w-12 h-12 object-contain group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(0,255,102,0.4)]" />
        <div>
          <span className="text-xl font-black tracking-widest text-brand-cyan block">KAFCONNECT</span>
          <span className="text-[9px] text-white uppercase tracking-[0.2em] font-bold block -mt-1">Arena Hub</span>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto no-scrollbar">
        {NAV_SECTIONS.map((section) => {
          const isCollapsed = section.collapsible && collapsed[section.label]
          return (
            <div key={section.label}>
              <button
                onClick={() => section.collapsible && setCollapsed(prev => ({ ...prev, [section.label]: !prev[section.label] }))}
                className={`mb-2 px-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 w-full flex items-center justify-between ${section.collapsible ? 'hover:text-slate-300 transition-colors' : 'cursor-default'}`}
              >
                {section.label}
                {section.collapsible && (
                  isCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />
                )}
              </button>

              {!isCollapsed && (
                <div className="flex flex-col gap-0.5">
                  {section.items.map((item) => {
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-all ${
                          active
                            ? 'bg-gradient-to-r from-brand-cyan/20 to-transparent text-brand-cyan border-l-2 border-brand-cyan shadow-[inset_20px_0_20px_-20px_rgba(0,255,102,0.15)]'
                            : 'text-slate-400 hover:bg-kaf-card hover:text-white border-l-2 border-transparent'
                        }`}
                      >
                        <item.icon
                          size={18}
                          className={active ? 'text-brand-cyan drop-shadow-[0_0_5px_rgba(0,255,102,0.8)]' : 'text-slate-500'}
                        />
                        <span className="flex-1 truncate">{item.name}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan text-[9px] font-black">{item.badge}</span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* Appeals & Roles links */}
        <div>
          <h3 className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Info</h3>
          <div className="flex flex-col gap-0.5">
            {[
              { name: 'Roles & Permissions', href: '/roles', icon: Shield },
              { name: 'Disputes & Appeals', href: '/appeals', icon: AlertTriangle },
              { name: 'Contact', href: '/contact', icon: MessageSquare },
            ].map(item => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-brand-cyan/20 to-transparent text-brand-cyan border-l-2 border-brand-cyan'
                      : 'text-slate-400 hover:bg-kaf-card hover:text-white border-l-2 border-transparent'
                  }`}
                >
                  <item.icon size={18} className={active ? 'text-brand-cyan' : 'text-slate-500'} />
                  <span className="flex-1 truncate">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* User profile card */}
      <div className="mt-4 pt-4 border-t border-kaf-border">
        {userProfile ? (
          <Link href={`/profile/${userProfile.username}`} className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-kaf-card to-transparent p-3 border border-kaf-border cursor-pointer hover:border-brand-cyan/40 transition-colors group">
            <div
              className="h-10 w-10 overflow-hidden rounded-full bg-slate-800 border-2 border-transparent group-hover:border-brand-cyan transition-all bg-cover bg-center"
              style={{ backgroundImage: `url('${userProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.username}`}')` }}
            />
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-black text-white group-hover:text-brand-cyan transition-colors">{userProfile.username}</p>
              <p className="truncate text-[10px] uppercase tracking-wider text-slate-400 font-bold">{userProfile.role || 'member'}</p>
            </div>
          </Link>
        ) : (
          <Link href="/auth/login" className="flex items-center gap-3 rounded-xl bg-kaf-card p-3 border border-kaf-border hover:border-brand-cyan/40 transition-colors group">
            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
              <Users size={18} className="text-slate-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-slate-400 group-hover:text-white transition-colors">Sign In</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-600 font-bold">Join KAFConnect</p>
            </div>
          </Link>
        )}
      </div>
    </aside>
  )
}
