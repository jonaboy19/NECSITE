import Link from 'next/link'
import Header from '@/components/Header'

const stats = [
  ['Live tournaments', '24/7'],
  ['Clan battles', '3v3 ready'],
  ['Match flow', 'Report + confirm'],
]

const cards = [
  ['Tournament Center', 'Create cups, start brackets, manage matches and push players through the competition flow.', '/tournaments'],
  ['Clan Network', 'Build clan profiles, organize rosters and prepare team based competitions.', '/clans'],
  ['Rankings', 'Track players, wins, losses, goals and rating across KAF events.', '/rankings'],
]

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <section className="relative mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.22),transparent_35%),radial-gradient(circle_at_top_right,rgba(16,185,129,.18),transparent_30%)]" />
        <Header />

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
              <Link href="/tournaments/create" className="rounded-2xl bg-cyan-400 px-6 py-4 text-center font-black text-slate-950 shadow-[0_0_40px_rgba(34,211,238,.25)] hover:bg-cyan-300 transition">Create tournament</Link>
              <Link href="/tournaments" className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center font-bold text-white hover:border-cyan-300/40 hover:bg-cyan-300/10 transition">Browse tournaments</Link>
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
