'use client'

import { useEffect, useState } from 'react'
import { Bell, Trophy, Users, Zap } from 'lucide-react'
import { useToast } from '@/components/Toast'
import { createClient } from '@/lib/supabase/client'

const iconByType: Record<string, any> = {
  tournament: Trophy,
  clan: Users,
  match: Zap,
}

export default function Notifications() {
  const toast = useToast()
  const supabase = createClient()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    let ignore = false
    async function loadNotifications() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from('notifications')
        .select('id,type,title,body,link,read,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      if (!ignore) {
        setNotifications(data || [])
        setLoading(false)
      }
    }
    loadNotifications()
    const channel = supabase.channel('notifications-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => loadNotifications())
      .subscribe()
    return () => {
      ignore = true
      supabase.removeChannel(channel)
    }
  }, [supabase])

  async function markAllRead() {
    const ids = notifications.filter(n => !n.read).map(n => n.id)
    if (ids.length) {
      await supabase.from('notifications').update({ read: true, read_at: new Date().toISOString() }).in('id', ids)
      setNotifications(prev => prev.map(item => ({ ...item, read: true })))
    }
    toast.success('All notifications marked as read.')
  }

  async function openNotification(item: any) {
    if (!item.read) {
      await supabase.from('notifications').update({ read: true, read_at: new Date().toISOString() }).eq('id', item.id)
      setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n))
    }
    if (item.link) window.location.href = item.link
  }

  return (
    <div className="kaf-app-page flex w-full flex-col pb-20">
      {/* Header */}
      <div className="kaf-page-hero sticky top-0 z-30 flex items-center justify-between px-6 py-5">
        <div className="relative z-10">
          <h1 className="kaf-display flex items-center gap-3 text-3xl text-white">
            <Bell className="text-brand-cyan" size={26} />
            Notifications
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Stay up to date with your activity</p>
        </div>
        <button onClick={markAllRead} disabled={unreadCount === 0} className="relative z-10 text-sm text-brand-cyan font-bold hover:underline transition-colors disabled:cursor-default disabled:text-slate-600 disabled:no-underline">
          {unreadCount > 0 ? `Mark ${unreadCount} read` : 'All read'}
        </button>
      </div>

      {/* Notification List */}
      <div className="p-4 space-y-2 max-w-2xl mx-auto w-full">
        {loading || notifications.length === 0 ? (
          <div className="kaf-card kaf-cut border border-kaf-border p-10 text-center">
            <Bell size={36} className="mx-auto mb-3 text-slate-600" />
            <h3 className="font-black text-white">{loading ? 'Loading notifications' : 'No notifications'}</h3>
            <p className="mt-1 text-sm text-slate-500">{loading ? 'Checking your live queue.' : 'Your notification queue is clear.'}</p>
          </div>
        ) : notifications.map((n) => {
          const Icon = iconByType[n.type] || Bell
          const iconColor = n.type === 'tournament' ? 'text-brand-gold' : n.type === 'clan' ? 'text-brand-lime' : 'text-brand-cyan'
          const iconBg = n.type === 'tournament' ? 'bg-brand-gold/10 border-brand-gold/20' : 'bg-brand-cyan/10 border-brand-cyan/20'
          return (
            <div
              key={n.id}
              onClick={() => openNotification(n)}
              className={`kaf-cut flex cursor-pointer items-start gap-4 border p-4 transition-all hover:-translate-y-0.5 ${
                !n.read
                  ? 'bg-kaf-card border-kaf-border hover:border-brand-cyan/30'
                  : 'bg-kaf-panel border-kaf-border/50 opacity-60 hover:opacity-80'
              }`}
            >
              <div className={`w-12 h-12 border flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon size={22} className={iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-black text-white text-sm">{n.title}</h3>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-brand-cyan shrink-0"></span>}
                </div>
                <p className="text-slate-400 text-sm mt-0.5 leading-snug">{n.body}</p>
                <p className="text-slate-600 text-xs font-bold uppercase tracking-widest mt-2">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
