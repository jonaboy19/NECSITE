import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trophy, Users, Calendar, Clock, ChevronRight, Info, CheckCircle } from 'lucide-react'

export default async function TournamentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !tournament) {
    notFound()
  }

  // Redirect to dashboard for live/in-progress tournaments
  if (tournament.status === 'live' || tournament.status === 'in_progress') {
    redirect(`/tournaments/${id}/dashboard`)
  }

  const { data: registrations } = await supabase
    .from('tournament_registrations')
    .select('*, profiles(username, avatar_url)')
    .eq('tournament_id', id)
    .limit(20)

  const { data: currentUser } = await supabase.auth.getUser()
  const isRegistered = registrations?.some((r: any) => r.profile_id === currentUser?.user?.id)
  const spotsLeft = (tournament.max_participants || 64) - (registrations?.length || 0)
  const isOpen = tournament.status === 'registration_open'

  const statusMap: Record<string, { label: string; className: string }> = {
    registration_open: { label: 'Registration Open', className: 'bg-brand-gold/20 text-brand-gold border-brand-gold/40' },
    live: { label: 'Live', className: 'bg-status-live/20 text-status-live border-status-live/40' },
    in_progress: { label: 'In Progress', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    completed: { label: 'Completed', className: 'bg-slate-500/20 text-slate-400 border-slate-500/40' },
    scheduled: { label: 'Scheduled', className: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
  }
  const statusInfo = statusMap[tournament.status] || { label: tournament.status, className: 'bg-slate-500/20 text-slate-400 border-slate-500/40' }

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Back Bar */}
      <div className="sticky top-0 z-30 bg-kaf-panel/95 backdrop-blur-xl border-b border-kaf-border px-4 py-3 flex items-center gap-3">
        <Link href="/tournaments" className="p-2 -ml-1 rounded-full hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} className="text-white" />
        </Link>
        <span className="font-bold text-white text-sm truncate">{tournament.title}</span>
        <Link
          href={`/tournaments/${id}/dashboard`}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-bold hover:bg-brand-cyan/20 transition-colors"
        >
          <Info size={14} /> Bracket
        </Link>
      </div>

      {/* Hero Banner */}
      <div className="relative h-56 md:h-72 bg-kaf-panel border-b border-kaf-border overflow-hidden">
        <div className="absolute inset-0 bg-[url('/kaf-eleague-s1-poster.png')] bg-cover bg-center opacity-25"></div>
        <div className="absolute inset-0 bg-[url('/hero-stadium.jpg')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-kaf-bg via-kaf-bg/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-kaf-bg/80 via-transparent to-transparent"></div>

        <div className="absolute bottom-6 left-6 right-6">
          <span className={`inline-block px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest mb-3 ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-black text-white leading-tight drop-shadow-md">
            {tournament.title}
          </h1>
          {tournament.description && (
            <p className="text-slate-400 mt-2 text-sm max-w-xl leading-relaxed">{tournament.description}</p>
          )}
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Registered', value: registrations?.length || 0, sub: `/ ${tournament.max_participants || 64}` },
            { icon: Trophy, label: 'Format', value: tournament.format?.replace(/_/g, ' ') || '1v1', sub: null },
            { icon: Calendar, label: 'Start Date', value: tournament.start_date ? new Date(tournament.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'TBA', sub: null },
            { icon: Clock, label: 'Spots Left', value: spotsLeft > 0 ? spotsLeft : 'Full', sub: null },
          ].map((s) => (
            <div key={s.label} className="kaf-card rounded-2xl border border-kaf-border p-4 flex flex-col items-center text-center">
              <s.icon size={18} className="text-brand-cyan mb-2" />
              <div className="text-lg font-black text-white leading-none">
                {s.value}{s.sub && <span className="text-slate-500 text-sm font-bold">{s.sub}</span>}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Prize Pool */}
        {tournament.prize_pool && (
          <div className="kaf-card rounded-2xl border border-brand-gold/20 bg-brand-gold/5 p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center shrink-0">
              <Trophy size={28} className="text-brand-gold" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Total Prize Pool</p>
              <p className="text-3xl font-black text-brand-gold">{tournament.prize_pool}</p>
            </div>
          </div>
        )}

        {/* CTA */}
        {isOpen && (
          <div className="kaf-card rounded-2xl border border-kaf-border p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white mb-1">Ready to Compete?</h3>
              <p className="text-slate-400 text-sm">
                {isRegistered
                  ? "You're already registered for this tournament."
                  : `${spotsLeft} spots remaining. Register before they fill up.`}
              </p>
            </div>
            {isRegistered ? (
              <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black shrink-0">
                <CheckCircle size={18} /> Registered
              </div>
            ) : (
              <Link
                href={`/tournaments/${id}/join`}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-cyan text-kaf-bg font-black hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,102,0.3)] shrink-0"
              >
                Register Now <ChevronRight size={18} />
              </Link>
            )}
          </div>
        )}

        {/* Registered Players */}
        <div className="kaf-card rounded-2xl border border-kaf-border overflow-hidden">
          <div className="p-5 border-b border-kaf-border flex items-center justify-between">
            <h2 className="font-black text-white flex items-center gap-2">
              <Users size={18} className="text-brand-cyan" /> Participants
              <span className="text-slate-500 font-bold text-sm">({registrations?.length || 0})</span>
            </h2>
            <Link href={`/tournaments/${id}/dashboard`} className="text-xs text-brand-cyan font-bold hover:underline flex items-center gap-1">
              View Bracket <ChevronRight size={14} />
            </Link>
          </div>
          {registrations && registrations.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4">
              {registrations.map((reg: any) => (
                <Link
                  key={reg.id}
                  href={`/profile/${reg.profiles?.username}`}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-kaf-bg border border-kaf-border hover:border-brand-cyan/30 transition-all group"
                >
                  <div
                    className="w-8 h-8 rounded-full bg-slate-800 bg-cover bg-center shrink-0 border border-kaf-border group-hover:border-brand-cyan transition-all"
                    style={{ backgroundImage: `url('${reg.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reg.profiles?.username}`}')` }}
                  />
                  <span className="text-xs font-bold text-white truncate group-hover:text-brand-cyan transition-colors">
                    {reg.profiles?.username || 'Player'}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <Users size={28} className="text-slate-700 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No players registered yet. Be the first!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
