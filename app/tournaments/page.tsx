import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Trophy, Calendar, Plus, Users, GitMerge, ShieldAlert, Search } from 'lucide-react'
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
    <div className="flex flex-col w-full pb-20">
      <PublicHeader />
      {/* Hero Section */}
      <section className="relative w-full h-[30vh] min-h-[250px] bg-kaf-panel overflow-hidden border-b border-kaf-border flex items-center">
        <div className="absolute inset-0 bg-[url('/kaf-eleague-s1-poster.png')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-kaf-bg via-kaf-bg/90 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-kaf-bg via-transparent to-transparent"></div>
        
        <div className="relative z-10 px-6 md:px-12 w-full max-w-5xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-bold uppercase tracking-widest mb-4">
              <Trophy size={14} className="text-brand-cyan" /> Competitions
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-white mb-2 leading-tight">
              PROVING <span className="text-brand-cyan drop-shadow-[0_0_15px_rgba(25,133,59,0.35)]">GROUNDS</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-md">
              Compete in official KAFConnect leagues, weekend cups, and draft tournaments.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/admin" className="rounded-xl bg-kaf-card border border-kaf-border p-4 text-white hover:bg-white/5 transition-colors flex items-center gap-2">
              <ShieldAlert size={20} className="text-brand-gold" />
            </Link>
          </div>
        </div>
      </section>

      {/* Tournaments Grid */}
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-display font-black uppercase tracking-wider flex items-center gap-2 text-white">
            <span className="w-2 h-8 bg-brand-cyan rounded-full"></span>
            All Events
          </h2>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-kaf-border bg-kaf-card p-3 sm:flex-row sm:items-center sm:justify-between">
          <form className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search tournaments..."
              className="w-full rounded-xl border border-kaf-border bg-kaf-bg py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-brand-cyan"
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
                  className={`whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
                    active ? 'border-brand-cyan/40 bg-brand-cyan/20 text-brand-lime' : 'border-kaf-border bg-kaf-bg text-slate-400 hover:text-white'
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
              <Link key={t.id} href={`/tournaments/${t.id}/dashboard`} className="kaf-card rounded-2xl border border-kaf-border group hover:border-brand-cyan/50 transition-all cursor-pointer relative overflow-hidden block flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-cyan/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Image Header */}
                <div className={`h-32 w-full bg-cover bg-center border-b border-kaf-border relative ${i % 2 === 0 ? "bg-[url('/hero-stadium.jpg')]" : "bg-[url('/kaf-eleague-s1-poster.png')]"}`}>
                  <div className="absolute inset-0 bg-kaf-bg/40 group-hover:bg-transparent transition-colors"></div>
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                      t.status === 'live' ? 'bg-status-live text-white shadow-[0_0_10px_rgba(255,0,60,0.4)]' :
                      t.status === 'registration_open' ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30' :
                      'bg-slate-600 text-white'
                    }`}>
                      {t.status?.replace('_', ' ') || 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-black text-white group-hover:text-brand-cyan transition-colors mb-2">
                    {t.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                    <span className="flex items-center gap-1.5"><Calendar size={14}/> {t.format?.replace('_', ' ') || 'Tournament'}</span>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-2">
                    <div className="bg-kaf-bg rounded-lg p-3 border border-kaf-border flex items-center gap-3">
                      <Users size={16} className="text-slate-500" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Max Players</span>
                        <span className="text-sm font-bold text-white">{t.max_participants || 'Uncapped'}</span>
                      </div>
                    </div>
                    <div className="bg-kaf-bg rounded-lg p-3 border border-kaf-border flex items-center gap-3">
                      <Trophy size={16} className="text-brand-gold" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Prize</span>
                        <span className="text-sm font-bold text-brand-gold">{t.prize_pool || 'Glory'}</span>
                      </div>
                    </div>
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
