'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Send, Mic, Smile, MoreVertical, Phone, Check, CheckCheck,
  Play, Pause, Users, User, ArrowLeft
} from 'lucide-react'
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react'
import { VoiceRecorder } from '@/components/VoiceRecorder'
import { sendPushToUser } from '@/hooks/usePushNotifications'

const QUICK_REACTIONS = ['❤️', '😂', '👍', '😮', '😢', '🙏']

// ─── Types ───────────────────────────────────────────────────────────────────
type MessageType = {
  id: string
  sender_id: string
  body: string | null
  content_type: 'text' | 'audio' | 'system'
  audio_url?: string | null
  audio_duration?: number | null
  created_at: string
  read_at?: string | null
  reactions?: ReactionGroup[]
  profile?: { username: string; display_name: string | null; avatar_url: string | null }
}

type ReactionGroup = { emoji: string; count: number; byMe: boolean }

type ChatMode = 
  | { type: 'dm'; recipientId: string; recipientName: string; recipientAvatar: string | null }
  | { type: 'clan'; clanId: string; clanName: string }

interface Props {
  mode: ChatMode
  currentUser: { id: string; username: string; avatar_url: string | null }
  onBack?: () => void
}

// ─── Audio Player ─────────────────────────────────────────────────────────────
function AudioBubble({ url, duration }: { url: string; duration: number | null }) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(url)
      audioRef.current.ontimeupdate = () => {
        const pct = (audioRef.current!.currentTime / audioRef.current!.duration) * 100
        setProgress(isNaN(pct) ? 0 : pct)
      }
      audioRef.current.onended = () => { setPlaying(false); setProgress(0) }
    }
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play(); setPlaying(true) }
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

  return (
    <div className="flex items-center gap-2 min-w-[160px]">
      <button onClick={toggle} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0">
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <div className="flex-1">
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="text-[10px] mt-0.5 opacity-70">{duration ? fmt(duration) : '0:00'}</div>
      </div>
      <Mic size={12} className="opacity-50 shrink-0" />
    </div>
  )
}

