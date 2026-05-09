'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'

export function ModerationActionButton({
  disputeId,
  status,
  label,
}: {
  disputeId: string
  status: 'reviewing' | 'resolved' | 'rejected'
  label: string
}) {
  const supabase = createClient()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const update = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Sign in as staff first.')
      setLoading(false)
      return
    }
    const { error } = await supabase
      .from('disputes')
      .update({ status })
      .eq('id', disputeId)

    if (error) toast.error(error.message)
    else {
      await supabase.from('platform_audit_events').insert({
        actor_id: user.id,
        action: `dispute.${status}`,
        entity_type: 'dispute',
        entity_id: disputeId,
      })
      toast.success(`Dispute marked ${status}.`)
    }
    setLoading(false)
  }

  return (
    <button
      type="button"
      onClick={update}
      disabled={loading}
      className="kaf-cut-sm border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-black uppercase tracking-wider text-slate-300 transition-colors hover:border-brand-lime/40 hover:text-brand-lime disabled:opacity-50"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : label}
    </button>
  )
}
