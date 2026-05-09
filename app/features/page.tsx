import PublicHeader from '@/components/PublicHeader'
import { FeatureHub } from '@/components/FeatureHub'
import Link from 'next/link'
import { Shield, Trophy, Users, Video } from 'lucide-react'

export const metadata = {
  title: 'Features - KAFConnect',
  description: 'Everything players, clans, staff, and visitors can do on KAFConnect.',
}

export default function FeaturesPage() {
  const paths = [
    {
      title: 'New player',
      description: 'Set up your profile, find a tournament, join a clan, and start reporting matches.',
      href: '/auth/register',
      action: 'Create profile',
      Icon: Trophy,
    },
    {
      title: 'Clan leader',
      description: 'Create an organization, recruit free agents, manage your roster, and scout rankings.',
      href: '/clans/create',
      action: 'Create clan',
      Icon: Shield,
    },
    {
      title: 'Tournament admin',
      description: 'Open the admin hub for event setup, match review, score checks, and platform control.',
      href: '/admin',
      action: 'Open admin',
      Icon: Users,
    },
    {
      title: 'Visitor',
      description: 'Browse tournaments, watch KAF TV, read news, and follow the public leaderboard.',
      href: '/vod-library',
      action: 'Watch KAF TV',
      Icon: Video,
    },
  ]

  return (
    <div className="min-h-screen bg-kaf-bg text-white">
      <PublicHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-12">
        <section className="mb-10 rounded-2xl border border-kaf-border bg-[linear-gradient(135deg,rgba(25,133,59,0.18),rgba(12,12,16,0.9)_45%,rgba(59,130,246,0.12))] p-6 sm:p-8">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-brand-lime">Start here</p>
          <h1 className="max-w-3xl font-display text-4xl font-black uppercase tracking-wide text-white sm:text-5xl">
            Choose what you want to do
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
            KAFConnect has tournaments, clans, rankings, media, chat, and admin tools. This page keeps every major feature one click away.
          </p>
        </section>

        <section className="mb-10 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {paths.map(({ title, description, href, action, Icon }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-2xl border border-kaf-border bg-kaf-card p-5 transition-all hover:-translate-y-0.5 hover:border-brand-cyan/40 hover:bg-kaf-elevated"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-brand-cyan/25 bg-brand-cyan/10 text-brand-lime">
                <Icon size={20} />
              </div>
              <h2 className="mb-2 text-lg font-black text-white">{title}</h2>
              <p className="mb-5 text-sm leading-relaxed text-slate-400">{description}</p>
              <span className="text-xs font-black uppercase tracking-wider text-brand-cyan group-hover:text-brand-lime">
                {action}
              </span>
            </Link>
          ))}
        </section>

        <FeatureHub />
      </main>
    </div>
  )
}
