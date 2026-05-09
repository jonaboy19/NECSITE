'use client'

import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/slugify'
import { ArrowLeft, ArrowRight, Calendar, Check, Loader2, Shield, Sliders, Trophy, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'

const STEPS = [
  { label: 'Basic Info', Icon: Trophy },
  { label: 'Format', Icon: Sliders },
  { label: 'Rules', Icon: Shield },
  { label: 'Registration', Icon: Users },
  { label: 'Timeline', Icon: Calendar },
  { label: 'Automation', Icon: Check },
]

export default function CreateTournament() {
  const supabase = createClient()
  const router = useRouter()
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    banner_url: '',
    description: '',
    game: 'eFootball Mobile',
    platform: 'Mobile',
    region: 'Global',
    language: 'English',
    visibility: 'public',
    format: 'Single Elimination',
    match_duration: '10 minutes',
    extra_time: true,
    penalties: true,
    disconnect_policy: 'One restart if both players agree. Repeated disconnects go to referee review.',
    no_show_policy: '10 minute grace period, then referee may award default win.',
    proof_requirements: 'Final score screenshot required.',
    rematch_policy: 'Only by referee decision.',
    lag_policy: 'Report before minute 30 with proof.',
    max_participants: '150',
    check_in_required: true,
    auto_accept: false,
    allow_reserves: true,
    require_discord: false,
    require_clan: false,
    registration_start: '',
    registration_deadline: '',
    checkin_start: '',
    checkin_end: '',
    start_date: '',
    round_timer_minutes: '60',
    submission_deadline_minutes: '15',
    auto_advance: true,
    auto_dq_inactive: false,
    auto_dispute_escalation: true,
    auto_notifications: true,
    auto_standings: true,
    prize_pool: '',
  })

  const progress = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step])

  const update = (key: keyof typeof form, value: any) => setForm(prev => ({ ...prev, [key]: value }))

  const create = async () => {
    setIsSubmitting(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in to create a tournament.')
      setIsSubmitting(false)
      return
    }

    const rules = {
      match_duration: form.match_duration,
      extra_time: form.extra_time,
      penalties: form.penalties,
      disconnect_policy: form.disconnect_policy,
      no_show_policy: form.no_show_policy,
      proof_requirements: form.proof_requirements,
      rematch_policy: form.rematch_policy,
      lag_policy: form.lag_policy,
      check_in_required: form.check_in_required,
      auto_accept: form.auto_accept,
      allow_reserves: form.allow_reserves,
      require_discord: form.require_discord,
      require_clan: form.require_clan,
      checkin_start: form.checkin_start || null,
      checkin_end: form.checkin_end || null,
      round_timer_minutes: Number(form.round_timer_minutes),
      submission_deadline_minutes: Number(form.submission_deadline_minutes),
      automation: {
        auto_advance: form.auto_advance,
        auto_dq_inactive: form.auto_dq_inactive,
        auto_dispute_escalation: form.auto_dispute_escalation,
        auto_notifications: form.auto_notifications,
        auto_standings: form.auto_standings,
      },
    }

    try {
      const { data, error: insertError } = await supabase.from('tournaments').insert({
        title: form.title,
        slug: `${slugify(form.title)}-${Math.random().toString(36).slice(2, 6)}`,
        description: form.description,
        game: form.game,
        platform: form.platform,
        region: form.region,
        language: form.language,
        visibility: form.visibility,
        format: form.format,
        rules: JSON.stringify(rules, null, 2),
        prize_pool: form.prize_pool || 'Glory',
        banner_url: form.banner_url || null,
        max_participants: Number(form.max_participants) || 150,
        registration_deadline: form.registration_deadline || null,
        start_date: form.start_date || null,
        host_id: user.id,
        created_by: user.id,
        status: 'draft',
      }).select('id').single()

      if (insertError) throw insertError

      await Promise.all([
        supabase.from('platform_audit_events').insert({
          actor_id: user.id,
          action: 'tournament.created',
          entity_type: 'tournament',
          entity_id: data.id,
          tournament_id: data.id,
          metadata: { format: form.format, max_participants: form.max_participants },
        }),
        supabase.from('activity_events').insert({
          actor_id: user.id,
          event_type: 'tournament_created',
          title: `${form.title} created`,
          tournament_id: data.id,
          link: `/tournaments/${data.id}`,
          visibility: form.visibility === 'public' ? 'public' : 'private',
        }),
      ])

      toast.success('Tournament created. Configure final details in the dashboard.')
      router.push(`/tournaments/${data.id}/dashboard`)
    } catch (err: any) {
      setError(err.message || 'Failed to create tournament.')
      setIsSubmitting(false)
    }
  }

  const canContinue = step > 0 || form.title.trim().length > 2
  const current = STEPS[step]
  const CurrentIcon = current.Icon

  return (
    <div className="kaf-screen flex min-h-[80vh] w-full flex-col p-4 md:p-8">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[320px_1fr_360px]">
        <aside className="kaf-frame kaf-cut-sm p-5 self-start">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center bg-brand-cyan/15 text-brand-lime kaf-cut-sm">
              <CurrentIcon size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Tournament Wizard</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{progress}% configured</p>
            </div>
          </div>
          <div className="mb-5 h-2 overflow-hidden bg-white/[0.06]">
            <div className="h-full bg-brand-cyan transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="space-y-2">
            {STEPS.map(({ label, Icon }, i) => (
              <button key={label} type="button" onClick={() => setStep(i)} className={`flex w-full items-center gap-3 border px-3 py-3 text-left text-sm font-black transition-colors ${i === step ? 'border-brand-lime/40 bg-brand-cyan/15 text-white' : 'border-white/[0.06] bg-black/20 text-slate-500 hover:text-white'}`}>
                <Icon size={16} className={i === step ? 'text-brand-lime' : ''} />
                {label}
              </button>
            ))}
          </div>
        </aside>

        <section className="kaf-frame kaf-cut p-6 md:p-8">
          {error && <div className="mb-5 border border-red-500/30 bg-red-500/10 p-3 text-sm font-bold text-red-400">{error}</div>}

          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-3xl font-display font-black text-white">Basic Info</h2>
              <Field label="Tournament Name"><input required value={form.title} onChange={e => update('title', e.target.value)} placeholder="KAF Open 1v1 Cup" className={inputClass} /></Field>
              <Field label="Banner URL"><input value={form.banner_url} onChange={e => update('banner_url', e.target.value)} placeholder="https://..." className={inputClass} /></Field>
              <Field label="Description"><textarea value={form.description} onChange={e => update('description', e.target.value)} rows={4} placeholder="Describe the event..." className={inputClass} /></Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Game Version"><input value={form.game} onChange={e => update('game', e.target.value)} className={inputClass} /></Field>
                <Field label="Platform"><input value={form.platform} onChange={e => update('platform', e.target.value)} className={inputClass} /></Field>
                <Field label="Region"><input value={form.region} onChange={e => update('region', e.target.value)} className={inputClass} /></Field>
                <Field label="Language"><input value={form.language} onChange={e => update('language', e.target.value)} className={inputClass} /></Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-3xl font-display font-black text-white">Format</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {['Single Elimination', 'Double Elimination', 'Swiss', 'Group Stage', 'League', 'Hybrid', 'Old UCL Format', 'New UCL Format'].map(format => (
                  <button key={format} type="button" onClick={() => update('format', format)} className={`border p-4 text-left font-black transition-colors ${form.format === format ? 'border-brand-lime/50 bg-brand-cyan/15 text-white' : 'border-white/[0.06] bg-black/20 text-slate-400 hover:text-white'}`}>
                    {format}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-3xl font-display font-black text-white">Match Rules</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Match Duration"><input value={form.match_duration} onChange={e => update('match_duration', e.target.value)} className={inputClass} /></Field>
                <Field label="Proof Requirements"><input value={form.proof_requirements} onChange={e => update('proof_requirements', e.target.value)} className={inputClass} /></Field>
              </div>
              <Toggle label="Extra time enabled" checked={form.extra_time} onChange={v => update('extra_time', v)} />
              <Toggle label="Penalties enabled" checked={form.penalties} onChange={v => update('penalties', v)} />
              <Field label="Disconnect Policy"><textarea value={form.disconnect_policy} onChange={e => update('disconnect_policy', e.target.value)} rows={2} className={inputClass} /></Field>
              <Field label="No-show Policy"><textarea value={form.no_show_policy} onChange={e => update('no_show_policy', e.target.value)} rows={2} className={inputClass} /></Field>
              <Field label="Rematch Policy"><textarea value={form.rematch_policy} onChange={e => update('rematch_policy', e.target.value)} rows={2} className={inputClass} /></Field>
              <Field label="Lag Policy"><textarea value={form.lag_policy} onChange={e => update('lag_policy', e.target.value)} rows={2} className={inputClass} /></Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-3xl font-display font-black text-white">Registration</h2>
              <Field label="Max Participants"><input type="number" value={form.max_participants} onChange={e => update('max_participants', e.target.value)} className={inputClass} /></Field>
              <Toggle label="Check-in required" checked={form.check_in_required} onChange={v => update('check_in_required', v)} />
              <Toggle label="Auto-accept registrations" checked={form.auto_accept} onChange={v => update('auto_accept', v)} />
              <Toggle label="Allow reserves" checked={form.allow_reserves} onChange={v => update('allow_reserves', v)} />
              <Toggle label="Require Discord/WhatsApp contact" checked={form.require_discord} onChange={v => update('require_discord', v)} />
              <Toggle label="Require clan/team" checked={form.require_clan} onChange={v => update('require_clan', v)} />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-3xl font-display font-black text-white">Timeline</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Registration Start"><input type="datetime-local" value={form.registration_start} onChange={e => update('registration_start', e.target.value)} className={inputClass} /></Field>
                <Field label="Registration Close"><input type="datetime-local" value={form.registration_deadline} onChange={e => update('registration_deadline', e.target.value)} className={inputClass} /></Field>
                <Field label="Check-in Start"><input type="datetime-local" value={form.checkin_start} onChange={e => update('checkin_start', e.target.value)} className={inputClass} /></Field>
                <Field label="Check-in End"><input type="datetime-local" value={form.checkin_end} onChange={e => update('checkin_end', e.target.value)} className={inputClass} /></Field>
                <Field label="Tournament Start"><input type="datetime-local" value={form.start_date} onChange={e => update('start_date', e.target.value)} className={inputClass} /></Field>
                <Field label="Round Timer Minutes"><input type="number" value={form.round_timer_minutes} onChange={e => update('round_timer_minutes', e.target.value)} className={inputClass} /></Field>
                <Field label="Submission Deadline Minutes"><input type="number" value={form.submission_deadline_minutes} onChange={e => update('submission_deadline_minutes', e.target.value)} className={inputClass} /></Field>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <h2 className="text-3xl font-display font-black text-white">Automation</h2>
              <Toggle label="Auto advance finalized matches" checked={form.auto_advance} onChange={v => update('auto_advance', v)} />
              <Toggle label="Auto DQ inactive players" checked={form.auto_dq_inactive} onChange={v => update('auto_dq_inactive', v)} />
              <Toggle label="Auto dispute escalation" checked={form.auto_dispute_escalation} onChange={v => update('auto_dispute_escalation', v)} />
              <Toggle label="Auto notifications" checked={form.auto_notifications} onChange={v => update('auto_notifications', v)} />
              <Toggle label="Auto standings updates" checked={form.auto_standings} onChange={v => update('auto_standings', v)} />
              <Field label="Prize Pool"><input value={form.prize_pool} onChange={e => update('prize_pool', e.target.value)} placeholder="Glory, cash, Discord role..." className={inputClass} /></Field>
            </div>
          )}

          <div className="mt-8 flex justify-between gap-3 border-t border-white/[0.06] pt-5">
            <button type="button" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-black text-slate-400 disabled:opacity-40">
              <ArrowLeft size={14} /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={() => setStep(step + 1)} disabled={!canContinue} className="inline-flex items-center gap-2 bg-brand-cyan px-5 py-2 text-sm font-black text-black disabled:opacity-40">
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button type="button" onClick={create} disabled={isSubmitting || !form.title.trim()} className="inline-flex items-center gap-2 bg-brand-gold px-5 py-2 text-sm font-black text-black disabled:opacity-40">
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Trophy size={14} />} Create Tournament
              </button>
            )}
          </div>
        </section>

        <aside className="kaf-frame kaf-cut-sm p-5 self-start">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Live Preview</p>
          <div className="overflow-hidden border border-brand-cyan/25 bg-brand-cyan/5">
            <div className="relative h-32 bg-[url('/hero-stadium.jpg')] bg-cover bg-center">
              <div className="absolute inset-0 bg-gradient-to-t from-kaf-card via-kaf-bg/40 to-transparent" />
              <div className="absolute bottom-3 left-3 border border-white/10 bg-black/35 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur">
                Draft
              </div>
            </div>
            <div className="p-5">
              <h2 className="text-xl font-black text-white">{form.title || 'Tournament Title'}</h2>
              <p className="mt-2 min-h-14 text-sm leading-relaxed text-slate-400">{form.description || 'Rules, format, and schedule notes will preview here.'}</p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <PreviewStat label="Slots" value={form.max_participants || '150'} />
                <PreviewStat label="Format" value={form.format} />
                <PreviewStat label="Region" value={form.region} />
                <PreviewStat label="Prize" value={form.prize_pool || 'Glory'} />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

const inputClass = 'mt-1 w-full border border-white/[0.08] bg-black/40 px-3 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-brand-lime'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-xs font-black uppercase tracking-wider text-slate-400">{label}{children}</label>
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between border border-white/[0.06] bg-black/20 p-4 text-left">
      <span className="text-sm font-black text-white">{label}</span>
      <span className={`h-6 w-11 rounded-full p-1 transition-colors ${checked ? 'bg-brand-cyan' : 'bg-slate-700'}`}>
        <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  )
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="depth-stat p-3">
      <div className="truncate text-lg font-black text-white">{value}</div>
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</div>
    </div>
  )
}
