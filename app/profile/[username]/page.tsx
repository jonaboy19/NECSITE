import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { StatusBadge } from '@/components/StatusBadge'
import { UserBadges } from '@/components/UserBadges'
import { TrustBadge } from '@/components/TrustBadge'
import { PlayerTitles } from '@/components/PlayerTitles'
import Link from 'next/link'
import { ArrowLeft, Globe, Calendar, Shield, Trophy, MapPin, Swords, Star } from 'lucide-react'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  return { title: `${username} | KAFConnect Player`, description: `View ${username}'s KAFConnect profile` }
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwn = user?.id === profile.id

  // Clan membership
  const { data: membership } = await supabase
    .from('clan_members')
    .select('role,clans:clan_id(id,name,tag,logo_url)')
    .eq('profile_id', profile.id)
    .maybeSingle()

  const clan = membership?.clans as any

  // Recent matches
  const { data: recentMatches } = await supabase
    .from('matches')
    .select('id,status,score_a,score_b,clan_a_id,clan_b_id,winner_clan_id,created_at')
    .or(`clan_a_id.eq.${clan?.id ?? 'none'},clan_b_id.eq.${clan?.id ?? 'none'}`)
    .order('created_at', { ascending: false })
    .limit(5)

  const initials = (profile.display_name || profile.username || '?')[0].toUpperCase()


  return (
    <div className="flex flex-col w-full pb-24">
      {/* Hero */}
      <div className="border-b border-kaf-border bg-kaf-panel px-4 sm:px-8 py-8">
        <Link href="/players" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-cyan mb-4 font-mono uppercase tracking-widest transition-colors">
          <ArrowLeft size={12} /> Players
        </Link>
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={profile.username} className="w-24 h-24 rounded-2xl object-cover border-2 border-brand-cyan/30 shadow-lg shadow-brand-cyan/20" />
              : <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-cyan/30 to-slate-900 border-2 border-brand-cyan/30 flex items-center justify-center text-4xl font-black text-brand-cyan">
                  {initials}
                </div>
            }
            {profile.verified && (
              <span className="absolute -bottom-2 -right-2 w-7 h-7 bg-brand-cyan rounded-full flex items-center justify-center">
                <Star size={12} className="text-slate-900 fill-slate-900" />
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-display font-black text-white">{profile.display_name || profile.username}</h1>
              <TrustBadge userId={profile.id} compact />
            </div>
            <div className="text-slate-400 text-sm">@{profile.username}</div>

            {/* Titles */}
            <PlayerTitles profileId={profile.id} canEdit={isOwn} />

            {/* Badges */}
            <UserBadges userId={profile.id} size="md" />

            {/* Meta tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              {clan && (
                <Link href={`/clans/${clan.id}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-black">
                  <Shield size={11} /> [{clan.tag}] {clan.name}
                </Link>
              )}
              {profile.region && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-kaf-border text-slate-300 text-xs font-bold">
                  <Globe size={11} /> {profile.region}
                </span>
              )}
              {profile.country && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-kaf-border text-slate-300 text-xs font-bold">
                  <MapPin size={11} /> {profile.country}
                </span>
              )}
              {!clan && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-black">
                  Free Agent
                </span>
              )}
            </div>
          </div>

          {isOwn && (
            <Link href="/settings" className="shrink-0 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-kaf-border text-white rounded-xl text-sm font-bold transition-colors">
              Edit Profile
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Bio */}
          {profile.bio && (
            <div className="kaf-card rounded-2xl border border-kaf-border p-5">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">About</h2>
              <p className="text-slate-300 text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Recent matches */}
          {recentMatches && recentMatches.length > 0 && (
            <div className="kaf-card rounded-2xl border border-kaf-border p-5">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Swords size={12} className="text-brand-cyan" /> Recent Matches
              </h2>
              <div className="space-y-2">
                {recentMatches.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-3 py-2 border-b border-kaf-border last:border-0">
                    <StatusBadge status={m.status} />
                    {(m.score_a != null || m.score_b != null) && (
                      <span className="font-mono font-black text-white">{m.score_a} : {m.score_b}</span>
                    )}
                    <span className="text-xs text-slate-500 ml-auto">{new Date(m.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar stats */}
        <div className="space-y-4">
          <div className="kaf-card rounded-2xl border border-kaf-border p-5 space-y-3">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Stats</h2>
            {[
              { label: 'Wins', value: profile.wins ?? 0, color: 'text-green-400' },
              { label: 'Losses', value: profile.losses ?? 0, color: 'text-red-400' },
              { label: 'Draws', value: profile.draws ?? 0, color: 'text-slate-400' },
              { label: 'Goals Scored', value: profile.goals_scored ?? 0, color: 'text-brand-gold' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{s.label}</span>
                <span className={`font-black ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>

          {clan && (
            <Link href={`/clans/${clan.id}`} className="block kaf-card rounded-2xl border border-kaf-border p-4 hover:border-brand-cyan/30 transition-all">
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Current Clan</div>
              <div className="flex items-center gap-3">
                {clan.logo_url
                  ? <img src={clan.logo_url} alt={clan.name} className="w-10 h-10 rounded-xl object-cover" />
                  : <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center font-black text-brand-cyan text-sm">{clan.name[0]}</div>
                }
                <div>
                  <div className="font-black text-white text-sm">{clan.name}</div>
                  <div className="text-xs text-slate-500">[{clan.tag}] · {membership?.role}</div>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