// ─── Reaction picker ──────────────────────────────────────────────────────────
function ReactionPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      {open && (
        <div className="absolute bottom-8 right-0 z-50">
          <EmojiPicker theme={Theme.DARK} onEmojiClick={(d: EmojiClickData) => { onPick(d.emoji); setOpen(false) }}
            width={300} height={400} />
        </div>
      )}
      {/* Quick reactions */}
      <div className="flex items-center gap-0.5 bg-slate-800 border border-kaf-border rounded-full px-1.5 py-0.5 shadow-xl">
        {QUICK_REACTIONS.map(e => (
          <button key={e} onClick={() => onPick(e)} className="text-sm hover:scale-125 transition-transform p-0.5">{e}</button>
        ))}
        <button onClick={() => setOpen(o => !o)} className="text-slate-400 hover:text-white ml-1 text-xs">+</button>
      </div>
    </div>
  )
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function Bubble({
  msg, isMine, reactions, onReact, showAvatar, senderName,
}: {
  msg: MessageType; isMine: boolean
  reactions: ReactionGroup[]
  onReact: (emoji: string) => void
  showAvatar: boolean
  senderName?: string
}) {
  const [showReactions, setShowReactions] = useState(false)
  const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1 group px-4`}>
      {/* Avatar (non-mine) */}
      {!isMine && showAvatar ? (
        <div className="w-7 h-7 rounded-full bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center text-[10px] font-black text-brand-cyan shrink-0 mr-2 self-end mb-4">
          {msg.profile?.avatar_url
            ? <img src={msg.profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            : (msg.profile?.display_name || msg.profile?.username || '?')[0].toUpperCase()
          }
        </div>
      ) : !isMine ? <div className="w-9 mr-0" /> : null}

      <div className={`relative max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Sender name in group */}
        {!isMine && senderName && showAvatar && (
          <span className="text-[10px] font-bold text-brand-cyan ml-1 mb-0.5">{senderName}</span>
        )}

        {/* Bubble */}
        <div
          className={`relative px-3 py-2 rounded-2xl text-sm leading-relaxed cursor-pointer select-text ${
            isMine
              ? 'bg-brand-cyan text-slate-900 rounded-br-sm'
              : 'bg-slate-800 text-white border border-kaf-border rounded-bl-sm'
          }`}
          onDoubleClick={() => setShowReactions(true)}
        >
          {msg.content_type === 'audio' && msg.audio_url ? (
            <AudioBubble url={msg.audio_url} duration={msg.audio_duration ?? null} />
          ) : (
            <span>{msg.body}</span>
          )}

          {/* Time + read receipt */}
          <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-[10px] ${isMine ? 'text-slate-700' : 'text-slate-500'}`}>{time}</span>
            {isMine && (
              msg.read_at
                ? <CheckCheck size={12} className="text-slate-700" />
                : <Check size={12} className="text-slate-600" />
            )}
          </div>
        </div>

        {/* Reactions display */}
        {reactions.length > 0 && (
          <div className={`flex gap-0.5 flex-wrap mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
            {reactions.map(r => (
              <button key={r.emoji} onClick={() => onReact(r.emoji)}
                className={`text-xs px-1.5 py-0.5 rounded-full border transition-all ${
                  r.byMe ? 'bg-brand-cyan/20 border-brand-cyan/40' : 'bg-slate-800 border-kaf-border'
                }`}>
                {r.emoji} {r.count > 1 ? r.count : ''}
              </button>
            ))}
          </div>
        )}

        {/* Reaction picker (on hover or double-click) */}
        {showReactions && (
          <div className={`absolute ${isMine ? 'right-0' : 'left-0'} -top-10 z-20`}>
            <ReactionPicker onPick={e => { onReact(e); setShowReactions(false) }} />
          </div>
        )}
        <div className={`absolute opacity-0 group-hover:opacity-100 transition-opacity ${isMine ? 'right-full mr-2' : 'left-full ml-2'} top-0 z-10`}>
          <button onClick={() => setShowReactions(s => !s)} className="p-1 rounded hover:bg-white/10 text-slate-500">
            <Smile size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Chat Window ─────────────────────────────────────────────────────────
