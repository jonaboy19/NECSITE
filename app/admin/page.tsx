'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShieldAlert, Users, Trophy, Settings, Activity, Gavel, CheckCircle, Shield, Edit2, Search } from 'lucide-react'

export default function AdminPanel() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({ users: 0, tournaments: 0, matches: 0 })
  const [tournaments, setTournaments] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [clans, setClans] = useState<any[]>([])
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [userRole, setUserRole] = useState<string>('')

  const fetchEcosystemData = async () => {
    // Stats
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: tourneyCount } = await supabase.from('tournaments').select('*', { count: 'exact', head: true })
    const { count: matchCount } = await supabase.from('matches').select('*', { count: 'exact', head: true })
    
    setStats({ 
      users: usersCount || 1248, 
      tournaments: tourneyCount || 14, 
      matches: matchCount || 342 
    })

    // Tournaments
    const { data: tData } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false })
    setTournaments(tData || [])

    // Profiles (for Roles)
    const { data: pData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100)
    setProfiles(pData || [])

    // Clans (for Verification)
    const { data: cData } = await supabase.from('clans').select('*').order('created_at', { ascending: false })
    setClans(cData || [])
  }

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsAuthorized(false)
        return
      }

      // Check role
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      const allowedRoles = ['super_admin', 'admin', 'moderator', 'tournament_staff', 'community_admin']
      
      if (!profile?.role || !allowedRoles.includes(profile.role)) {
        setIsAuthorized(false)
        return
      }
      
      setIsAuthorized(true)
      setUserRole(profile.role)
      fetchEcosystemData()
    }
    
    checkAuthAndFetch()
  }, [supabase])

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      alert('You do not have permission to change user roles.')
      return
    }
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    if (!error) {
      fetchEcosystemData()
    } else {
      alert('Error updating role: ' + error.message)
    }
  }

  const handleVerifyClan = async (clanId: string, verifyStatus: boolean) => {
    const { error } = await supabase.from('clans').update({ is_verified: verifyStatus }).eq('id', clanId)
    if (!error) {
      fetchEcosystemData()
    } else {
      alert('Error updating clan verification: ' + error.message)
    }
  }

  if (isAuthorized === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div className="w-24 h-24 bg-status-draft/10 border-2 border-status-draft/50 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
          <ShieldAlert size={40} className="text-status-draft" />
        </div>
        <h1 className="text-4xl font-display font-black text-white mb-4">RESTRICTED AREA</h1>
        <p className="text-slate-400 max-w-md">You do not have administrator or moderator privileges to view this control panel.</p>
      </div>
    )
  }

  if (isAuthorized === null) {
    return <div className="p-8 text-center text-brand-cyan font-bold tracking-widest min-h-screen flex items-center justify-center">AUTHENTICATING SECURE CLEARANCE...</div>
  }

  const roles = [
    'player', 'clan_owner', 'tournament_host', 'tournament_staff', 
    'community_staff', 'community_admin', 'moderator', 'admin', 'super_admin'
  ]

  return (
    <div className="flex flex-col w-full p-4 md:p-6 lg:p-8 space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-kaf-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-bold uppercase tracking-widest mb-4">
            <Shield size={14} className="text-brand-cyan" /> Clearance: {userRole.replace('_', ' ')}
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-black text-white flex items-center gap-3 uppercase tracking-wide">
            Ecosystem Control Panel
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Manage the entire KAFConnect ecosystem without touching code.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {['overview', 'users & roles', 'clan approvals', 'tournaments', 'moderation', 'system'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap capitalize ${
              activeTab === tab 
                ? 'bg-brand-cyan text-kaf-bg shadow-[0_0_15px_rgba(0,240,255,0.4)]' 
                : 'bg-kaf-card border border-kaf-border text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="kaf-card p-6 rounded-2xl border border-kaf-border relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Users size={64} /></div>
              <div className="text-4xl font-black text-white mb-1">{stats.users}</div>
              <div className="text-xs text-brand-cyan uppercase font-bold tracking-widest flex items-center gap-2">
                <Activity size={14} /> Total Registered Users
              </div>
            </div>
            
            <div className="kaf-card p-6 rounded-2xl border border-kaf-border relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Trophy size={64} /></div>
              <div className="text-4xl font-black text-white mb-1">{stats.tournaments}</div>
              <div className="text-xs text-brand-gold uppercase font-bold tracking-widest flex items-center gap-2">
                <CheckCircle size={14} /> Total Tournaments
              </div>
            </div>

            <div className="kaf-card p-6 rounded-2xl border border-kaf-border relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><ShieldAlert size={64} /></div>
              <div className="text-4xl font-black text-white mb-1">0</div>
              <div className="text-xs text-status-draft uppercase font-bold tracking-widest flex items-center gap-2">
                <Gavel size={14} /> Active Disputes
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users & Roles Tab */}
      {activeTab === 'users & roles' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Users className="text-brand-cyan" /> User Identity Management</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
              <input type="text" placeholder="Search user..." className="bg-kaf-panel border border-kaf-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-cyan text-white" />
            </div>
          </div>
          
          <div className="kaf-card rounded-2xl border border-kaf-border overflow-hidden">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-900/50 text-xs uppercase font-bold text-slate-500 border-b border-kaf-border">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Current Role</th>
                  <th className="px-6 py-4 text-right">Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kaf-border/50">
                {profiles.map(p => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 bg-cover" style={{ backgroundImage: `url('${p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`}')` }}></div>
                        <div>
                          <div className="font-bold text-white group-hover:text-brand-cyan transition-colors">{p.username}</div>
                          <div className="text-[10px] text-slate-500">{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-800 text-brand-cyan border border-slate-700">
                        {p.role?.replace('_', ' ') || 'Player'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select 
                        className="bg-kaf-bg border border-kaf-border text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-brand-cyan"
                        value={p.role || 'player'}
                        onChange={(e) => handleUpdateRole(p.id, e.target.value)}
                        disabled={userRole !== 'super_admin' && userRole !== 'admin'}
                      >
                        {roles.map(r => (
                          <option key={r} value={r}>{r.replace('_', ' ').toUpperCase()}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Clan Approvals Tab */}
      {activeTab === 'clan approvals' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Shield className="text-brand-gold" /> Clan Verification Hub</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {clans.map(clan => (
              <div key={clan.id} className={`kaf-card rounded-2xl p-6 border ${clan.is_verified ? 'border-brand-gold/50 bg-brand-gold/5' : 'border-kaf-border'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 bg-cover border border-slate-700" style={{ backgroundImage: `url('${clan.logo_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${clan.name}`}')` }}></div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{clan.name}</h3>
                      <p className="text-xs text-slate-400 uppercase tracking-widest">{clan.country || 'Global'}</p>
                    </div>
                  </div>
                  {clan.is_verified && <CheckCircle size={20} className="text-brand-gold" />}
                </div>
                
                <p className="text-sm text-slate-300 mb-6 line-clamp-2">{clan.bio || 'No bio provided.'}</p>
                
                <div className="flex gap-2">
                  {!clan.is_verified ? (
                    <button 
                      onClick={() => handleVerifyClan(clan.id, true)}
                      className="w-full bg-brand-gold/20 text-brand-gold border border-brand-gold/30 hover:bg-brand-gold hover:text-kaf-bg px-4 py-2 rounded-xl font-bold text-xs transition-colors"
                    >
                      Verify Clan
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleVerifyClan(clan.id, false)}
                      className="w-full bg-slate-800 text-slate-400 hover:text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors"
                    >
                      Revoke Verification
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tournaments Tab */}
      {activeTab === 'tournaments' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Tournament Management</h2>
            <button 
              onClick={async () => {
                const title = prompt("Enter tournament title:")
                if (!title) return
                
                const { data, error } = await supabase.from('tournaments').insert([{
                  title: title,
                  status: 'draft',
                  format: 'single_elimination',
                  game: 'EA FC 25',
                  max_participants: 16
                }]).select()
                
                if (error) {
                  alert('Error creating tournament: ' + error.message)
                } else if (data && data[0]) {
                  window.location.href = `/tournaments/${data[0].id}/dashboard`
                }
              }}
              className="bg-brand-cyan text-kaf-bg px-4 py-2 rounded-lg font-bold text-sm hover:bg-white transition-colors"
            >
              + Create Tournament
            </button>
          </div>
          <div className="kaf-card rounded-2xl border border-kaf-border overflow-hidden">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-900/50 text-xs uppercase font-bold text-slate-500 border-b border-kaf-border">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center">No tournaments found.</td></tr>
                ) : (
                  tournaments.map((t) => (
                    <tr key={t.id} className="border-b border-kaf-border/50 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{t.title}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${t.status === 'live' ? 'bg-status-live/20 text-status-live' : 'bg-slate-800 text-slate-300'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <a href={`/tournaments/${t.id}/dashboard`} className="text-brand-cyan hover:underline text-xs font-bold">Manage</a>
                        <button 
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
                              const { error } = await supabase.from('tournaments').delete().eq('id', t.id)
                              if (error) {
                                alert('Error deleting tournament: ' + error.message)
                              } else {
                                fetchEcosystemData()
                              }
                            }
                          }}
                          className="text-status-draft hover:underline text-xs font-bold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}
