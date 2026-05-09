'use client'

import Link from 'next/link'
import {
  Trophy,
  Shield,
  Users,
  BarChart3,
  Swords,
  MessageSquare,
  Video,
  UserPlus,
  Settings,
  HelpCircle,
  Handshake,
  Eye,
  CalendarDays,
  Award,
  type LucideIcon,
} from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

type Feature = {
  title: string
  description: string
  href: string
  action: string
  Icon: LucideIcon
  audience: 'players' | 'clans' | 'staff' | 'everyone'
}

export const FEATURES: Feature[] = [
  {
    title: 'Join tournaments',
    description: 'Find open events, register, follow brackets, and check match schedules.',
    href: '/tournaments',
    action: 'Browse events',
    Icon: Trophy,
    audience: 'players',
  },
  {
    title: 'Build or join a clan',
    description: 'Create an organization, recruit players, manage your roster, or apply as a free agent.',
    href: '/clans',
    action: 'Open clans',
    Icon: Shield,
    audience: 'clans',
  },
  {
    title: 'Find players',
    description: 'Discover competitors, free agents, friends, and regional community members.',
    href: '/players',
    action: 'View players',
    Icon: Users,
    audience: 'everyone',
  },
  {
    title: 'Track rankings',
    description: 'See who is climbing, compare player and clan performance, and follow form.',
    href: '/rankings',
    action: 'See rankings',
    Icon: BarChart3,
    audience: 'players',
  },
  {
    title: 'Report matches',
    description: 'Submit scores, confirm results, and keep tournament admins up to date.',
    href: '/matches/report',
    action: 'Report score',
    Icon: Swords,
    audience: 'players',
  },
  {
    title: 'Chat and messages',
    description: 'Coordinate with clans, tournament staff, friends, and opponents.',
    href: '/messages',
    action: 'Open inbox',
    Icon: MessageSquare,
    audience: 'everyone',
  },
  {
    title: 'Watch KAF TV',
    description: 'Follow videos, highlights, VODs, and live community media.',
    href: '/vod-library',
    action: 'Watch media',
    Icon: Video,
    audience: 'everyone',
  },
  {
    title: 'Free agents',
    description: 'List yourself for recruitment or scout available players for your roster.',
    href: '/free-agents',
    action: 'Find talent',
    Icon: UserPlus,
    audience: 'clans',
  },
  {
    title: 'Transfer market',
    description: 'Track transfer windows, open negotiations, contract states, loans, and player movement history.',
    href: '/transfers',
    action: 'Open market',
    Icon: Handshake,
    audience: 'clans',
  },
  {
    title: 'Scouting hub',
    description: 'Filter talent by region, platform, style, availability, reliability, and recruitment fit.',
    href: '/scouting',
    action: 'Scout players',
    Icon: Eye,
    audience: 'clans',
  },
  {
    title: 'Operations calendar',
    description: 'Manage check-ins, roster locks, fixtures, media drops, and tournament deadlines in one schedule.',
    href: '/calendar',
    action: 'Open calendar',
    Icon: CalendarDays,
    audience: 'staff',
  },
  {
    title: 'Seasons and awards',
    description: 'Follow season phases, archived records, MVP races, rookies, trophies, and monthly honors.',
    href: '/seasons',
    action: 'View season',
    Icon: Award,
    audience: 'everyone',
  },
  {
    title: 'Set up profile',
    description: 'Add gamertag, avatar, region, social links, and competition details.',
    href: '/settings',
    action: 'Edit profile',
    Icon: Settings,
    audience: 'players',
  },
  {
    title: 'Need help?',
    description: 'Contact staff, understand roles, and submit appeals or disputes.',
    href: '/contact',
    action: 'Get support',
    Icon: HelpCircle,
    audience: 'everyone',
  },
]

const audienceLabels = {
  players: 'Players',
  clans: 'Clans',
  staff: 'Staff',
  everyone: 'Everyone',
}

export function FeatureHub({
  compact = false,
  limit,
  title = 'Everything you can do on KAFConnect',
  subtitle = 'A simple starting point for players, clan staff, hosts, and new visitors.',
}: {
  compact?: boolean
  limit?: number
  title?: string
  subtitle?: string
}) {
  const items = typeof limit === 'number' ? FEATURES.slice(0, limit) : FEATURES

  return (
    <section className={compact ? 'space-y-5' : 'space-y-8'}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-black uppercase tracking-wide text-white sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            {subtitle}
          </p>
        </div>
        {!compact && (
          <Link href="/auth/register" className="inline-flex items-center justify-center rounded-lg bg-brand-cyan px-5 py-3 text-sm font-black text-white transition-colors hover:bg-brand-lime">
            Create account
          </Link>
        )}
      </div>

      <div className={`grid gap-3 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-3'}`}>
        {items.map(({ title, description, href, action, Icon, audience }) => (
          <Link
            key={title}
            href={href}
            onClick={() => trackEvent('feature_hub_click', { title, href, audience })}
            className="group flex min-h-36 flex-col justify-between rounded-xl border border-kaf-border bg-kaf-card p-5 transition-all hover:-translate-y-0.5 hover:border-brand-cyan/40 hover:bg-kaf-elevated"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-brand-cyan/25 bg-brand-cyan/10 text-brand-lime">
                <Icon size={20} />
              </span>
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-black text-white">{title}</h3>
                  <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-500">
                    {audienceLabels[audience]}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-slate-400">{description}</p>
              </div>
            </div>
            <span className="mt-5 text-xs font-black uppercase tracking-wider text-brand-cyan transition-colors group-hover:text-brand-lime">
              {action}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
