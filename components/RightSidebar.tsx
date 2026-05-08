import Link from 'next/link'
import { TrendingUp, Radio, Users } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function RightSidebar() {
  const supabase = await createServerSupabaseClient()
  
  const { data: liveStreams } = await supabase
    .from('broadcasts')
    .select('*')
    .eq('status', 'live')
    .limit(5)

  const { data: upcomingMatches } = await supabase
    .from('matches')
    .select('*, tournaments(title)')
    .eq('status', 'scheduled')
    .order('scheduled_time', { ascending: true })
    .limit(5)

  const live = liveStreams || []
  const matches = upcomingMatches || []

  return (
    <aside className="sticky top-0 hidden h-screen w-72 flex-col overflow-y-auto border-l border-kaf-border bg-kaf-panel p-4 no-scrollbar xl:flex">
      <div className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
          <Radio size={16} className="text-status-live live-badge rounded-full" />
          Live Now
        </h3>
        <div className="flex flex-col gap-3">
          {live.length === 0 ? (
            <div className="text-slate-500 text-xs text-center py-4 bg-kaf-card rounded-xl border border-kaf-border/50">No live streams at the moment.</div>
          ) : live.map((stream: any, i: number) => (
            <Link key={i} href={`/live/${stream.id}`} className="group flex items-center gap-4 rounded-xl bg-gradient-to-r from-kaf-card to-transparent p-2.5 transition-all hover:bg-slate-800/50 border border-transparent hover:border-brand-cyan shadow-sm">
              <div className="relative h-14 w-20 overflow-hidden rounded-lg bg-slate-800 shadow-md border border-kaf-border/50">
                <div className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-500" style={{ backgroundImage: `url(${stream.thumbnail_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200'})`}}></div>
                <div className="absolute bottom-1 left-1 rounded bg-status-live px-1.5 py-0.5 text-[9px] font-black text-white shadow-[0_0_10px_rgba(255,0,60,0.5)] tracking-wider">LIVE</div>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-black text-white truncate group-hover:text-brand-cyan transition-colors">{stream.streamer_name || 'KAFConnect'}</span>
                <span className="text-[11px] text-slate-400 truncate mb-1 font-medium">{stream.title || 'Live Match'}</span>
                <span className="text-[10px] text-status-live font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-live animate-pulse"></span> {stream.viewer_count || 0} viewers
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
          <TrendingUp size={16} className="text-brand-cyan" />
          Upcoming Matches
        </h3>
        <div className="flex flex-col gap-3">
          {matches.length === 0 ? (
            <div className="text-slate-500 text-xs text-center py-4 bg-kaf-card rounded-xl border border-kaf-border/50">No upcoming matches scheduled.</div>
          ) : matches.map((match: any, i: number) => (
            <div key={i} className="flex flex-col gap-2 rounded-xl bg-gradient-to-br from-kaf-card to-slate-900/50 p-4 border border-kaf-border hover:border-brand-cyan/40 transition-all cursor-pointer shadow-md group">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span className="text-brand-cyan/80">{match.tournaments?.title || 'Scrim'}</span>
                <span>{match.scheduled_time ? new Date(match.scheduled_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'}</span>
              </div>
              <div className="flex items-center justify-between font-black text-sm mt-1">
                <span className="group-hover:text-brand-cyan transition-colors">{match.team1_id || 'TBD'}</span>
                <span className="text-slate-500 text-[10px] px-2 py-0.5 rounded bg-kaf-bg border border-kaf-border">VS</span>
                <span className="group-hover:text-brand-cyan transition-colors">{match.team2_id || 'TBD'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
          <Users size={16} />
          Active Lounges
        </h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between rounded-xl bg-kaf-card p-3 border border-kaf-border hover:border-brand-teal/40 transition-colors cursor-pointer">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="h-6 w-6 rounded-full bg-cyan-500 border border-kaf-card z-20"></div>
                <div className="h-6 w-6 rounded-full bg-purple-500 border border-kaf-card z-10"></div>
                <div className="h-6 w-6 rounded-full bg-emerald-500 border border-kaf-card"></div>
              </div>
              <span className="text-xs font-semibold">Tournament Chat</span>
            </div>
            <span className="text-xs text-brand-cyan font-bold">12</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
