import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Globe, Search, UserPlus, Star } from 'lucide-react'

export const metadata = {
  title: 'Free Agents - KAFConnect',
  description: 'Browse players looking for a clan on KAFConnect.',
}

export default async function FreeAgents() {
  const supabase = await createServerSupabaseClient()

  // Players with no clan membership
  const { data: freeAgents } = await supabase
    .from('profiles')
    .select('*, rankings(rating)')
    .order('created_at', { ascending: false })
    .limit(40)

  // Filter: not in any clan (we check by NOT existing in clan_members)
  // For simplicity, we show all non-clan-members from the rankings perspective
  const { data: clanMembers } = await supabase
    .from('clan_members')
    .select('profile_id')

  const clanMemberIds = new Set(clanMembers?.map((m: any) => m.profile_id) || [])
  const agents = (freeAgents || []).filter((p: any) => !clanMemberIds.has(p.id))

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-kaf-panel/95 backdrop-blur-xl border-b border-kaf-border px-6 py-4">
        <h1 className="text-2xl font-display font-black text-white uppercase tracking-wide flex items-center gap-3">
          <UserPlus className="text-brand-gold" size={26} />
          Free Agents
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">Players not affiliated with any clan - available for recruitment</p>
      </div>

      <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <UserPlus size={48} className="text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-black text-white mb-2">No free agents found</h3>
              <p className="text-slate-400">All players are currently in clans.</p>
            </div>
          ) : agents.map((player: any) => (
            <Link
              key={player.id}
              href={`/profile/${player.username}`}
              className="kaf-card rounded-2xl border border-kaf-border p-5 flex items-center gap-4 group hover:border-brand-gold/30 transition-all"
            >
              <div
                className="w-14 h-14 rounded-full bg-slate-800 bg-cover bg-center border-2 border-kaf-border group-hover:border-brand-gold transition-all shrink-0"
                style={{ backgroundImage: `url('${player.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`}')` }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white group-hover:text-brand-gold transition-colors truncate">{player.username}</div>
                <div className="flex items-center gap-2 mt-1">
                  {player.region && (
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Globe size={9} /> {player.region}
                    </span>
                  )}
                  {player.rankings?.rating && (
                    <span className="text-[10px] text-brand-cyan font-black">{player.rankings.rating} MMR</span>
                  )}
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-[9px] font-black uppercase tracking-widest shrink-0">
                Free Agent
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
