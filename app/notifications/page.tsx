'use client'

import { useState } from 'react'
import { Bell, Trophy, Users, Zap } from 'lucide-react'
import { useToast } from '@/components/Toast'

const mockNotifications = [
  {
    id: 1,
    icon: Trophy,
    iconColor: 'text-brand-gold',
    iconBg: 'bg-brand-gold/10 border-brand-gold/20',
    title: 'Tournament Starting Soon',
    desc: 'KAF Ramadan Cup begins in 30 minutes. Get ready!',
    time: '30m ago',
    unread: true,
  },
  {
    id: 2,
    icon: Users,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-400/10 border-purple-400/20',
    title: 'Clan Application Update',
    desc: 'Your application to HYDRO Esports has been reviewed.',
    time: '2h ago',
    unread: true,
  },
  {
    id: 3,
    icon: Zap,
    iconColor: 'text-brand-cyan',
    iconBg: 'bg-brand-cyan/10 border-brand-cyan/20',
    title: 'Match Challenge',
    desc: 'Player TamsTV has challenged you to a scrim.',
    time: '1d ago',
    unread: false,
  },
]

export default function Notifications() {
  const toast = useToast()
  const [notifications, setNotifications] = useState(mockNotifications)
  const unreadCount = notifications.filter(n => n.unread).length

  function markAllRead() {
    setNotifications(prev => prev.map(item => ({ ...item, unread: false })))
    toast.success('All notifications marked as read.')
  }

  function openNotification(id: number) {
    setNotifications(prev => prev.map(item => item.id === id ? { ...item, unread: false } : item))
  }

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-kaf-panel/95 backdrop-blur-xl border-b border-kaf-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-black text-white uppercase tracking-wide flex items-center gap-3">
            <Bell className="text-brand-cyan" size={26} />
            Notifications
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Stay up to date with your activity</p>
        </div>
        <button onClick={markAllRead} disabled={unreadCount === 0} className="text-sm text-brand-cyan font-bold hover:underline transition-colors disabled:cursor-default disabled:text-slate-600 disabled:no-underline">
          {unreadCount > 0 ? `Mark ${unreadCount} read` : 'All read'}
        </button>
      </div>

      {/* Notification List */}
      <div className="p-4 space-y-2 max-w-2xl mx-auto w-full">
        {notifications.map((n) => {
          const Icon = n.icon
          return (
            <div
              key={n.id}
              onClick={() => openNotification(n.id)}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer hover:-translate-y-0.5 ${
                n.unread
                  ? 'bg-kaf-card border-kaf-border hover:border-brand-cyan/30'
                  : 'bg-kaf-panel border-kaf-border/50 opacity-60 hover:opacity-80'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${n.iconBg}`}>
                <Icon size={22} className={n.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-black text-white text-sm">{n.title}</h3>
                  {n.unread && <span className="w-2 h-2 rounded-full bg-brand-cyan shrink-0"></span>}
                </div>
                <p className="text-slate-400 text-sm mt-0.5 leading-snug">{n.desc}</p>
                <p className="text-slate-600 text-xs font-bold uppercase tracking-widest mt-2">{n.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
