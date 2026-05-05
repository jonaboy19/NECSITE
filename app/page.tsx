import Link from 'next/link'
import Header from '@/components/Header'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Trophy, Users, Crown, Zap } from 'lucide-react'

const flagshipSeries = [
  {
    title: 'KAF E-League',
    description: 'The flagship draft-based league — 16 selected players, branded broadcast, and a full season for the crown.',
    status: 'Season 1 — In Progress',
    type: 'Premier League Format',
    href: '/tournaments',
    pinned: true,
    official: true
  },
  {
    title: 'Tournex Open',
    description: 'Monthly cups across all regions. Climb the bracket, qualify for the seasonal grand final, get scouted.',
    status: 'Open Circuit Knockout Series',
    type: 'Monthly Cups',
    href: '/tournaments',
    pinned: true,
    official: true
  }
]

const stats = [
  ['0+', 'Ranked Players'],
  ['3', 'Active Clans'],
  ['1', 'Tournaments'],
  ['5', 'Regions Worldwide']
]

const regions = ['Africa', 'Europe', 'Asia', 'MENA', 'Americas']

async function getHomeData() {
  const supabase = await createServerSupabaseClient()
  const [tournaments, clans, rankings] = await Promise.all([
    supabase.from('tournament_summary').select('*').order('created_at', { ascending: false }).limit(3),
    supabase.from('clans').select('*').limit(3),
    supabase.from('rankings').select('*').order('rating', { ascending: false }).limit(5)
  ])
  return { tournaments: tournaments.data || [], clans: clans.data || [], rankings: rankings.data || [] }
}

