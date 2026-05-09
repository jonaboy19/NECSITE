import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { StatusBadge } from '@/components/StatusBadge'
import Link from 'next/link'
import { ArrowLeft, Trophy, Users, Calendar, Globe, Shield, ChevronRight, Swords, Radio, AlertTriangle, Tv } from 'lucide-react'
import { Metadata } from 'next'
import { TournamentCheckInButton } from '@/components/TournamentCheckInButton'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: t } = await supabase.from('tournaments').select('title,description').eq('id', id).single()
  return { title: t ? `${t.title} | KAFConnect` : 'Tournament | KAFConnect', description: t?.description }
}

export default async function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: t } = await supabase.from('tournaments').select('*').eq('id', id).single()
  if (!t) notFound()

  const [{ data: regs }, { data: matches }, { data: checkins }, { data: broadcasts }, { data: admins }] = await Promise.all([
    supabase.from('tournament_registrations').select('id,clan_id,profile_id,status,clans:clan_id(name,tag,logo_url)').eq('tournament_id', id),
    supabase.from('matches').select('id,round,status,score_a,score_b,clan_a_id,clan_b_id').eq('tournament_id', id).order('round').limit(10),
    supabase.from('tournament_checkins').select('id,status,clan_id,player_id,checked_in_at,missing_players,clans:clan_id(name,tag)').eq('tournament_id', id).limit(25),
    supabase.from('broadcast_slots').select('id,title,provider,stream_url,scheduled_at,status').eq('tournament_id', id).order('scheduled_at', { ascending: true }).limit(6),
    supabase.from('tournament_admins').select('role,profiles:profile_id(username,avatar_url)').eq('tournament_id', id).limit(8),
  ])
  const matchIds = (matches || []).map((m: any) => m.id)
  const { data: disputes } = matchIds.length > 0
    ? await supabase.from('disputes').select('id,status,reason,match_id,created_at').in('match_id', matchIds).limit(10)
    : { data: [] }

  const tabs = [
    { label: 'Overview', href: `/tournaments/${id}` },
    { label: 'Bracket', href: `/tournaments/${id}/bracket` },
    { label: 'Matches', href: `/tournaments/${id}/matches` },
  ]

  return (
    <div className="kaf-app-page flex w-full flex-col pb-24">
      {/* Hero Banner */}
      <div className="relative border-b border-kaf-border overflow-hidden">
        {t.banner_url
          ? <img src={t.banner_url} alt={t.title} className="w-full h-48 sm:h-64 object-cover" />
          : <div className="kaf-stadium-bg flex h-48 w-full items-center justify-center sm:h-64">
              <Trophy size={64} className="text-slate-700" />
            </div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-kaf-bg via-kaf-bg/70 to-transparent" />
        <div className="absolute inset-0 bg-line-grid opacity-40" />
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-6">
          <Link href="/tournaments" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand-cyan mb-3 font-mono uppercase tracking-widest transition-colors">
            <ArrowLeft size={12} /> Tournaments
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="kaf-display text-4xl text-white sm:text-5xl">{t.title}</h1>
            <StatusBadge status={t.status} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { label: 'Teams', value: regs?.length ?? 0 },
              { label: 'Matches', value: matches?.length ?? 0 },
              { label: 'Ready', value: checkins?.filter((c: any) => ['ready', 'locked'].includes(c.status)).length ?? 0 },
              { label: 'Prize', value: t.prize_pool || 'Glory' },
            ].map(item => (
              <div key={item.label} className="kaf-cut-sm border border-white/10 bg-black/35 px-4 py-2 backdrop-blur">
                <div className="text-lg font-black text-white">{item.value}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex border-b border-kaf-border px-4 sm:px-8 bg-kaf-panel overflow-x-auto">
        {tabs.map(tab => (
          <Link key={tab.href} href={tab.href}
            className="px-4 py-3 text-sm font-bold text-slate-400 hover:text-white border-b-2 border-transparent hover:border-brand-cyan transition-all whitespace-nowrap">
            {tab.label}
          </Link>
        ))}
        {t.status === 'registration_open' || t.status === 'upcoming' ? (
          <Link href={`/tournaments/${id}/join`}
            className="ml-auto px-4 py-3 text-sm font-black text-brand-cyan hover:text-white flex items-center gap-1.5 whitespace-nowrap">
            Register <ChevronRight size={14} />
          </Link>
        ) : null}
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {t.description && (
            <div className="depth-panel kaf-cut p-5">
              <h2 className="kaf-panel-title mb-3">About</h2>
              <p className="text-slate-400 text-sm leading-relaxed">{t.description}</p>
            </div>
          )}

          {/* Recent Matches */}
          {matches && matches.length > 0 && (
            <div className="depth-panel kaf-cut p-5">
              <h2 className="kaf-panel-title mb-3 flex items-center gap-2">
                <Swords size={14} className="text-brand-cyan" /> Recent Matches
              </h2>
              <div className="space-y-2">
                {matches.slice(0, 5).map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between border border-white/5 bg-black/20 px-3 py-2 text-sm">
                    <span className="text-slate-400 font-mono text-xs">Round {m.round}</span>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={m.status} />
                      {(m.score_a != null || m.score_b != null) && (
                        <span className="font-mono font-black text-white">{m.score_a ?? '-'} : {m.score_b ?? '-'}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Link href={`/tournaments/${id}/bracket`} className="mt-3 inline-flex items-center gap-1 text-xs text-brand-cyan font-bold hover:underline">
                View full bracket <ChevronRight size={12} />
              </Link>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="depth-panel kaf-cut p-5">
              <h2 className="kaf-panel-title mb-3 flex items-center gap-2">
                <Radio size={14} className="text-brand-lime" /> Check-In Status
              </h2>
              {(checkins || []).length === 0 ? (
                <p className="text-sm text-slate-500">No check-ins recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {(checkins || []).slice(0, 6).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between border border-white/5 bg-black/20 px-3 py-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-white">{item.clans?.name || 'Player check-in'}</div>
                        <div className="text-[10px] text-slate-500">{item.checked_in_at ? new Date(item.checked_in_at).toLocaleString() : 'Not checked in'}</div>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="depth-panel kaf-cut p-5">
              <h2 className="kaf-panel-title mb-3 flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-400" /> Disputes
              </h2>
              {(disputes || []).length === 0 ? (
                <p className="text-sm text-slate-500">No disputes connected to this tournament yet.</p>
              ) : (
                <div className="space-y-2">
                  {(disputes || []).map((item: any) => (
                    <div key={item.id} className="border border-white/5 bg-black/20 px-3 py-2">
                      <div className="line-clamp-2 text-sm font-bold text-white">{item.reason}</div>
                      <div className="mt-2"><StatusBadge status={item.status} /></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Registrations */}
          {regs && regs.length > 0 && (
            <div className="depth-panel kaf-cut p-5">
              <h2 className="kaf-panel-title mb-3 flex items-center gap-2">
                <Shield size={14} className="text-brand-cyan" /> Registered Teams ({regs.length})
              </h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {regs.map((r: any) => {
                  const clan = r.clans
                  return (
                    <div key={r.id} className="flex items-center gap-2.5 p-2.5 depth-stat">
                      <div className="w-8 h-8 bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center font-black text-brand-cyan text-xs">
                        {clan ? (clan.tag || clan.name)[0] : '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{clan?.name || 'Unknown'}</div>
                        {clan?.tag && <div className="text-[10px] text-slate-500">[{clan.tag}]</div>}
                      </div>
                      <StatusBadge status={r.status || 'pending'} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="depth-panel kaf-cut p-5 space-y-3">
            <h2 className="kaf-panel-title flex items-center gap-2">
              <Tv size={14} className="text-brand-gold" /> Broadcasts
            </h2>
            {(broadcasts || []).length === 0 ? (
              <p className="text-sm text-slate-500">No broadcasts scheduled.</p>
            ) : (
              <div className="space-y-3">
                {(broadcasts || []).map((slot: any) => {
                  const content = (
                    <>
                    <div className="text-sm font-bold text-white">{slot.title}</div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {slot.provider} {slot.scheduled_at ? `- ${new Date(slot.scheduled_at).toLocaleString()}` : ''}
                    </div>
                    <div className="mt-2"><StatusBadge status={slot.status} /></div>
                    </>
                  )
                  return slot.stream_url ? (
                    <a key={slot.id} href={slot.stream_url} className="block border border-white/5 bg-black/20 p-3 transition-colors hover:border-brand-gold/30">
                      {content}
                    </a>
                  ) : (
                    <div key={slot.id} className="border border-white/5 bg-black/20 p-3">
                      {content}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="depth-panel kaf-cut p-5 space-y-3">
            <h2 className="kaf-panel-title">Admins</h2>
            {(admins || []).length === 0 ? (
              <p className="text-sm text-slate-500">No tournament admins assigned.</p>
            ) : (
              <div className="space-y-2">
                {(admins || []).map((admin: any, i: number) => (
                  <div key={`${admin.profiles?.username || i}-${admin.role}`} className="flex items-center justify-between border border-white/5 bg-black/20 px-3 py-2">
                    <span className="text-sm font-bold text-white">{admin.profiles?.username || 'Admin'}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-lime">{admin.role}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="depth-panel kaf-cut p-5 space-y-3">
            <h2 className="kaf-panel-title">Details</h2>
            {[
              { Icon: Globe, label: 'Region', value: t.region },
              { Icon: Users, label: 'Format', value: t.format },
              { Icon: Calendar, label: 'Start', value: t.start_date ? new Date(t.start_date).toLocaleDateString() : null },
              { Icon: Calendar, label: 'End', value: t.end_date ? new Date(t.end_date).toLocaleDateString() : null },
              { Icon: Trophy, label: 'Prize Pool', value: t.prize_pool },
              { Icon: Users, label: 'Max Teams', value: t.max_registrations ? `${regs?.length ?? 0} / ${t.max_registrations}` : null },
            ].filter(d => d.value).map(({ Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2.5 text-sm">
                <Icon size={14} className="text-brand-cyan shrink-0" />
                <span className="text-slate-400">{label}</span>
                <span className="ml-auto font-bold text-white text-right">{value}</span>
              </div>
            ))}
          </div>

          {(t.status === 'registration_open' || t.status === 'upcoming') && (
            <Link href={`/tournaments/${id}/join`}
              className="btn-primary w-full py-3 text-sm">
              Register Your Clan
            </Link>
          )}
          {['registration_open', 'active', 'live'].includes(t.status) && (
            <TournamentCheckInButton tournamentId={id} />
          )}
        </div>
      </div>
    </div>
  )
}
