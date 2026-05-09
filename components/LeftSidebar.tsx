'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Home, Play, Trophy, BarChart3, Users, GitMerge, Video, MessageSquare,
  Bell, Settings, UserPlus, Film, Shield, AlertTriangle, Newspaper,
  Star, Swords, ChevronDown, ChevronRight, Tv, Sliders, Users2, Search, Zap, Compass,
  PanelLeftClose, PanelLeftOpen, Handshake, Gavel, CalendarDays, Award, Eye
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GlobalSearch } from '@/components/GlobalSearch'

type NavItem    = { name: string; href: string; icon: any; badge?: string; accent?: string }
type NavSection = { label: string; items: NavItem[]; collapsible?: boolean }

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Compete',
    items: [
      { name: 'Home',         href: '/',               icon: Home },
      { name: 'Start Here',   href: '/features',       icon: Compass },
      { name: 'Tournaments',  href: '/tournaments',    icon: Trophy },
      { name: 'E-League',     href: '/e-league',       icon: Tv,    accent: '#f59e0b' },
      { name: 'Match Center', href: '/matches/report', icon: Play },
      { name: 'Scrims',       href: '/scrims',         icon: Swords },
      { name: 'Calendar',     href: '/calendar',       icon: CalendarDays },
      { name: 'Draft Room',   href: '/drafts',         icon: GitMerge },
      { name: 'Seasons',      href: '/seasons',        icon: Trophy, accent: '#f59e0b' },
      { name: 'Awards',       href: '/awards',         icon: Award,  accent: '#f59e0b' },
      { name: 'Rankings',     href: '/rankings',       icon: BarChart3 },
    ],
  },
  {
    label: 'Community',
    items: [
      { name: 'Players',      href: '/players',        icon: Users },
      { name: 'Clans',        href: '/clans',          icon: Shield },
      { name: 'Free Agents',  href: '/free-agents',    icon: UserPlus },
      { name: 'Scouting',     href: '/scouting',       icon: Eye, accent: '#22c55e' },
      { name: 'Transfers',    href: '/transfers',      icon: Handshake, accent: '#f59e0b' },
      { name: 'Friends',      href: '/friends',        icon: Users2 },
      { name: 'Community',    href: '/community',      icon: Star },
      { name: 'News',         href: '/news',           icon: Newspaper },
    ],
  },
  {
    label: 'Media',
    collapsible: true,
    items: [
      { name: 'KAF TV',       href: '/remotion',       icon: Video,  accent: '#ef4444' },
      { name: 'VOD Library',  href: '/vod-library',    icon: Film },
      { name: 'Sponsors',     href: '/sponsors',       icon: Zap,    accent: '#f59e0b' },
    ],
  },
  {
    label: 'Account',
    items: [
      { name: 'Dashboard',    href: '/dashboard',      icon: Settings },
      { name: 'Messages',     href: '/messages',       icon: MessageSquare },
      { name: 'Notifications',href: '/notifications',  icon: Bell },
      { name: 'Settings',     href: '/settings',       icon: Settings },
    ],
  },
  {
    label: 'Admin',
    items: [
      { name: 'Admin Panel',  href: '/admin',          icon: Shield,         accent: '#7c3aed' },
      { name: 'No-Code',      href: '/admin/nocode',   icon: Sliders,        accent: '#7c3aed' },
      { name: 'Moderation',   href: '/moderation',     icon: Gavel,          accent: '#ef4444' },
      { name: 'Appeals',      href: '/appeals',        icon: AlertTriangle,  accent: '#ef4444' },
    ],
  },
]

const INFO_ITEMS: NavItem[] = [
  { name: 'Roles & Permissions', href: '/roles',    icon: Shield },
  { name: 'Disputes & Appeals',  href: '/appeals',  icon: AlertTriangle, accent: '#ef4444' },
  { name: 'Contact',             href: '/contact',  icon: MessageSquare },
]

