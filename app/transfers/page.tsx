import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Handshake, Search, Shield, Star, UserPlus, WalletCards } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import { TransferOfferButton } from '@/components/TransferOfferButton'

export const metadata = {
  title: 'Transfer Market | KAFConnect',
  description: 'Scout free agents, review transfer negotiations, and manage player movement.',
}

export default async function TransferMarketPage({ searchParams }: { searchParams: Promise<{ q?: string; region?: string }> }) {
  const { q, region } = await searchParams
  const supabase = await createServerSupabaseClient()

  let playerQuery = supabase
    .from('players')
    .select('id,gamertag,country,region,role,ranking_points,form,bio,avatar_url,current_clan_id, profiles(username,avatar_url), player_reputation(reliability_score,sportsmanship_score,activity_score,competitive_rating)')
    .is('current_clan_id', null)
    .order('ranking_points', { ascending: false })
    .limit(48)

  if (q) playerQuery = playerQuery.ilike('gamertag', `%${q}%`)
  if (region) playerQuery = playerQuery.eq('region', region)

  const [{ data: players }, { data: negotiations }, { data: contracts }] = await Promise.all([
    playerQuery,
    supabase
      .from('transfer_negotiations')
      .select('id,status,created_at,salary_amount,salary_currency,players(gamertag),from_clan:from_clan_id(name,tag),to_clan:to_clan_id(name,tag)')
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('player_contracts')
      .select('id,status,ends_at,players(gamertag),clans(name,tag)')
      .in('status', ['expiring', 'transfer-listed', 'negotiating'])
      .order('ends_at', { ascending: true, nullsFirst: false })
      .limit(12),
  ])

  const agents = players || []
  const regions = Array.from(new Set(agents.map((p: any) => p.region).filter(Boolean)))

  return (
    <div className="kaf-screen flex flex-col w-full pb-20">
      <section className="kaf-stadium-bg kaf-scanlines border-b border-white/[0.06] px-6 py-10 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="kaf-chip kaf-chip-yellow mb-5">
            <Handshake size={12} /> Transfer Market
          </div>
          <h1 className="kaf-display text-5xl text-white md:text-7xl">
            Scout. Negotiate. <span className="text-brand-gold">Sign.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-slate-400">
            A real recruitment board for free agents, expiring contracts, transfer-listed players, and negotiation history.
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
                placeholder="Search free agents..."
                className="w-full border border-white/[0.08] bg-black/40 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-brand-gold"
              />
              {region && <input type="hidden" name="region" value={region} />}
            </form>
            <div className="flex gap-2 overflow-x-auto">
              <Link href="/transfers" className={`kaf-cut-sm border px-4 py-2 text-xs font-black uppercase tracking-wider ${!region ? 'border-brand-gold/40 bg-brand-gold/15 text-brand-gold' : 'border-white/[0.08] text-slate-400'}`}>
                All
              </Link>
              {regions.slice(0, 5).map(r => (
                <Link key={r} href={`/transfers?${new URLSearchParams({ ...(q ? { q } : {}), region: r }).toString()}`} className={`kaf-cut-sm border px-4 py-2 text-xs font-black uppercase tracking-wider ${region === r ? 'border-brand-gold/40 bg-brand-gold/15 text-brand-gold' : 'border-white/[0.08] text-slate-400'}`}>
                  {r}
                </Link>
              ))}
            </div>
          </div>

          {agents.length === 0 ? (
            <div className="kaf-frame kaf-cut p-10 text-center">
              <UserPlus size={42} className="mx-auto mb-3 text-slate-700" />
              <h2 className="text-xl font-black text-white">No free agents match this search</h2>
              <p className="mt-2 text-sm text-slate-500">Try a different region or search term.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {agents.map((player: any) => {
                const rep = Array.isArray(player.player_reputation) ? player.player_reputation[0] : player.player_reputation
                return (
                  <div key={player.id} className="kaf-frame kaf-cut depth-hover p-5 group">
                    <Link href={`/profile/${player.profiles?.username || player.gamertag}`} className="block">
                    <div className="flex items-start gap-4">
                      <div
                        className="h-14 w-14 shrink-0 border border-white/10 bg-slate-800 bg-cover bg-center kaf-cut-sm"
                        style={{ backgroundImage: `url('${player.avatar_url || player.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.gamertag}`}')` }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-lg font-black text-white group-hover:text-brand-gold">{player.gamertag}</div>
                        <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                          {player.region && <span>{player.region}</span>}
                          {player.role && <span>{player.role}</span>}
                          <span>{player.ranking_points || 1000} rating</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 line-clamp-2 min-h-[40px] text-sm text-slate-400">{player.bio || 'Available for clan recruitment and tryouts.'}</p>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        ['Reliability', rep?.reliability_score ?? 70],
                        ['Activity', rep?.activity_score ?? 70],
                        ['Sports', rep?.sportsmanship_score ?? 70],
                      ].map(([label, value]) => (
                        <div key={label} className="border border-white/[0.06] bg-black/20 p-2">
                          <div className="text-lg font-black text-brand-gold">{value}</div>
                          <div className="text-[9px] font-black uppercase tracking-wider text-slate-500">{label}</div>
                        </div>
                      ))}
                    </div>
                    </Link>
                    <TransferOfferButton playerId={player.id} playerName={player.gamertag} />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="kaf-frame kaf-cut-sm p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">
              <WalletCards size={16} className="text-brand-gold" /> Contract Watch
            </h2>
            {(contracts || []).length === 0 ? (
              <p className="text-sm text-slate-500">No expiring or transfer-listed contracts.</p>
            ) : (
              <div className="space-y-3">
                {(contracts || []).map((contract: any) => (
                  <div key={contract.id} className="border border-white/[0.06] bg-black/20 p-3">
                    <div className="font-bold text-white">{contract.players?.gamertag || 'Player'}</div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {contract.clans?.tag || contract.clans?.name || 'Clan'} {contract.ends_at ? `- ${new Date(contract.ends_at).toLocaleDateString()}` : ''}
                    </div>
                    <div className="mt-2"><StatusBadge status={contract.status} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="kaf-frame kaf-cut-sm p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">
              <Shield size={16} className="text-brand-lime" /> Negotiation Timeline
            </h2>
            {(negotiations || []).length === 0 ? (
              <p className="text-sm text-slate-500">No transfer negotiations have been opened yet.</p>
            ) : (
              <div className="space-y-3">
                {(negotiations || []).map((offer: any) => (
                  <div key={offer.id} className="border border-white/[0.06] bg-black/20 p-3">
                    <div className="font-bold text-white">{offer.players?.gamertag || 'Player'}</div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {offer.from_clan?.tag || 'FA'} to {offer.to_clan?.tag || offer.to_clan?.name || 'TBD'}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <StatusBadge status={offer.status} />
                      {offer.salary_amount && <span className="text-xs font-black text-brand-gold">{offer.salary_amount} {offer.salary_currency}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="kaf-frame kaf-cut-sm p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">
              <Star size={16} className="text-brand-gold" /> Scout Rules
            </h2>
            <div className="space-y-2 text-sm text-slate-400">
              <p>Use profile history, reputation scores, role fit, and activity before opening negotiations.</p>
              <p>Every offer should become a tracked transfer negotiation, never a private DM decision.</p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
