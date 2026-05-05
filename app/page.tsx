import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen p-5 pb-24 kaf-grid">
      <section className="mx-auto flex min-h-[80vh] max-w-5xl flex-col justify-center gap-8">
        <div className="space-y-4">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">KAF Esports Connect</p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-7xl">
            The mobile-first tournament hub for clans, players and KAF competitions.
          </h1>
          <p className="max-w-2xl text-slate-300">
            Create tournaments, register players, start brackets, report scores, confirm results and track rankings from one connected platform.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link className="kaf-card rounded-2xl p-4" href="/tournaments">Browse tournaments</Link>
          <Link className="kaf-card rounded-2xl p-4" href="/tournaments/create">Create tournament</Link>
          <Link className="kaf-card rounded-2xl p-4" href="/clans">Explore clans</Link>
          <Link className="kaf-card rounded-2xl p-4" href="/rankings">Rankings</Link>
        </div>
      </section>
    </main>
  )
}
