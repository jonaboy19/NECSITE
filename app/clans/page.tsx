import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Shield, Search, Trophy, Users, ArrowUpRight, CheckCircle, UserPlus } from 'lucide-react'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import { EmptyState } from '@/components/EmptyState'

export default async function Clans({ searchParams }: { searchParams: Promise<{ q?: string; recruiting?: string }> }) {
  const { q, recruiting } = await searchParams
  const supabase = await createServerSupabaseClient()
  // Fetch clans and their members count if possible. We'll just fetch clans for now.
  let query = supabase.from('clans').select('*').limit(24)
  if (q) query = query.ilike('name', `%${q}%`)
  if (recruiting === 'true') query = query.eq('is_recruiting', true)
  const { data: clans, error } = await query

  return (
    <div className="kaf-screen flex flex-col w-full pb-20">
      <PublicHeader />
      <section className="kaf-stadium-bg kaf-scanlines relative w-full min-h-[360px] overflow-hidden border-b border-white/[0.06] flex items-center">
        <div className="absolute inset-0 bg-dot-grid opacity-25"></div>
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-kaf-bg to-transparent"></div>
        
        <div className="relative z-10 px-6 md:px-12 w-full max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8 pt-20">
          <div>
            <div className="kaf-chip kaf-chip-green mb-5">
              <Shield size={12} /> Clan HQ
            </div>
            <h1 className="kaf-display text-5xl md:text-7xl text-white leading-[0.95]">
              Build your <span className="text-brand-lime">club identity</span>
            </h1>
            <p className="text-slate-400 mt-6 max-w-2xl text-lg leading-relaxed">
              Recruit players, inspect rosters, track trophies, and open a proper team home for every competitive eFootball organization.
            </p>
          </div>
          
          <div className="kaf-frame kaf-cut-sm w-full max-w-sm p-5">
            <div className="text-xs font-black uppercase tracking-[0.24em] text-brand-lime">Clan Control</div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="border border-white/[0.06] bg-white/[0.03] p-4">
                <div className="font-display text-3xl text-brand-lime">{clans?.length || 0}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Listed clans</div>
              </div>
              <div className="border border-white/[0.06] bg-white/[0.03] p-4">
                <div className="font-display text-3xl text-brand-lime">{clans?.filter((c: any) => c.is_recruiting).length || 0}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Recruiting</div>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <a href="#clan-search" className="kaf-cut-sm border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-sm font-black uppercase tracking-wider text-white transition-colors hover:border-brand-lime/50 hover:text-brand-lime">
                <Search size={16} className="inline mr-2" /> Search
              </a>
              <Link href="/clans/create" className="kaf-cut-sm bg-brand-cyan px-4 py-3 text-sm font-black uppercase tracking-wider text-black transition-all hover:bg-brand-lime">
                <UserPlus size={16} className="inline mr-2" /> Create
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Roster & Leaderboards */}
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        <div className="flex items-center justify-between mb-2">
          <h2 className="kaf-display text-3xl flex items-center gap-3 text-white">
            <span className="h-8 w-1 bg-brand-lime"></span>
            Top Organizations
          </h2>
        </div>

        <div id="clan-search" className="kaf-frame kaf-cut-sm flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
          <form className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search clans..."
              className="w-full border border-white/[0.08] bg-black/40 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-brand-lime"
            />
            {recruiting === 'true' && <input type="hidden" name="recruiting" value="true" />}
          </form>
          <div className="flex gap-2">
            <Link
              href={q ? `/clans?q=${encodeURIComponent(q)}` : '/clans'}
              className={`kaf-cut-sm border px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
                recruiting !== 'true' ? 'border-brand-lime/40 bg-brand-cyan/20 text-brand-lime' : 'border-white/[0.08] bg-black/30 text-slate-400 hover:text-white'
              }`}
            >
              All
            </Link>
            <Link
              href={`/clans?${new URLSearchParams({ ...(q ? { q } : {}), recruiting: 'true' }).toString()}`}
              className={`kaf-cut-sm border px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
                recruiting === 'true' ? 'border-brand-lime/40 bg-brand-cyan/20 text-brand-lime' : 'border-white/[0.08] bg-black/30 text-slate-400 hover:text-white'
              }`}
            >
              Recruiting
            </Link>
          </div>
        </div>

        {error ? (
          <EmptyState
            Icon={Shield}
            title="Clans could not load"
            description="The clan directory is temporarily unavailable. Try again soon or contact staff if the issue continues."
            action={{ href: '/contact', label: 'Contact staff' }}
          />
        ) : clans && clans.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clans.map((clan: any, i: number) => (
              <Link href={`/clans/${clan.id}`} key={clan.id} className="kaf-frame kaf-cut depth-hover p-5 group hover:border-brand-lime/40 cursor-pointer relative overflow-hidden block">
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand-cyan/[0.12] to-transparent opacity-80"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-lime/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 kaf-cut-sm bg-kaf-panel border border-white/10 flex items-center justify-center text-2xl font-black text-slate-600 bg-cover bg-center shadow-[0_14px_30px_rgba(0,0,0,0.35)] ring-1 ring-white/5" style={{ backgroundImage: clan.logo_url ? `url(${clan.logo_url})` : `url('https://api.dicebear.com/7.x/initials/svg?seed=${clan.name}')`}}>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white group-hover:text-brand-lime transition-colors flex items-center gap-2">
                        {clan.name}
                        {clan.is_verified && <CheckCircle className="text-brand-gold fill-brand-gold/20" size={16} />}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">#{clan.slug || `RANK-${i+1}`}</p>
                        {clan.is_recruiting && (
                          <span className="text-[9px] bg-brand-gold/10 text-brand-gold border border-brand-gold/30 px-1.5 py-0.5 font-black uppercase tracking-widest">Recruiting</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 border border-white/[0.08] bg-white/[0.04] flex items-center justify-center text-slate-400 group-hover:bg-brand-cyan/20 group-hover:text-brand-lime transition-colors">
                    <ArrowUpRight size={16} />
                  </div>
                </div>

                <p className="text-sm text-slate-300 mb-6 line-clamp-2 min-h-[40px]">
                  {clan.bio || 'An upcoming esports organization ready to dominate the competitive scene.'}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div className="depth-stat rounded-lg p-3 flex items-center gap-3">
                    <Trophy size={16} className="text-brand-gold" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Trophies</span>
                      <span className="text-sm font-bold text-white">{clan.trophies || 0}</span>
                    </div>
                  </div>
                  <div className="depth-stat rounded-lg p-3 flex items-center gap-3">
                    <Users size={16} className="text-brand-cyan" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Members</span>
                      <span className="text-sm font-bold text-white">{clan.member_count || 1}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Open HQ</span>
                  <span className="text-xs font-black text-brand-lime opacity-0 transition-opacity group-hover:opacity-100">View roster</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            Icon={Shield}
            title="No clans yet"
            description="There are no organizations listed yet. Start the first clan and invite your team."
            action={{ href: '/clans/create', label: 'Create the first clan' }}
          />
        )}
      </div>
    </div>
  )
}
