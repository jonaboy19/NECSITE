'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Loader2, Trash2, MessageSquare, Lock } from 'lucide-react'
import { useToast } from '@/components/Toast'

interface ClanChatProps { clanId: string; isMember: boolean; currentUserId?: string }

export function ClanChat({ clanId, isMember, currentUserId }: ClanChatProps) {
  const supabase = createClient()
  const { error: toastError } = useToast()
  const [messages, setMessages] = useState<any[]>([])
  const [profiles, setProfiles] = useState<Record<string, any>>({})
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 50)
  }

  async function load() {
    const { data, error } = await supabase
      .from('clan_chat_messages')
      .select('*')
      .eq('clan_id', clanId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .limit(200)
    if (error) { toastError(error.message); setLoading(false); return }
    setMessages(data ?? [])
    const ids = Array.from(new Set((data ?? []).map((m: any) => m.sender_id as string))) as string[]
    if (ids.length) {
      const { data: prof } = await supabase.from('profiles').select('id,display_name,username,avatar_url').in('id', ids)
      const map: Record<string, any> = {}
      ;(prof ?? []).forEach(p => { map[p.id] = p })
      setProfiles(map)
    }
    setLoading(false)
    scrollToBottom()
  }

  useEffect(() => { load() }, [clanId])

  useEffect(() => {
    const ch = supabase.channel(`clan_chat_${clanId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'clan_chat_messages', filter: `clan_id=eq.${clanId}` },
        async (payload: any) => {
          const newMsg = payload.new
          if (newMsg.deleted_at) return
          setMessages(prev => [...prev, newMsg])
          if (!profiles[newMsg.sender_id]) {
            const { data } = await supabase.from('profiles').select('id,display_name,username,avatar_url').eq('id', newMsg.sender_id).single()
            if (data) setProfiles(p => ({ ...p, [data.id]: data }))
          }
          scrollToBottom()
        })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [clanId, profiles])

  async function send() {
    if (!body.trim() || !currentUserId) return
    setSending(true)
    const { error } = await supabase.from('clan_chat_messages').insert({
      clan_id: clanId, sender_id: currentUserId, body: body.trim(),
    })
    setSending(false)
    if (error) toastError(error.message)
    else setBody('')
  }

  async function deleteMsg(id: string) {
    await supabase.from('clan_chat_messages').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    setMessages(prev => prev.filter(m => m.id !== id))
  }

  if (!isMember) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
        <Lock size={32} className="mb-3 opacity-40" />
        <p className="text-sm font-medium">Clan chat is only visible to members.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-96 rounded-2xl border border-kaf-border overflow-hidden bg-slate-900/50">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-kaf-border">
        <MessageSquare size={14} className="text-brand-cyan" />
        <span className="text-xs font-black uppercase tracking-widest text-white">Clan Chat</span>
        <span className="text-[10px] text-slate-500 ml-auto">Real-time</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-kaf-border">
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-slate-500" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-8">No messages yet. Say hi! 👋</div>
        ) : messages.map((msg) => {
          const p = profiles[msg.sender_id]
          const isOwn = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex items-start gap-2.5 group ${isOwn ? 'flex-row-reverse' : ''}`}>
              <div className="w-7 h-7 rounded-full bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center text-[10px] font-black text-brand-cyan shrink-0">
                {(p?.display_name || p?.username || '?')[0]?.toUpperCase()}
              </div>
              <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                {!isOwn && (
                  <span className="text-[10px] text-slate-500 font-bold px-1">{p?.display_name || p?.username}</span>
                )}
                <div className={`px-3 py-2 rounded-2xl text-sm break-words ${
                  isOwn ? 'bg-brand-cyan text-slate-900 font-medium rounded-tr-sm' : 'bg-slate-800 text-white rounded-tl-sm'
                }`}>
                  {msg.body}
                </div>
                <span className="text-[9px] text-slate-600 px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {isOwn && (
                <button onClick={() => deleteMsg(msg.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-600 hover:text-red-400">
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div className="border-t border-kaf-border p-3 flex gap-2">
        <input
          type="text"
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="Type a message..."
          className="flex-1 bg-slate-800 border border-kaf-border rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-brand-cyan focus:outline-none transition-all"
        />
        <button
          onClick={send}
          disabled={sending || !body.trim()}
          className="px-3 py-2 bg-brand-cyan hover:bg-brand-cyan/80 text-slate-900 rounded-xl transition-colors disabled:opacity-40"
        >
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>
    </div>
  )
}
