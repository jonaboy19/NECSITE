'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Define a strict schema for reporting match scores
const ReportScoreSchema = z.object({
  matchId: z.string().uuid("Invalid Match ID format"),
  scoreA: z.number().int().min(0).max(99, "Score cannot be absurdly high"),
  scoreB: z.number().int().min(0).max(99, "Score cannot be absurdly high"),
})

export async function submitMatchScore(formData: FormData) {
  // Validate input types and constraints on the server
  const parsed = ReportScoreSchema.safeParse({
    matchId: formData.get('matchId'),
    scoreA: Number(formData.get('scoreA')),
    scoreB: Number(formData.get('scoreB')),
  })

  if (!parsed.success) {
    return { error: 'Invalid Input Data: ' + parsed.error.issues.map(i => i.message).join(', ') }
  }

  const supabase = await createServerSupabaseClient()
  
  // Verify User identity and permissions using server context
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { matchId, scoreA, scoreB } = parsed.data

  // Fetch match safely to check authorization (must be player A or B)
  const { data: match } = await supabase
    .from('matches')
    .select('player_a_id, player_b_id, status')
    .eq('id', matchId)
    .single()

  if (!match) return { error: 'Match not found' }
  if (match.status !== 'scheduled' && match.status !== 'live') return { error: 'Match cannot be updated' }
  
  if (match.player_a_id !== user.id && match.player_b_id !== user.id) {
    return { error: 'Forbidden: You are not part of this match' }
  }

  // Determine winner safely
  let winnerProfileId = null
  let winnerClanId = null
  // We'd need clan IDs, so let's just update the score and let the host complete it, 
  // or handle clan progression. For now, just save the score securely.
  
  const { error } = await supabase
    .from('matches')
    .update({ 
      score_a: scoreA, 
      score_b: scoreB, 
      status: 'completed',
      reported_by: user.id
    })
    .eq('id', matchId)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
