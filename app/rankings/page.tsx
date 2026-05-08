import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Trophy, Medal, Star, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'

export default async function Rankings() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('rankings').select('*, profiles(username, avatar_url), clans(name)').order('rating', { ascending: false }).limit(50)
  
  const rankingsData = data && data.length > 0 ? data : [];

  const getTier = (rating: number) => {
    if (rating >= 1200) return { name: 'Champion', color: 'text-brand-cyan', bg: 'bg-brand-cyan/20 border-brand-cyan' };
    if (rating >= 1000) return { name: 'Diamond', color: 'text-brand-gold', bg: 'bg-brand-gold/20 border-brand-gold' };
    if (rating >= 800) return { name: 'Platinum', color: 'text-slate-300', bg: 'bg-slate-300/20 border-slate-300' };
    return { name: 'Gold', color: 'text-amber-600', bg: 'bg-amber-600/20 border-amber-600' };
  }

  const getMockTrend = (index: number) => {
    if (index % 3 === 0) return { type: 'up', val: Math.floor(Math.random() * 5) + 1 };
    if (index % 5 === 0) return { type: 'down', val: Math.floor(Math.random() * 3) + 1 };
    return { type: 'same', val: 0 };
  }

  return (
    <div className="flex flex-col w-full">
      <PublicHeader />
      <div className="p-4 md:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-kaf-border pb-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-display font-black text-white flex items-center gap-3 uppercase tracking-wide">
            <Trophy className="text-brand-gold" size={40} /> Global Leaderboard
          </h1>
          <p className="text-slate-400 mt-2 font-medium">The official KAFConnect Top 50 Rankings based on Elo MMR.</p>
        </div>
        <div className="flex gap-2 bg-kaf-panel p-1 rounded-lg border border-kaf-border">
          <button className="px-4 py-2 bg-brand-cyan text-kaf-bg rounded font-bold text-sm">Global</button>
          <button className="px-4 py-2 text-slate-400 hover:text-white rounded font-bold text-sm transition-colors">Region</button>
          <button className="px-4 py-2 text-slate-400 hover:text-white rounded font-bold text-sm transition-colors">Clans</button>
        </div>
      </div>

      {/* Podium for Top 3 */}
      {rankingsData.length >= 3 && (
        <div className="flex justify-center items-end h-[300px] gap-2 md:gap-6 mb-12 mt-8">
          {/* 2nd Place */}
          <div className="flex flex-col items-center group w-1/3 max-w-[180px]">
            <div className="w-20 h-20 rounded-full bg-slate-800 bg-cover border-4 border-slate-300 shadow-[0_0_20px_rgba(203,213,225,0.3)] mb-4 group-hover:scale-110 transition-transform" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${rankingsData[1].profiles?.username}')` }}></div>
            <div className="text-white font-black truncate w-full text-center">{rankingsData[1].profiles?.username}</div>
            <div className="text-brand-cyan font-bold mb-4">{rankingsData[1].rating}</div>
            <div className="w-full h-32 bg-gradient-to-t from-slate-300/20 to-slate-300/10 border-t border-l border-r border-slate-300/30 rounded-t-lg flex justify-center pt-4 text-3xl font-black text-slate-300">2</div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center group w-1/3 max-w-[200px]">
            <Trophy size={32} className="text-brand-gold mb-2" />
            <div className="w-24 h-24 rounded-full bg-slate-800 bg-cover border-4 border-brand-gold shadow-[0_0_30px_rgba(251,191,36,0.4)] mb-4 group-hover:scale-110 transition-transform" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${rankingsData[0].profiles?.username}')` }}></div>
            <div className="text-white font-black text-lg truncate w-full text-center">{rankingsData[0].profiles?.username}</div>
            <div className="text-brand-cyan font-bold mb-4">{rankingsData[0].rating}</div>
            <div className="w-full h-40 bg-gradient-to-t from-brand-gold/20 to-brand-gold/10 border-t border-l border-r border-brand-gold/30 rounded-t-lg flex justify-center pt-4 text-4xl font-black text-brand-gold">1</div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center group w-1/3 max-w-[180px]">
            <div className="w-20 h-20 rounded-full bg-slate-800 bg-cover border-4 border-amber-600 shadow-[0_0_20px_rgba(217,119,6,0.3)] mb-4 group-hover:scale-110 transition-transform" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${rankingsData[2].profiles?.username}')` }}></div>
            <div className="text-white font-black truncate w-full text-center">{rankingsData[2].profiles?.username}</div>
            <div className="text-brand-cyan font-bold mb-4">{rankingsData[2].rating}</div>
            <div className="w-full h-24 bg-gradient-to-t from-amber-600/20 to-amber-600/10 border-t border-l border-r border-amber-600/30 rounded-t-lg flex justify-center pt-4 text-3xl font-black text-amber-600">3</div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="kaf-card rounded-3xl p-0 border border-kaf-border shadow-xl overflow-hidden">
        <div className="grid grid-cols-12 text-xs font-bold text-slate-500 uppercase tracking-widest p-4 border-b border-kaf-border bg-slate-900/50">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-5 md:col-span-4">Player</div>
          <div className="col-span-3 hidden md:block">Clan</div>
          <div className="col-span-2 hidden md:block text-center">Tier</div>
          <div className="col-span-2 text-center">Form</div>
          <div className="col-span-4 md:col-span-2 text-right pr-4">Rating</div>
        </div>

        <div className="divide-y divide-kaf-border/50">
          {rankingsData?.map((r: any, index: number) => {
            const tier = getTier(r.rating || 0);
            const trend = getMockTrend(index);

            return (
              <Link 
                href={`/profile/${r.profiles?.username}`}
                key={r.id} 
                className="grid grid-cols-12 items-center p-4 transition-all hover:bg-slate-800/50 group cursor-pointer"
              >
                {/* Rank & Trend */}
                <div className="col-span-1 flex flex-col items-center justify-center gap-1">
                  <span className={`text-lg font-black ${index < 3 ? 'text-brand-gold' : 'text-slate-400'}`}>
                    {index + 1}
                  </span>
                  <div className="flex items-center text-[10px] font-bold">
                    {trend.type === 'up' && <><TrendingUp size={12} className="text-emerald-500" /> <span className="text-emerald-500">{trend.val}</span></>}
                    {trend.type === 'down' && <><TrendingDown size={12} className="text-red-500" /> <span className="text-red-500">{trend.val}</span></>}
                    {trend.type === 'same' && <Minus size={12} className="text-slate-500" />}
                  </div>
                </div>
                
                {/* Player */}
                <div className="col-span-5 md:col-span-4 flex items-center gap-3 md:gap-4 pl-2">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden bg-cover bg-center group-hover:border-brand-cyan transition-colors" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${r.profiles?.username || 'player'}')` }}></div>
                  <div className="font-bold text-white text-base truncate group-hover:text-brand-cyan transition-colors">
                    {r.profiles?.username || r.profile_id}
                  </div>
                </div>

                {/* Clan */}
                <div className="col-span-3 hidden md:flex items-center gap-2">
                  {r.clans?.name ? (
                    <span className="text-sm font-semibold text-slate-300 hover:text-white truncate">{r.clans.name}</span>
                  ) : (
                    <span className="text-xs text-slate-500 italic">Free Agent</span>
                  )}
                </div>

                {/* Tier */}
                <div className="col-span-2 hidden md:flex justify-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${tier.bg} ${tier.color}`}>
                    {tier.name}
                  </span>
                </div>

                {/* Form */}
                <div className="col-span-2 flex justify-center gap-1">
                  <div className="w-2 h-6 bg-emerald-500/20 rounded border border-emerald-500"></div>
                  <div className="w-2 h-6 bg-emerald-500/20 rounded border border-emerald-500"></div>
                  <div className="w-2 h-6 bg-status-live/20 rounded border border-status-live"></div>
                  <div className="w-2 h-6 bg-emerald-500/20 rounded border border-emerald-500 hidden md:block"></div>
                </div>
                
                {/* Rating */}
                <div className="col-span-4 md:col-span-2 text-right pr-4">
                  <span className="text-xl font-black text-brand-cyan">{r.rating || 1000}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
      </div>
    </div>
  )
}
