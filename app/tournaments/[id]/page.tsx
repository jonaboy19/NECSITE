import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { StatusBadge } from '@/components/StatusBadge'
import Link from 'next/link'
import { ArrowLeft, Trophy, Users, Calendar, Globe, Shield, ChevronRight, Swords } from 'lucide-react'
import { Metadata } from 'next'

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

  const [{ data: regs }, { data: matches }] = await Promise.all([
    supabase.from('tournament_registrations').select('id,clan_id,profile_id,status,clans:clan_id(name,tag,logo_url)').eq('tournament_id', id),
    supabase.from('matches').select('id,round,status,score_a,score_b,clan_a_id,clan_b_id').eq('tournament_id', id).order('round').limit(10),
  ])

  const tabs = [
    { label: 'Overview', href: `/tournaments/${id}` },
    { label: 'Bracket', href: `/tournaments/${id}/bracket` },
    { label: 'Matches', href: `/tournaments/${id}/matches` },
  ]

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Hero Banner */}
      <div className="relative border-b border-kaf-border overflow-hidden">
        {t.banner_url
          ? <img src={t.banner_url} alt={t.title} className="w-full h-48 sm:h-64 object-cover" />
          : <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-purple-950/60 via-slate-950 to-slate-950 flex items-center justify-center">
              <Trophy size={64} className="text-slate-700" />
            </div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-kaf-bg via-kaf-bg/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-6">
          <Link href="/tournaments" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand-cyan mb-3 font-mono uppercase tracking-widest transition-colors">
            <ArrowLeft size={12} /> Tournaments
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-display font-black text-white uppercase">{t.title}</h1>
            <StatusBadge status={t.status} />
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
            <div className="kaf-card rounded-2xl border border-kaf-border p-5">
              <h2 className="text-sm font-black text-white uppercase tracking-wide mb-3">About</h2>
              <p className="text-slate-400 text-sm leading-relaxed">{t.description}</p>
            </div>
          )}

          {/* Recent Matches */}
          {matches && matches.length > 0 && (
            <div className="kaf-card rounded-2xl border border-kaf-border p-5">
              <h2 className="text-sm font-black text-white uppercase tracking-wide mb-3 flex items-center gap-2">
                <Swords size={14} className="text-brand-cyan" /> Recent Matches
              </h2>
              <div className="space-y-2">
                {matches.slice(0, 5).map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between py-2 border-b border-kaf-border last:border-0 text-sm">
                    <span className="text-slate-400 font-mono text-xs">Round {m.round}</span>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={m.status} />
                      {(m.score_a != null || m.score_b != null) && (
                        <span className="font-mono font-black text-white">{m.score_a ?? '–'} : {m.score_b ?? '–'}</span>
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

          {/* Registrations */}
          {regs && regs.length > 0 && (
            <div className="kaf-card rounded-2xl border border-kaf-border p-5">
              <h2 className="text-sm font-black text-white uppercase tracking-wide mb-3 flex items-center gap-2">
                <Shield size={14} className="text-brand-cyan" /> Registered Teams ({regs.length})
              </h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {regs.map((r: any) => {
                  const clan = r.clans
                  return (
                    <div key={r.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/50 border border-kaf-border">
                      <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center font-black text-brand-cyan text-xs">
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
          <div className="kaf-card rounded-2xl border border-kaf-border p-5 space-y-3">
            <h2 className="text-sm font-black text-white uppercase tracking-wide">Details</h2>
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
              className="block w-full py-3 bg-brand-cyan hover:bg-brand-cyan/80 text-slate-900 rounded-xl font-black text-sm text-center transition-colors">
              Register Your Clan
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
