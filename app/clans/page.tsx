import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Shield, Search, Plus, Trophy, Users, Star, ArrowUpRight, CheckCircle, UserPlus } from 'lucide-react'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'

export default async function Clans() {
  const supabase = await createServerSupabaseClient()
  // Fetch clans and their members count if possible. We'll just fetch clans for now.
  const { data: clans } = await supabase.from('clans').select('*').limit(12)

  return (
    <div className="flex flex-col w-full pb-20">
      <PublicHeader />
      {/* Hero Section */}
      <section className="relative w-full h-[30vh] min-h-[250px] bg-kaf-panel overflow-hidden border-b border-kaf-border flex items-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-kaf-bg via-kaf-bg/90 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-kaf-bg via-transparent to-transparent"></div>
        
        <div className="relative z-10 px-6 md:px-12 w-full max-w-5xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Shield size={14} className="text-purple-400" /> Clan HQ
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-white mb-2 leading-tight">
              FORGE YOUR <span className="text-brand-cyan drop-shadow-[0_0_15px_rgba(25,133,59,0.35)]">LEGACY</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-md">
              Join elite organizations, recruit top talent, and dominate the global leaderboards together.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="rounded-xl bg-kaf-card border border-kaf-border p-4 text-white hover:bg-white/5 transition-colors flex items-center gap-2">
              <Search size={20} className="text-slate-400" />
            </button>
            <Link href="/clans/create" className="rounded-xl bg-brand-cyan px-6 py-4 font-bold text-white transition-all hover:bg-brand-lime hover:scale-105 shadow-glow-green flex items-center gap-2">
              <Plus size={20} /> Create Clan
            </Link>
          </div>
        </div>
      </section>

      {/* Roster & Leaderboards */}
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-display font-black uppercase tracking-wider flex items-center gap-2 text-white">
            <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
            Top Organizations
          </h2>
        </div>

        {clans && clans.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clans.map((clan: any, i: number) => (
              <Link href={`/clans/${clan.id}`} key={clan.id} className="kaf-card p-5 rounded-2xl border border-kaf-border group hover:border-purple-500/50 transition-all cursor-pointer relative overflow-hidden block">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-kaf-panel border border-kaf-border flex items-center justify-center text-2xl font-black text-slate-600 bg-cover bg-center" style={{ backgroundImage: clan.logo_url ? `url(${clan.logo_url})` : `url('https://api.dicebear.com/7.x/initials/svg?seed=${clan.name}')`}}>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors flex items-center gap-2">
                        {clan.name}
                        {clan.is_verified && <CheckCircle className="text-brand-gold fill-brand-gold/20" size={16} />}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">#{clan.slug || `RANK-${i+1}`}</p>
                        {clan.is_recruiting && (
                          <span className="text-[9px] bg-brand-gold/10 text-brand-gold border border-brand-gold/30 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">Recruiting</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors">
                    <ArrowUpRight size={16} />
                  </div>
                </div>

                <p className="text-sm text-slate-300 mb-6 line-clamp-2 min-h-[40px]">
                  {clan.bio || 'An upcoming esports organization ready to dominate the competitive scene.'}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-kaf-bg rounded-lg p-3 border border-kaf-border flex items-center gap-3">
                    <Trophy size={16} className="text-brand-gold" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Trophies</span>
                      <span className="text-sm font-bold text-white">{clan.trophies || 0}</span>
                    </div>
                  </div>
                  <div className="bg-kaf-bg rounded-lg p-3 border border-kaf-border flex items-center gap-3">
                    <Users size={16} className="text-brand-cyan" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Members</span>
                      <span className="text-sm font-bold text-white">{clan.member_count || 1}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="w-full py-20 flex flex-col items-center justify-center bg-kaf-card rounded-2xl border border-dashed border-kaf-border">
            <Shield size={48} className="text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Clans Found</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-md text-center">There are currently no esports organizations registered. Be the first to forge a legacy.</p>
            <Link href="/clans/create" className="rounded-xl bg-brand-cyan px-6 py-3 font-bold text-white hover:bg-brand-lime hover:scale-105 transition-all">
              Create the First Clan
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
