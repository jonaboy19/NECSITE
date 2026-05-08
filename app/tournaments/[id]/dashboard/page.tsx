import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth-helpers'
import Link from 'next/link'
import { ArrowLeft, Settings, Users, Trophy, Play } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'

export default async function TournamentDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: t } = await supabase.from('tournaments').select('*').eq('id', id).single()
  if (!t) notFound()

  // Only host or admin
  const admin = await isAdmin(supabase, user.id)
  if (t.host_id !== user.id && !admin) redirect(`/tournaments/${id}`)

  const [{ data: regs }, { data: matches }] = await Promise.all([
    supabase.from('tournament_registrations').select('*,clans:clan_id(name,tag)').eq('tournament_id', id),
    supabase.from('matches').select('id,round,status').eq('tournament_id', id),
  ])

  return (
    <div className="flex flex-col w-full pb-24">
      <div className="border-b border-kaf-border px-4 sm:px-8 py-6 bg-kaf-panel">
        <Link href={`/tournaments/${id}`} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-cyan mb-3 font-mono uppercase tracking-widest transition-colors">
          <ArrowLeft size={12} /> {t.title}
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-display font-black text-white uppercase flex items-center gap-2">
            <Settings size={20} className="text-brand-cyan" /> Tournament Dashboard
          </h1>
          <StatusBadge status={t.status} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { Icon: Users, label: 'Registrations', value: regs?.length ?? 0, color: 'text-brand-cyan' },
            { Icon: Play, label: 'Matches', value: matches?.length ?? 0, color: 'text-purple-400' },
            { Icon: Trophy, label: 'Completed', value: matches?.filter(m => m.status === 'completed').length ?? 0, color: 'text-brand-gold' },
          ].map(s => (
            <div key={s.label} className="kaf-card rounded-2xl border border-kaf-border p-4 text-center">
              <s.Icon size={20} className={`${s.color} mx-auto mb-1`} />
              <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wide mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="kaf-card rounded-2xl border border-kaf-border p-5">
          <h2 className="text-sm font-black text-white uppercase tracking-wide mb-3">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href={`/tournaments/${id}/start`}
              className="px-4 py-2 bg-brand-cyan hover:bg-brand-cyan/80 text-slate-900 rounded-xl font-black text-sm transition-colors">
              Start Tournament
            </Link>
            <Link href={`/tournaments/${id}/bracket`}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-kaf-border text-white rounded-xl font-black text-sm transition-colors">
              View Bracket
            </Link>
            <Link href={`/tournaments/${id}/matches`}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-kaf-border text-white rounded-xl font-black text-sm transition-colors">
              Manage Matches
            </Link>
          </div>
        </div>

        {/* Registrations */}
        <div className="kaf-card rounded-2xl border border-kaf-border p-5">
          <h2 className="text-sm font-black text-white uppercase tracking-wide mb-3">Registrations</h2>
          <div className="space-y-2">
            {(regs ?? []).map((r: any) => (
              <div key={r.id} className="flex items-center gap-3 py-2 border-b border-kaf-border last:border-0">
                <div className="flex-1 text-sm font-bold text-white">{r.clans?.name || 'Unknown'} <span className="text-slate-500">[{r.clans?.tag}]</span></div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
