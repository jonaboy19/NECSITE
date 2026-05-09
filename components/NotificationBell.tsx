'use client'
import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('notifications')
        .select('id,type,title,body,link,read,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (data) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.read).length)
      }
    }

    fetchNotifications()

    // Realtime subscription
    const channel = supabase.channel('notifications-channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications' 
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev].slice(0, 10))
        setUnreadCount(prev => prev + 1)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleMarkAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true, read_at: new Date().toISOString() }).eq('id', id)
    setUnreadCount(prev => Math.max(0, prev - 1))
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-slate-300 hover:text-brand-cyan transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white border-2 border-kaf-bg">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-72 md:w-80 bg-kaf-panel border border-kaf-border rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-kaf-border flex justify-between items-center bg-slate-900/50">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={async () => {
                  const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
                  if (unreadIds.length > 0) {
                    await supabase.from('notifications').update({ read: true, read_at: new Date().toISOString() }).in('id', unreadIds)
                    setUnreadCount(0)
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
                  }
                }}
                className="text-[10px] text-brand-cyan hover:underline uppercase"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto no-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-sm">
                No new notifications.
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-3 border-b border-kaf-border/50 hover:bg-white/5 transition-colors cursor-pointer ${!n.read ? 'bg-brand-cyan/5' : ''}`}
                  onClick={() => {
                    if (!n.read) handleMarkAsRead(n.id)
                    if (n.link) window.location.href = n.link
                  }}
                >
                  <h4 className={`text-sm ${!n.read ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                    {n.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{n.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
