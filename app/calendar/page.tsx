import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CalendarDays, Clock, Radio, Swords, Trophy } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'

export const metadata = {
  title: 'Calendar | KAFConnect',
  description: 'Upcoming matches, broadcasts, tournament starts, and operational deadlines.',
}

export default async function CalendarPage() {
  const supabase = await createServerSupabaseClient()
  const now = new Date().toISOString()
  const [{ data: matches }, { data: tournaments }, { data: broadcasts }] = await Promise.all([
    supabase
      .from('matches')
      .select('id,status,round,scheduled_at,tournament_id,clan_a_id,clan_b_id,tournaments(title),clan_a:clan_a_id(name,tag),clan_b:clan_b_id(name,tag)')
      .gte('scheduled_at', now)
      .order('scheduled_at', { ascending: true })
      .limit(30),
    supabase
      .from('tournaments')
      .select('id,title,status,start_date,registration_deadline,checkin_start_at,checkin_end_at')
      .or(`start_date.gte.${now},registration_deadline.gte.${now},checkin_start_at.gte.${now}`)
      .order('start_date', { ascending: true, nullsFirst: false })
      .limit(20),
    supabase
      .from('broadcast_slots')
      .select('id,title,provider,stream_url,scheduled_at,status,tournament_id,tournaments(title)')
      .gte('scheduled_at', now)
      .order('scheduled_at', { ascending: true })
      .limit(20),
  ])

  return (
    <div className="kaf-app-page flex w-full flex-col pb-20">
      <section className="kaf-page-hero px-6 py-12 md:px-10">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="kaf-chip kaf-chip-green mb-5">
            <CalendarDays size={12} /> Operations Calendar
          </div>
          <h1 className="kaf-display text-5xl text-white md:text-7xl">
            Live <span className="text-brand-lime">Schedule</span>
          </h1>
          <p className="mt-5 max-w-2xl text-slate-400">
            One place for match deadlines, tournament starts, check-ins, and broadcast operations.
          </p>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-7xl gap-6 p-6 lg:grid-cols-3">
        <section className="space-y-4">
          <h2 className="kaf-panel-title flex items-center gap-2">
            <Swords size={15} /> Upcoming Matches
          </h2>
          <div className="kaf-frame kaf-cut overflow-hidden">
            {(matches || []).length === 0 ? (
              <div className="p-8 text-sm text-slate-500">No scheduled matches.</div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {(matches || []).map((match: any) => (
                  <Link key={match.id} href={`/matches/${match.id}`} className="block p-4 transition-colors hover:bg-brand-cyan/5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-black text-white">{match.clan_a?.tag || match.clan_a?.name || 'TBD'} vs {match.clan_b?.tag || match.clan_b?.name || 'TBD'}</div>
                        <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-500">{match.tournaments?.title || 'Match'} - Round {match.round || '-'}</div>
                      </div>
                      <StatusBadge status={match.status} />
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-brand-lime">
                      <Clock size={12} /> {new Date(match.scheduled_at).toLocaleString()}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="kaf-panel-title flex items-center gap-2">
            <Trophy size={15} /> Tournament Deadlines
          </h2>
          <div className="kaf-frame kaf-cut overflow-hidden">
            {(tournaments || []).length === 0 ? (
              <div className="p-8 text-sm text-slate-500">No upcoming tournament deadlines.</div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {(tournaments || []).map((tournament: any) => (
                  <Link key={tournament.id} href={`/tournaments/${tournament.id}`} className="block p-4 transition-colors hover:bg-brand-gold/5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-black text-white">{tournament.title}</div>
                        <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                          {tournament.registration_deadline ? `Registration ${new Date(tournament.registration_deadline).toLocaleString()}` : 'Competition timeline'}
                        </div>
                      </div>
                      <StatusBadge status={tournament.status} />
                    </div>
                    <div className="mt-3 text-xs text-brand-gold">
                      {tournament.start_date ? `Starts ${new Date(tournament.start_date).toLocaleString()}` : 'Start not scheduled'}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="kaf-panel-title flex items-center gap-2">
            <Radio size={15} /> Broadcast Slots
          </h2>
          <div className="kaf-frame kaf-cut overflow-hidden">
            {(broadcasts || []).length === 0 ? (
              <div className="p-8 text-sm text-slate-500">No broadcasts scheduled.</div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {(broadcasts || []).map((slot: any) => {
                  const content = (
                    <div className="block p-4 transition-colors hover:bg-brand-cyan/5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-black text-white">{slot.title}</div>
                          <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-500">{slot.provider || 'Broadcast'} - {slot.tournaments?.title || 'KAFConnect'}</div>
                        </div>
                        <StatusBadge status={slot.status} />
                      </div>
                      <div className="mt-3 text-xs text-brand-lime">{new Date(slot.scheduled_at).toLocaleString()}</div>
                    </div>
                  )
                  return slot.stream_url ? (
                    <a key={slot.id} href={slot.stream_url} target="_blank" rel="noopener noreferrer">{content}</a>
                  ) : (
                    <div key={slot.id}>{content}</div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
