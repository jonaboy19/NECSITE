'use client'
import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, Users, Star, Settings, CheckCircle, UserPlus, GitMerge, RefreshCw, Trophy, ArrowLeft, Globe, Medal, Award } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/Toast'

export default function ClanDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const { success, error: toastError } = useToast()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [clan, setClan] = useState<any>(null)
  const [roster, setRoster] = useState<any[]>([])
  const [joinRequests, setJoinRequests] = useState<any[]>([])
  const [clanWars, setClanWars] = useState<any[]>([])
  const [applicationMessage, setApplicationMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Overview')
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({ motd: '', bio: '', logo_url: '', banner_url: '', coach_name: '', tag: '' })

  const tabs = ['Overview', 'Roster', 'Clan Wars', 'Matches', 'Trophies']

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)

    const { data: cData } = await supabase.from('clans').select('*').eq('id', id).single()
    setClan(cData)

    // clan_members now has both profile_id (our schema) and member_role/role columns
    const { data: rData } = await supabase
      .from('clan_members')
      .select('*, profiles(username, avatar_url, region)')
      .eq('clan_id', id)
    setRoster(rData || [])

    if (user) {
      const userMember = rData?.find((m: any) => m.profile_id === user.id)
      const managerRoles = ['owner', 'manager', 'captain']
      const userRole = userMember?.role || userMember?.member_role || ''
      if (userMember && managerRoles.includes(userRole)) {
        const { data: reqData } = await supabase
          .from('clan_applications')
          .select('*, profiles(username, avatar_url)')
          .eq('clan_id', id)
          .eq('status', 'pending')
        setJoinRequests(reqData || [])
      }
    }
    
    const { data: cwData } = await supabase
      .from('clan_wars')
      .select('*, challenger:challenger_clan_id(name, tag, logo_url), challenged:challenged_clan_id(name, tag, logo_url)')
      .or(`challenger_clan_id.eq.${id},challenged_clan_id.eq.${id}`)
    setClanWars(cwData || [])
    
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [id])
  
  useEffect(() => {
    if (clan) setEditForm({ motd: clan.motd || '', bio: clan.bio || '', logo_url: clan.logo_url || '', banner_url: clan.banner_url || '', coach_name: clan.coach_name || '', tag: clan.tag || '' })
  }, [clan])

  // Support both role column names
  const getMemberRole = (member: any) => member?.role || member?.member_role || 'player'
  const userMember = roster.find(m => m.profile_id === currentUser?.id)
  const userRole = getMemberRole(userMember)
  const canManageRoster = ['owner', 'manager', 'captain'].includes(userRole)
  const canEditClanDetails = ['owner', 'manager'].includes(userRole)
  const isMember = !!userMember

  const handleApply = async () => {
    if (!currentUser) return toastError('You must be logged in to apply.')
    const { error } = await supabase.from('clan_applications').insert({
      clan_id: id,
      profile_id: currentUser.id,
      status: 'pending',
      message: applicationMessage
    })
    if (error) toastError(error.message)
    else {
      success('Application submitted! The captain will review it.')
      setApplicationMessage('')
    }
  }

  const toggleRecruitment = async () => {
    const newStatus = !clan.is_recruiting
    const { error } = await supabase.from('clans').update({ is_recruiting: newStatus, recruitment_status: newStatus ? 'open' : 'closed' }).eq('id', id)
    if (error) toastError(error.message)
    else {
      success('Recruitment status updated')
      fetchData()
    }
  }

  const transferOwnership = async (newOwnerId: string) => {
    if (!confirm("Transfer ownership? You will become a captain and cannot undo this.")) return
    const { error } = await supabase.from('clans').update({ owner_id: newOwnerId }).eq('id', id)
    if (error) return toastError(error.message)
    
    const myMemberId = userMember?.id
    const newOwnerMember = roster.find(m => m.profile_id === newOwnerId)
    if (myMemberId) await supabase.from('clan_members').update({ role: 'captain' }).eq('id', myMemberId)
    if (newOwnerMember) await supabase.from('clan_members').update({ role: 'owner' }).eq('id', newOwnerMember.id)
    
    success('Ownership transferred successfully')
    fetchData()
  }

  const handleRequest = async (reqId: string, status: 'accepted' | 'rejected', profileId: string) => {
    await supabase.from('clan_applications').update({ status }).eq('id', reqId)
    if (status === 'accepted') {
      const { error } = await supabase.from('clan_members').insert({
        clan_id: id,
        profile_id: profileId,
        role: 'player'
      })
      if (error) toastError(error.message)
      else success('Player accepted into clan!')
    } else {
      success('Application rejected.')
    }
    fetchData()
  }

  const handleKick = async (memberId: string, memberProfileId: string) => {
    if (!confirm('Remove this player from the clan?')) return
    const { error } = await supabase.from('clan_members').delete().eq('id', memberId)
    if (error) toastError(error.message)
    else success('Player removed from roster.')
    fetchData()
  }

  const handleChangeRole = async (memberId: string, newRole: string) => {
    const { error } = await supabase.from('clan_members').update({ role: newRole, member_role: newRole }).eq('id', memberId)
    if (error) toastError(error.message)
    else success(`Role updated to ${newRole}`)
    fetchData()
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('clans').update(editForm).eq('id', id)
    if (error) toastError(error.message)
    else {
      success('Clan details updated!')
      setIsEditModalOpen(false)
      fetchData()
    }
  }

  const handleLeaveClan = async () => {
    if (userRole === 'owner') {
      return toastError('Owners must transfer ownership before leaving the clan.')
    }
    if (!confirm('Are you sure you want to leave this clan?')) return
    const { error } = await supabase.from('clan_members').delete().eq('id', userMember.id)
    if (error) toastError(error.message)
    else {
      success('You have left the clan.')
      fetchData()
    }
  }

  const roleColors: Record<string, string> = {
    owner: 'text-brand-gold border-brand-gold/30 bg-brand-gold/10',
    manager: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    captain: 'text-brand-cyan border-brand-cyan/30 bg-brand-cyan/10',
    co_captain: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    coach: 'text-green-400 border-green-400/30 bg-green-400/10',
    player: 'text-slate-300 border-slate-700 bg-slate-800',
    sub: 'text-slate-400 border-slate-700/60 bg-slate-800/60',
    analyst: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
  }

  if (loading) return (
    <div className="flex flex-col w-full min-h-screen pb-20">
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="animate-spin text-brand-cyan" size={32} />
      </div>
    </div>
  )

  if (!clan) return (
    <div className="flex flex-col w-full min-h-screen pb-20 items-center justify-center">
      <Shield size={64} className="text-slate-700 mb-4" />
      <h2 className="text-2xl font-black text-white">Clan Not Found</h2>
      <Link href="/clans" className="mt-4 text-brand-cyan hover:underline">Back to Clans</Link>
    </div>
  )

  const wins = clan.wins || 0
  const losses = clan.losses || 0
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0

  return (
    <div className="flex flex-col w-full min-h-screen pb-20">
      {/* Banner */}
      <div className="relative w-full h-72 md:h-96 bg-slate-900 border-b border-kaf-border overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50 transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: `url(${clan.banner_url || '/hero-stadium.jpg'})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-kaf-panel via-kaf-panel/70 to-transparent" />
        <div className="absolute inset-0 bg-line-grid opacity-35" />
        <Link href="/clans" className="absolute top-6 left-6 flex items-center gap-2 text-sm text-slate-300 hover:text-white font-bold bg-kaf-panel/60 backdrop-blur px-3 py-2 rounded-xl border border-kaf-border transition-colors">
          <ArrowLeft size={16} /> All Clans
        </Link>
        {canEditClanDetails && (
          <button onClick={() => setIsEditModalOpen(true)} className="absolute top-6 right-6 bg-kaf-panel/80 backdrop-blur border border-kaf-border text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-colors z-10">
            <Settings size={16} /> Edit Clan
          </button>
        )}
      </div>

      <div className="px-6 md:px-8 max-w-7xl mx-auto w-full relative -mt-32 space-y-6">
        {/* Hero section */}
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div
            className="w-32 h-32 md:w-48 md:h-48 rounded-3xl bg-kaf-panel border-4 border-kaf-bg shadow-[0_28px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/10 flex items-center justify-center overflow-hidden bg-cover shrink-0"
            style={{ backgroundImage: clan.logo_url ? `url(${clan.logo_url})` : undefined }}
          >
            {!clan.logo_url && <Shield size={80} className="text-brand-cyan opacity-80" />}
          </div>

          <div className="flex-1 pb-2 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {clan.is_verified && (
                <span className="px-3 py-1 rounded bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-[10px] font-black uppercase tracking-widest">
                  Verified Organization
                </span>
              )}
              {clan.region && (
                <span className="px-3 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  <Globe size={10} /> {clan.region}
                </span>
              )}
              {isMember && (
                <span className="px-3 py-1 rounded bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-[10px] font-black uppercase tracking-widest">
                  Member
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-white uppercase tracking-tight mb-1 flex items-center gap-3 drop-shadow-lg truncate">
              {clan.name}
              {clan.is_verified && <CheckCircle className="text-brand-gold fill-brand-gold/20 shrink-0" size={30} />}
            </h1>
            {clan.tag && <p className="text-slate-400 font-mono font-bold text-lg">[{clan.tag}]</p>}
            {clan.bio && <p className="text-slate-300 max-w-2xl mt-2 leading-relaxed">{clan.bio}</p>}
          </div>

          <div className="flex flex-wrap gap-3 pb-2 shrink-0">
            <div className="depth-stat rounded-xl px-5 py-3 text-white text-sm font-bold flex items-center gap-2">
              <Users size={18} className="text-brand-cyan" /> {roster.length} Members
            </div>
            <div className={`px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 uppercase tracking-widest ${
              clan.recruitment_status === 'open' || clan.is_recruiting
                ? 'bg-brand-gold/10 border border-brand-gold/30 text-brand-gold'
                : 'bg-slate-800 border border-slate-600 text-slate-400'
            }`}>
              <UserPlus size={18} />
              {clan.recruitment_status === 'open' || clan.is_recruiting ? 'Recruiting' : 'Closed'}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'ELO Rating', value: clan.elo || 1200, color: 'text-brand-gold' },
            { label: 'Wins', value: wins, color: 'text-green-400' },
            { label: 'Losses', value: losses, color: 'text-red-400' },
            { label: 'Win Rate', value: `${winRate}%`, color: 'text-brand-cyan' },
            { label: 'Members', value: roster.length, color: 'text-white' },
          ].map(stat => (
            <div key={stat.label} className="depth-panel depth-hover p-4 rounded-xl text-center">
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Pending applications alert for captains */}
        {canManageRoster && joinRequests.length > 0 && (
          <div className="depth-panel rounded-xl border-brand-cyan/30 bg-brand-cyan/5 p-4">
            <h3 className="font-black text-brand-cyan mb-3 flex items-center gap-2">
              <Award size={16} /> {joinRequests.length} Pending Application{joinRequests.length > 1 ? 's' : ''}
            </h3>
            <div className="space-y-2">
              {joinRequests.map(req => (
                <div key={req.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full bg-slate-800 bg-cover bg-center shrink-0"
                      style={{ backgroundImage: `url('${req.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.profiles?.username}`}')` }}
                    />
                    <div>
                      <div className="font-bold text-white text-sm">{req.profiles?.username}</div>
                      {req.message && <div className="text-xs text-slate-400 italic">"{req.message}"</div>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleRequest(req.id, 'accepted', req.profile_id)}
                      className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 font-bold text-xs hover:bg-green-500 hover:text-white transition-colors">
                      Accept
                    </button>
                    <button onClick={() => handleRequest(req.id, 'rejected', req.profile_id)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 font-bold text-xs hover:bg-red-500 hover:text-white transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-1 border-b border-kaf-border no-scrollbar">
          {[...tabs, ...(canManageRoster ? ['HQ'] : [])].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 font-bold text-sm tracking-wide whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab
                  ? 'border-brand-cyan text-brand-cyan'
                  : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          <div className="lg:col-span-2 space-y-6">

            {/* OVERVIEW TAB */}
            {activeTab === 'Overview' && (
              <div className="space-y-6">
                {(clan.motd || canEditClanDetails) && (
                  <div className="depth-panel p-6 rounded-2xl border-brand-cyan/30 mb-6 bg-brand-cyan/5">
                    <h3 className="font-black text-brand-cyan text-sm mb-2 uppercase tracking-widest">Message of the Day</h3>
                    <p className="text-white font-bold">{clan.motd || 'No message set.'}</p>
                  </div>
                )}
                <div className="depth-panel p-6 rounded-2xl">
                  <h3 className="font-black text-white text-lg mb-3">About</h3>
                  <p className="text-slate-400 leading-relaxed">{clan.description || clan.bio || 'No description provided yet.'}</p>
                  {clan.coach_name && (
                    <div className="mt-4 pt-4 border-t border-kaf-border">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Coach</span>
                      <p className="text-white font-bold mt-1">{clan.coach_name}</p>
                    </div>
                  )}
                </div>
                <div className="depth-panel depth-hover p-8 rounded-2xl relative overflow-hidden group">
                  <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <Trophy size={200} />
                  </div>
                  <h3 className="text-2xl font-display font-black text-white mb-2 relative z-10">Trophy Cabinet</h3>
                  {wins > 0 ? (
                    <p className="text-brand-gold font-bold relative z-10">🏆 {wins} competitive wins</p>
                  ) : (
                    <p className="text-slate-400 relative z-10">No trophies yet — the hunt begins here.</p>
                  )}
                </div>
              </div>
            )}

            {/* ROSTER TAB */}
            {activeTab === 'Roster' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-white flex items-center gap-2"><Users size={18} className="text-brand-cyan" /> Roster ({roster.length})</h3>
                </div>
                {roster.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">No members yet.</div>
                ) : roster.map((member) => {
                  const role = getMemberRole(member)
                  return (
                    <div key={member.id} className="depth-panel depth-hover p-4 rounded-xl flex items-center justify-between hover:border-brand-cyan/30 group">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-11 h-11 rounded-full bg-slate-800 bg-cover bg-center border-2 border-transparent group-hover:border-brand-cyan transition-colors"
                          style={{ backgroundImage: `url('${member.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.profiles?.username}`}')` }}
                        />
                        <div>
                          <div className="font-bold text-white group-hover:text-brand-cyan transition-colors">
                            <Link href={`/profile/${member.profiles?.username}`} className="hover:underline">
                              {member.profiles?.username || 'Unknown'}
                            </Link>
                          </div>
                          {member.profiles?.region && (
                            <div className="text-xs text-slate-500">{member.profiles.region}</div>
                          )}
                          {member.last_active && (
                            <div className="text-[10px] text-slate-600 mt-0.5">
                              Active: {new Date(member.last_active).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-widest border ${roleColors[role] || roleColors.player}`}>
                          {role.replace('_', ' ')}
                        </span>
                        {canManageRoster && role !== 'owner' && (
                          <div className="flex gap-1">
                            <select
                              value={role}
                              onChange={e => handleChangeRole(member.id, e.target.value)}
                              className="text-xs bg-slate-800 border border-slate-700 rounded px-1 py-1 text-white"
                            >
                              {['player', 'captain', 'co_captain', 'coach', 'manager', 'analyst', 'sub'].map(r => (
                                <option key={r} value={r}>{r.replace('_', ' ')}</option>
                              ))}
                            </select>
                            <button onClick={() => handleKick(member.id, member.profile_id)}
                              className="text-xs text-red-400 px-2 py-1 rounded bg-red-500/10 hover:bg-red-500 hover:text-white transition-colors font-bold">
                              Kick
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* CLAN WARS TAB */}
            {activeTab === 'Clan Wars' && (
              <div className="space-y-4">
                <h3 className="font-black text-white text-lg mb-2">Clan Wars</h3>
                {clanWars.length === 0 ? (
                  <div className="depth-panel p-6 rounded-2xl text-center py-8 text-slate-500">
                    <Shield size={40} className="mx-auto mb-3 opacity-30" />
                    No clan wars recorded yet.
                  </div>
                ) : clanWars.map(war => {
                  const isChallenger = war.challenger_clan_id === id
                  const opponent = isChallenger ? war.challenged : war.challenger
                  const win = (isChallenger && war.challenger_score > war.challenged_score) || (!isChallenger && war.challenged_score > war.challenger_score)
                  return (
                    <div key={war.id} className="depth-panel depth-hover p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-800 rounded-full border border-kaf-border overflow-hidden bg-cover bg-center" style={{ backgroundImage: opponent?.logo_url ? `url(${opponent.logo_url})` : undefined }} />
                        <div>
                          <div className="font-bold text-white text-sm">vs {opponent?.name || 'Unknown Clan'}</div>
                          <div className="text-xs text-slate-500">{new Date(war.scheduled_at || war.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-xl font-black font-mono tracking-widest text-white">
                          {isChallenger ? `${war.challenger_score} - ${war.challenged_score}` : `${war.challenged_score} - ${war.challenger_score}`}
                        </div>
                        <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                          win ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {win ? 'Victory' : 'Defeat'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* MATCHES TAB */}
            {activeTab === 'Matches' && (
              <div className="depth-panel p-6 rounded-2xl">
                <h3 className="font-black text-white text-lg mb-4">Match History</h3>
                <div className="text-center py-8 text-slate-500">
                  <Trophy size={40} className="mx-auto mb-3 opacity-30" />
                  No official matches recorded yet.
                </div>
              </div>
            )}

            {/* TROPHIES TAB */}
            {activeTab === 'Trophies' && (
              <div className="depth-panel p-8 rounded-2xl">
                <h3 className="font-black text-white text-xl mb-4 flex items-center gap-2">
                  <Trophy className="text-brand-gold" /> Achievements
                </h3>
                <div className="text-center py-8 text-slate-500">No trophies recorded. Win tournaments to earn them!</div>
              </div>
            )}

            {/* HQ / MANAGEMENT TAB */}
            {activeTab === 'HQ' && canManageRoster && (
              <div className="space-y-6">
                <div className="depth-panel p-6 rounded-2xl">
                  <h3 className="font-black text-white mb-4">Recruitment Settings</h3>
                  <div className="flex items-center justify-between p-4 depth-stat rounded-xl">
                    <div>
                      <div className="font-bold text-white text-sm">Recruitment Status</div>
                      <div className="text-xs text-slate-400">Allow players to apply to join the clan.</div>
                    </div>
                    <button onClick={toggleRecruitment} className={`px-4 py-2 rounded-lg font-bold text-xs ${clan.is_recruiting ? 'bg-brand-cyan text-kaf-bg hover:bg-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'} transition-colors`}>
                      {clan.is_recruiting ? 'Open' : 'Closed'}
                    </button>
                  </div>
                </div>

                {userRole === 'owner' && (
                  <div className="depth-panel p-6 rounded-2xl border-red-500/30 bg-red-500/5">
                    <h3 className="font-black text-red-400 mb-4">Danger Zone</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Transfer Ownership</label>
                        <select 
                          className="w-full bg-slate-900 border border-kaf-border rounded-lg px-3 py-2 text-white text-sm mb-2"
                          onChange={(e) => {
                            if (e.target.value) transferOwnership(e.target.value)
                          }}
                          value=""
                        >
                          <option value="" disabled>Select new owner...</option>
                          {roster.filter(m => m.profile_id !== currentUser?.id).map(m => (
                            <option key={m.id} value={m.profile_id}>{m.profiles?.username}</option>
                          ))}
                        </select>
                        <p className="text-xs text-slate-500">This action cannot be undone. You will be demoted to Captain.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            {/* Join CTA for non-members */}
            {!isMember && (
              <div className="depth-panel p-6 rounded-2xl border-brand-cyan/30 relative overflow-hidden">
                <div className="absolute -top-4 -right-4 opacity-10"><Shield size={100} /></div>
                <h2 className="text-xl font-display font-black text-white uppercase tracking-wider mb-2 relative z-10">Join Organization</h2>
                {clan.recruitment_status === 'open' || clan.is_recruiting ? (
                  <>
                    <p className="text-sm text-slate-300 leading-relaxed mb-4 relative z-10">
                      Submit your application to be reviewed by the clan captain.
                    </p>
                    <textarea 
                      placeholder="Why should we accept you?" 
                      className="w-full bg-slate-900 border border-kaf-border rounded-xl px-3 py-2 text-white text-sm mb-3 relative z-10 focus:border-brand-cyan/50 focus:outline-none h-20 resize-none"
                      value={applicationMessage}
                      onChange={e => setApplicationMessage(e.target.value)}
                    />
                    <button onClick={handleApply}
                      className="w-full bg-brand-cyan text-kaf-bg py-3 rounded-xl font-black hover:bg-white transition-all relative z-10">
                      Apply to Join
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-slate-500 font-bold text-center relative z-10">Recruitment is currently closed.</p>
                )}
              </div>
            )}

            {/* Quick Links */}
            <div className="depth-panel p-5 rounded-2xl space-y-3">
              <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest">Quick Links</h3>
              <Link href={`/tournaments?clan=${id}`} className="flex items-center gap-2 text-sm text-slate-300 hover:text-brand-cyan transition-colors font-bold py-1">
                <Trophy size={14} className="text-brand-gold" /> Tournament History
              </Link>
              <Link href="/scrims" className="flex items-center gap-2 text-sm text-slate-300 hover:text-brand-cyan transition-colors font-bold py-1">
                <Medal size={14} className="text-brand-cyan" /> Find Scrims
              </Link>
              <Link href="/free-agents" className="flex items-center gap-2 text-sm text-slate-300 hover:text-brand-cyan transition-colors font-bold py-1">
                <UserPlus size={14} className="text-brand-cyan" /> Browse Free Agents
              </Link>
              {isMember && (
                <button onClick={handleLeaveClan} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors font-bold py-1 w-full text-left">
                  <ArrowLeft size={14} className="text-red-400" /> Leave Clan
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="depth-panel p-6 rounded-2xl w-full max-w-lg relative">
            <h2 className="text-2xl font-black text-white mb-4">Edit Clan Details</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Tag (2-5 Chars)</label>
                  <input value={editForm.tag} onChange={e => setEditForm({...editForm, tag: e.target.value.toUpperCase()})} className="w-full bg-slate-900 border border-kaf-border rounded-lg px-3 py-2 text-white" maxLength={5} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Coach Name</label>
                  <input value={editForm.coach_name} onChange={e => setEditForm({...editForm, coach_name: e.target.value})} className="w-full bg-slate-900 border border-kaf-border rounded-lg px-3 py-2 text-white" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Message of the Day</label>
                <input value={editForm.motd} onChange={e => setEditForm({...editForm, motd: e.target.value})} className="w-full bg-slate-900 border border-kaf-border rounded-lg px-3 py-2 text-white" placeholder="Visible to visitors on your overview" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Bio</label>
                <textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full bg-slate-900 border border-kaf-border rounded-lg px-3 py-2 text-white h-20 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Logo URL</label>
                  <input value={editForm.logo_url} onChange={e => setEditForm({...editForm, logo_url: e.target.value})} className="w-full bg-slate-900 border border-kaf-border rounded-lg px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Banner URL</label>
                  <input value={editForm.banner_url} onChange={e => setEditForm({...editForm, banner_url: e.target.value})} className="w-full bg-slate-900 border border-kaf-border rounded-lg px-3 py-2 text-white" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white font-bold transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-brand-cyan text-kaf-bg rounded-xl font-bold hover:bg-white transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
