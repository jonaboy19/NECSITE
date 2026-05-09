export const TOURNAMENT_STATUS = {
  draft: 'draft',
  registrationOpen: 'registration_open',
  active: 'active',
  completed: 'completed',
} as const

export const MATCH_STATUS = {
  scheduled: 'scheduled',
  live: 'live',
  completed: 'completed',
  disputed: 'disputed',
} as const

export const CONTRACT_STATUS = {
  active: 'active',
  expiring: 'expiring',
  expired: 'expired',
  suspended: 'suspended',
  transferListed: 'transfer-listed',
  negotiating: 'negotiating',
  released: 'released',
  trial: 'trial',
  loan: 'loan',
  academy: 'academy',
} as const

const LEGACY_TOURNAMENT_STATUS: Record<string, string> = {
  live: TOURNAMENT_STATUS.active,
  in_progress: TOURNAMENT_STATUS.active,
  open: TOURNAMENT_STATUS.registrationOpen,
  registration: TOURNAMENT_STATUS.registrationOpen,
  finished: TOURNAMENT_STATUS.completed,
}

export function normalizeTournamentStatus(status?: string | null) {
  if (!status) return TOURNAMENT_STATUS.draft
  return LEGACY_TOURNAMENT_STATUS[status] || status
}

export function isTournamentLive(status?: string | null) {
  return normalizeTournamentStatus(status) === TOURNAMENT_STATUS.active
}

export function isTournamentJoinable(status?: string | null) {
  return normalizeTournamentStatus(status) === TOURNAMENT_STATUS.registrationOpen
}

export function formatStatusLabel(status?: string | null) {
  return (status || 'unknown').replace(/_/g, ' ')
}
