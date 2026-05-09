import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Trophy, Calendar, Users, GitMerge, ShieldAlert, Search, Radio } from 'lucide-react'
import PublicHeader from '@/components/PublicHeader'
import { EmptyState } from '@/components/EmptyState'

export default async function Tournaments({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q, status } = await searchParams
  const supabase = await createServerSupabaseClient()
  let query = supabase.from('tournaments').select('*').order('created_at', { ascending: false })

  if (q) query = query.ilike('title', `%${q}%`)
  if (status && status !== 'all') query = query.eq('status', status)

  const { data: tournaments, error } = await query
  const statusTabs = [
    { label: 'All', value: 'all' },
    { label: 'Open', value: 'registration_open' },
    { label: 'Live', value: 'live' },
    { label: 'Completed', value: 'completed' },
  ]

  return (
    <div className="kaf-screen flex flex-col w-full pb-20">
      <PublicHeader />
      <section className="kaf-stadium-bg kaf-scanlines relative w-full min-h-[360px] overflow-hidden border-b border-white/[0.06] flex items-center">
        <div className="absolute inset-0 bg-[url('/kaf-eleague-s1-poster.png')] bg-cover bg-center opacity-20 scale-105"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-kaf-bg via-kaf-bg/80 to-transparent"></div>
        <div className="absolute inset-0 bg-dot-grid opacity-20"></div>
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-kaf-bg to-transparent"></div>
        
        <div className="relative z-10 px-6 md:px-12 w-full max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8 pt-20">
          <div>
            <div className="kaf-chip kaf-chip-yellow mb-5">
              <Trophy size={12} /> Tournament Circuit
            </div>
            <h1 className="kaf-display text-5xl md:text-7xl text-white leading-[0.95]">
              Official <span className="text-brand-gold">competition hub</span>
            </h1>
            <p className="text-slate-400 mt-6 max-w-2xl text-lg leading-relaxed">
              Browse open cups, enter live dashboards, track formats and prize pools, and keep every event route one click away.
            </p>
          </div>
          
          <div className="kaf-frame kaf-frame-yellow kaf-cut-sm w-full max-w-sm p-5">
            <div className="text-xs font-black uppercase tracking-[0.24em] text-brand-gold">Event Control</div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="border border-white/[0.06] bg-white/[0.03] p-4">
                <div className="font-display text-3xl text-brand-gold">{tournaments?.length || 0}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Events</div>
              </div>
              <div className="border border-white/[0.06] bg-white/[0.03] p-4">
                <div className="font-display text-3xl text-red-400">{tournaments?.filter((t: any) => t.status === 'live').length || 0}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Live</div>
              </div>
            </div>
            <Link href="/admin" className="mt-5 inline-flex kaf-cut-sm border border-brand-gold/30 bg-brand-gold/10 px-4 py-3 text-sm font-black uppercase tracking-wider text-brand-gold transition-colors hover:bg-brand-gold hover:text-black">
              <ShieldAlert size={16} className="mr-2" /> Admin controls
            </Link>
          </div>
        </div>
      </section>

      {/* Tournaments Grid */}
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="kaf-display text-3xl flex items-center gap-3 text-white">
            <span className="h-8 w-1 bg-brand-gold"></span>
            All Events
          </h2>
        </div>

        <div className="kaf-frame kaf-cut-sm flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
          <form className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search tournaments..."
              className="w-full border border-white/[0.08] bg-black/40 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-brand-gold"
            />
            {status && status !== 'all' && <input type="hidden" name="status" value={status} />}
          </form>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {statusTabs.map(tab => {
              const active = (!status && tab.value === 'all') || status === tab.value
              const href = `/tournaments?${new URLSearchParams({
                ...(q ? { q } : {}),
                ...(tab.value !== 'all' ? { status: tab.value } : {}),
              }).toString()}`
              return (
                <Link
                  key={tab.value}
                  href={href}
                  className={`kaf-cut-sm whitespace-nowrap border px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
                    active ? 'border-brand-gold/40 bg-brand-gold/15 text-brand-gold' : 'border-white/[0.08] bg-black/30 text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>
        </div>

        {error ? (
          <EmptyState
            Icon={ShieldAlert}
            title="Tournaments could not load"
            description="The tournament list is temporarily unavailable. Try again soon or contact staff if the issue continues."
            action={{ href: '/contact', label: 'Contact staff' }}
          />
        ) : tournaments && tournaments.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((t: any, i: number) => (
              <Link key={t.id} href={`/tournaments/${t.id}/dashboard`} className="kaf-frame kaf-cut depth-hover group hover:border-brand-gold/45 cursor-pointer relative overflow-hidden block flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-gold/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                
                {/* Image Header */}
                <div className={`h-36 w-full bg-cover bg-center border-b border-white/[0.06] relative overflow-hidden ${i % 2 === 0 ? "bg-[url('/hero-stadium.jpg')]" : "bg-[url('/kaf-eleague-s1-poster.png')]"}`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-kaf-card via-kaf-bg/45 to-transparent group-hover:via-kaf-bg/20 transition-colors"></div>
                  <div className="absolute bottom-4 left-4 rounded-lg border border-white/10 bg-black/35 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur">
                    {t.format?.replace('_', ' ') || 'Tournament'}
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`kaf-cut-sm inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black uppercase tracking-widest ${
                      t.status === 'live' ? 'bg-status-live text-white shadow-[0_0_10px_rgba(255,0,60,0.4)]' :
                      t.status === 'registration_open' ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30' :
                      'bg-slate-600 text-white'
                    }`}>
                      {t.status === 'live' && <Radio size={10} />}
                      {t.status?.replace('_', ' ') || 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-black text-white group-hover:text-brand-gold transition-colors mb-2">
                    {t.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                    <span className="flex items-center gap-1.5"><Calendar size={14}/> {t.format?.replace('_', ' ') || 'Tournament'}</span>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-2">
                    <div className="depth-stat rounded-lg p-3 flex items-center gap-3">
                      <Users size={16} className="text-slate-500" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Max Players</span>
                        <span className="text-sm font-bold text-white">{t.max_participants || 'Uncapped'}</span>
                      </div>
                    </div>
                    <div className="depth-stat rounded-lg p-3 flex items-center gap-3">
                      <Trophy size={16} className="text-brand-gold" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Prize</span>
                        <span className="text-sm font-bold text-brand-gold">{t.prize_pool || 'Glory'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Event Control</span>
                    <span className="text-xs font-black text-brand-gold opacity-0 transition-opacity group-hover:opacity-100">Open dashboard</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            Icon={GitMerge}
            title="No tournaments open yet"
            description="There are no official events listed right now. Check back soon or ask staff when the next competition starts."
            action={{ href: '/contact', label: 'Ask staff' }}
          />
        )}
      </div>
    </div>
  )
}
