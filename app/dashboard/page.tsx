import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, Shield, Trophy, LayoutDashboard, Settings, Map, CheckCircle2, Circle } from 'lucide-react'
import PageLayout from '@/components/PageLayout'

export default async function PlayerDashboard() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  
  // Calculate Onboarding Progress
  const completionSteps = [
    { name: 'Set Gamertag', complete: !!profile?.username },
    { name: 'Upload Avatar', complete: !!profile?.avatar_url },
    { name: 'Set Region', complete: !!profile?.region },
    { name: 'Link Discord', complete: !!profile?.discord_id },
  ]
  const completedCount = completionSteps.filter(s => s.complete).length
  const progressPercent = Math.round((completedCount / completionSteps.length) * 100)

  // Fetch active clan applications
  const { data: myApplications } = await supabase.from('clan_applications').select('*, clans(name)').eq('profile_id', user.id).order('created_at', { ascending: false })

  return (
    <div className="flex flex-col w-full pb-20 p-6 max-w-7xl mx-auto space-y-8">
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-black text-white">Player Dashboard</h1>
        {profile?.role === 'admin' && (
          <Link href="/admin" className="px-4 py-2 bg-brand-gold text-black font-bold rounded-lg hover:scale-105 transition">
            Admin Hub
          </Link>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Completion Card */}
        <div className="kaf-card rounded-2xl border border-kaf-border p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-cyan to-purple-500"></div>
          <h2 className="text-xl font-black mb-4 text-white">Profile Setup</h2>
          
          <div className="mb-4">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              <span>Progress</span>
              <span className="text-brand-cyan">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-kaf-bg rounded-full overflow-hidden">
              <div className="h-full bg-brand-cyan transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          <div className="space-y-3 mt-6">
            {completionSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {step.complete ? <CheckCircle2 size={18} className="text-brand-cyan" /> : <Circle size={18} className="text-slate-600" />}
                <span className={`text-sm font-bold ${step.complete ? 'text-white' : 'text-slate-500'}`}>{step.name}</span>
              </div>
            ))}
          </div>

          {progressPercent < 100 && (
            <Link href="/profile" className="mt-6 block w-full text-center py-2 bg-kaf-bg border border-kaf-border rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:border-brand-cyan transition">
              Complete Profile
            </Link>
          )}
        </div>

        {/* Status Blocks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="kaf-card rounded-2xl border border-kaf-border p-6 flex flex-col justify-center items-center text-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
                <Shield size={24} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-black text-white mb-1">My Clan</h3>
              <p className="text-sm text-slate-400 mb-4">You are currently a Free Agent.</p>
              <Link href="/clans" className="text-xs font-bold text-brand-cyan uppercase tracking-widest hover:underline">Browse Organizations</Link>
            </div>

            <div className="kaf-card rounded-2xl border border-kaf-border p-6 flex flex-col justify-center items-center text-center">
              <div className="w-12 h-12 bg-brand-cyan/10 rounded-full flex items-center justify-center mb-4">
                <Map size={24} className="text-brand-cyan" />
              </div>
              <h3 className="text-lg font-black text-white mb-1">Active Tournaments</h3>
              <p className="text-sm text-slate-400 mb-4">0 events currently in progress.</p>
              <Link href="/tournaments" className="text-xs font-bold text-brand-cyan uppercase tracking-widest hover:underline">View Brackets</Link>
            </div>
          </div>

          <div className="kaf-card rounded-2xl border border-kaf-border p-6">
            <h2 className="text-lg font-black mb-4 text-white">My Applications</h2>
            {myApplications && myApplications.length > 0 ? (
              <div className="space-y-3">
                {myApplications.map((app: any) => (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-kaf-bg border border-kaf-border rounded-xl">
                    <span className="font-bold text-white">{app.clans?.name}</span>
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                      app.status === 'accepted' ? 'bg-status-live text-white' : 
                      app.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">You have no active clan applications.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}