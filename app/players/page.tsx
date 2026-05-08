import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Search, Globe, Star, Filter, Trophy, Shield } from 'lucide-react'
import PublicHeader from '@/components/PublicHeader'

export const metadata = {
  title: 'Players — KAFConnect',
  description: 'Browse all competitive eFootball players registered on KAFConnect.',
}

export default async function Players({ searchParams }: { searchParams: Promise<{ region?: string; q?: string }> }) {
  const { region, q } = await searchParams
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('profiles')
    .select('*, rankings(rating, rank)')
    .order('created_at', { ascending: false })
    .limit(60)

  if (region && region !== 'All') {
    query = query.eq('region', region)
  }
  if (q) {
    query = query.ilike('username', `%${q}%`)
  }

  const { data: players } = await query

  const REGIONS = ['All', 'EU', 'NA', 'SA', 'MENA', 'ASIA', 'OCE', 'AF']

  return (
    <div className="flex flex-col w-full pb-20">
      <PublicHeader />

      {/* Hero */}
      <section className="relative bg-kaf-panel border-b border-kaf-border px-6 py-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.08)_0%,transparent_60%)]" />
        <div className="max-w-5xl mx-auto relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Users size={12} /> Player Directory
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight">
            ALL <span className="text-brand-cyan">PLAYERS</span>
          </h1>
          <p className="text-slate-400 mt-3 max-w-xl">Browse competitive eFootball players from every region.</p>
        </div>
      </section>

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <form className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by gamertag..."
              className="w-full pl-10 pr-4 py-2.5 bg-kaf-card border border-kaf-border rounded-xl text-white placeholder-slate-500 text-sm focus:border-brand-cyan focus:outline-none transition-all"
            />
          </form>
          <div className="flex gap-2 flex-wrap">
            {REGIONS.map(r => (
              <Link
                key={r}
                href={r === 'All' ? '/players' : `/players?region=${r}`}
                className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                  (r === 'All' && !region) || region === r
                    ? 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/40'
                    : 'bg-kaf-card border-kaf-border text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </Link>
            ))}
          </div>
        </div>

        {/* Player Grid */}
        {players && players.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {players.map((player: any, i: number) => (
              <Link
                key={player.id}
                href={`/profile/${player.username}`}
                className="kaf-card rounded-2xl border border-kaf-border p-4 flex flex-col items-center text-center group hover:border-brand-cyan/40 hover:shadow-[0_0_15px_rgba(0,255,102,0.1)] transition-all"
              >
                <div
                  className="w-16 h-16 rounded-full bg-slate-800 bg-cover bg-center border-2 border-kaf-border group-hover:border-brand-cyan transition-all mb-3"
                  style={{ backgroundImage: `url('${player.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`}')` }}
                />
                <div className="font-bold text-white text-sm truncate w-full group-hover:text-brand-cyan transition-colors">
                  {player.username}
                </div>
                {player.region && (
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                    <Globe size={9} /> {player.region}
                  </div>
                )}
                {player.rankings?.rating && (
                  <div className="mt-2 text-xs font-black text-brand-cyan">
                    {player.rankings.rating} MMR
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <Users size={48} className="text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-black text-white mb-2">No players found</h3>
            <p className="text-slate-400">Try adjusting your search or region filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}
