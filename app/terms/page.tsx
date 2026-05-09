import PublicHeader from '@/components/PublicHeader'

export const metadata = {
  title: 'Terms - KAFConnect',
  description: 'Terms of use for KAFConnect.',
}

export default function TermsPage() {
  const sections = [
    {
      title: 'Using The Platform',
      body: 'By using KAFConnect, you agree to use the site fairly, follow tournament rules, and respect staff decisions made to protect competitive integrity.',
    },
    {
      title: 'Accounts And Eligibility',
      body: 'You are responsible for your account, profile information, clan activity, tournament registrations, match reports, and messages.',
    },
    {
      title: 'Moderation',
      body: 'KAFConnect may moderate accounts, clans, tournament entries, match reports, messages, uploads, and public content when rules are broken or the community is harmed.',
    },
    {
      title: 'Tournaments',
      body: 'Events may be paused, adjusted, rescheduled, cancelled, or corrected when required for fairness, technical problems, organizer decisions, or evidence review.',
    },
    {
      title: 'Disputes',
      body: 'Use the contact or appeals pages for account issues, match disputes, suspicious activity, and moderation questions. Clear evidence helps staff resolve issues faster.',
    },
  ]

  return (
    <div className="min-h-screen bg-kaf-bg text-white">
      <PublicHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-4 font-display text-4xl font-black uppercase tracking-wide sm:text-5xl">Terms</h1>
        <div className="space-y-4">
          {sections.map(section => (
            <section key={section.title} className="rounded-2xl border border-kaf-border bg-kaf-card p-6 text-sm leading-relaxed text-slate-300">
              <h2 className="mb-2 text-lg font-black text-white">{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
