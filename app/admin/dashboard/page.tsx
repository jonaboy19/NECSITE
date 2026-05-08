import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ShieldAlert, Users, Trophy, Activity, Gavel } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Admin Dashboard — KAFConnect',
}

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient()

  // Server-side role check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/admin/dashboard')

  // Check role in BOTH tables for compatibility
  const [{ data: profile }, { data: roleRow }] = await Promise.all([
    supabase.from('profiles').select('role, username').eq('id', user.id).single(),
    supabase.from('user_roles').select('role').eq('user_id', user.id).in('role', ['super_admin', 'tournament_admin']).maybeSingle(),
  ])

  const adminRoles = ['super_admin', 'admin', 'tournament_admin', 'moderator']
  const profileRole = profile?.role || ''
  const hasAdminRole = adminRoles.includes(profileRole) || !!roleRow

  if (!hasAdminRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div className="w-24 h-24 bg-red-500/10 border-2 border-red-500/50 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert size={40} className="text-red-400" />
        </div>
        <h1 className="text-4xl font-display font-black text-white mb-4">RESTRICTED AREA</h1>
        <p className="text-slate-400 max-w-md mb-6">
          You don&apos;t have administrator privileges. Contact a Super Admin if this is a mistake.
        </p>
        <Link href="/" className="text-brand-cyan hover:underline font-bold">Return Home</Link>
      </div>
    )
  }

  // Real counts from DB
  const [
    { count: userCount },
    { count: clanCount },
    { count: tournamentCount },
    { count: matchCount },
    { count: disputeCount },
    { count: pendingRegCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('clans').select('*', { count: 'exact', head: true }),
    supabase.from('tournaments').select('*', { count: 'exact', head: true }),
    supabase.from('matches').select('*', { count: 'exact', head: true }),
    supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('tournament_registrations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const stats = [
    { label: 'Registered Users', value: userCount ?? 0, icon: Users, color: 'text-brand-cyan', border: 'border-brand-cyan/20' },
    { label: 'Clans', value: clanCount ?? 0, icon: Activity, color: 'text-purple-400', border: 'border-purple-400/20' },
    { label: 'Tournaments', value: tournamentCount ?? 0, icon: Trophy, color: 'text-brand-gold', border: 'border-brand-gold/20' },
    { label: 'Matches', value: matchCount ?? 0, icon: Activity, color: 'text-green-400', border: 'border-green-400/20' },
    { label: 'Open Disputes', value: disputeCount ?? 0, icon: Gavel, color: 'text-red-400', border: 'border-red-400/20' },
    { label: 'Pending Registrations', value: pendingRegCount ?? 0, icon: Users, color: 'text-orange-400', border: 'border-orange-400/20' },
  ]

  return (
    <div className="flex flex-col w-full p-4 md:p-8 space-y-8 pb-20">
      <div className="border-b border-kaf-border pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-bold uppercase tracking-widest mb-4">
          Clearance: {(profileRole || roleRow?.role || 'admin').replace('_', ' ')}
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-black text-white uppercase tracking-wide">
          Admin Dashboard
        </h1>
        <p className="text-slate-400 mt-2">Platform overview for {profile?.username || user.email}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className={`kaf-card p-5 rounded-2xl border ${stat.border} relative overflow-hidden group`}>
              <div className="absolute top-3 right-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon size={48} />
              </div>
              <div className={`text-4xl font-black mb-1 ${stat.color}`}>{stat.value.toLocaleString()}</div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-black text-white mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Manage Users & Roles', href: '/admin', desc: 'Assign/revoke platform roles', color: 'brand-cyan' },
            { label: 'Manage Tournaments', href: '/admin?tab=tournaments', desc: 'Create, edit, delete tournaments', color: 'brand-gold' },
            { label: 'Clan Verification', href: '/admin?tab=clans', desc: 'Approve and verify clan organizations', color: 'purple-400' },
            { label: 'View Disputes', href: '/appeals', desc: 'Review open appeals and disputes', color: 'red-400' },
            { label: 'View All Matches', href: '/matches', desc: 'Full match history and results', color: 'green-400' },
            { label: 'Create Tournament', href: '/tournaments/create', desc: 'Start a new competition', color: 'orange-400' },
          ].map(action => (
            <Link key={action.label} href={action.href}
              className="kaf-card rounded-xl border border-kaf-border p-4 hover:border-brand-cyan/30 transition-all group">
              <div className="font-black text-white text-sm group-hover:text-brand-cyan transition-colors">{action.label}</div>
              <div className="text-xs text-slate-500 mt-1">{action.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
