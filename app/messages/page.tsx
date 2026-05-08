'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatWindow } from '@/components/ChatWindow'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { Search, MessageSquare, Edit2, Users, User, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Thread = {
  id: string
  type: 'dm' | 'clan'
  name: string
  avatar: string | null
  lastMsg: string
  lastTime: string
  unread: number
  recipientId?: string
  clanId?: string
}

export default function MessagesPage() {
  const supabase = createClient()
  const router = useRouter()
  usePushNotifications() // registers SW + subscribes to push

  const [me, setMe] = useState<any>(null)
  const [threads, setThreads] = useState<Thread[]>([])
  const [active, setActive] = useState<Thread | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const [showNewDm, setShowNewDm] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [userResults, setUserResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── Load user ────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('id,username,display_name,avatar_url').eq('id', user.id).single()
      setMe(profile)
    }
    load()
  }, [])

  // ─── Load threads ─────────────────────────────────────────────────────────
  const loadThreads = useCallback(async () => {
    if (!me) return
    setLoading(true)

    // DM threads: last message per conversation partner
    const { data: dmData } = await supabase.rpc('get_dm_threads', { _user_id: me.id }).limit(20)
    
    // Clan chats the user is a member of
    const { data: clanData } = await supabase
      .from('clan_members')
      .select('clan_id,clans:clan_id(id,name,tag,logo_url)')
      .eq('profile_id', me.id)

    const dmThreads: Thread[] = (dmData ?? []).map((d: any) => ({
      id: `dm:${d.partner_id}`,
      type: 'dm',
      name: d.partner_display_name || d.partner_username,
      avatar: d.partner_avatar,
      lastMsg: d.last_message || '',
      lastTime: d.last_at || '',
      unread: d.unread_count ?? 0,
      recipientId: d.partner_id,
    }))

    const clanThreads: Thread[] = (clanData ?? []).map((c: any) => {
      const clan = c.clans
      return {
        id: `clan:${clan.id}`,
        type: 'clan',
        name: `[${clan.tag}] ${clan.name}`,
        avatar: clan.logo_url,
        lastMsg: 'Clan chat',
        lastTime: '',
        unread: 0,
        clanId: clan.id,
      }
    })

    setThreads([...dmThreads, ...clanThreads])
    setLoading(false)
  }, [me])

  useEffect(() => { loadThreads() }, [loadThreads])

  // ─── Realtime: refresh threads on new message ─────────────────────────────
  useEffect(() => {
    if (!me) return
    const ch = supabase.channel('messages-inbox')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${me.id}` },
        () => loadThreads()
      )
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [me, loadThreads])

  const openThread = (t: Thread) => {
    setActive(t)
    setMobileView('chat')
  }

  const searchUsers = useCallback(async (q: string) => {
    if (!q || q.length < 2) { setUserResults([]); return }
    setSearching(true)
    const { data } = await supabase
      .from('profiles')
      .select('id,username,display_name,avatar_url')
      .ilike('username', `%${q}%`)
      .neq('id', me?.id)
      .limit(8)
    setUserResults(data ?? [])
    setSearching(false)
  }, [me])

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => searchUsers(userSearch), 300)
  }, [userSearch, searchUsers])

  const startDm = (user: any) => {
    setShowNewDm(false)
    setUserSearch('')
    setUserResults([])
    const t: Thread = {
      id: `dm:${user.id}`,
      type: 'dm',
      name: user.display_name || user.username,
      avatar: user.avatar_url,
      lastMsg: '',
      lastTime: '',
      unread: 0,
      recipientId: user.id,
    }
    // Add to top of threads if not already there
    setThreads(prev => prev.find(x => x.id === t.id) ? prev : [t, ...prev])
    openThread(t)
  }

  const filtered = threads.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  )

  if (!me) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-6 h-6 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const chatProps = active ? (
    active.type === 'dm'
      ? {
          mode: { type: 'dm' as const, recipientId: active.recipientId!, recipientName: active.name, recipientAvatar: active.avatar },
          currentUser: { id: me.id, username: me.username, avatar_url: me.avatar_url },
          onBack: () => setMobileView('list'),
        }
      : {
          mode: { type: 'clan' as const, clanId: active.clanId!, clanName: active.name },
          currentUser: { id: me.id, username: me.username, avatar_url: me.avatar_url },
          onBack: () => setMobileView('list'),
        }
  ) : null

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden">
      {/* ── Conversation sidebar ── */}
      <div className={`relative flex flex-col w-full md:w-80 lg:w-96 border-r border-kaf-border bg-kaf-panel shrink-0 ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-kaf-border">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-display font-black text-white">Messages</h1>
            <button
              onClick={() => setShowNewDm(true)}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-brand-cyan transition-colors"
              title="New message">
              <Edit2 size={16} />
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-slate-900 border border-kaf-border rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-brand-cyan/50 transition-colors" />
          </div>
        </div>

        {/* New DM modal */}
        {showNewDm && (
          <div className="absolute inset-0 z-50 flex items-start justify-center pt-16 px-4">
            <div className="absolute inset-0 bg-kaf-bg/80 backdrop-blur-sm" onClick={() => setShowNewDm(false)} />
            <div className="relative w-full max-w-sm bg-kaf-panel border border-kaf-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-kaf-border">
                <span className="font-black text-white">New Message</span>
                <button onClick={() => setShowNewDm(false)} className="text-slate-400 hover:text-white"><X size={16} /></button>
              </div>
              <div className="p-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input autoFocus value={userSearch} onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search by username..."
                    className="w-full bg-slate-900 border border-kaf-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-brand-cyan/50 transition-colors" />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {searching && <div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin text-brand-cyan" /></div>}
                {!searching && userResults.length === 0 && userSearch.length > 1 && (
                  <div className="text-center py-6 text-slate-500 text-sm">No players found</div>
                )}
                {userResults.map(u => (
                  <button key={u.id} onClick={() => startDm(u)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-kaf-border/50 last:border-0">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-kaf-border overflow-hidden flex items-center justify-center shrink-0">
                      {u.avatar_url
                        ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                        : <User size={18} className="text-slate-500" />}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{u.display_name || u.username}</div>
                      <div className="text-xs text-slate-500">@{u.username}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-800 rounded w-2/3" />
                    <div className="h-2 bg-slate-800 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <MessageSquare size={40} className="text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm font-bold">No conversations yet</p>
              <p className="text-slate-600 text-xs mt-1">Search for a player to start chatting</p>
            </div>
          ) : (
            filtered.map(t => {
              const isActive = active?.id === t.id
              return (
                <button key={t.id} onClick={() => openThread(t)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-kaf-border/50 transition-colors ${
                    isActive ? 'bg-brand-cyan/10 border-l-2 border-l-brand-cyan' : 'hover:bg-white/5'
                  }`}>
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-kaf-border flex items-center justify-center overflow-hidden">
                      {t.avatar
                        ? <img src={t.avatar} alt="" className="w-full h-full object-cover" />
                        : t.type === 'clan'
                          ? <Users size={20} className="text-brand-cyan" />
                          : <User size={20} className="text-slate-500" />
                      }
                    </div>
                    {t.type === 'dm' && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-kaf-panel" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-bold text-sm truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>{t.name}</span>
                      {t.lastTime && <span className="text-[10px] text-slate-500 shrink-0">{new Date(t.lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500 truncate">{t.lastMsg.length > 40 ? t.lastMsg.slice(0, 40) + '…' : t.lastMsg}</span>
                      {t.unread > 0 && (
                        <span className="shrink-0 min-w-5 h-5 px-1.5 bg-brand-cyan text-slate-900 text-[10px] font-black rounded-full flex items-center justify-center">
                          {t.unread > 99 ? '99+' : t.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── Chat panel ── */}
      <div className={`flex-1 ${mobileView === 'list' && !active ? 'hidden md:flex' : 'flex'} flex-col`}>
        {chatProps && active ? (
          <ChatWindow {...chatProps} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 text-slate-600">
            <MessageSquare size={64} className="opacity-20" />
            <div>
              <p className="font-black text-slate-400">Select a conversation</p>
              <p className="text-sm mt-1">Choose from the left or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
