import PublicHeader from '@/components/PublicHeader'

export const metadata = {
  title: 'Privacy - KAFConnect',
  description: 'Privacy information for KAFConnect users.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-kaf-bg text-white">
      <PublicHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-4 font-display text-4xl font-black uppercase tracking-wide sm:text-5xl">Privacy</h1>
        <div className="space-y-5 rounded-2xl border border-kaf-border bg-kaf-card p-6 text-sm leading-relaxed text-slate-300">
          <p>KAFConnect stores account, profile, tournament, clan, message, and match-report data needed to run the platform.</p>
          <p>Public profile fields such as username, avatar, region, rankings, clan, and match activity may be visible to other users.</p>
          <p>Private account details are handled through Supabase Auth. Do not publish service-role keys or private credentials in code.</p>
          <p>Contact staff if you need account support or want inaccurate profile information corrected.</p>
        </div>
      </main>
    </div>
  )
}
