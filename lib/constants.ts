// Color and styling constants
export const COLORS = {
  primary: '#020617',
  secondary: '#0f172a',
  accent: 'cyan',
  accentLight: '#06b6d4',
  accentDark: '#0891b2',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
}

// Animation and transition constants
export const TRANSITIONS = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
}

// API endpoints
export const API_ENDPOINTS = {
  tournaments: '/api/tournaments',
  clans: '/api/clans',
  rankings: '/api/rankings',
  matches: '/api/matches',
  profiles: '/api/profiles',
}

// Navigation links
export const NAV_LINKS = [
  { href: '/tournaments', label: 'Tournaments', icon: 'Trophy' },
  { href: '/clans', label: 'Clans', icon: 'Users' },
  { href: '/rankings', label: 'Rankings', icon: 'BarChart3' },
]

// Quick action links
export const QUICK_ACTIONS = [
  { href: '/tournaments/create', label: 'Create Tournament', icon: 'Plus', color: 'cyan' },
  { href: '/clans/create', label: 'Create Clan', icon: 'Plus', color: 'cyan' },
  { href: '/profile', label: 'View Profile', icon: 'User', color: 'slate' },
]

// Footer links
export const FOOTER_SECTIONS = {
  compete: {
    title: 'Compete',
    links: [
      { href: '/tournaments', label: 'Tournaments' },
      { href: '/tournaments', label: 'KAF E-League' },
      { href: '/matches', label: 'Match Center' },
      { href: '/rankings', label: 'Rankings' },
    ]
  },
  community: {
    title: 'Community',
    links: [
      { href: '/clans', label: 'Clans' },
      { href: '/news', label: 'News' },
      { href: '/community', label: 'Community' },
    ]
  },
  business: {
    title: 'Business',
    links: [
      { href: '/sponsors', label: 'Sponsors' },
      { href: '/admin', label: 'Admin Dashboard' },
      { href: '/contact', label: 'Contact' },
    ]
  }
}

// Regions
export const REGIONS = ['Africa', 'Europe', 'Asia', 'MENA', 'Americas']

// Pagination and limits
export const PAGINATION = {
  defaultLimit: 10,
  homeLimit: 3,
  leaderboardLimit: 50,
}
