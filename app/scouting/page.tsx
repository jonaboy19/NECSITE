import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BarChart3, Eye, FileText, Search, Shield, Star, UserPlus } from 'lucide-react'

export const metadata = {
  title: 'Scouting Hub | KAFConnect',
  description: 'Scout players, track reputation, review contracts, and prepare transfer decisions.',
}

export default async function ScoutingHubPage({ searchParams }: { searchParams: Promise<{ q?: string; region?: string }> }) {
  const { q, region } = await searchParams
  const supabase = await createServerSupabaseClient()

  let playerQuery = supabase
    .from('players')
    .select('id,gamertag,country,region,role,ranking_points,form,bio,avatar_url,current_clan_id,profiles(username,avatar_url),player_reputation(reliability_score,sportsmanship_score,activity_score,competitive_rating)')
    .order('ranking_points', { ascending: false })
    .limit(72)

  if (q) playerQuery = playerQuery.ilike('gamertag', `%${q}%`)
  if (region) playerQuery = playerQuery.eq('region', region)

  const [{ data: players }, { data: contracts }, { data: negotiations }] = await Promise.all([
    playerQuery,
    supabase
      .from('player_contracts')
      .select('id,status,starts_at,ends_at,salary_amount,salary_currency,players(gamertag,role),clans(name,tag)')
      .order('created_at', { ascending: false })
      .limit(15),
    supabase
      .from('transfer_negotiations')
      .select('id,status,created_at,players(gamertag),from_clan:from_clan_id(name,tag),to_clan:to_clan_id(name,tag)')
      .order('created_at', { ascending: false })
      .limit(15),
  ])

  const roster = players || []
  const regions = Array.from(new Set(roster.map((p: any) => p.region).filter(Boolean)))

  return (
    <div className="kaf-app-page flex w-full flex-col pb-20">
      <section className="kaf-page-hero px-6 py-12 md:px-10">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="kaf-chip kaf-chip-green mb-5">
            <Eye size={12} /> Scouting Department
          </div>
          <h1 className="kaf-display text-5xl text-white md:text-7xl">
            Scout <span className="text-brand-lime">Talent</span>
          </h1>
          <p className="mt-5 max-w-2xl text-slate-400">
            Review real player records, reputation, contract activity, and transfer movement before committing to a signing.
          </p>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-7xl gap-6 p-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="kaf-frame kaf-cut-sm flex flex-col gap-3 p-3 sm:flex-row">
            <form className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search player database..."
                className="w-full border border-white/[0.08] bg-black/40 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-brand-lime"
              />
              {region && <input type="hidden" name="region" value={region} />}
            </form>
            <div className="flex gap-2 overflow-x-auto">
              <Link href="/scouting" className={`kaf-cut-sm border px-4 py-2 text-xs font-black uppercase tracking-wider ${!region ? 'border-brand-cyan/40 bg-brand-cyan/15 text-brand-lime' : 'border-white/[0.08] text-slate-400'}`}>
                All
              </Link>
              {regions.slice(0, 6).map(r => (
                <Link key={r} href={`/scouting?${new URLSearchParams({ ...(q ? { q } : {}), region: r }).toString()}`} className={`kaf-cut-sm border px-4 py-2 text-xs font-black uppercase tracking-wider ${region === r ? 'border-brand-cyan/40 bg-brand-cyan/15 text-brand-lime' : 'border-white/[0.08] text-slate-400'}`}>
                  {r}
                </Link>
              ))}
            </div>
          </div>

          {roster.length === 0 ? (
            <div className="kaf-frame kaf-cut p-10 text-center">
              <UserPlus size={42} className="mx-auto mb-3 text-slate-700" />
              <h2 className="text-xl font-black text-white">No players match this scout filter</h2>
              <p className="mt-2 text-sm text-slate-500">Try a different region or search term.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {roster.map((player: any) => {
                const rep = Array.isArray(player.player_reputation) ? player.player_reputation[0] : player.player_reputation
                const profileHref = `/profile/${player.profiles?.username || player.gamertag}`
                const marketValue = Math.round(((player.ranking_points || 1000) * 7) + ((rep?.competitive_rating || 70) * 120))
                return (
                  <Link key={player.id} href={profileHref} className="kaf-frame kaf-cut depth-hover p-5">
                    <div className="flex items-start gap-4">
                      <div
                        className="h-14 w-14 shrink-0 border border-white/10 bg-slate-800 bg-cover bg-center kaf-cut-sm"
                        style={{ backgroundImage: `url('${player.avatar_url || player.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.gamertag}`}')` }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-lg font-black text-white">{player.gamertag}</div>
                        <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                          {player.region && <span>{player.region}</span>}
                          {player.role && <span>{player.role}</span>}
                          <span>{player.ranking_points || 1000} rating</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 line-clamp-2 min-h-[40px] text-sm text-slate-400">{player.bio || 'No scouting note yet. Open the profile before making a transfer decision.'}</p>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        ['Reliability', rep?.reliability_score ?? 70],
                        ['Activity', rep?.activity_score ?? 70],
                        ['Comp', rep?.competitive_rating ?? player.ranking_points ?? 70],
                      ].map(([label, value]) => (
                        <div key={label} className="border border-white/[0.06] bg-black/20 p-2">
                          <div className="text-lg font-black text-brand-lime">{value}</div>
                          <div className="text-[9px] font-black uppercase tracking-wider text-slate-500">{label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs">
                      <span className="font-black uppercase tracking-wider text-slate-500">Projected value</span>
                      <span className="font-black text-brand-gold">{marketValue.toLocaleString()} KC</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="kaf-frame kaf-cut-sm p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">
              <FileText size={16} className="text-brand-gold" /> Contract Intel
            </h2>
            {(contracts || []).length === 0 ? (
              <p className="text-sm text-slate-500">No contract records available.</p>
            ) : (
              <div className="space-y-3">
                {(contracts || []).map((contract: any) => (
                  <div key={contract.id} className="border border-white/[0.06] bg-black/20 p-3">
                    <div className="font-bold text-white">{contract.players?.gamertag || 'Player'}</div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {contract.clans?.tag || contract.clans?.name || 'Clan'} {contract.ends_at ? `- ends ${new Date(contract.ends_at).toLocaleDateString()}` : ''}
                    </div>
                    <div className="mt-2 text-xs font-black text-brand-gold">
                      {contract.salary_amount ? `${contract.salary_amount} ${contract.salary_currency || 'KC'}` : contract.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="kaf-frame kaf-cut-sm p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">
              <BarChart3 size={16} className="text-brand-lime" /> Transfer Movement
            </h2>
            {(negotiations || []).length === 0 ? (
              <p className="text-sm text-slate-500">No tracked negotiations yet.</p>
            ) : (
              <div className="space-y-3">
                {(negotiations || []).map((offer: any) => (
                  <div key={offer.id} className="border border-white/[0.06] bg-black/20 p-3">
                    <div className="font-bold text-white">{offer.players?.gamertag || 'Player'}</div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {offer.from_clan?.tag || 'FA'} to {offer.to_clan?.tag || offer.to_clan?.name || 'TBD'}
                    </div>
                    <div className="mt-2 text-xs font-black uppercase tracking-wider text-brand-lime">{offer.status}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link href="/transfers" className="btn-primary w-full py-3">
            Open Transfer Market
          </Link>

          <div className="kaf-frame kaf-cut-sm p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">
              <Shield size={16} className="text-brand-lime" /> Scout Standard
            </h2>
            <div className="space-y-2 text-sm text-slate-400">
              <p>Use reputation, contract state, rating, and role fit before opening an offer.</p>
              <p>Keep transfers inside KAFConnect so history and accountability stay attached to the player.</p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
