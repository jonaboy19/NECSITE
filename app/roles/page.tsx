import { Shield, Crown, Users, Star, Eye, Plus, Settings, Trash2, ChevronRight, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Roles & Permissions — KAFConnect',
  description: 'Understanding the role system and what each role can do on KAFConnect.',
}

const ROLES = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    icon: Crown,
    color: 'text-brand-gold',
    bg: 'bg-brand-gold/10 border-brand-gold/30',
    badge: 'bg-brand-gold text-kaf-bg',
    description: 'Full platform access. Can manage users, assign roles, delete data, configure site settings, manage sponsors, news, and all content.',
    permissions: [
      { label: 'Manage all users and roles', allowed: true },
      { label: 'Create & delete tournaments', allowed: true },
      { label: 'Create & delete clans', allowed: true },
      { label: 'Manage all matches & results', allowed: true },
      { label: 'Publish news & announcements', allowed: true },
      { label: 'Resolve disputes', allowed: true },
      { label: 'Manage sponsors', allowed: true },
      { label: 'Override site configuration', allowed: true },
      { label: 'View audit logs', allowed: true },
    ],
    how: 'Assigned by the KAFConnect team only.',
  },
  {
    id: 'tournament_admin',
    name: 'Tournament Admin',
    icon: Shield,
    color: 'text-brand-lime',
    bg: 'bg-brand-cyan/10 border-brand-cyan/30',
    badge: 'bg-brand-cyan text-white',
    description: 'Can create and fully manage tournaments — including approving registrations, setting match results, and resolving disputes within their events.',
    permissions: [
      { label: 'Create & manage tournaments', allowed: true },
      { label: 'Approve/reject registrations', allowed: true },
      { label: 'Set match results', allowed: true },
      { label: 'Resolve tournament disputes', allowed: true },
      { label: 'View all participants', allowed: true },
      { label: 'Publish news & announcements', allowed: false },
      { label: 'Manage user roles', allowed: false },
      { label: 'Override site configuration', allowed: false },
    ],
    how: 'Granted by Super Admin via a Tournament Permit.',
  },
  {
    id: 'clan_admin',
    name: 'Clan Admin',
    icon: Star,
    color: 'text-brand-cyan',
    bg: 'bg-brand-cyan/10 border-brand-cyan/30',
    badge: 'bg-brand-cyan text-kaf-bg',
    description: 'Manages their own clan. Can edit clan details, approve/reject member applications, manage roster roles, and register the clan for tournaments.',
    permissions: [
      { label: 'Edit clan profile & branding', allowed: true },
      { label: 'Accept/reject member applications', allowed: true },
      { label: 'Set member roles within clan', allowed: true },
      { label: 'Register clan for tournaments', allowed: true },
      { label: 'Submit match results', allowed: true },
      { label: 'Create tournaments', allowed: false },
      { label: 'Manage other clans', allowed: false },
      { label: 'Assign site-wide roles', allowed: false },
    ],
    how: 'Automatically granted when you create a clan.',
  },
  {
    id: 'player',
    name: 'Player',
    icon: Users,
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/30',
    badge: 'bg-green-600 text-white',
    description: 'Registered competitive player. Can apply to join clans, register for tournaments, report match results, post scrim requests, and manage their profile.',
    permissions: [
      { label: 'Register for tournaments', allowed: true },
      { label: 'Apply to join clans', allowed: true },
      { label: 'Report match results', allowed: true },
      { label: 'Post scrim requests', allowed: true },
      { label: 'File disputes', allowed: true },
      { label: 'Manage own profile', allowed: true },
      { label: 'Manage other users', allowed: false },
      { label: 'Create tournaments', allowed: false },
    ],
    how: 'Applied for via Settings → My Role.',
  },
  {
    id: 'user',
    name: 'User',
    icon: Eye,
    color: 'text-slate-400',
    bg: 'bg-slate-700/20 border-slate-700/40',
    badge: 'bg-slate-700 text-white',
    description: 'Base role for all registered accounts. Can view all public content, follow tournaments, and browse clans and rankings.',
    permissions: [
      { label: 'View public tournaments', allowed: true },
      { label: 'Browse clans & players', allowed: true },
      { label: 'View rankings & news', allowed: true },
      { label: 'Register for tournaments', allowed: false },
      { label: 'Apply to join clans', allowed: false },
      { label: 'Post scrim requests', allowed: false },
      { label: 'Submit match results', allowed: false },
      { label: 'Manage content', allowed: false },
    ],
    how: 'Default role when you create an account.',
  },
]

export default function RolesPage() {
  return (
    <div className="flex flex-col w-full pb-20">
      {/* Header */}
      <div className="bg-kaf-panel border-b border-kaf-border px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-bold uppercase tracking-widest mb-4">
            <Shield size={12} /> Platform Governance
          </div>
          <h1 className="text-4xl font-display font-black text-white uppercase tracking-tight">
            Roles & <span className="text-brand-cyan">Permissions</span>
          </h1>
          <p className="text-slate-400 mt-3 max-w-xl">
            KAFConnect uses a role-based access system enforced at both the UI and database level. Here&apos;s what each role can do.
          </p>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
        {ROLES.map(role => {
          const Icon = role.icon
          return (
            <div key={role.id} className={`kaf-card rounded-2xl border p-6 ${role.bg}`}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className={`flex items-center gap-3 flex-1`}>
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${role.bg}`}>
                    <Icon size={24} className={role.color} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-white">{role.name}</h2>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${role.badge}`}>
                        {role.id}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1 max-w-lg">{role.description}</p>
                    <p className="text-xs text-slate-500 mt-1.5 italic">{role.how}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid sm:grid-cols-2 gap-2">
                {role.permissions.map(perm => (
                  <div key={perm.label} className="flex items-center gap-2 text-sm">
                    {perm.allowed ? (
                      <CheckCircle size={14} className="text-green-400 shrink-0" />
                    ) : (
                      <XCircle size={14} className="text-slate-700 shrink-0" />
                    )}
                    <span className={perm.allowed ? 'text-slate-300' : 'text-slate-600'}>{perm.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* CTA */}
        <div className="kaf-card rounded-2xl border border-kaf-border p-6 text-center">
          <h3 className="text-lg font-black text-white mb-2">Want to upgrade your role?</h3>
          <p className="text-slate-400 text-sm mb-4">Player and Clan Admin roles can be applied for in your account settings.</p>
          <Link href="/settings" className="px-6 py-3 bg-brand-cyan text-kaf-bg rounded-xl font-black text-sm hover:bg-white transition-colors inline-flex items-center gap-2">
            <Settings size={16} /> Go to Settings
          </Link>
        </div>
      </div>
    </div>
  )
}