export function ChatWindow({ mode, currentUser, onBack }: Props) {
  const supabase = createClient()
  const [messages, setMessages] = useState<MessageType[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [theyTyping, setTheyTyping] = useState(false)
  const [showVoice, setShowVoice] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [online, setOnline] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const reactTable = mode.type === 'dm' ? 'message_reactions' : 'clan_message_reactions'

  // ─── Load initial messages ────────────────────────────────────────────────
  const loadMessages = useCallback(async () => {
    let query = supabase.from(
      mode.type === 'dm' ? 'messages' : 'clan_chat_messages'
    ).select(`*, profile:profiles!sender_id(username,display_name,avatar_url)`)

    if (mode.type === 'dm') {
      query = query.or(
        `and(sender_id.eq.${currentUser.id},recipient_id.eq.${mode.recipientId}),and(sender_id.eq.${mode.recipientId},recipient_id.eq.${currentUser.id})`
      )
    } else {
      query = query.eq('clan_id', mode.clanId)
    }

    const { data } = await query.order('created_at', { ascending: true }).limit(100)
    if (!data) return

    // Load reactions for each message
    const ids = data.map(m => m.id)
    const { data: rxns } = await supabase.from(reactTable)
      .select('message_id,emoji,user_id').in('message_id', ids)

    const rxnMap: Record<string, ReactionGroup[]> = {}
    ;(rxns ?? []).forEach((r: any) => {
      if (!rxnMap[r.message_id]) rxnMap[r.message_id] = []
      const existing = rxnMap[r.message_id].find(g => g.emoji === r.emoji)
      if (existing) { existing.count++; if (r.user_id === currentUser.id) existing.byMe = true }
      else rxnMap[r.message_id].push({ emoji: r.emoji, count: 1, byMe: r.user_id === currentUser.id })
    })

    setMessages(data.map(m => ({ ...m, reactions: rxnMap[m.id] ?? [] })))

    // Mark DMs as read
    if (mode.type === 'dm') {
      await supabase.from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_id', currentUser.id)
        .eq('sender_id', mode.recipientId)
        .is('read_at', null)
    }
  }, [mode, currentUser.id])

  useEffect(() => { loadMessages() }, [loadMessages])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // ─── Realtime subscription ────────────────────────────────────────────────
  useEffect(() => {
    const chName = mode.type === 'dm'
      ? `dm:${[currentUser.id, mode.recipientId].sort().join(':')}`
      : `clan:${mode.clanId}`

    const ch = supabase.channel(chName, { config: { presence: { key: currentUser.id } } })
    channelRef.current = ch

    ch
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        setMessages(prev => [...prev, { ...payload, reactions: [] }])
        // Mark as read if DM from them
        if (mode.type === 'dm' && payload.sender_id === mode.recipientId) {
          supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', payload.id)
        }
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id !== currentUser.id) {
          setTheyTyping(true)
          setTimeout(() => setTheyTyping(false), 2500)
        }
      })
      .on('broadcast', { event: 'reaction' }, () => { loadMessages() })
      .on('presence', { event: 'sync' }, () => {
        const state = ch.presenceState()
        if (mode.type === 'dm') setOnline(Object.keys(state).includes(mode.recipientId))
      })
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') await ch.track({ user_id: currentUser.id, online_at: new Date().toISOString() })
      })

    return () => { supabase.removeChannel(ch) }
  }, [mode, currentUser.id])

  // ─── Typing indicator ─────────────────────────────────────────────────────
  const handleTyping = (val: string) => {
    setInput(val)
    if (!typing) {
      setTyping(true)
      channelRef.current?.send({ type: 'broadcast', event: 'typing', payload: { user_id: currentUser.id } })
    }
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => setTyping(false), 2000)
  }

  // ─── Send text ────────────────────────────────────────────────────────────
  const sendText = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')

    const base = {
      sender_id: currentUser.id,
      body: text,
      content_type: 'text',
      created_at: new Date().toISOString(),
    }
    const payload = mode.type === 'dm'
      ? { ...base, recipient_id: mode.recipientId }
      : { ...base, clan_id: mode.clanId }

    const table = mode.type === 'dm' ? 'messages' : 'clan_chat_messages'
    const { data: saved } = await supabase.from(table).insert(payload as any).select().single()
    if (!saved) return

    channelRef.current?.send({ type: 'broadcast', event: 'message', payload: saved })

    // Push notification
    if (mode.type === 'dm') {
      sendPushToUser(supabase, mode.recipientId,
        `New message from ${currentUser.username}`, text, '/messages')
    }
  }

  // ─── Send voice ────────────────────────────────────────────────────────────
  const sendVoice = async (audioBlob: Blob, duration: number) => {
    setShowVoice(false)
    setUploading(true)
    try {
      const path = `${currentUser.id}/${Date.now()}.webm`
      const { data: upload, error } = await supabase.storage.from('audio-messages').upload(path, audioBlob)
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from('audio-messages').getPublicUrl(path)
      const table = mode.type === 'dm' ? 'messages' : 'clan_chat_messages'
      const base = { sender_id: currentUser.id, body: null, content_type: 'audio', audio_url: publicUrl, audio_duration: duration, created_at: new Date().toISOString() }
      const payload = mode.type === 'dm' ? { ...base, recipient_id: mode.recipientId } : { ...base, clan_id: mode.clanId }

      const { data: saved } = await supabase.from(table).insert(payload as any).select().single()
      if (saved) {
        channelRef.current?.send({ type: 'broadcast', event: 'message', payload: saved })
        if (mode.type === 'dm') sendPushToUser(supabase, mode.recipientId, `🎤 Voice message from ${currentUser.username}`, '', '/messages')
      }
    } catch (e) { console.error(e) }
    setUploading(false)
  }

  // ─── React to message ──────────────────────────────────────────────────────
  const reactToMessage = async (messageId: string, emoji: string) => {
    const existing = await supabase.from(reactTable)
      .select('id').eq('message_id', messageId).eq('user_id', currentUser.id).eq('emoji', emoji).maybeSingle()

    if (existing.data) {
      await supabase.from(reactTable).delete().eq('id', existing.data.id)
    } else {
      await supabase.from(reactTable).insert({ message_id: messageId, user_id: currentUser.id, emoji })
    }
    channelRef.current?.send({ type: 'broadcast', event: 'reaction', payload: { message_id: messageId } })
    loadMessages()
  }

  // ─── Header info ───────────────────────────────────────────────────────────
  const headerName = mode.type === 'dm' ? mode.recipientName : mode.clanName
  const headerSub = mode.type === 'dm'
    ? (online ? '🟢 Online' : 'Offline')
    : 'Clan Chat'

  return (
    <div className="flex flex-col h-full bg-kaf-bg">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-kaf-panel border-b border-kaf-border shrink-0">
        {onBack && (
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 transition-colors">
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="w-9 h-9 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center shrink-0">
          {mode.type === 'clan' ? <Users size={16} className="text-brand-cyan" /> : <User size={16} className="text-brand-cyan" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-white text-sm truncate">{headerName}</div>
          <div className="text-[10px] text-slate-400 font-mono">
            {theyTyping ? <span className="text-brand-cyan animate-pulse">typing...</span> : headerSub}
          </div>
        </div>
        {mode.type === 'dm' && (
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"><Phone size={16} /></button>
            <button className="p-2 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"><MoreVertical size={16} /></button>
          </div>
        )}
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto py-4 space-y-0.5">
        {messages.map((msg, i) => {
          const isMine = msg.sender_id === currentUser.id
          const showAvatar = !isMine && (i === 0 || messages[i - 1]?.sender_id !== msg.sender_id)
          const senderName = msg.profile?.display_name || msg.profile?.username || ''
          return (
            <Bubble
              key={msg.id}
              msg={msg}
              isMine={isMine}
              reactions={msg.reactions ?? []}
              onReact={e => reactToMessage(msg.id, e)}
              showAvatar={showAvatar}
              senderName={mode.type === 'clan' ? senderName : undefined}
            />
          )
        })}

        {theyTyping && (
          <div className="flex items-center gap-2 px-4">
            <div className="px-3 py-2 bg-slate-800 border border-kaf-border rounded-2xl rounded-bl-sm">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Voice recorder overlay */}
      {showVoice ? (
        <VoiceRecorder onSend={sendVoice} onCancel={() => setShowVoice(false)} />
      ) : (
        /* Input bar */
        <div className="flex items-center gap-2 px-3 py-3 bg-kaf-panel border-t border-kaf-border shrink-0">
          <input
            value={input}
            onChange={e => handleTyping(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendText())}
            placeholder="Message..."
            className="flex-1 bg-slate-900 border border-kaf-border rounded-full px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-brand-cyan/50 transition-colors"
            disabled={uploading}
          />
          {input.trim() ? (
            <button onClick={sendText}
              className="w-10 h-10 rounded-full bg-brand-cyan hover:bg-brand-cyan/80 flex items-center justify-center text-slate-900 transition-colors shrink-0">
              <Send size={16} />
            </button>
          ) : (
            <button onClick={() => setShowVoice(true)} disabled={uploading}
              className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 border border-kaf-border flex items-center justify-center text-slate-400 hover:text-brand-cyan transition-colors shrink-0">
              {uploading ? <span className="w-4 h-4 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" /> : <Mic size={16} />}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
