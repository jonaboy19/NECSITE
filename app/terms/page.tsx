import PublicHeader from '@/components/PublicHeader'

export const metadata = {
  title: 'Terms - KAFConnect',
  description: 'Terms of use for KAFConnect.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-kaf-bg text-white">
      <PublicHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-4 font-display text-4xl font-black uppercase tracking-wide sm:text-5xl">Terms</h1>
        <div className="space-y-5 rounded-2xl border border-kaf-border bg-kaf-card p-6 text-sm leading-relaxed text-slate-300">
          <p>By using KAFConnect, you agree to use the platform fairly, follow tournament rules, and respect staff decisions.</p>
          <p>Accounts, clans, tournament entries, match reports, and messages may be moderated when they break rules or harm the community.</p>
          <p>Platform features can change as KAFConnect develops. Staff may pause, remove, or adjust events when needed for fairness or safety.</p>
          <p>For disputes, appeals, and account questions, use the contact or appeals pages.</p>
        </div>
      </main>
    </div>
  )
}
