import { createServerSupabaseClient } from '@/lib/supabase/server'
import BracketVisualizer from '@/components/BracketVisualizer'
import Link from 'next/link'
import { ArrowLeft, Trophy, GitMerge, Users } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: tournament } = await supabase.from('tournaments').select('title').eq('id', id).single()
  return {
    title: `${tournament?.title || 'Tournament'} Bracket — KAFConnect`,
    description: `View the full bracket for ${tournament?.title || 'this tournament'} on KAFConnect.`,
  }
}

export default async function BracketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: tournament } = await supabase.from('tournaments').select('*').eq('id', id).single()
  const { data: rawMatches } = await supabase
    .from('match_details')
    .select('*')
    .eq('tournament_id', id)
    .order('round')
    .order('match_number')

  const { data: players } = await supabase
    .from('tournament_registrations')
    .select('*, profiles(username, avatar_url)')
    .eq('tournament_id', id)

  const completedCount = rawMatches?.filter(m => m.status === 'completed').length || 0
  const liveCount = rawMatches?.filter(m => m.status === 'live').length || 0

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-kaf-panel/95 backdrop-blur-xl border-b border-kaf-border px-4 py-3 flex items-center gap-3">
        <Link href={`/tournaments/${id}/dashboard`} className="p-2 -ml-1 rounded-full hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} className="text-white" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-black text-white text-sm truncate">{tournament?.title || 'Tournament'}</h1>
          <p className="text-[10px] text-brand-cyan font-bold uppercase tracking-widest">Full Bracket</p>
        </div>
        <div className="flex items-center gap-3">
          {liveCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-live/10 border border-status-live/30 text-status-live text-[10px] font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-status-live rounded-full animate-pulse" />
              {liveCount} Live
            </div>
          )}
        </div>
      </div>

      {/* Tournament Stats Bar */}
      <div className="bg-kaf-panel border-b border-kaf-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20">
              <Trophy size={16} className="text-brand-gold" />
            </div>
            <div>
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Prize</p>
              <p className="text-sm font-black text-white">{tournament?.prize_pool || 'Glory'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 flex items-center justify-center border border-brand-cyan/20">
              <Users size={16} className="text-brand-cyan" />
            </div>
            <div>
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Players</p>
              <p className="text-sm font-black text-white">{players?.length || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <GitMerge size={16} className="text-purple-400" />
            </div>
            <div>
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Matches</p>
              <p className="text-sm font-black text-white">{completedCount}/{rawMatches?.length || 0} Complete</p>
            </div>
          </div>
          <div className="ml-auto">
            <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
              tournament?.status === 'live' ? 'bg-status-live text-white shadow-[0_0_10px_rgba(255,0,60,0.4)]' :
              tournament?.status === 'registration_open' ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30' :
              tournament?.status === 'completed' ? 'bg-slate-600/20 text-slate-400 border border-slate-600/30' :
              'bg-slate-700 text-white'
            }`}>
              {tournament?.status?.replace(/_/g, ' ') || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Bracket */}
      <div className="p-6 max-w-full">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-8 bg-brand-cyan rounded-full" />
          <h2 className="text-2xl font-display font-black uppercase tracking-wider text-white">
            Tournament Bracket
          </h2>
        </div>

        <BracketVisualizer matches={rawMatches as any || []} tournamentId={id} />
      </div>
    </div>
  )
}
