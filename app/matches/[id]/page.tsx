import Link from 'next/link'
import { ArrowLeft, Clock, Trophy, Play, Info, Activity, Users, ShieldAlert } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import DisputeUpload from '@/components/DisputeUpload'

export default async function MatchPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient()
  
  // Fetch match details
  const { data: match, error } = await supabase
    .from('matches')
    .select(`
      *,
      tournament:tournaments(*),
      player_a:profiles!matches_player_a_id_fkey(*),
      player_b:profiles!matches_player_b_id_fkey(*),
      clan_a:clans!matches_clan_a_id_fkey(*),
      clan_b:clans!matches_clan_b_id_fkey(*)
    `)
    .eq('id', params.id)
    .single()

  if (error || !match) {
    // For preview purposes, if the match doesn't exist, we will show a mock "Live Match"
    // Since the database might not have populated matches yet.
  }

  const isLive = match?.status === 'live' || true; // Mock true for testing
  const scoreA = match?.score_a ?? 2;
  const scoreB = match?.score_b ?? 1;

  const teamA = match?.clan_a || { name: 'HYDRØX', logo_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=hydrox' };
  const teamB = match?.clan_b || { name: 'NOVA', logo_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=nova' };
  const playerA = match?.player_a || { username: 'JXKMT', rating: 1250 };
  const playerB = match?.player_b || { username: 'TamsTV', rating: 1190 };

  const tournamentName = match?.tournament?.title || 'KAF Ramadan Cup 2026';

  // Mock timeline events (Sofascore style)
  const timelineEvents = [
    { minute: "12'", type: "goal", team: "A", player: "Mbappe", details: "Assist: Messi" },
    { minute: "34'", type: "card_yellow", team: "B", player: "Van Dijk", details: "Foul" },
    { minute: "45+2'", type: "whistle", team: "none", player: "Half Time", details: "Score: 1 - 0" },
    { minute: "58'", type: "goal", team: "B", player: "Haaland", details: "Assist: De Bruyne" },
    { minute: "74'", type: "card_red", team: "B", player: "Rodri", details: "Violent Conduct" },
    { minute: "89'", type: "goal", team: "A", player: "Neymar Jr", details: "Penalty" },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-kaf-bg pb-20">
      {/* Top App Bar */}
      <div className="sticky top-0 z-40 bg-kaf-panel/95 backdrop-blur-xl border-b border-kaf-border px-4 py-3 flex items-center justify-between shadow-lg">
        <Link href="/tournaments" className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} className="text-white" />
        </Link>
        <div className="text-center">
          <h1 className="text-sm font-bold text-white uppercase tracking-wider">{tournamentName}</h1>
          <p className="text-[10px] text-brand-cyan">Round of 16</p>
        </div>
        <button className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors">
          <Info size={20} />
        </button>
      </div>

      <div className="max-w-3xl mx-auto w-full">
        {/* MATCH SCOREBOARD HEADER */}
        <div className="relative overflow-hidden bg-kaf-panel border-b border-kaf-border">
          <div className="absolute inset-0 bg-[url('/hero-stadium.jpg')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-kaf-panel"></div>
          
          <div className="relative z-10 px-4 py-8 md:py-12">
            {/* Live Badge */}
            {isLive && (
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-status-live/20 border border-status-live text-status-live text-[10px] font-black uppercase tracking-widest animate-pulse shadow-[0_0_15px_rgba(255,0,60,0.5)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-live"></span>
                  89:45
                </div>
              </div>
            )}

            {/* Teams & Score */}
            <div className="flex items-center justify-center gap-6 md:gap-12 w-full">
              {/* Team A */}
              <div className="flex flex-col items-center gap-3 flex-1 text-center">
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-slate-800 bg-cover bg-center shadow-2xl border-2 border-transparent" style={{ backgroundImage: `url('${teamA.logo_url}')` }}></div>
                <div>
                  <h2 className="text-lg md:text-xl font-black text-white">{teamA.name}</h2>
                  <p className="text-xs text-slate-400">({playerA.username})</p>
                </div>
              </div>

              {/* Score */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-5xl md:text-7xl font-display font-black text-white drop-shadow-2xl">
                  <span>{scoreA}</span>
                  <span className="text-slate-600 mb-2">-</span>
                  <span>{scoreB}</span>
                </div>
                <div className="mt-2 text-xs font-bold text-brand-cyan tracking-widest uppercase">
                  Agg: 3-2
                </div>
              </div>

              {/* Team B */}
              <div className="flex flex-col items-center gap-3 flex-1 text-center">
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-slate-800 bg-cover bg-center shadow-2xl border-2 border-transparent" style={{ backgroundImage: `url('${teamB.logo_url}')` }}></div>
                <div>
                  <h2 className="text-lg md:text-xl font-black text-white">{teamB.name}</h2>
                  <p className="text-xs text-slate-400">({playerB.username})</p>
                </div>
              </div>
            </div>

            {/* Match Actions */}
            <div className="flex justify-center gap-4 mt-8">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-cyan text-kaf-bg font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                <Play size={18} className="fill-current" /> Watch Stream
              </button>
            </div>
          </div>
        </div>

        {/* TABS Navigation */}
        <div className="flex border-b border-kaf-border bg-kaf-panel sticky top-[53px] z-30">
          <button className="flex-1 py-4 text-sm font-bold text-brand-cyan border-b-2 border-brand-cyan transition-colors">Details</button>
          <button className="flex-1 py-4 text-sm font-bold text-slate-400 hover:text-white transition-colors">Lineups</button>
          <button className="flex-1 py-4 text-sm font-bold text-slate-400 hover:text-white transition-colors">Stats</button>
        </div>

        {/* MATCH DETAILS CONTENT (Sofascore Timeline) */}
        <div className="p-4 md:p-6 space-y-6">
          
          {/* Win Probability Bar */}
          <div className="kaf-card p-4 rounded-2xl border border-kaf-border mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Win Probability</h3>
            <div className="flex w-full h-3 rounded-full overflow-hidden bg-slate-800 mb-2">
              <div className="h-full bg-brand-cyan transition-all duration-1000" style={{ width: '65%' }}></div>
              <div className="h-full bg-slate-600 transition-all duration-1000" style={{ width: '10%' }}></div>
              <div className="h-full bg-brand-gold transition-all duration-1000" style={{ width: '25%' }}></div>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-brand-cyan">65% {teamA.name}</span>
              <span className="text-slate-500">10% Draw</span>
              <span className="text-brand-gold">25% {teamB.name}</span>
            </div>
          </div>

          <DisputeUpload matchId={params.id} />

          {/* INCIDENT TIMELINE */}
          <div className="kaf-card p-6 rounded-2xl border border-kaf-border">
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
              <Activity size={20} className="text-brand-cyan" /> Match Events
            </h3>

            <div className="relative">
              {/* Timeline Center Line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-slate-800 transform -translate-x-1/2"></div>

              <div className="space-y-6">
                {timelineEvents.map((event, i) => {
                  const isLeft = event.team === 'A';
                  const isCenter = event.team === 'none';
                  const isRight = event.team === 'B';

                  if (isCenter) {
                    return (
                      <div key={i} className="flex justify-center relative z-10">
                        <div className="bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold px-4 py-1 rounded-full">
                          {event.player} • {event.details}
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={i} className={`flex items-center w-full relative z-10 ${isLeft ? 'justify-start' : 'justify-end'}`}>
                      
                      {/* Left Side Event */}
                      {isLeft && (
                        <div className="flex items-center gap-3 w-1/2 pr-6 justify-end text-right">
                          <div>
                            <p className="font-bold text-white text-sm">{event.player}</p>
                            <p className="text-xs text-slate-400">{event.details}</p>
                          </div>
                          {event.type === 'goal' && <div className="w-6 h-6 rounded-full bg-brand-cyan/20 border border-brand-cyan text-brand-cyan flex items-center justify-center shrink-0"><Play size={10} className="fill-current" /></div>}
                          {event.type === 'card_yellow' && <div className="w-4 h-6 rounded bg-yellow-500 shrink-0"></div>}
                          {event.type === 'card_red' && <div className="w-4 h-6 rounded bg-status-live shrink-0"></div>}
                        </div>
                      )}

                      {/* Center Time Badge */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-kaf-card border-2 border-slate-700 flex items-center justify-center text-[10px] font-black text-white z-20">
                        {event.minute}
                      </div>

                      {/* Right Side Event */}
                      {isRight && (
                        <div className="flex items-center gap-3 w-1/2 pl-6 justify-start text-left">
                          {event.type === 'goal' && <div className="w-6 h-6 rounded-full bg-brand-gold/20 border border-brand-gold text-brand-gold flex items-center justify-center shrink-0"><Play size={10} className="fill-current" /></div>}
                          {event.type === 'card_yellow' && <div className="w-4 h-6 rounded bg-yellow-500 shrink-0"></div>}
                          {event.type === 'card_red' && <div className="w-4 h-6 rounded bg-status-live shrink-0"></div>}
                          <div>
                            <p className="font-bold text-white text-sm">{event.player}</p>
                            <p className="text-xs text-slate-400">{event.details}</p>
                          </div>
                        </div>
                      )}

                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Form / H2H Preview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="kaf-card p-4 rounded-xl border border-kaf-border">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Team A Form</h3>
              <div className="flex justify-center gap-2">
                <span className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 flex items-center justify-center text-xs font-bold">W</span>
                <span className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 flex items-center justify-center text-xs font-bold">W</span>
                <span className="w-6 h-6 rounded-md bg-slate-500/20 text-slate-500 border border-slate-500/50 flex items-center justify-center text-xs font-bold">D</span>
                <span className="w-6 h-6 rounded-md bg-status-live/20 text-status-live border border-status-live/50 flex items-center justify-center text-xs font-bold">L</span>
                <span className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 flex items-center justify-center text-xs font-bold">W</span>
              </div>
            </div>
            <div className="kaf-card p-4 rounded-xl border border-kaf-border">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Team B Form</h3>
              <div className="flex justify-center gap-2">
                <span className="w-6 h-6 rounded-md bg-status-live/20 text-status-live border border-status-live/50 flex items-center justify-center text-xs font-bold">L</span>
                <span className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 flex items-center justify-center text-xs font-bold">W</span>
                <span className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 flex items-center justify-center text-xs font-bold">W</span>
                <span className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 flex items-center justify-center text-xs font-bold">W</span>
                <span className="w-6 h-6 rounded-md bg-slate-500/20 text-slate-500 border border-slate-500/50 flex items-center justify-center text-xs font-bold">D</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
