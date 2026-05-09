import { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Tv, Calendar, Trophy, Users, ChevronRight, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'E-League | KAFConnect',
  description: 'KAF E-League - the premier eFootball season-based league.',
}

export default async function ELeaguePage() {
  const supabase = await createServerSupabaseClient()

  const { data: series } = await supabase
    .from('series')
    .select('*')
    .order('season', { ascending: false })
    .limit(20)

  const liveSeries = series?.filter(s => s.status === 'live') ?? []
  const upcomingSeries = series?.filter(s => s.status === 'upcoming') ?? []
  const completedSeries = series?.filter(s => s.status === 'completed') ?? []

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Hero */}
      <div className="kaf-stadium-bg kaf-scanlines relative border-b border-white/[0.06] px-4 sm:px-8 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-25" />
        <div className="relative max-w-5xl mx-auto">
          <div className="kaf-chip kaf-chip-green mb-5">
            <Tv size={10} /> E-League
          </div>
          <h1 className="kaf-display text-5xl sm:text-7xl text-white">
            KAF <span className="text-brand-lime">E-League</span>
          </h1>
          <p className="text-slate-400 mt-6 max-w-2xl text-xl leading-relaxed">
            Season-based competitive eFootball league for KAF's elite clans and players.
            Earn points, climb the table, and fight for the championship.
          </p>
          {liveSeries.length > 0 && (
            <div className="mt-6 inline-flex items-center gap-2">
              <span className="kaf-chip kaf-chip-red">{liveSeries.length} Season{liveSeries.length > 1 ? 's' : ''} Live Now</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-10">
        {/* Live Seasons */}
        {liveSeries.length > 0 && (
          <section>
            <h2 className="text-lg font-black text-white uppercase tracking-wide mb-4 flex items-center gap-2">
              <Zap size={16} className="text-red-400" /> Live Seasons
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {liveSeries.map(s => <SeriesCard key={s.id} series={s} highlight />)}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {upcomingSeries.length > 0 && (
          <section>
            <h2 className="text-lg font-black text-white uppercase tracking-wide mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-brand-cyan" /> Upcoming
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {upcomingSeries.map(s => <SeriesCard key={s.id} series={s} />)}
            </div>
          </section>
        )}

        {/* Completed */}
        {completedSeries.length > 0 && (
          <section>
            <h2 className="text-lg font-black text-white uppercase tracking-wide mb-4 flex items-center gap-2">
              <Trophy size={16} className="text-brand-gold" /> Completed Seasons
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedSeries.map(s => <SeriesCard key={s.id} series={s} />)}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!series?.length && (
          <div className="text-center py-20 text-slate-500">
            <Trophy size={48} className="mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-black text-white">No seasons yet</h3>
            <p className="text-sm mt-1">The E-League is coming soon. Stay tuned.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function SeriesCard({ series, highlight = false }: { series: any; highlight?: boolean }) {
  const statusColors: Record<string, string> = {
    live:      'text-red-400 bg-red-500/10 border-red-500/30',
    upcoming:  'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/30',
    completed: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  }
  const statusColor = statusColors[series.status] ?? statusColors.upcoming

  return (
    <div className={`kaf-frame kaf-cut overflow-hidden transition-all hover:-translate-y-1 ${
      highlight ? 'border-red-500/30 bg-red-500/5' : 'border-kaf-border'
    }`}>
      {series.banner_url ? (
        <img src={series.banner_url} alt={series.name} className="w-full h-28 object-cover" />
      ) : (
        <div className="kaf-stadium-bg flex h-28 w-full items-center justify-center">
          <Trophy size={32} className="text-slate-600" />
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Season {series.season}</div>
            <h3 className="font-black text-white text-sm leading-tight">{series.name}</h3>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${statusColor}`}>
            {series.status === 'live' ? 'LIVE' : series.status}
          </span>
        </div>
        {series.prize_pool && (
          <div className="text-xs text-brand-gold font-bold">Prize: {series.prize_pool}</div>
        )}
        {series.description && (
          <p className="text-xs text-slate-400 line-clamp-2">{series.description}</p>
        )}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[10px] text-slate-500">
            {series.start_date && new Date(series.start_date).toLocaleDateString()}
            {series.end_date && ` - ${new Date(series.end_date).toLocaleDateString()}`}
          </div>
          <span className="text-[10px] text-brand-cyan font-bold uppercase flex items-center gap-1">
            View <ChevronRight size={10} />
          </span>
        </div>
      </div>
    </div>
  )
}