export default function LeftSidebar() {
  const pathname = usePathname()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({ Media: true })
  const [railMode, setRailMode] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

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

  useEffect(() => {
    const saved = window.localStorage.getItem('kaf-sidebar-rail')
    if (saved) setRailMode(saved === 'true')
  }, [])

  useEffect(() => {
    window.localStorage.setItem('kaf-sidebar-rail', String(railMode))
  }, [railMode])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (!typing && e.key === '[') setRailMode(prev => !prev)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <aside className={`sticky top-0 hidden h-screen flex-col border-r border-white/[0.06] bg-[#050706]/96 shadow-panel no-scrollbar lg:flex overflow-hidden transition-[width] duration-300 ease-out ${railMode ? 'w-20' : 'w-64'}`}>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Subtle top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/40 to-transparent pointer-events-none" />

      <div className="flex flex-col h-full overflow-y-auto no-scrollbar p-4 gap-4">

        {/* Logo */}
        <div className="flex items-center justify-between gap-2">
        <Link href="/" className="flex min-w-0 items-center gap-3 px-1 py-1 group shrink-0">
          <div className="relative w-10 h-10 overflow-hidden bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center shrink-0 group-hover:border-brand-cyan/50 transition-colors kaf-cut-sm">
            <Image
              src="/kaf-logo.png"
              alt="KAF Connect Logo"
              width={32}
              height={32}
              className="object-contain group-hover:scale-110 transition-transform"
            />
          </div>
          {!railMode && <div className="leading-none">
            <span className="text-base font-display font-black tracking-widest text-white block">
              KAF<span className="text-brand-lime">CONNECT</span>
            </span>
            <span className="text-[9px] text-slate-600 uppercase tracking-[0.25em] font-bold">Arena Hub</span>
          </div>}
        </Link>
          <button
            type="button"
            onClick={() => setRailMode(prev => !prev)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 transition-colors hover:border-brand-lime/40 hover:text-brand-lime"
            aria-label={railMode ? 'Expand sidebar' : 'Collapse sidebar'}
            title={railMode ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {railMode ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className={`flex items-center gap-2.5 w-full px-3 py-2.5 bg-kaf-card border border-kaf-border text-slate-500 hover:text-slate-300 hover:border-kaf-border-strong text-xs transition-all group shrink-0 ${railMode ? 'justify-center rounded-lg' : 'rounded-xl'}`}
          title="Search"
        >
          <Search size={13} className="shrink-0" />
          {!railMode && <span className="flex-1 text-left">Search...</span>}
          {!railMode && <kbd className="text-[9px] border border-kaf-border rounded-md px-1.5 py-0.5 font-mono hidden group-hover:block">
            Ctrl K
          </kbd>}
        </button>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-5 min-h-0">
          {NAV_SECTIONS.map((section) => {
            const isCollapsed = section.collapsible && collapsed[section.label]
            return (
              <div key={section.label}>
                {!railMode && <button
                  onClick={() => section.collapsible && setCollapsed(prev => ({ ...prev, [section.label]: !prev[section.label] }))}
                  className={`mb-1.5 px-2 text-[10px] font-black uppercase tracking-[0.18em] w-full flex items-center justify-between h-5
                    ${section.collapsible
                      ? 'text-slate-600 hover:text-slate-400 transition-colors cursor-pointer'
                      : 'text-slate-600 cursor-default'}`}
                >
                  {section.label}
                  {section.collapsible && (
                    isCollapsed
                      ? <ChevronRight size={10} className="text-slate-600" />
                      : <ChevronDown size={10} className="text-slate-600" />
                  )}
                </button>
                }

                {(!isCollapsed || railMode) && (
                  <div className="flex flex-col gap-0.5">
                    {section.items.map((item) => {
                      const active = isActive(item.href)
                      const iconColor = active ? '#22c55e' : item.accent || '#64748b'
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          title={railMode ? item.name : undefined}
                          className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-150 ${railMode ? 'justify-center' : ''}
                            ${active
                              ? 'bg-gradient-to-r from-brand-cyan/18 to-brand-cyan/4 text-white'
                              : 'text-slate-400 hover:bg-kaf-card hover:text-slate-100'
                            }`}
                        >
                          {/* Active left bar */}
                          {active && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-brand-lime shadow-glow-green-sm" />
                          )}
                          <item.icon
                            size={17}
                            style={{ color: iconColor }}
                            className="shrink-0 transition-colors"
                          />
                          {!railMode && <span className="flex-1 truncate">{item.name}</span>}
                          {!railMode && item.badge && (
                            <span className="px-1.5 py-0.5 rounded-full bg-brand-cyan/20 text-brand-lime text-[9px] font-black">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          {/* Info section */}
          <div>
            {!railMode && <p className="mb-1.5 px-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600">Info</p>}
            <div className="flex flex-col gap-0.5">
              {INFO_ITEMS.map(item => {
                const active = isActive(item.href)
                const iconColor = active ? '#22c55e' : item.accent || '#64748b'
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={railMode ? item.name : undefined}
                    className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-150 ${railMode ? 'justify-center' : ''}
                      ${active
                        ? 'bg-gradient-to-r from-brand-cyan/18 to-brand-cyan/4 text-white'
                        : 'text-slate-400 hover:bg-kaf-card hover:text-slate-100'
                      }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-brand-lime shadow-glow-green-sm" />
                    )}
                    <item.icon size={17} style={{ color: iconColor }} className="shrink-0" />
                    {!railMode && <span className="flex-1 truncate">{item.name}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>

        {/* User profile card */}
        <div className="shrink-0 pt-3 border-t border-kaf-border">
          {userProfile ? (
            <Link
              href={`/profile/${userProfile.username}`}
              title={railMode ? userProfile.username : undefined}
              className={`group flex items-center gap-3 rounded-xl p-3 border border-kaf-border hover:border-brand-cyan/30 hover:bg-kaf-card transition-all ${railMode ? 'justify-center' : ''}`}
            >
              {/* Avatar with gradient ring */}
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-cyan via-brand-lime to-brand-blue opacity-0 group-hover:opacity-100 transition-opacity p-px rounded-full" />
                <div
                  className="relative w-9 h-9 rounded-full bg-slate-800 bg-cover bg-center border-2 border-transparent group-hover:border-brand-cyan/50 transition-colors"
                  style={{ backgroundImage: `url('${userProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.username}`}')` }}
                />
              </div>
              {!railMode && <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-black text-white group-hover:text-brand-lime transition-colors leading-none mb-0.5">
                  {userProfile.username}
                </p>
                <p className="truncate text-[10px] uppercase tracking-wider text-slate-500 font-bold leading-none">
                  {userProfile.role || 'member'}
                </p>
              </div>}
              {!railMode && <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />}
            </Link>
          ) : (
            <Link
              href="/auth/login"
              title={railMode ? 'Sign in' : undefined}
              className={`group flex items-center gap-3 rounded-xl p-3 border border-kaf-border hover:border-brand-cyan/30 hover:bg-kaf-card transition-all ${railMode ? 'justify-center' : ''}`}
            >
              <div className="w-9 h-9 rounded-full bg-kaf-elevated border border-kaf-border flex items-center justify-center shrink-0">
                <Users size={16} className="text-slate-500" />
              </div>
              {!railMode && <div className="flex-1">
                <p className="text-sm font-black text-slate-400 group-hover:text-white transition-colors">Sign In</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-600 font-bold">Join KAFConnect</p>
              </div>}
            </Link>
          )}
        </div>
      </div>
    </aside>
  )
}
