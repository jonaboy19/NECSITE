import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Award, Crown, Shield, Star, Trophy } from 'lucide-react'

export const metadata = {
  title: 'Awards | KAFConnect',
  description: 'Trophies, player awards, clan honours, and seasonal recognition.',
}

export default async function AwardsPage() {
  const supabase = await createServerSupabaseClient()
  const [{ data: clans }, { data: players }, { data: tournaments }, { data: titles }] = await Promise.all([
    supabase.from('clans').select('id,name,tag,logo_url,trophies,is_verified').order('trophies', { ascending: false }).limit(12),
    supabase.from('players').select('id,gamertag,ranking_points,role,avatar_url,profiles(username)').order('ranking_points', { ascending: false }).limit(12),
    supabase.from('tournaments').select('id,title,status,prize_pool,end_date').in('status', ['completed', 'finished']).order('end_date', { ascending: false, nullsFirst: false }).limit(8),
    supabase.from('player_titles').select('id,title_code,player_id,catalog:title_code(label,rarity),players:player_id(gamertag,profiles(username))').limit(20),
  ])

  return (
    <div className="kaf-app-page flex w-full flex-col pb-20">
      <section className="kaf-page-hero px-6 py-12 md:px-10">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="kaf-chip kaf-chip-yellow mb-5">
            <Award size={12} /> Hall Of Fame
          </div>
          <h1 className="kaf-display text-5xl text-white md:text-7xl">
            Awards & <span className="text-brand-gold">Trophies</span>
          </h1>
          <p className="mt-5 max-w-2xl text-slate-400">
            Recognition built from real rankings, clan trophies, title awards, and completed competitions.
          </p>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-7xl gap-6 p-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section>
            <h2 className="kaf-panel-title mb-4 flex items-center gap-2">
              <Crown size={15} /> Clan Trophy Cabinet
            </h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {(clans || []).map((clan: any, index: number) => (
                <Link key={clan.id} href={`/clans/${clan.id}`} className="kaf-frame kaf-cut depth-hover p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center border border-brand-gold/25 bg-brand-gold/10 text-xl font-black text-brand-gold">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-lg font-black text-white">{clan.name}</div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">[{clan.tag || 'KAF'}]</div>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <div className="border border-white/[0.06] bg-black/20 p-3">
                      <div className="text-2xl font-black text-brand-gold">{clan.trophies ?? 0}</div>
                      <div className="text-[9px] font-black uppercase tracking-wider text-slate-500">Trophies</div>
                    </div>
                    <div className="border border-white/[0.06] bg-black/20 p-3">
                      <div className="text-2xl font-black text-brand-lime">{clan.is_verified ? 'Yes' : 'No'}</div>
                      <div className="text-[9px] font-black uppercase tracking-wider text-slate-500">Verified</div>
                    </div>
                  </div>
                </Link>
              ))}
              {(!clans || clans.length === 0) && <EmptyAwardState label="No clan trophy records yet." />}
            </div>
          </section>

          <section>
            <h2 className="kaf-panel-title mb-4 flex items-center gap-2">
              <Star size={15} /> Player Of The Month Pool
            </h2>
            <div className="kaf-frame kaf-cut overflow-hidden">
              {(players || []).length === 0 ? (
                <div className="p-8 text-sm text-slate-500">No ranked players available.</div>
              ) : (
                <div className="divide-y divide-white/[0.06]">
                  {(players || []).map((player: any, index: number) => (
                    <Link key={player.id} href={`/profile/${player.profiles?.username || player.gamertag}`} className="grid grid-cols-[40px_1fr_auto] items-center gap-3 p-4 transition-colors hover:bg-brand-cyan/5">
                      <div className="font-mono text-sm font-black text-slate-500">#{index + 1}</div>
                      <div>
                        <div className="font-black text-white">{player.gamertag}</div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">{player.role || 'Player'}</div>
                      </div>
                      <div className="text-lg font-black text-brand-lime">{player.ranking_points || 0}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="kaf-frame kaf-cut-sm p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">
              <Trophy size={16} className="text-brand-gold" /> Recent Champions
            </h2>
            {(tournaments || []).length === 0 ? (
              <p className="text-sm text-slate-500">Completed tournaments will appear here.</p>
            ) : (
              <div className="space-y-3">
                {(tournaments || []).map((tournament: any) => (
                  <Link key={tournament.id} href={`/tournaments/${tournament.id}`} className="block border border-white/[0.06] bg-black/20 p-3 transition-colors hover:border-brand-gold/30">
                    <div className="font-bold text-white">{tournament.title}</div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-500">{tournament.end_date ? new Date(tournament.end_date).toLocaleDateString() : 'Completed'}</div>
                    {tournament.prize_pool && <div className="mt-2 text-xs font-black text-brand-gold">{tournament.prize_pool}</div>}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="kaf-frame kaf-cut-sm p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">
              <Shield size={16} className="text-brand-lime" /> Player Titles
            </h2>
            {(titles || []).length === 0 ? (
              <p className="text-sm text-slate-500">No player titles awarded yet.</p>
            ) : (
              <div className="space-y-3">
                {(titles || []).map((title: any) => (
                  <Link key={title.id} href={`/profile/${title.players?.profiles?.username || title.players?.gamertag || ''}`} className="block border border-white/[0.06] bg-black/20 p-3 transition-colors hover:border-brand-cyan/30">
                    <div className="font-bold text-white">{title.catalog?.label || title.title_code}</div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-500">{title.players?.gamertag || 'Player'} {title.catalog?.rarity ? `- ${title.catalog.rarity}` : ''}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  )
}

function EmptyAwardState({ label }: { label: string }) {
  return (
    <div className="kaf-frame kaf-cut p-8 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
      {label}
    </div>
  )
}
