import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CalendarDays, Shield, Trophy, Zap } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'

export const metadata = {
  title: 'Seasons | KAFConnect',
  description: 'Season archive, live competitive cycles, and championship history.',
}

export default async function SeasonsPage() {
  const supabase = await createServerSupabaseClient()
  const [{ data: series }, { data: tournaments }, { data: activity }] = await Promise.all([
    supabase.from('series').select('*').order('season', { ascending: false }).limit(30),
    supabase.from('tournaments').select('id,title,status,format,start_date,end_date,prize_pool').order('start_date', { ascending: false, nullsFirst: false }).limit(20),
    supabase.from('activity_events').select('id,event_type,title,created_at').order('created_at', { ascending: false }).limit(8),
  ])

  const live = (series || []).filter((s: any) => ['live', 'active'].includes(s.status))
  const archived = (series || []).filter((s: any) => !['live', 'active'].includes(s.status))

  return (
    <div className="kaf-app-page flex w-full flex-col pb-20">
      <section className="kaf-page-hero px-6 py-12 md:px-10">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="kaf-chip kaf-chip-yellow mb-5">
            <Trophy size={12} /> Seasonal Ecosystem
          </div>
          <h1 className="kaf-display text-5xl text-white md:text-7xl">
            Seasons & <span className="text-brand-gold">Archives</span>
          </h1>
          <p className="mt-5 max-w-2xl text-slate-400">
            Track active seasons, archived competitions, season records, tournament cycles, and the history that makes clans matter.
          </p>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-7xl gap-6 p-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section>
            <h2 className="kaf-panel-title mb-4 flex items-center gap-2">
              <Zap size={15} /> Live Seasons
            </h2>
            {live.length === 0 ? (
              <div className="kaf-frame kaf-cut p-8 text-sm text-slate-500">No live season records are configured yet.</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {live.map((s: any) => <SeasonCard key={s.id} season={s} highlight />)}
              </div>
            )}
          </section>

          <section>
            <h2 className="kaf-panel-title mb-4 flex items-center gap-2">
              <Shield size={15} /> Season Archive
            </h2>
            {archived.length === 0 ? (
              <div className="kaf-frame kaf-cut p-8 text-sm text-slate-500">Completed seasons will appear here once archived.</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {archived.map((s: any) => <SeasonCard key={s.id} season={s} />)}
              </div>
            )}
          </section>

          <section>
            <h2 className="kaf-panel-title mb-4 flex items-center gap-2">
              <CalendarDays size={15} /> Tournament Cycle
            </h2>
            <div className="kaf-frame kaf-cut overflow-hidden">
              {(tournaments || []).length === 0 ? (
                <div className="p-8 text-sm text-slate-500">No tournaments configured.</div>
              ) : (
                <div className="divide-y divide-white/[0.06]">
                  {(tournaments || []).map((t: any) => (
                    <Link key={t.id} href={`/tournaments/${t.id}`} className="grid gap-2 p-4 transition-colors hover:bg-brand-cyan/5 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                      <div>
                        <div className="font-black text-white">{t.title}</div>
                        <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-500">{t.format || 'Competition'} {t.prize_pool ? `- ${t.prize_pool}` : ''}</div>
                      </div>
                      <div className="text-xs text-slate-500">{t.start_date ? new Date(t.start_date).toLocaleDateString() : 'Unscheduled'}</div>
                      <StatusBadge status={t.status} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="kaf-frame kaf-cut-sm p-5">
            <h2 className="mb-4 text-sm font-black uppercase tracking-wider text-white">Season Activity</h2>
            {(activity || []).length === 0 ? (
              <p className="text-sm text-slate-500">No recent season activity.</p>
            ) : (
              <div className="space-y-3">
                {(activity || []).map((event: any) => (
                  <div key={event.id} className="border border-white/[0.06] bg-black/20 p-3">
                    <div className="text-sm font-bold text-white">{event.title || event.event_type}</div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-500">{new Date(event.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link href="/tournaments/create" className="btn-primary w-full py-3">
            Create Season Event
          </Link>
        </aside>
      </main>
    </div>
  )
}

function SeasonCard({ season, highlight = false }: { season: any; highlight?: boolean }) {
  return (
    <div className={`kaf-frame kaf-cut p-5 ${highlight ? 'border-brand-gold/30 bg-brand-gold/5' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Season {season.season || '-'}</div>
          <h3 className="mt-2 text-xl font-black text-white">{season.name || 'KAF Season'}</h3>
        </div>
        <StatusBadge status={season.status || 'draft'} />
      </div>
      {season.description && <p className="mt-3 line-clamp-3 text-sm text-slate-400">{season.description}</p>}
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs text-slate-500">
        <span>{season.start_date ? new Date(season.start_date).toLocaleDateString() : 'No start date'}</span>
        {season.prize_pool && <span className="font-black text-brand-gold">{season.prize_pool}</span>}
      </div>
    </div>
  )
}
