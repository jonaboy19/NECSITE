import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Shield, BarChart3, Calendar, MapPin, ExternalLink, ArrowLeft, Swords, Globe } from 'lucide-react'

export default async function PlayerProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) {
    notFound()
  }

  const { data: rankingData } = await supabase
    .from('rankings')
    .select('*')
    .eq('profile_id', profile.id)
    .single()

  const { data: matchHistory } = await supabase
    .from('matches')
    .select('*, tournament:tournaments(title)')
    .or(`player_a_id.eq.${profile.id},player_b_id.eq.${profile.id}`)
    .order('created_at', { ascending: false })
    .limit(10)

  const wins = matchHistory?.filter((m: any) => m.winner_id === profile.id).length || 0
  const losses = (matchHistory?.length || 0) - wins

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Back Bar */}
      <div className="sticky top-0 z-30 bg-kaf-panel/95 backdrop-blur-xl border-b border-kaf-border px-4 py-3 flex items-center gap-3">
        <Link href="/rankings" className="p-2 -ml-1 rounded-full hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} className="text-white" />
        </Link>
        <span className="font-bold text-white text-sm">{profile.username}</span>
      </div>

      {/* Profile Hero */}
      <div className="relative bg-kaf-panel border-b border-kaf-border overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-stadium.jpg')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-kaf-panel"></div>
        <div className="relative z-10 p-6 md:p-10 flex flex-col sm:flex-row items-start sm:items-end gap-6">
          {/* Avatar */}
          <div
            className="w-28 h-28 rounded-2xl bg-slate-800 bg-cover bg-center border-4 border-brand-cyan shadow-[0_0_30px_rgba(0,255,102,0.3)] shrink-0"
            style={{ backgroundImage: `url('${profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}')` }}
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-black text-white">{profile.username}</h1>
              {profile.role === 'admin' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-brand-gold/20 text-brand-gold border border-brand-gold/30">Admin</span>
              )}
            </div>
            {profile.display_name && (
              <p className="text-slate-300 font-medium mb-1">{profile.display_name}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-bold uppercase tracking-widest">
              {profile.region && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {profile.region}
                </span>
              )}
              {profile.discord_id && (
                <span className="flex items-center gap-1 text-[#5865F2]">
                  Discord: {profile.discord_id}
                </span>
              )}
              {profile.twitch_username && (
                <span className="flex items-center gap-1 text-[#9146FF]">
                  <Globe size={12} /> {profile.twitch_username}
                </span>
              )}
            </div>
            {profile.bio && (
              <p className="text-slate-400 text-sm mt-3 max-w-lg leading-relaxed">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Rating', value: rankingData?.rating ?? '—', color: 'text-brand-cyan', icon: BarChart3 },
            { label: 'Wins', value: wins, color: 'text-emerald-400', icon: Trophy },
            { label: 'Losses', value: losses, color: 'text-red-400', icon: Swords },
            { label: 'Rank', value: rankingData ? `#${rankingData.rank ?? '—'}` : '—', color: 'text-brand-gold', icon: Trophy },
          ].map((stat) => (
            <div key={stat.label} className="kaf-card rounded-2xl border border-kaf-border p-4 flex flex-col items-center text-center">
              <stat.icon size={20} className={`${stat.color} mb-2`} />
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Match History */}
        <div className="kaf-card rounded-2xl border border-kaf-border overflow-hidden">
          <div className="p-5 border-b border-kaf-border flex items-center gap-2">
            <Swords size={18} className="text-brand-cyan" />
            <h2 className="font-black text-white">Recent Matches</h2>
          </div>
          {matchHistory && matchHistory.length > 0 ? (
            <div className="divide-y divide-kaf-border/50">
              {matchHistory.map((match: any) => {
                const isWin = match.winner_id === profile.id
                return (
                  <Link
                    key={match.id}
                    href={`/matches/${match.id}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border ${
                        isWin
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/15 text-red-400 border-red-500/30'
                      }`}>
                        {isWin ? 'W' : 'L'}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-brand-cyan transition-colors">
                          {match.tournament?.title || 'Friendly Match'}
                        </p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                          {new Date(match.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-white">
                        {match.score_a ?? '—'} – {match.score_b ?? '—'}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Swords size={32} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No matches played yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
