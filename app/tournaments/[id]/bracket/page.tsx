import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Trophy, GitMerge, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default async function Bracket({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient()
  
  // Fetch tournament details
  const { data: tourney } = await supabase.from('tournaments').select('*').eq('id', params.id).single()

  // Fetch matches with player info
  const { data } = await supabase.from('matches').select(`
    *,
    playerA:profiles!matches_player_a_id_fkey (username, avatar_url),
    playerB:profiles!matches_player_b_id_fkey (username, avatar_url)
  `).eq('tournament_id', params.id).order('round')

  const rounds = {} as any
  data?.forEach((m: any) => {
    if (!rounds[m.round]) rounds[m.round] = []
    rounds[m.round].push(m)
  })

  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-[#07111A]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 lg:p-8 border-b border-kaf-border bg-kaf-panel">
        <div>
          <Link href={`/tournaments/${params.id}/dashboard`} className="text-brand-cyan hover:underline flex items-center gap-2 mb-2 text-sm font-bold uppercase tracking-widest">
            <ChevronLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-display font-black text-white flex items-center gap-3 uppercase tracking-wide">
            <GitMerge className="text-brand-cyan" size={36} /> 
            {tourney?.title || 'Tournament Bracket'}
          </h1>
        </div>
        <div className="bg-brand-gold/10 border border-brand-gold/30 text-brand-gold px-4 py-2 rounded-lg font-bold text-sm uppercase flex items-center gap-2">
          <Trophy size={16} /> {Object.keys(rounds).length} Rounds
        </div>
      </div>

      {/* Bracket Canvas */}
      <div className="flex-1 overflow-auto p-8 no-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <div className="flex gap-16 min-w-max items-center h-full">
          {Object.keys(rounds).map((roundKey, roundIndex) => (
            <div key={roundKey} className="flex flex-col justify-around min-h-full gap-8 w-64">
              <h2 className="text-center text-sm font-black text-brand-cyan uppercase tracking-widest mb-4">
                {roundIndex === Object.keys(rounds).length - 1 ? 'Grand Final' : `Round ${roundKey}`}
              </h2>
              
              {rounds[roundKey].map((m: any) => (
                <div key={m.id} className="relative kaf-card rounded-xl border border-kaf-border overflow-hidden shadow-2xl">
                  {/* Player A */}
                  <div className={`flex items-center justify-between p-3 border-b border-kaf-border ${m.score_a > m.score_b ? 'bg-brand-cyan/10' : ''}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-6 h-6 rounded bg-slate-800 shrink-0 bg-cover" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${m.playerA?.username || 'TBD'}')` }}></div>
                      <span className={`font-bold text-sm truncate ${m.score_a > m.score_b ? 'text-brand-cyan' : 'text-slate-300'}`}>
                        {m.playerA?.username || 'TBD'}
                      </span>
                    </div>
                    <span className="font-black text-white ml-2">{m.score_a !== null ? m.score_a : '-'}</span>
                  </div>
                  
                  {/* Player B */}
                  <div className={`flex items-center justify-between p-3 ${m.score_b > m.score_a ? 'bg-status-draft/10' : ''}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-6 h-6 rounded bg-slate-800 shrink-0 bg-cover" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${m.playerB?.username || 'TBD'}')` }}></div>
                      <span className={`font-bold text-sm truncate ${m.score_b > m.score_a ? 'text-status-draft' : 'text-slate-300'}`}>
                        {m.playerB?.username || 'TBD'}
                      </span>
                    </div>
                    <span className="font-black text-white ml-2">{m.score_b !== null ? m.score_b : '-'}</span>
                  </div>
                  
                  {/* Status Indicator */}
                  {m.status === 'scheduled' && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-kaf-bg border border-kaf-border text-[8px] font-bold px-2 py-0.5 rounded text-slate-400 uppercase">
                      VS
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
