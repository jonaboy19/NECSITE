import PublicHeader from '@/components/PublicHeader'

export const metadata = {
  title: 'Privacy - KAFConnect',
  description: 'Privacy information for KAFConnect users.',
}

export default function PrivacyPage() {
  const sections = [
    {
      title: 'What KAFConnect Stores',
      body: 'KAFConnect stores the account, profile, tournament, clan, message, match-report, analytics, and support data needed to run the platform.',
    },
    {
      title: 'Public Profile Data',
      body: 'Usernames, avatars, regions, rankings, clan memberships, tournament entries, and public match activity may be visible to other users and visitors.',
    },
    {
      title: 'Private Account Data',
      body: 'Authentication is handled through Supabase Auth. Email addresses, sessions, magic links, and password reset flows should be managed only through Supabase and Vercel environment variables.',
    },
    {
      title: 'Messages And Moderation',
      body: 'Messages and reports may be reviewed when needed for moderation, safety, disputes, or platform abuse investigations.',
    },
    {
      title: 'Analytics',
      body: 'KAFConnect may record basic product events such as feature clicks, signup attempts, login failures, and tournament registration attempts to improve usability and reliability.',
    },
    {
      title: 'Corrections And Support',
      body: 'Contact staff if you need account support, profile corrections, or help with inaccurate tournament or match information.',
    },
  ]

  return (
    <div className="min-h-screen bg-kaf-bg text-white">
      <PublicHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-4 font-display text-4xl font-black uppercase tracking-wide sm:text-5xl">Privacy</h1>
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