export default async function Home() {
  const { tournaments, clans, rankings } = await getHomeData()

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header />

        {/* Hero Section */}
        <section className="py-20">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight">
              The eSports hub for eFootball players
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-300">
              From kickoff to crowning the champion — clans, tournaments, leagues, all in one home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/clans" className="rounded-2xl bg-cyan-400 px-8 py-4 font-black text-slate-950 hover:bg-cyan-300 transition">
                Browse Clans
              </Link>
              <Link href="/tournaments" className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-bold hover:border-cyan-300/40 hover:bg-cyan-300/10 transition">
                View Tournaments
              </Link>
              <Link href="/matches" className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-bold hover:border-cyan-300/40 hover:bg-cyan-300/10 transition">
                Live Matches
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {stats.map(([value, label]) => (
                <div key={label} className="text-center">
                  <div className="text-3xl font-black text-cyan-200">{value}</div>
                  <div className="text-sm text-slate-400 uppercase tracking-wide">{label}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400">
              {regions.map(region => (
                <span key={region} className="px-3 py-1 rounded-full bg-slate-800">{region}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Flagship Series */}
        <section className="py-16">
          <h2 className="text-3xl font-black mb-8">Flagship Series</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {flagshipSeries.map(series => (
              <Link key={series.title} href={series.href} className="kaf-card p-6 rounded-2xl hover:border-cyan-300/40 transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{series.title}</h3>
                    <p className="text-sm text-cyan-200 uppercase tracking-wide">{series.status}</p>
                  </div>
                  <div className="flex gap-2">
                    {series.pinned && <span className="px-2 py-1 bg-cyan-400 text-slate-950 text-xs font-bold rounded">PINNED</span>}
                    {series.official && <span className="px-2 py-1 bg-emerald-400 text-slate-950 text-xs font-bold rounded">OFFICIAL</span>}
                  </div>
                </div>
                <p className="text-slate-400 mb-4">{series.description}</p>
                <p className="text-sm text-slate-500">{series.type}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Latest Tournaments */}
        <section className="py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black">Latest Tournaments</h2>
            <Link href="/tournaments" className="text-cyan-200 hover:text-cyan-100 transition">View All</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {tournaments.map(t => (
              <Link key={t.id} href={`/tournaments/${t.id}/dashboard`} className="kaf-card p-6 rounded-2xl hover:border-cyan-300/40 transition">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy size={20} className="text-cyan-200" />
                  <span className="text-lg font-semibold">{t.title}</span>
                </div>
                <p className="text-sm text-slate-400 mb-4">{t.registration_count} players • {t.match_count} matches</p>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Draft eFootball • Single Elimination</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Top Clans */}
        <section className="py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black">Top Clans</h2>
            <Link href="/clans" className="text-cyan-200 hover:text-cyan-100 transition">View All</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {clans.map((clan, index) => (
              <div key={clan.id} className="kaf-card p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl font-black text-cyan-200">#{index + 1}</div>
                  <div>
                    <h3 className="text-lg font-semibold">{clan.name}</h3>
                    <p className="text-sm text-slate-400 uppercase">Global • 0W-0L</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Results */}
        <section className="py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black">Recent Results</h2>
            <Link href="/matches" className="text-cyan-200 hover:text-cyan-100 transition">View All</Link>
          </div>
          <div className="kaf-card p-6 rounded-2xl">
            <p className="text-slate-400">No completed matches yet.</p>
          </div>
        </section>

        {/* Sponsors */}
        <section className="py-16">
          <h2 className="text-3xl font-black mb-8">For Sponsors</h2>
          <div className="kaf-card p-8 rounded-2xl text-center">
            <h3 className="text-2xl font-bold mb-4">Reach a fast-growing international esports community.</h3>
            <p className="text-slate-400 mb-6">
              KAFConnect connects players across Africa, Europe, Asia and MENA — with live-streamed tournaments, branded overlays and growing social reach.
            </p>
            <Link href="/sponsors" className="rounded-2xl bg-cyan-400 px-8 py-4 font-bold text-slate-950 hover:bg-cyan-300 transition">
              Become a Sponsor
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 border-t border-slate-800">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4">Compete</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/tournaments" className="hover:text-cyan-200 transition">Tournaments</Link></li>
                <li><Link href="/tournaments" className="hover:text-cyan-200 transition">KAF E-League</Link></li>
                <li><Link href="/matches" className="hover:text-cyan-200 transition">Match Center</Link></li>
                <li><Link href="/rankings" className="hover:text-cyan-200 transition">Rankings</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/clans" className="hover:text-cyan-200 transition">Clans</Link></li>
                <li><Link href="/news" className="hover:text-cyan-200 transition">News</Link></li>
                <li><Link href="/community" className="hover:text-cyan-200 transition">Community</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Business</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/sponsors" className="hover:text-cyan-200 transition">Sponsors</Link></li>
                <li><Link href="/admin" className="hover:text-cyan-200 transition">Admin Dashboard</Link></li>
                <li><Link href="/contact" className="hover:text-cyan-200 transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">KAFConnect</h4>
              <p className="text-sm text-slate-400 mb-4">
                International esports hub for tournaments, clans, rankings and live match coverage. Powered by KAF E-League.
              </p>
              <p className="text-xs text-slate-500">© 2026 KAFCONNECT • ALL RIGHTS RESERVED</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            {regions.join(' • ')}
          </div>
        </footer>
      </div>
    </main>
  )
}

        <div className="grid min-h-[78vh] items-center gap-10 py-14 lg:grid-cols-[1.15fr_.85fr]">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-200">
              KAF Esports Connect
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                Run mobile esports tournaments like a real league.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                A KAF tournament operating system for clans, players, hosts and admins. Create events, register competitors, generate matches, report scores and track rankings from one platform.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/tournaments/create" className="rounded-2xl bg-cyan-400 px-6 py-4 text-center font-black text-slate-950 shadow-[0_0_40px_rgba(34,211,238,.25)]">Create tournament</Link>
              <Link href="/tournaments" className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center font-bold text-white">Browse tournaments</Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-2xl font-black text-cyan-200">{value}</div>
                  <div className="text-xs uppercase tracking-widest text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-cyan-300/20 bg-slate-950/80 p-4 shadow-[0_0_80px_rgba(34,211,238,.12)]">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-cyan-400/20 via-slate-900 to-emerald-400/10 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-cyan-200">Live bracket</div>
                  <div className="text-2xl font-black">KAF Elite Cup</div>
                </div>
                <div className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-slate-950">LIVE</div>
              </div>
              <div className="space-y-3">
                {['HYDRØX vs NOVA', 'Oblivion vs Elite XI', 'ZERA Squad vs Falcons'].map((match, i) => (
                  <div key={match} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="flex justify-between text-sm"><span>{match}</span><span className="text-cyan-200">Round {i + 1}</span></div>
                    <div className="mt-3 h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-cyan-400" style={{width: `${45 + i * 18}%`}} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map(([title, body, href]) => (
            <Link key={title} href={href} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-cyan-300/40 hover:bg-cyan-300/10">
              <div className="text-xl font-black">{title}</div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{body}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
