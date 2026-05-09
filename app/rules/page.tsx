import PublicHeader from '@/components/PublicHeader'

export const metadata = {
  title: 'Rules - KAFConnect',
  description: 'Community and competition rules for KAFConnect.',
}

export default function RulesPage() {
  const sections = [
    {
      title: 'Account And Identity',
      items: [
        'Use one account and keep your gamertag, Discord, region, and eFootball ID accurate.',
        'Do not impersonate players, staff, clans, sponsors, or tournament organizers.',
        'Keep login links private. You are responsible for activity from your account.',
      ],
    },
    {
      title: 'Competition',
      items: [
        'Join only tournaments you can attend and check the format, schedule, roster rules, and deadlines before registering.',
        'Play matches fairly. Bug abuse, match fixing, intentional disconnects, and manipulated evidence can lead to removal.',
        'Submit scores honestly through match reporting and keep screenshots or recordings when staff request proof.',
      ],
    },
    {
      title: 'Community',
      items: [
        'Respect opponents, clan members, staff, streamers, and visitors.',
        'No harassment, hate speech, threats, spam, explicit content, or attempts to bypass moderation.',
        'Clan leaders are responsible for their roster behavior during official KAFConnect events.',
      ],
    },
    {
      title: 'Disputes And Staff Decisions',
      items: [
        'Use the appeals or contact pages for disputes. Keep reports specific and include evidence.',
        'Tournament admins may review registrations, match reports, disputes, and suspicious activity.',
        'Staff may adjust scores, reject reports, remove entries, or suspend access when fairness or safety requires it.',
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-kaf-bg text-white">
      <PublicHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-4 font-display text-4xl font-black uppercase tracking-wide sm:text-5xl">Rules</h1>
        <p className="mb-8 text-sm leading-relaxed text-slate-400">
          These baseline rules keep tournaments fair and the community usable for everyone.
        </p>
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={section.title} className="rounded-2xl border border-kaf-border bg-kaf-card p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-sm font-black text-brand-lime">{String(index + 1).padStart(2, '0')}</span>
                <h2 className="text-lg font-black text-white">{section.title}</h2>
              </div>
              <ul className="space-y-2 text-sm leading-relaxed text-slate-300">
                {section.items.map(item => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
