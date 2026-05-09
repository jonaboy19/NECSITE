import PublicHeader from '@/components/PublicHeader'

export const metadata = {
  title: 'Rules - KAFConnect',
  description: 'Community and competition rules for KAFConnect.',
}

export default function RulesPage() {
  const rules = [
    'Use your real competitive gamertag and keep profile details accurate.',
    'Respect opponents, staff, streamers, and community members.',
    'Submit match results honestly and provide evidence when requested.',
    'Do not abuse bugs, duplicate accounts, or impersonate another player.',
    'Tournament admins may review disputes and adjust results when evidence requires it.',
  ]

  return (
    <div className="min-h-screen bg-kaf-bg text-white">
      <PublicHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-4 font-display text-4xl font-black uppercase tracking-wide sm:text-5xl">Rules</h1>
        <p className="mb-8 text-sm leading-relaxed text-slate-400">
          These baseline rules keep tournaments fair and the community usable for everyone.
        </p>
        <div className="space-y-3">
          {rules.map((rule, index) => (
            <div key={rule} className="flex gap-4 rounded-2xl border border-kaf-border bg-kaf-card p-5">
              <span className="text-sm font-black text-brand-lime">{String(index + 1).padStart(2, '0')}</span>
              <p className="text-sm leading-relaxed text-slate-300">{rule}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
