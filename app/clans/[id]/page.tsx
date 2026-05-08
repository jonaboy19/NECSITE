'use client'
import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, Users, Medal, Star, Settings, CheckCircle, XCircle, UserPlus, GitMerge, RefreshCw, Trophy } from 'lucide-react'
import Link from 'next/link'

export default function ClanDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [clan, setClan] = useState<any>(null)
  const [roster, setRoster] = useState<any[]>([])
  const [joinRequests, setJoinRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState('Overview')
  const tabs = ['Overview', 'Roster', 'Lineups', 'Matches', 'Trophies']

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)

    // Fetch Clan
    const { data: cData } = await supabase.from('clans').select('*').eq('id', id).single()
    setClan(cData)

    // Fetch Roster with Profiles and Rankings
    const { data: rData } = await supabase.from('clan_members')
      .select('*, profiles(username, avatar_url, region), rankings(rating)')
      .eq('clan_id', id)
    setRoster(rData || [])

    // Fetch Join Requests if user is owner/coach/captain/manager
    if (user) {
      const userMember = rData?.find((m: any) => m.profile_id === user.id)
      if (userMember && ['owner', 'manager', 'captain'].includes(userMember.role)) {
        const { data: reqData } = await supabase.from('clan_applications')
          .select('*, profiles(username)')
          .eq('clan_id', id)
          .eq('status', 'pending')
        setJoinRequests(reqData || [])
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const userRole = roster.find(m => m.profile_id === currentUser?.id)?.role || 'guest'
  const canManageRoster = ['owner', 'manager', 'captain'].includes(userRole)
  const canEditClanDetails = ['owner', 'manager'].includes(userRole)
  const canRegisterTournaments = ['owner', 'manager', 'captain'].includes(userRole)

  const handleApply = async () => {
    if (!currentUser) return alert('You must be logged in to apply.')
    const { error } = await supabase.from('clan_applications').insert({
      clan_id: id,
      profile_id: currentUser.id,
      status: 'pending'
    })
    if (error) alert(error.message)
    else alert('Application submitted successfully!')
  }

  const handleRequest = async (reqId: string, status: 'accepted' | 'rejected', profileId: string) => {
    // Update request
    await supabase.from('clan_applications').update({ status }).eq('id', reqId)
    // If approved, insert into clan_members
    if (status === 'accepted') {
      await supabase.from('clan_members').insert({
        clan_id: id,
        profile_id: profileId,
        role: 'player'
      })
    }
    fetchData()
  }

  const handleKick = async (memberId: string) => {
    if(!confirm("Are you sure you want to kick this player?")) return;
    await supabase.from('clan_members').delete().eq('id', memberId)
    fetchData()
  }

  const handlePromote = async (memberId: string, newRole: string) => {
    await supabase.from('clan_members').update({ role: newRole }).eq('id', memberId)
    fetchData()
  }

  const roleColors: any = {
    owner: 'text-brand-gold border-brand-gold/30 bg-brand-gold/10',
    manager: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    captain: 'text-brand-cyan border-brand-cyan/30 bg-brand-cyan/10',
    player: 'text-slate-300 border-slate-700 bg-slate-800'
  }

  if (loading) return <div className="flex justify-center items-center h-screen"><RefreshCw className="animate-spin text-brand-cyan" size={48} /></div>

  return (
    <div className="flex flex-col w-full min-h-screen pb-20">
      <div className="relative w-full h-72 md:h-96 bg-slate-900 border-b border-kaf-border overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-50 transition-transform duration-1000 hover:scale-105" style={{ backgroundImage: `url(${clan?.banner_url || '/hero-stadium.jpg'})` }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-kaf-panel via-kaf-panel/60 to-transparent"></div>
        {canEditClanDetails && (
          <button className="absolute top-6 right-6 bg-kaf-panel/80 backdrop-blur border border-kaf-border text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-colors z-10 shadow-lg">
            <Settings size={16} /> Edit Settings
          </button>
        )}
      </div>

      <div className="px-6 md:px-8 max-w-7xl mx-auto w-full relative -mt-32 space-y-6">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-3xl bg-kaf-panel border-4 border-kaf-bg shadow-2xl flex items-center justify-center overflow-hidden bg-cover" style={{ backgroundImage: `url(${clan?.logo_url || ''})` }}>
            {!clan?.logo_url && <Shield size={80} className="text-brand-cyan opacity-80" />}
          </div>
          
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-[10px] font-black uppercase tracking-widest kaf-glow">
                {clan?.is_verified ? 'Verified Organization' : 'Community Clan'}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-black text-white uppercase tracking-tight mb-2 flex items-center gap-3 drop-shadow-lg">
              {clan?.name || 'Loading...'}
              {clan?.is_verified && <CheckCircle className="text-brand-gold fill-brand-gold/20" size={36} />}
            </h1>
            <p className="text-slate-300 font-medium max-w-2xl text-lg">
              {clan?.bio || 'No clan biography provided.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pb-2">
            <div className="px-5 py-3 rounded-xl bg-kaf-card border border-kaf-border text-white text-sm font-bold flex items-center gap-2 shadow-lg">
              <Users size={18} className="text-brand-cyan" /> {roster.length} Members
            </div>
            {clan?.is_recruiting ? (
              <div className="px-5 py-3 rounded-xl bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-sm font-bold flex items-center gap-2 shadow-lg uppercase tracking-widest">
                <UserPlus size={18} /> Recruiting
              </div>
            ) : (
              <div className="px-5 py-3 rounded-xl bg-slate-800 border border-slate-600 text-slate-400 text-sm font-bold flex items-center gap-2 shadow-lg uppercase tracking-widest">
                Closed
              </div>
            )}
          </div>
        </div>

        {/* Custom Tabs Navigation */}
        <div className="flex overflow-x-auto gap-2 border-b border-kaf-border pb-1 no-scrollbar pt-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-bold text-sm tracking-wide whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab 
                  ? 'border-brand-cyan text-brand-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]' 
                  : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
          {canManageRoster && (
            <button
              onClick={() => setActiveTab('Management')}
              className={`ml-auto px-6 py-3 font-bold text-sm tracking-wide whitespace-nowrap transition-all border-b-2 ${
                activeTab === 'Management' 
                  ? 'border-brand-gold text-brand-gold' 
                  : 'border-transparent text-brand-gold/50 hover:text-brand-gold'
              }`}
            >
              <Star size={14} className="inline mr-1" /> HQ
            </button>
          )}
        </div>

        <div className="pt-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'Overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="kaf-card p-6 rounded-2xl border border-kaf-border">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Region</h3>
                    <p className="text-2xl font-black text-white">{clan?.region || 'Global'}</p>
                  </div>
                  <div className="kaf-card p-6 rounded-2xl border border-kaf-border">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Global Rank</h3>
                    <p className="text-2xl font-black text-brand-cyan">#Unranked</p>
                  </div>
                </div>
                
                <div className="kaf-card p-8 rounded-2xl border border-kaf-border shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <Trophy size={200} />
                  </div>
                  <h3 className="text-2xl font-display font-black text-white mb-2 relative z-10">Trophy Cabinet</h3>
                  <p className="text-slate-400 relative z-10">This organization has not won any major KAF events yet.</p>
                </div>
              </div>
            )}

            {activeTab === 'Roster' && (
              <div className="space-y-4">
                {roster.map((player) => (
                  <div key={player.id} className="kaf-card p-4 rounded-xl border border-kaf-border flex items-center justify-between hover:border-brand-cyan/30 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-800 bg-cover border-2 border-transparent group-hover:border-brand-cyan transition-colors" style={{ backgroundImage: `url(${player.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.profiles?.username}`})` }}></div>
                      <div>
                        <div className="font-bold text-lg text-white group-hover:text-brand-cyan transition-colors">{player.profiles?.username || 'Unknown'}</div>
                        <div className="text-xs text-slate-400">{player.profiles?.region || 'Unknown Region'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs text-slate-500 uppercase">Rating</div>
                        <div className="font-bold text-white">{player.rankings?.rating || '0'}</div>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-widest border ${roleColors[player.role]}`}>
                        {player.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Lineups' && (
              <div className="kaf-card p-8 rounded-2xl border border-kaf-border text-center space-y-4">
                <GitMerge size={48} className="mx-auto text-slate-500" />
                <h3 className="text-xl font-bold text-white">Event Lineups</h3>
                <p className="text-slate-400 max-w-md mx-auto">Create specific rosters of players to submit for different tournaments and leagues.</p>
                {canManageRoster && (
                  <button className="px-6 py-3 bg-white text-kaf-bg rounded-xl font-bold hover:scale-105 transition-transform mt-4">
                    Create New Lineup
                  </button>
                )}
              </div>
            )}

            {activeTab === 'Management' && canManageRoster && (
              <div className="space-y-6">
                <div className="kaf-card p-6 rounded-2xl border border-kaf-border shadow-xl">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                    Join Requests <span className="bg-brand-cyan text-kaf-bg px-2 py-0.5 rounded-full">{joinRequests.length}</span>
                  </h3>
                  
                  <div className="space-y-3">
                    {joinRequests.length === 0 && <p className="text-xs text-slate-500">No pending requests.</p>}
                    {joinRequests.map(req => (
                      <div key={req.id} className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white">{req.profiles?.username}</div>
                          <div className="text-xs text-slate-400">Applied recently</div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleRequest(req.id, 'accepted', req.profile_id)} className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-sm hover:bg-emerald-500 hover:text-white transition-colors">
                            Accept
                          </button>
                          <button onClick={() => handleRequest(req.id, 'rejected', req.profile_id)} className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 font-bold text-sm hover:bg-red-500 hover:text-white transition-colors">
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="kaf-card p-6 rounded-2xl border border-kaf-border shadow-xl">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Roster Operations</h3>
                  <div className="space-y-2">
                    {roster.map((player) => (
                       <div key={player.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg">
                          <span className="font-bold text-white text-sm">{player.profiles?.username} <span className="text-slate-500 font-normal">({player.role})</span></span>
                          {player.role !== 'owner' && (
                            <div className="flex gap-2">
                              {canEditClanDetails && player.role === 'player' && (
                                <button onClick={() => handlePromote(player.id, 'captain')} className="text-xs font-bold text-brand-cyan px-2 py-1 rounded bg-brand-cyan/10">Promote</button>
                              )}
                              {canEditClanDetails && player.role === 'captain' && (
                                <button onClick={() => handlePromote(player.id, 'player')} className="text-xs font-bold text-slate-400 px-2 py-1 rounded bg-slate-800">Demote</button>
                              )}
                              <button onClick={() => handleKick(player.id)} className="text-xs font-bold text-red-400 px-2 py-1 rounded bg-red-500/10">Kick</button>
                            </div>
                          )}
                       </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {!canManageRoster && activeTab !== 'Management' && (
              <div className="kaf-card p-6 rounded-2xl border border-brand-cyan/30 shadow-[0_0_20px_rgba(0,240,255,0.1)] relative overflow-hidden">
                <div className="absolute -top-4 -right-4 opacity-10"><Shield size={100} /></div>
                <h2 className="text-xl font-display font-black text-white uppercase tracking-wider mb-2 relative z-10">Join Organization</h2>
                {clan?.is_recruiting ? (
                  <>
                    <p className="text-sm text-slate-300 leading-relaxed mb-6 relative z-10">
                      Submit your application to be reviewed by the management. Make sure your KAF profile is fully set up.
                    </p>
                    <button onClick={handleApply} className="w-full bg-brand-cyan text-kaf-bg py-4 rounded-xl font-black text-lg hover:scale-105 hover:bg-white transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] relative z-10">
                      Apply to Join
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-status-draft font-bold text-center relative z-10">
                    Recruitment is currently closed.
                  </p>
                )}
              </div>
            )}

            <div className="kaf-card p-6 rounded-2xl border border-kaf-border">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Upcoming Matches</h3>
              <div className="text-center py-6 text-slate-400 text-sm">
                No official matches scheduled.
              </div>
            </div>
            
            <div className="kaf-card p-6 rounded-2xl border border-kaf-border">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Transfer Activity</h3>
              <div className="text-center py-6 text-slate-400 text-sm">
                No recent transfer activity.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
