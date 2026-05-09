import PublicHeader from '@/components/PublicHeader'
import { FeatureHub } from '@/components/FeatureHub'

export const metadata = {
  title: 'Features - KAFConnect',
  description: 'Everything players, clans, staff, and visitors can do on KAFConnect.',
}

export default function FeaturesPage() {
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
        <FeatureHub />
      </main>
    </div>
  )
}
