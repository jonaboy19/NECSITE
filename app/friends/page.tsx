'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users2, UserPlus, Check, X, MessageSquare, Loader2, Search } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/Toast'

export default function FriendsPage() {
  const supabase = createClient()
  const { success, error: toastError } = useToast()
  const [userId, setUserId] = useState<string | null>(null)
  const [friends, setFriends] = useState<any[]>([])
  const [pending, setPending] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      loadFriends(user.id)
    })
  }, [])

  async function loadFriends(uid: string) {
    const { data } = await supabase.from('friendships')
      .select('*, profile:requester_id(id,username,display_name,avatar_url,country), profile2:addressee_id(id,username,display_name,avatar_url,country)')
      .or(`requester_id.eq.${uid},addressee_id.eq.${uid}`)
    const accepted = (data ?? []).filter((f: any) => f.status === 'accepted')
    const pend = (data ?? []).filter((f: any) => f.status === 'pending' && f.addressee_id === uid)
    setFriends(accepted)
    setPending(pend)
    setLoading(false)
  }

  async function doSearch() {
    if (!search.trim()) return
    setSearching(true)
    const { data } = await supabase.from('profiles').select('id,username,display_name,avatar_url,country')
      .ilike('username', `%${search}%`).limit(8)
    setSearchResults(data ?? [])
    setSearching(false)
  }

  async function sendRequest(addresseeId: string) {
    if (!userId) return
    const { error } = await supabase.from('friendships').insert({ requester_id: userId, addressee_id: addresseeId, status: 'pending' })
    if (error) toastError(error.message)
    else { success('Friend request sent!'); setSearchResults(r => r.filter(p => p.id !== addresseeId)) }
  }

  async function accept(id: string) {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', id)
    if (userId) loadFriends(userId)
    success('Friend accepted!')
  }

  async function decline(id: string) {
    await supabase.from('friendships').update({ status: 'rejected' }).eq('id', id)
    if (userId) loadFriends(userId)
  }

  const getFriend = (f: any) => f.requester_id === userId ? f.profile2 : f.profile

  return (
    <div className="flex flex-col w-full pb-24">
      <div className="border-b border-kaf-border px-4 sm:px-8 py-6 bg-kaf-panel">
        <h1 className="text-3xl font-display font-black text-white uppercase flex items-center gap-3">
          <Users2 size={24} className="text-brand-cyan" /> Friends
        </h1>
        <p className="text-slate-400 text-sm mt-1">Connect with players across KAFConnect.</p>
      </div>

      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 space-y-8">
        {/* Search */}
        <div className="space-y-3">
          <h2 className="text-sm font-black text-white uppercase tracking-wide">Find Players</h2>
          <div className="flex gap-2">
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()}
              placeholder="Search by username..."
              className="flex-1 px-3 py-2.5 bg-slate-800 border border-kaf-border rounded-xl text-white text-sm placeholder-slate-600 focus:border-brand-cyan focus:outline-none" />
            <button onClick={doSearch} disabled={searching}
              className="px-4 py-2 bg-brand-cyan hover:bg-brand-cyan/80 text-slate-900 rounded-xl font-black text-sm flex items-center gap-2">
              {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            </button>
          </div>
          {searchResults.map(p => (
            <div key={p.id} className="flex items-center gap-3 kaf-card p-3 rounded-xl border border-kaf-border">
              <div className="w-9 h-9 rounded-full bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center font-black text-brand-cyan text-sm">
                {(p.display_name || p.username || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1"><div className="text-sm font-bold text-white">{p.display_name || p.username}</div><div className="text-xs text-slate-500">@{p.username} {p.country && `· ${p.country}`}</div></div>
              <button onClick={() => sendRequest(p.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan rounded-xl text-xs font-black transition-all">
                <UserPlus size={12} /> Add
              </button>
            </div>
          ))}
        </div>

        {/* Pending */}
        {pending.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-2">
              Requests <span className="w-5 h-5 rounded-full bg-brand-cyan text-slate-900 text-[10px] font-black flex items-center justify-center">{pending.length}</span>
            </h2>
            {pending.map(f => {
              const p = f.profile
              return (
                <div key={f.id} className="flex items-center gap-3 kaf-card p-3 rounded-xl border border-brand-cyan/20">
                  <div className="w-9 h-9 rounded-full bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center font-black text-brand-cyan text-sm">
                    {(p?.display_name || p?.username || '?')[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1"><div className="text-sm font-bold text-white">{p?.display_name || p?.username}</div><div className="text-xs text-slate-500">@{p?.username}</div></div>
                  <button onClick={() => accept(f.id)} className="p-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors"><Check size={14} /></button>
                  <button onClick={() => decline(f.id)} className="p-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"><X size={14} /></button>
                </div>
              )
            })}
          </div>
        )}

        {/* Friends list */}
        <div className="space-y-3">
          <h2 className="text-sm font-black text-white uppercase tracking-wide">Friends ({friends.length})</h2>
          {loading ? <Loader2 size={20} className="animate-spin text-slate-500" /> :
          friends.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Users2 size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No friends yet. Search for players above!</p>
            </div>
          ) : friends.map(f => {
            const p = getFriend(f)
            return (
              <div key={f.id} className="flex items-center gap-3 kaf-card p-3 rounded-xl border border-kaf-border">
                <div className="w-9 h-9 rounded-full bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center font-black text-brand-cyan text-sm">
                  {(p?.display_name || p?.username || '?')[0]?.toUpperCase()}
                </div>
                <div className="flex-1"><div className="text-sm font-bold text-white">{p?.display_name || p?.username}</div><div className="text-xs text-slate-500">@{p?.username} {p?.country && `· ${p.country}`}</div></div>
                <Link href={`/messages?dm=${p?.id}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-kaf-border text-slate-300 rounded-xl text-xs font-black transition-colors">
                  <MessageSquare size={12} /> Message
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
