import { createClient } from './supabase/client'

// Data fetching utilities
export async function fetchTournaments(limit?: number) {
  const supabase = createClient()
  const { data } = await supabase
    .from('tournament_summary')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit || 10)
  return data || []
}

export async function fetchClans(limit?: number) {
  const supabase = createClient()
  const { data } = await supabase
    .from('clans')
    .select('*')
    .limit(limit || 10)
  return data || []
}

export async function fetchRankings(limit?: number) {
  const supabase = createClient()
  const { data } = await supabase
    .from('rankings')
    .select('*')
    .order('rating', { ascending: false })
    .limit(limit || 50)
  return data || []
}

export async function fetchFeedActivities(limit?: number) {
  const supabase = createClient()
  const { data } = await supabase
    .from('feed_activities')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit || 10)
  return data || []
}

export async function fetchLiveTickers() {
  const supabase = createClient()
  const { data } = await supabase
    .from('live_tickers')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  return data || []
}

export async function fetchCurrentUser() {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function fetchUserProfile(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

// Formatting utilities
export function formatPlayerCount(count: number): string {
  if (count === 0) return 'No players'
  if (count === 1) return '1 player'
  return `${count} players`
}

export function formatMatchCount(count: number): string {
  if (count === 0) return 'No matches'
  if (count === 1) return '1 match'
  return `${count} matches`
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatRating(rating: number): string {
  return rating.toLocaleString()
}

// Status utilities
export function getStatusColor(status: string): string {
  const statusColors: { [key: string]: string } = {
    'registration_open': 'bg-cyan-400 text-slate-950',
    'in_progress': 'bg-emerald-400 text-slate-950',
    'completed': 'bg-slate-400 text-slate-950',
    'live': 'bg-emerald-400 text-slate-950',
    'scheduled': 'bg-blue-400 text-slate-950',
  }
  return statusColors[status.toLowerCase()] || 'bg-slate-400 text-slate-950'
}

export function getStatusLabel(status: string): string {
  const labels: { [key: string]: string } = {
    'registration_open': 'Registration Open',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'live': 'Live',
    'scheduled': 'Scheduled',
  }
  return labels[status.toLowerCase()] || status
}

// URL utilities
export function getTournamentUrl(tournamentId: string): string {
  return `/tournaments/${tournamentId}/dashboard`
}

export function getClanUrl(clanId: string): string {
  return `/clans/${clanId}`
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidUsername(username: string): boolean {
  return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_-]+$/.test(username)
}

// Error handling
export function handleError(error: any): string {
  if (error?.message) return error.message
  if (typeof error === 'string') return error
  return 'An error occurred. Please try again.'
}
