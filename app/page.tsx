import Link from 'next/link'
import Header from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Trophy } from 'lucide-react'
import { fetchTournaments, fetchClans } from '@/lib/utils'
import { REGIONS, PAGINATION } from '@/lib/constants'

const flagshipSeries = [
  {
    title: 'KAF E-League',
    description: 'The flagship draft-based league — selected players, branded broadcast, and a full season for the crown.',
    status: 'Season 1 — In Progress',
    type: 'Premier League Format',
    href: '/tournaments',
    pinned: true,
    official: true,
  },
  {
    title: 'Tournex Open',
    description: 'Monthly cups across all regions. Climb the bracket, qualify for the seasonal grand final, get scouted.',
    status: 'Open Circuit Knockout Series',
    type: 'Monthly Cups',
    href: '/tournaments',
    pinned: true,
    official: true,
  },
]

async function getHomeData() {
  const tournaments = await fetchTournaments(PAGINATION.homeLimit)
  const clans = await fetchClans(PAGINATION.homeLimit)
  return { tournaments, clans }
}

export default async function Home() {
  const { tournaments, clans } = await getHomeData()

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header />

        <section className="py-20">
          <div className="space-y-8 text-center">
            <h1 className="text-4xl font-black tracking-tight md:text-6xl">
              The esports hub for eFootball players
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-300">
              From kickoff to crowning the champion — clans, tournaments, leagues, all in one home.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/clans" className="rounded-2xl bg-cyan-400 px-8 py-4 font-black text-slate-950 transition hover:bg-cyan-300">
                Browse Clans
              </Link>
              <Link href="/tournaments" className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-bold transition hover:border-cyan-300/40 hover:bg-cyan-300/10">
                View Tournaments
              </Link>
              <Link href="/matches" className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-bold transition hover:border-cyan-300/40 hover:bg-cyan-300/10">
                Live Matches
              </Link>
            </div>
            <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4 md:grid-cols-4">
              {[
                ['0+', 'Ranked Players'],
                [`${clans.length}`, 'Active Clans'],
                [`${tournaments.length}`, 'Tournaments'],
                ['5', 'Regions Worldwide'],
              ].map(([value, label]) => (
                <div key={label} className="text-center">
                  <div className="text-3xl font-black text-cyan-200">{value}</div>
                  <div className="text-sm uppercase tracking-wide text-slate-400">{label}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400">
              {REGIONS.map((region) => (
                <span key={region} className="rounded-full bg-slate-800 px-3 py-1">{region}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <h2 className="mb-8 text-3xl font-black">Flagship Series</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {flagshipSeries.map((series) => (
              <Link key={series.title} href={series.href} className="kaf-card rounded-2xl p-6 transition hover:border-cyan-300/40">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{series.title}</h3>
                    <p className="text-sm uppercase tracking-wide text-cyan-200">{series.status}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {series.pinned && <span className="rounded bg-cyan-400 px-2 py-1 text-xs font-bold text-slate-950">PINNED</span>}
                    {series.official && <span className="rounded bg-emerald-400 px-2 py-1 text-xs font-bold text-slate-950">OFFICIAL</span>}
                  </div>
                </div>
                <p className="mb-4 text-slate-400">{series.description}</p>
                <p className="text-sm text-slate-500">{series.type}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-black">Latest Tournaments</h2>
            <Link href="/tournaments" className="text-cyan-200 transition hover:text-cyan-100">View All</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {tournaments.length === 0 ? (
              <div className="kaf-card rounded-2xl p-6 text-slate-400 md:col-span-3">No tournaments yet. Create the first one.</div>
            ) : tournaments.map((t: any) => (
              <Link key={t.id} href={`/tournaments/${t.id}/dashboard`} className="kaf-card rounded-2xl p-6 transition hover:border-cyan-300/40">
                <div className="mb-2 flex items-center gap-2">
                  <Trophy size={20} className="text-cyan-200" />
                  <span className="text-lg font-semibold">{t.title}</span>
                </div>
                <p className="mb-4 text-sm text-slate-400">{t.registration_count ?? 0} players • {t.match_count ?? 0} matches</p>
                <div className="text-xs uppercase tracking-wide text-slate-500">Draft eFootball • Single Elimination</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-black">Top Clans</h2>
            <Link href="/clans" className="text-cyan-200 transition hover:text-cyan-100">View All</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {clans.length === 0 ? (
              <div className="kaf-card rounded-2xl p-6 text-slate-400 md:col-span-3">No clans yet. Create the first clan.</div>
            ) : clans.map((clan: any, index: number) => (
              <div key={clan.id} className="kaf-card rounded-2xl p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="text-2xl font-black text-cyan-200">#{index + 1}</div>
                  <div>
                    <h3 className="text-lg font-semibold">{clan.name}</h3>
                    <p className="text-sm uppercase text-slate-400">{clan.region ?? 'Global'} • 0W-0L</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-black">Recent Results</h2>
            <Link href="/matches" className="text-cyan-200 transition hover:text-cyan-100">View All</Link>
          </div>
          <div className="kaf-card rounded-2xl p-6">
            <p className="text-slate-400">No completed matches yet.</p>
          </div>
        </section>

        <section className="py-16">
          <h2 className="mb-8 text-3xl font-black">For Sponsors</h2>
          <div className="kaf-card rounded-2xl p-8 text-center">
            <h3 className="mb-4 text-2xl font-bold">Reach a fast-growing international esports community.</h3>
            <p className="mb-6 text-slate-400">
              KAFConnect connects players across Africa, Europe, Asia and MENA — with live-streamed tournaments, branded overlays and growing social reach.
            </p>
            <Link href="/sponsors" className="rounded-2xl bg-cyan-400 px-8 py-4 font-bold text-slate-950 transition hover:bg-cyan-300">
              Become a Sponsor
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  )
}
