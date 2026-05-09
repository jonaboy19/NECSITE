'use client'

import { useEffect, useState } from 'react'
import { Send, Loader2, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'

export function MatchRoomChat({ matchId }: { matchId: string }) {
  const supabase = createClient()
  const toast = useToast()
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    let mounted = true

    async function load() {
      const { data } = await supabase
        .from('match_room_messages')
        .select('id,message,message_type,created_at,profiles:sender_id(username,avatar_url)')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true })
        .limit(80)
      if (mounted) {
        setMessages(data || [])
        setLoading(false)
      }
    }

    load()
    const channel = supabase
      .channel(`match-room-${matchId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_room_messages', filter: `match_id=eq.${matchId}` }, payload => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [matchId, supabase])

  const send = async () => {
    if (!text.trim()) return
    setSending(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Sign in to chat in the match room.')
      setSending(false)
      return
    }
    const { error } = await supabase.from('match_room_messages').insert({
      match_id: matchId,
      sender_id: user.id,
      message: text.trim(),
      message_type: 'chat',
    })
    if (error) toast.error(error.message)
    else setText('')
    setSending(false)
  }

  return (
    <div className="depth-panel rounded-2xl p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-white">
        <MessageSquare size={16} className="text-brand-lime" /> Match Chat
      </h2>
      <div className="mb-4 max-h-72 space-y-3 overflow-y-auto rounded-xl border border-white/[0.06] bg-black/20 p-3">
        {loading ? (
          <div className="flex justify-center py-8 text-slate-500"><Loader2 className="animate-spin" /></div>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No messages yet. Use this room for lobby codes, scheduling, and referee updates.</p>
        ) : (
          messages.map((msg, i) => (
            <div key={msg.id || i} className="rounded-lg border border-white/[0.05] bg-white/[0.03] p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-xs font-black text-brand-lime">{msg.profiles?.username || 'Match room'}</span>
                <span className="text-[10px] text-slate-600">{msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
              </div>
              <p className="text-sm text-slate-200">{msg.message}</p>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send() }}
          placeholder="Send lobby code, setup note, or referee update..."
          className="min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-brand-lime"
        />
        <button onClick={send} disabled={sending || !text.trim()} className="inline-flex items-center gap-2 rounded-lg bg-brand-cyan px-4 py-2 text-sm font-black text-black disabled:opacity-50">
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>
    </div>
  )
}
