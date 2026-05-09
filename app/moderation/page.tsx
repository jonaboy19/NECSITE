import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, Ban, FileWarning, Gavel, ShieldAlert } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import { isAdmin } from '@/lib/auth-helpers'

export const metadata = {
  title: 'Moderation Queue | KAFConnect',
}

export default async function ModerationQueuePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/moderation')

  const admin = await isAdmin(supabase, user.id)
  if (!admin) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
        <ShieldAlert size={54} className="mb-4 text-red-400" />
        <h1 className="text-3xl font-display font-black text-white">Restricted Moderation Queue</h1>
        <p className="mt-2 max-w-md text-slate-400">Only staff can review disputes, penalties, and evidence.</p>
      </div>
    )
  }

  const [{ data: disputes }, { data: evidence }, { data: penalties }, { data: audit }] = await Promise.all([
    supabase
      .from('disputes')
      .select('id,status,reason,created_at,match_id,opened_by,profiles:opened_by(username)')
      .in('status', ['open', 'reviewing'])
      .order('created_at', { ascending: false })
      .limit(25),
    supabase
      .from('evidence_items')
      .select('id,evidence_type,file_url,external_url,stream_timestamp,notes,created_at,dispute_id,uploaded_by,profiles:uploaded_by(username)')
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('penalties')
      .select('id,penalty_type,reason,status,starts_at,ends_at,target_profile_id,target_clan_id,profiles:target_profile_id(username),clans:target_clan_id(name,tag)')
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('platform_audit_events')
      .select('id,action,entity_type,entity_id,created_at,profiles:actor_id(username)')
      .order('created_at', { ascending: false })
      .limit(12),
  ])

  return (
    <div className="kaf-screen flex flex-col w-full pb-20">
      <section className="border-b border-white/[0.06] bg-[#070908] px-6 py-8 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="kaf-chip kaf-chip-red mb-4">
            <Gavel size={12} /> Moderation
          </div>
          <h1 className="kaf-display text-5xl text-white">Integrity Command</h1>
          <p className="mt-3 max-w-2xl text-slate-400">Review disputes, evidence, penalties, and admin audit trails from one staff queue.</p>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-7xl gap-6 p-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Open disputes', value: disputes?.length || 0, Icon: AlertTriangle, tone: 'text-red-400' },
              { label: 'Evidence items', value: evidence?.length || 0, Icon: FileWarning, tone: 'text-brand-gold' },
              { label: 'Active penalties', value: penalties?.filter((p: any) => p.status === 'active').length || 0, Icon: Ban, tone: 'text-orange-400' },
            ].map(item => (
              <div key={item.label} className="kaf-frame kaf-cut-sm p-5">
                <item.Icon size={18} className={item.tone} />
                <div className={`mt-3 font-display text-4xl ${item.tone}`}>{item.value}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="kaf-frame kaf-cut p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-white">
              <AlertTriangle size={18} className="text-red-400" /> Dispute Resolution Queue
            </h2>
            {(disputes || []).length === 0 ? (
              <p className="text-sm text-slate-500">No open disputes.</p>
            ) : (
              <div className="space-y-3">
                {(disputes || []).map((d: any) => (
                  <div key={d.id} className="border border-white/[0.06] bg-black/20 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-black text-white">{d.reason}</div>
                        <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                          opened by {d.profiles?.username || 'unknown'} - {new Date(d.created_at).toLocaleString()}
                        </div>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {d.match_id && <Link href={`/matches/${d.match_id}`} className="text-xs font-black uppercase tracking-wider text-brand-lime hover:underline">Open match</Link>}
                      <Link href={`/appeals`} className="text-xs font-black uppercase tracking-wider text-orange-400 hover:underline">Appeal center</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="kaf-frame kaf-cut-sm p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">
              <FileWarning size={16} className="text-brand-gold" /> Recent Evidence
            </h2>
            {(evidence || []).length === 0 ? (
              <p className="text-sm text-slate-500">No evidence uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {(evidence || []).map((item: any) => (
                  <div key={item.id} className="border border-white/[0.06] bg-black/20 p-3">
                    <div className="text-sm font-bold text-white">{item.evidence_type}</div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {item.profiles?.username || 'unknown'} - {new Date(item.created_at).toLocaleDateString()}
                    </div>
                    {(item.file_url || item.external_url) && (
                      <a href={item.file_url || item.external_url} className="mt-2 inline-flex text-xs font-black uppercase tracking-wider text-brand-gold hover:underline">
                        Open evidence
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="kaf-frame kaf-cut-sm p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">
              <Ban size={16} className="text-orange-400" /> Penalties
            </h2>
            {(penalties || []).length === 0 ? (
              <p className="text-sm text-slate-500">No penalties issued.</p>
            ) : (
              <div className="space-y-3">
                {(penalties || []).map((p: any) => (
                  <div key={p.id} className="border border-white/[0.06] bg-black/20 p-3">
                    <div className="text-sm font-bold text-white">{p.penalty_type}</div>
                    <div className="mt-1 text-xs text-slate-500">{p.reason}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <StatusBadge status={p.status} />
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        {p.profiles?.username || p.clans?.tag || p.clans?.name || 'target'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="kaf-frame kaf-cut-sm p-5">
            <h2 className="mb-4 text-sm font-black uppercase tracking-wider text-white">Audit Trail</h2>
            {(audit || []).length === 0 ? (
              <p className="text-sm text-slate-500">No audit events recorded.</p>
            ) : (
              <div className="space-y-3">
                {(audit || []).map((event: any) => (
                  <div key={event.id} className="border border-white/[0.06] bg-black/20 p-3">
                    <div className="text-xs font-black uppercase tracking-wider text-brand-lime">{event.action}</div>
                    <div className="mt-1 text-[10px] text-slate-500">{event.entity_type} - {event.profiles?.username || 'system'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  )
}
