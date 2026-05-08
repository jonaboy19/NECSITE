'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, ShieldAlert, ShieldX, Shield } from 'lucide-react'

const TIER_META: Record<string, { label: string; cls: string; Icon: any }> = {
  trusted:    { label: 'Trusted',    cls: 'border-green-500/40 text-green-400 bg-green-500/10',   Icon: ShieldCheck },
  standard:   { label: 'Standard',   cls: 'border-slate-500/40 text-slate-400 bg-slate-500/10',   Icon: Shield },
  new:        { label: 'New',        cls: 'border-brand-cyan/40 text-brand-cyan bg-brand-cyan/10', Icon: Shield },
  restricted: { label: 'Restricted', cls: 'border-orange-500/40 text-orange-400 bg-orange-500/10',Icon: ShieldAlert },
  banned:     { label: 'Banned',     cls: 'border-red-500/40 text-red-400 bg-red-500/10',          Icon: ShieldX },
}

interface TrustBadgeProps { userId: string; compact?: boolean }

export function TrustBadge({ userId, compact = false }: TrustBadgeProps) {
  const supabase = createClient()
  const [data, setData] = useState<{ tier: string; score: number } | null>(null)

  useEffect(() => {
    let cancel = false
    supabase.from('user_trust_scores').select('tier,score').eq('user_id', userId).maybeSingle()
      .then(({ data }) => { if (!cancel) setData(data ?? { tier: 'new', score: 100 }) })
    return () => { cancel = true }
  }, [userId])

  if (!data) return null
  const m = TIER_META[data.tier] ?? TIER_META.standard
  const Icon = m.Icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${m.cls}`}>
      <Icon className="h-3 w-3" />
      {compact ? m.label : `Trust: ${m.label} · ${data.score}`}
    </span>
  )
}
