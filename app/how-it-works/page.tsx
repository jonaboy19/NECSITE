import PublicHeader from '@/components/PublicHeader'
import Link from 'next/link'
import { CheckCircle2, Flag, ShieldCheck, Trophy } from 'lucide-react'

export const metadata = {
  title: 'How Tournaments Work - KAFConnect',
  description: 'Learn how KAFConnect tournaments, clans, match reports, and disputes work.',
}

export default function HowItWorksPage() {
  const steps = [
    {
      title: 'Create your profile',
      description: 'Register, add your gamertag, region, Discord, and eFootball ID so organizers can verify you.',
      Icon: ShieldCheck,
    },
    {
      title: 'Join or create a clan',
      description: 'Most events use clan registration. Join an existing organization or create one for your roster.',
      Icon: Flag,
    },
    {
      title: 'Register for events',
      description: 'Browse open tournaments, check the rules and format, then register your clan before the deadline.',
      Icon: Trophy,
    },
    {
      title: 'Report results',
      description: 'After each match, submit scores and evidence when needed. Staff can review disputes.',
      Icon: CheckCircle2,
    },
  ]

  return (
    <div className="min-h-screen bg-kaf-bg text-white">
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-2xl border border-kaf-border bg-kaf-card p-6 sm:p-8">
          <h1 className="font-display text-4xl font-black uppercase tracking-wide sm:text-5xl">How KAFConnect Works</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
            A simple guide for players, clan leaders, and tournament hosts.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {steps.map(({ title, description, Icon }) => (
            <div key={title} className="rounded-2xl border border-kaf-border bg-kaf-card p-5">
              <Icon className="mb-4 text-brand-lime" size={24} />
              <h2 className="mb-2 text-lg font-black text-white">{title}</h2>
              <p className="text-sm leading-relaxed text-slate-400">{description}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-kaf-border bg-kaf-card p-5">
            <h2 className="mb-2 text-lg font-black text-white">For Players</h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Keep your profile complete, join events on time, follow match schedules, and report scores honestly.
            </p>
          </div>
          <div className="rounded-2xl border border-kaf-border bg-kaf-card p-5">
            <h2 className="mb-2 text-lg font-black text-white">For Clan Leaders</h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Manage roster quality, register the correct team, check approvals, and coordinate players before match time.
            </p>
          </div>
          <div className="rounded-2xl border border-kaf-border bg-kaf-card p-5">
            <h2 className="mb-2 text-lg font-black text-white">For Staff</h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Review pending entries, resolve disputes from evidence, and keep tournament state accurate for everyone.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-kaf-border bg-kaf-card p-6 text-center">
          <h2 className="mb-2 text-xl font-black text-white">Need help from staff?</h2>
          <p className="mb-5 text-sm text-slate-400">Use the contact page for account questions, event issues, and match disputes.</p>
          <Link href="/contact" className="inline-flex rounded-xl bg-brand-cyan px-5 py-3 text-sm font-black text-white shadow-glow-green transition-colors hover:bg-brand-lime">
            Contact staff
          </Link>
        </section>
      </main>
    </div>
  )
}
