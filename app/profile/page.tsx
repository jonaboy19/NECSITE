import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Trophy, Star, Target, Shield, Settings, Activity, MessageSquare, Video, Globe } from 'lucide-react'
import Link from 'next/link'

export default async function Profile() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div className="w-24 h-24 bg-brand-cyan/10 border-2 border-brand-cyan/50 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(25,133,59,0.24)]">
          <Shield size={40} className="text-brand-cyan" />
        </div>
        <h1 className="text-4xl font-display font-black text-white mb-4">ACCESS DENIED</h1>
        <p className="text-slate-400 max-w-md mb-8">You must be logged in to view your player profile and access the competitive ecosystem.</p>
        <Link href="/auth/login" className="rounded-xl bg-brand-cyan px-8 py-4 font-bold text-white hover:bg-brand-lime hover:scale-105 transition-all shadow-glow-green">
          Login / Register
        </Link>
      </div>
    )
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  
  // Fetch true rankings data
  const { data: rankingData } = await supabase.from('rankings').select('*').eq('profile_id', user.id).single()
  
  const stats = { 
    wins: rankingData?.wins || 0, 
    losses: rankingData?.losses || 0, 
    rating: rankingData?.rating || 0, 
    rank: rankingData ? 'TBD' : 'U/R' 
  }

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Cover Photo */}
      <div className="relative w-full h-48 md:h-64 bg-slate-900 border-b border-kaf-border overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518605368461-1e1e38ce7058?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-kaf-panel to-transparent"></div>
        <div className="absolute top-4 right-4">
          <button className="w-10 h-10 rounded-full bg-black/50 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="px-6 md:px-8 max-w-5xl mx-auto w-full relative -mt-20">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-8">
          {/* Avatar / Card Profile */}
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-kaf-panel border-4 border-kaf-bg shadow-2xl overflow-hidden relative z-10">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: profile?.avatar_url ? `url(${profile.avatar_url})` : `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || 'player'}')` }}></div>
            </div>
            {/* Rank Badge */}
            <div className="absolute -bottom-4 -right-4 w-12 h-12 rounded-full bg-brand-gold border-4 border-kaf-bg flex items-center justify-center font-black text-kaf-bg z-20 shadow-lg">
              #{stats.rank}
            </div>
          </div>

          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl md:text-4xl font-black text-white">{profile?.username || 'Unknown Player'}</h1>
              {profile?.role === 'admin' && <Star size={20} className="text-brand-gold fill-current" />}
            </div>
            <p className="text-slate-400 font-medium mb-4">{profile?.display_name || 'No display name set'}</p>
            
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Shield size={12} /> Free Agent
              </div>
              <div className="px-3 py-1 rounded-lg bg-status-live/10 border border-status-live/30 text-status-live text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Activity size={12} /> Online
              </div>
              {profile?.discord_id && (
                <div className="px-3 py-1 rounded-lg bg-[#5865F2]/10 border border-[#5865F2]/30 text-[#5865F2] text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <MessageSquare size={12} /> Discord
                </div>
              )}
              {profile?.twitch_username && (
                <div className="px-3 py-1 rounded-lg bg-[#9146FF]/10 border border-[#9146FF]/30 text-[#9146FF] text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Video size={12} /> Twitch
                </div>
              )}
              {profile?.region && (
                <div className="px-3 py-1 rounded-lg bg-slate-500/10 border border-slate-500/30 text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Globe size={12} /> {profile.region}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="kaf-card p-4 rounded-2xl border border-kaf-border flex flex-col items-center justify-center text-center group hover:border-brand-cyan/50 transition-colors">
            <Trophy size={24} className="text-brand-gold mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-3xl font-black text-white">{stats.wins}</p>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Wins</p>
          </div>
          <div className="kaf-card p-4 rounded-2xl border border-kaf-border flex flex-col items-center justify-center text-center group hover:border-status-draft/50 transition-colors">
            <Target size={24} className="text-status-draft mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-3xl font-black text-white">{stats.losses}</p>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Losses</p>
          </div>
          <div className="kaf-card p-4 rounded-2xl border border-kaf-border flex flex-col items-center justify-center text-center group hover:border-brand-cyan/50 transition-colors">
            <Star size={24} className="text-brand-cyan mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-3xl font-black text-white">{stats.wins + stats.losses > 0 ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100) : 0}%</p>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Win Rate</p>
          </div>
          <div className="kaf-card p-4 rounded-2xl border border-kaf-border flex flex-col items-center justify-center text-center group hover:border-brand-gold/50 transition-colors">
            <Activity size={24} className="text-brand-gold mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-3xl font-black text-white">{stats.rating}</p>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">MMR Rating</p>
          </div>
        </div>

        {/* Recent Matches */}
        <div>
          <h2 className="text-xl font-display font-black uppercase tracking-wider mb-4 flex items-center gap-2 text-white">
            <span className="w-2 h-6 bg-brand-cyan rounded-full"></span>
            Recent Matches
          </h2>
          <div className="kaf-card rounded-2xl border border-kaf-border overflow-hidden">
            <div className="p-8 text-center text-slate-400">
              No recent match data available. Join a tournament to get started.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
