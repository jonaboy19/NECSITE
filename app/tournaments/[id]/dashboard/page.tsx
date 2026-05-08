import { createServerSupabaseClient } from '@/lib/supabase/server'
import MatchCard from '@/components/MatchCard'
import HostControlPanel from '@/components/HostControlPanel'
import { Trophy, Users, GitMerge, ChevronLeft, Calendar, Shield, Map, Settings, Play, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'

export default async function Dashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: tournament } = await supabase.from('tournaments').select('*').eq('id', id).single()
  const { data: matches } = await supabase.from('match_details').select('*').eq('tournament_id', id).order('round')
  // Fetch profiles along with registrations
  const { data: players } = await supabase.from('tournament_registrations').select('*, profiles(username, avatar_url), clans(name)').eq('tournament_id', id)

  // Check if current user is the host
  const { data: { user } } = await supabase.auth.getUser()
  const isHost = user && (user.id === tournament?.creator_id)
  
  // Also check if admin
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    isAdmin = ['admin', 'super_admin', 'moderator'].includes(profile?.role || '')
  }

  const isLive = tournament?.status === 'live';

  return (
    <div className="flex flex-col w-full pb-20">
      <PublicHeader />
      {/* Tournament Hero */}
      <section className="relative w-full h-[40vh] min-h-[350px] bg-kaf-panel overflow-hidden border-b border-kaf-border flex items-end">
        <div className="absolute inset-0 bg-[url('/kaf-eleague-s1-poster.png')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-kaf-bg via-kaf-bg/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-kaf-bg via-kaf-bg/50 to-transparent"></div>
        
        <div className="relative z-10 p-6 md:p-12 w-full max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="w-full">
            <Link href="/tournaments" className="text-brand-cyan hover:underline flex items-center gap-2 mb-4 text-sm font-bold uppercase tracking-widest w-fit">
              <ChevronLeft size={16} /> Back to Events
            </Link>
            
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded text-xs font-black uppercase tracking-widest ${
                isLive ? 'bg-status-live text-white shadow-[0_0_15px_rgba(255,0,60,0.5)]' :
                tournament?.status === 'registration_open' ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30' :
                'bg-slate-700 text-white'
              }`}>
                {tournament?.status?.replace('_', ' ') || 'Unknown Status'}
              </span>
              <span className="px-3 py-1 rounded bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan text-xs font-black uppercase tracking-widest">
                {tournament?.format?.replace('_', ' ') || 'Tournament'}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-display font-black tracking-tight text-white mb-2 leading-tight">
              {tournament?.title || 'Unknown Event'}
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl font-medium mb-6">
              {tournament?.description || 'The ultimate proving grounds for KAF esports competitors.'}
            </p>
            
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center border border-brand-gold/30">
                  <Trophy size={18} className="text-brand-gold" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Prize Pool</div>
                  <div className="font-bold text-white text-lg">{tournament?.prize_pool || 'TBD'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-brand-cyan/10 flex items-center justify-center border border-brand-cyan/30">
                  <Users size={18} className="text-brand-cyan" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Participants</div>
                  <div className="font-bold text-white text-lg">{players?.length || 0} / {tournament?.max_participants || '∞'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/30">
                  <GitMerge size={18} className="text-purple-400" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Matches</div>
                  <div className="font-bold text-white text-lg">{matches?.length || 0}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0 flex flex-col gap-3 min-w-[200px]">
            {tournament?.status === 'registration_open' ? (
              <Link href={`/tournaments/${id}/join`} className="w-full text-center rounded-xl bg-brand-cyan px-6 py-4 font-bold text-kaf-bg hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                Register for Event
              </Link>
            ) : null}
            <Link href={`/tournaments/${id}/bracket`} className="w-full flex items-center justify-center gap-2 rounded-xl bg-kaf-card border border-kaf-border px-6 py-4 font-bold text-white hover:bg-white/10 transition-all">
              <Map size={18} /> View Bracket
            </Link>
          </div>
        </div>
      </section>

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full grid lg:grid-cols-3 gap-8">
        
        {/* Left Col: Matches & Host Controls */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Host Control Panel */}
          {(isHost || isAdmin) && (
            <HostControlPanel tournamentId={id} initialStatus={tournament?.status || 'draft'} />
          )}

          <div className="flex items-center justify-between border-b border-kaf-border pb-4">
            <h2 className="text-2xl font-display font-black uppercase tracking-wider flex items-center gap-2 text-white">
              <span className="w-2 h-8 bg-brand-cyan rounded-full"></span>
              Match Schedule
            </h2>
            <Link href={`/tournaments/${id}/bracket`} className="text-brand-cyan text-sm font-bold hover:underline">
              Full Bracket
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {matches?.length === 0 ? (
              <div className="col-span-full py-12 flex flex-col items-center justify-center bg-kaf-card rounded-2xl border border-dashed border-kaf-border text-slate-400">
                <GitMerge size={32} className="mb-3 opacity-50" />
                <p>No matches have been generated yet.</p>
              </div>
            ) : (
              matches?.map(m => <MatchCard key={m.id} m={m} />)
            )}
          </div>
        </div>

        {/* Right Col: Participants */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-kaf-border pb-4">
            <h2 className="text-xl font-display font-black uppercase tracking-wider flex items-center gap-2 text-white">
              <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
              Roster
            </h2>
          </div>

          <div className="kaf-card rounded-2xl border border-kaf-border p-4 space-y-3">
            {players?.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                No players have registered yet.
              </div>
            ) : (
              players?.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-kaf-border">
                  <div className="w-10 h-10 rounded-full bg-kaf-bg border border-kaf-border bg-cover bg-center shrink-0" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${p.profiles?.username || p.player_id}')` }}></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">{p.profiles?.username || 'Unknown Player'}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold truncate flex items-center gap-1">
                      {p.clans?.name ? <><Shield size={10} className="text-purple-400"/> {p.clans.name}</> : 'Free Agent'}
                    </div>
                  </div>
                  {p.seed && (
                    <div className="w-6 h-6 rounded-full bg-kaf-bg text-slate-400 flex items-center justify-center text-xs font-black border border-kaf-border">
                      {p.seed}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
