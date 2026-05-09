'use client'

import { useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'

export function TournamentCheckInButton({ tournamentId }: { tournamentId: string }) {
  const supabase = createClient()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const checkIn = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Sign in to check in.')
      setLoading(false)
      return
    }

    const { data: membership } = await supabase
      .from('clan_members')
      .select('clan_id, role, member_role')
      .eq('profile_id', user.id)
      .maybeSingle()

    if (!membership) {
      toast.error('You need a registered clan to check in.')
      setLoading(false)
      return
    }

    const { data: registration } = await supabase
      .from('tournament_registrations')
      .select('id')
      .eq('tournament_id', tournamentId)
      .eq('clan_id', membership.clan_id)
      .maybeSingle()

    if (!registration) {
      toast.error('Your clan is not registered for this tournament.')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('tournament_checkins')
      .upsert({
        tournament_id: tournamentId,
        registration_id: registration.id,
        clan_id: membership.clan_id,
        status: 'ready',
        checked_in_by: user.id,
        checked_in_at: new Date().toISOString(),
      }, { onConflict: 'tournament_id,registration_id' })

    if (error) toast.error(error.message)
    else {
      await supabase.from('platform_audit_events').insert({
        actor_id: user.id,
        action: 'tournament.checkin.ready',
        entity_type: 'tournament_checkin',
        clan_id: membership.clan_id,
        tournament_id: tournamentId,
      })
      toast.success('Clan checked in and marked ready.')
    }
    setLoading(false)
  }

  return (
    <button
      type="button"
      onClick={checkIn}
      disabled={loading}
      className="block w-full py-3 bg-brand-lime hover:bg-brand-cyan text-black rounded-xl font-black text-sm text-center transition-all disabled:opacity-50"
    >
      {loading ? <span className="inline-flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Checking in...</span> : <span className="inline-flex items-center gap-2"><CheckCircle size={15} /> Check In Clan</span>}
    </button>
  )
}
