'use client'

import { useState } from 'react'
import { Handshake, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'

export function TransferOfferButton({ playerId, playerName }: { playerId: string; playerName: string }) {
  const supabase = createClient()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    salary_amount: '',
    contract_duration_months: '3',
    role_promise: 'Rotation player',
    tournament_guarantee: '',
    buyout_clause: '',
    starter_guarantee: false,
  })

  const submit = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Sign in to open negotiations.')
      setLoading(false)
      return
    }

    const { data: membership } = await supabase
      .from('clan_members')
      .select('clan_id, role, member_role')
      .eq('profile_id', user.id)
      .maybeSingle()

    const role = membership?.role || membership?.member_role
    if (!membership || !['owner', 'manager', 'captain', 'co_captain'].includes(role)) {
      toast.error('Only clan leadership can send transfer offers.')
      setLoading(false)
      return
    }

    const { data: offer, error } = await supabase
      .from('transfer_negotiations')
      .insert({
        player_id: playerId,
        to_clan_id: membership.clan_id,
        status: 'sent',
        salary_amount: form.salary_amount ? Number(form.salary_amount) : null,
        contract_duration_months: form.contract_duration_months ? Number(form.contract_duration_months) : null,
        role_promise: form.role_promise,
        tournament_guarantee: form.tournament_guarantee || null,
        buyout_clause: form.buyout_clause ? Number(form.buyout_clause) : null,
        starter_guarantee: form.starter_guarantee,
        requested_by: user.id,
      })
      .select('id')
      .single()

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    await Promise.all([
      supabase.from('platform_audit_events').insert({
        actor_id: user.id,
        action: 'transfer.offer.sent',
        entity_type: 'transfer_negotiation',
        entity_id: offer?.id,
        clan_id: membership.clan_id,
        metadata: { player_id: playerId, player_name: playerName },
      }),
      supabase.from('activity_events').insert({
        actor_id: user.id,
        event_type: 'transfer_offer',
        title: `Transfer offer opened for ${playerName}`,
        clan_id: membership.clan_id,
        visibility: 'public',
        link: '/transfers',
        metadata: { player_id: playerId, offer_id: offer?.id },
      }),
    ])

    toast.success('Transfer offer sent.')
    setOpen(false)
    setLoading(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 kaf-cut-sm border border-brand-gold/30 bg-brand-gold/10 px-3 py-2 text-xs font-black uppercase tracking-wider text-brand-gold transition-colors hover:bg-brand-gold hover:text-black"
      >
        <Handshake size={14} /> Open Negotiation
      </button>

      {open && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="kaf-frame kaf-cut w-full max-w-lg p-6">
            <h2 className="text-2xl font-black text-white">Offer for {playerName}</h2>
            <p className="mt-1 text-sm text-slate-500">Create a tracked negotiation instead of a private DM.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                Salary
                <input value={form.salary_amount} onChange={e => setForm({ ...form, salary_amount: e.target.value })} type="number" className="mt-1 w-full border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-brand-gold" />
              </label>
              <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                Duration months
                <input value={form.contract_duration_months} onChange={e => setForm({ ...form, contract_duration_months: e.target.value })} type="number" className="mt-1 w-full border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-brand-gold" />
              </label>
              <label className="sm:col-span-2 text-xs font-black uppercase tracking-wider text-slate-400">
                Role promise
                <input value={form.role_promise} onChange={e => setForm({ ...form, role_promise: e.target.value })} className="mt-1 w-full border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-brand-gold" />
              </label>
              <label className="sm:col-span-2 text-xs font-black uppercase tracking-wider text-slate-400">
                Tournament promise
                <input value={form.tournament_guarantee} onChange={e => setForm({ ...form, tournament_guarantee: e.target.value })} className="mt-1 w-full border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-brand-gold" />
              </label>
              <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                Buyout clause
                <input value={form.buyout_clause} onChange={e => setForm({ ...form, buyout_clause: e.target.value })} type="number" className="mt-1 w-full border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-brand-gold" />
              </label>
              <label className="flex items-end gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
                <input checked={form.starter_guarantee} onChange={e => setForm({ ...form, starter_guarantee: e.target.checked })} type="checkbox" className="mb-1" />
                Starter guarantee
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white">Cancel</button>
              <button onClick={submit} disabled={loading} className="inline-flex items-center gap-2 bg-brand-gold px-5 py-2 text-sm font-black text-black disabled:opacity-50">
                {loading && <Loader2 size={14} className="animate-spin" />} Send Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
