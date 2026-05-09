'use client'

import { useState } from 'react'
import { Search, Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Link from 'next/link'

type RankingItem = {
  id: string
  profile_id: string
  rating: number
  rank?: number
  profiles?: { username: string; avatar_url?: string; region?: string }
  clans?: { name: string }
}

const getTier = (rating: number) => {
  if (rating >= 1200) return { name: 'Champion', color: 'text-brand-cyan', bg: 'bg-brand-cyan/20 border-brand-cyan' }
  if (rating >= 1000) return { name: 'Diamond', color: 'text-brand-gold', bg: 'bg-brand-gold/20 border-brand-gold' }
  if (rating >= 800) return { name: 'Platinum', color: 'text-slate-300', bg: 'bg-slate-300/20 border-slate-300' }
  return { name: 'Gold', color: 'text-amber-600', bg: 'bg-amber-600/20 border-amber-600' }
}

const getMockTrend = (index: number) => {
  if (index % 3 === 0) return { type: 'up', val: Math.floor(index * 1.7 % 5) + 1 }
  if (index % 5 === 0) return { type: 'down', val: Math.floor(index * 0.8 % 3) + 1 }
  return { type: 'same', val: 0 }
}

const TABS = ['Global', 'Region', 'Clans'] as const
type Tab = typeof TABS[number]

export default function RankingsClient({ rankingsData }: { rankingsData: RankingItem[] }) {
  const [activeTab, setActiveTab] = useState<Tab>('Global')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'rating' | 'name'>('rating')

  const displayData = rankingsData
    .filter(item => {
      const q = query.trim().toLowerCase()
      const name = item.profiles?.username?.toLowerCase() || ''
      const clan = item.clans?.name?.toLowerCase() || ''
      const matchesQuery = !q || name.includes(q) || clan.includes(q)
      const matchesTab = activeTab === 'Clans' ? !!item.clans?.name : true
      return matchesQuery && matchesTab
    })
    .sort((a, b) => {
      if (sort === 'name') return (a.profiles?.username || '').localeCompare(b.profiles?.username || '')
      return (b.rating || 0) - (a.rating || 0)
    })

  return (
    <>
      {/* Tab Switcher */}
      <div className="flex max-w-full gap-2 overflow-x-auto rounded-lg border border-kaf-border bg-kaf-panel p-1">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded font-bold text-sm transition-all ${
              activeTab === tab
                ? 'bg-brand-cyan text-kaf-bg shadow-[0_0_10px_rgba(0,255,102,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="relative block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search player or clan..."
            className="w-full rounded-xl border border-kaf-border bg-kaf-panel py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-brand-cyan"
          />
        </label>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as 'rating' | 'name')}
          className="rounded-xl border border-kaf-border bg-kaf-panel px-4 py-3 text-sm font-bold text-white outline-none transition-colors focus:border-brand-cyan"
        >
          <option value="rating">Sort by rating</option>
          <option value="name">Sort by name</option>
        </select>
      </div>

      {activeTab === 'Region' && (
        <div className="rounded-xl border border-brand-cyan/20 bg-brand-cyan/5 px-4 py-3 text-xs font-bold uppercase tracking-widest text-brand-cyan">
          Regional data uses the same live ranking pool until player regions are populated.
        </div>
      )}

      {activeTab === 'Clans' && (
        <div className="rounded-xl border border-purple-400/20 bg-purple-400/5 px-4 py-3 text-xs font-bold uppercase tracking-widest text-purple-300">
          Showing ranked players currently attached to a clan.
        </div>
      )}

      {/* Podium for Top 3 */}
      {displayData.length >= 3 && (
        <div className="flex justify-center items-end h-[300px] gap-2 md:gap-6 mb-12 mt-8">
          {/* 2nd Place */}
          <div className="flex flex-col items-center group w-1/3 max-w-[180px]">
            <div className="w-20 h-20 rounded-full bg-slate-800 bg-cover border-4 border-slate-300 shadow-[0_0_20px_rgba(203,213,225,0.3)] mb-4 group-hover:scale-110 transition-transform" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${displayData[1].profiles?.username}')` }}></div>
            <div className="text-white font-black truncate w-full text-center">{displayData[1].profiles?.username}</div>
            <div className="text-brand-cyan font-bold mb-4">{displayData[1].rating}</div>
            <div className="w-full h-32 bg-gradient-to-t from-slate-300/20 to-slate-300/10 border-t border-l border-r border-slate-300/30 rounded-t-lg flex justify-center pt-4 text-3xl font-black text-slate-300">2</div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center group w-1/3 max-w-[200px]">
            <Trophy size={32} className="text-brand-gold mb-2" />
            <div className="w-24 h-24 rounded-full bg-slate-800 bg-cover border-4 border-brand-gold shadow-[0_0_30px_rgba(251,191,36,0.4)] mb-4 group-hover:scale-110 transition-transform" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${displayData[0].profiles?.username}')` }}></div>
            <div className="text-white font-black text-lg truncate w-full text-center">{displayData[0].profiles?.username}</div>
            <div className="text-brand-cyan font-bold mb-4">{displayData[0].rating}</div>
            <div className="w-full h-40 bg-gradient-to-t from-brand-gold/20 to-brand-gold/10 border-t border-l border-r border-brand-gold/30 rounded-t-lg flex justify-center pt-4 text-4xl font-black text-brand-gold">1</div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center group w-1/3 max-w-[180px]">
            <div className="w-20 h-20 rounded-full bg-slate-800 bg-cover border-4 border-amber-600 shadow-[0_0_20px_rgba(217,119,6,0.3)] mb-4 group-hover:scale-110 transition-transform" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${displayData[2].profiles?.username}')` }}></div>
            <div className="text-white font-black truncate w-full text-center">{displayData[2].profiles?.username}</div>
            <div className="text-brand-cyan font-bold mb-4">{displayData[2].rating}</div>
            <div className="w-full h-24 bg-gradient-to-t from-amber-600/20 to-amber-600/10 border-t border-l border-r border-amber-600/30 rounded-t-lg flex justify-center pt-4 text-3xl font-black text-amber-600">3</div>
          </div>
        </div>
      )}

      {/* Rankings Table */}
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
          {displayData.length === 0 ? (
            <div className="py-16 text-center">
              <Trophy size={40} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">No rankings data yet.</p>
            </div>
          ) : displayData.map((r, index) => {
            const tier = getTier(r.rating || 0)
            const trend = getMockTrend(index)

            return (
              <Link
                href={`/profile/${r.profiles?.username}`}
                key={r.id}
                className="grid grid-cols-12 items-center p-4 transition-all hover:bg-slate-800/50 group cursor-pointer"
              >
                {/* Rank & Trend */}
                <div className="col-span-1 flex flex-col items-center justify-center gap-1">
                  <span className={`text-lg font-black ${index < 3 ? 'text-brand-gold' : 'text-slate-400'}`}>{index + 1}</span>
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
    </>
  )
}
