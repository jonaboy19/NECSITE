import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  Trophy, Users, BarChart3, Zap, Shield, Play, Star, Flame, ArrowRight,
  Bell, MessageSquareDot, Swords, Globe, TrendingUp, ChevronRight
} from 'lucide-react'
import LiveActivityTicker from '@/components/LiveActivityTicker'
import RealtimeFeed from '@/components/RealtimeFeed'
import { fetchLiveTickers, fetchFeedActivities, fetchTournaments, fetchRankings } from '@/lib/utils'
import HeroRemotionBackground from '@/components/HeroRemotionBackground'
import { FeatureHub } from '@/components/FeatureHub'

/* ─── Public Nav ─── */
function PublicNav() {
  return (
    <nav aria-label="Public navigation" className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-16 py-4 sm:py-5 pointer-events-auto border-b border-white/5 bg-black/70 backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative w-9 h-9 rounded-lg bg-brand-cyan flex items-center justify-center text-white font-black text-sm shadow-glow-green-sm group-hover:shadow-glow-green transition-shadow">
          K
        </div>
        <span className="text-base sm:text-lg font-display font-black tracking-[0.12em] sm:tracking-[0.18em] uppercase">
          KAF<span className="text-brand-lime">CONNECT</span>
        </span>
      </Link>

      <div className="hidden lg:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {[
          { href: '/news', label: 'News' },
          { href: '/features', label: 'Features' },
          { href: '/e-league', label: 'KAF E-League' },
          { href: '/tournaments', label: 'Tournaments' },
          { href: '/clans', label: 'Clans' },
          { href: '/rankings', label: 'Rankings' },
        ].map(({ href, label }) => (
          <Link key={href} href={href} className="hover:text-white transition-colors hover:text-shadow-sm">
            {label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/auth/login"
          className="hidden xs:inline-flex text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 hover:text-white transition-colors px-2 sm:px-3 py-2">
          Login
        </Link>
        <Link href="/auth/register"
          className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.12em] sm:tracking-[0.15em] px-3 sm:px-5 py-2.5 bg-brand-cyan text-white rounded-lg hover:bg-brand-lime transition-all shadow-glow-green-sm hover:shadow-glow-green whitespace-nowrap">
          Join Arena
        </Link>
      </div>
    </nav>
  )
}

/* ─── Animated stats bar ─── */
function StatsBadge({ value, label, icon: Icon }: { value: string; label: string; icon: any }) {
  return (
    <div className="flex items-center gap-2.5 px-3 sm:px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm">
      <Icon size={14} className="text-brand-lime shrink-0" />
      <span className="text-white font-black text-sm">{value}</span>
      <span className="text-slate-500 text-[11px] font-medium uppercase tracking-widest hidden sm:block">{label}</span>
    </div>
  )
}

/* ─── Feature card ─── */
function FeatureCard({
  number, title, description, accent, icon: Icon,
}: {
  number: string; title: string; description: string; accent: string; icon: any
}) {
  return (
    <div className={`group relative p-8 lg:p-10 bg-kaf-card border border-kaf-border hover:border-opacity-60 transition-all duration-300 flex flex-col justify-between h-full min-h-[280px] overflow-hidden`}
      style={{ '--accent': accent } as any}>
      {/* Subtle corner glow */}
      <div className="absolute top-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)` }} />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${accent}18`, border: `1px solid ${accent}33` }}>
            <Icon size={20} style={{ color: accent }} />
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accent }}>
            System {number}
          </span>
        </div>
        <h3 className="text-xl font-display font-black uppercase tracking-wide mb-3 text-white">{title}</h3>
        <p className="text-slate-400 leading-relaxed text-sm font-medium">{description}</p>
      </div>

      <div className="text-8xl font-black font-mono text-white/[0.04] tracking-tighter self-end mt-6 leading-none select-none">
        {number}
      </div>
    </div>
  )
}

/* ─── Landing Page ─── */
async function LandingPage() {
  return (
    <div className="bg-kaf-bg min-h-screen text-white font-sans flex flex-col overflow-x-hidden">
      <PublicNav />

      {/* ── Hero ──────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
        {/* Video / Remotion bg */}
        <HeroRemotionBackground />

        {/* Layered overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-kaf-bg z-[1]" />
        <div className="absolute inset-0 bg-dot-grid z-[2] opacity-60" />

        {/* Green mesh glow top-left */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-[100px] bg-brand-cyan/20 z-[2] pointer-events-none" />
        {/* Blue mesh glow top-right */}
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full blur-[100px] bg-brand-blue/15 z-[2] pointer-events-none" />

        {/* Hero content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 pb-14 sm:pb-20 pt-36 sm:pt-40 flex flex-col gap-8 sm:gap-10 pointer-events-auto">

          {/* Status pill */}
          <div className="flex items-center gap-2.5 w-fit max-w-full border border-brand-cyan/30 bg-brand-cyan/8 rounded-full px-3 sm:px-4 py-2 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse shrink-0" />
            <span className="text-brand-lime font-mono text-[10px] sm:text-[11px] tracking-[0.18em] sm:tracking-[0.35em] uppercase font-bold truncate">
              System Online - KAF Arena v2.0
            </span>
          </div>

          {/* Headline */}
          <div className="max-w-4xl">
            <h1 className="font-display font-black text-[clamp(3rem,15vw,8rem)] leading-[0.9] tracking-normal uppercase">
              <span className="text-white">KAF</span>
              <br />
              <span className="text-transparent" style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.2)' }}>
                ESPORTS
              </span>{' '}
              <span className="text-brand-lime">HUB</span>
            </h1>
            <p className="mt-6 text-slate-400 text-lg leading-relaxed max-w-xl font-medium">
              A simple home for eFootball tournaments, clans, rankings, match reports, videos, and community tools.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-3 items-center">
            <StatsBadge value="2,400+" label="Active Players" icon={Users} />
            <StatsBadge value="180+" label="Tournaments Run" icon={Trophy} />
            <StatsBadge value="12K+" label="Matches Played" icon={Swords} />
            <StatsBadge value="58" label="Countries" icon={Globe} />
          </div>

          {/* CTA row */}
          <div className="grid w-full gap-3 sm:flex sm:flex-wrap sm:gap-4 sm:items-center">
            <Link href="/auth/register"
              className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-4 bg-brand-cyan text-white font-black text-sm uppercase tracking-[0.12em] rounded-xl hover:bg-brand-lime transition-all shadow-glow-green hover:shadow-glow-green">
              Start Competing <ArrowRight size={16} />
            </Link>
            <Link href="/tournaments"
              className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-4 border border-white/15 text-white font-black text-sm uppercase tracking-[0.12em] rounded-xl hover:bg-white/6 hover:border-white/30 transition-all backdrop-blur-sm">
              <Play size={16} className="text-slate-400" /> Browse Tournaments
            </Link>
            <Link href="/features"
              className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-4 border border-brand-cyan/30 text-brand-lime font-black text-sm uppercase tracking-[0.12em] rounded-xl hover:bg-brand-cyan/10 hover:border-brand-cyan/50 transition-all backdrop-blur-sm">
              See All Features
            </Link>
          </div>
        </div>

        {/* Bottom marquee ticker */}
        <div className="relative z-10 border-t border-white/6 bg-black/50 backdrop-blur-xl overflow-hidden py-3.5 flex pointer-events-none">
          <div className="animate-marquee whitespace-nowrap flex gap-16 text-[10px] font-mono tracking-[0.35em] text-brand-lime/70 uppercase">
            {Array(8).fill(['Global Matchmaking', 'Live Video Highlights', 'Clan War Protocol', 'E-League Season 2', 'ELO Rankings']).flat().map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Cards ─────────────────────────── */}
      <section className="py-20 md:py-28 px-6 lg:px-16 w-full max-w-7xl mx-auto">
        <FeatureHub
          compact
          limit={6}
          title="Start with what you need"
          subtitle="Players, clan leaders, and staff can get to the right tool without learning the whole platform first."
        />
      </section>

      <section className="py-20 md:py-28 px-6 lg:px-16 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-kaf-border to-transparent" />
          <h2 className="text-[11px] font-bold font-mono uppercase tracking-[0.4em] text-slate-500 whitespace-nowrap">Core Architecture</h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-kaf-border to-transparent" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-kaf-border rounded-2xl overflow-hidden border border-kaf-border">
          <FeatureCard
            number="01"
            title="Live Video Synthesis"
            description="Powered by Remotion. Real-time match data is compiled into cinematic highlights server-side, instantly upon match resolution."
            accent="#22c55e"
            icon={Play}
          />
          <FeatureCard
            number="02"
            title="Relentless ELO Engine"
            description="Global rankings mathematically forged in competition. Every match dynamically shifts the balance of power across all regions."
            accent="#f59e0b"
            icon={TrendingUp}
          />
          <FeatureCard
            number="03"
            title="Clan War Protocol"
            description="Mobilize your organization. Issue direct challenges, manage your roster, and conquer the leaderboard as a unified front."
            accent="#3b82f6"
            icon={Shield}
          />
          <div className="md:col-span-2 lg:col-span-3 group relative p-8 lg:p-12 bg-kaf-card hover:bg-kaf-elevated transition-colors flex flex-col lg:flex-row gap-8 items-center overflow-hidden">
            {/* Glow behind */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/[0.06] via-transparent to-brand-blue/[0.06] pointer-events-none" />
            <div className="relative z-10 flex-1">
              <div className="kaf-badge kaf-badge-green mb-4">
                <Zap size={9} /> Featured
              </div>
              <h3 className="text-3xl font-display font-black uppercase tracking-tight mb-3 text-white">
                Tournament Infrastructure
              </h3>
              <p className="text-slate-400 leading-relaxed max-w-xl font-medium">
                From registration to bracket generation and dispute resolution - the complete competitive layer for any scale of tournament.
              </p>
            </div>
            <Link href="/auth/register"
              className="relative z-10 w-full justify-center sm:w-auto shrink-0 inline-flex items-center gap-2 px-8 sm:px-10 py-4 bg-brand-cyan text-white font-black text-sm uppercase tracking-[0.12em] rounded-xl hover:bg-brand-lime transition-all shadow-glow-green hover:shadow-glow-green whitespace-nowrap">
              Enter the Arena <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why KAF ───────────────────────────────── */}
      <section className="py-16 px-6 lg:px-16 max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Globe, label: 'Multi-Region', desc: 'Compete across Africa, Europe, MENA, Asia & Americas', accent: 'var(--brand-blue)' },
            { icon: BarChart3, label: 'Live Stats', desc: 'Real-time ELO shifts, win rates, and match analytics', accent: 'var(--brand-gold)' },
            { icon: Star, label: 'Verified Clans', desc: 'Official clan pages, war records, and roster management', accent: '#a78bfa' },
          ].map(({ icon: Icon, label, desc, accent }) => (
            <div key={label} className="flex items-start gap-4 p-6 rounded-2xl bg-kaf-card border border-kaf-border hover:border-kaf-border-strong transition-colors group">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                style={{ background: `${accent}18`, border: `1px solid ${accent}33` }}>
                <Icon size={20} style={{ color: accent }} />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm mb-1">{label}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ────────────────────────────────── */}
      <footer className="mt-auto border-t border-kaf-border px-6 lg:px-16 py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
          <div>
            <div className="text-xl font-display font-black tracking-[0.15em] uppercase mb-2">
              KAF<span className="text-brand-lime">CONNECT</span>
            </div>
            <p className="text-slate-600 text-xs max-w-xs leading-relaxed">
              The ultimate competitive eFootball platform. Tournaments, clans, rankings & live highlights.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
            {[
              { title: 'Compete', links: [{ href: '/tournaments', l: 'Tournaments' }, { href: '/e-league', l: 'KAF E-League' }, { href: '/rankings', l: 'Rankings' }, { href: '/matches', l: 'Match Center' }] },
              { title: 'Community', links: [{ href: '/clans', l: 'Clans' }, { href: '/players', l: 'Players' }, { href: '/news', l: 'News' }, { href: '/free-agents', l: 'Free Agents' }] },
              { title: 'Platform', links: [{ href: '/features', l: 'Start Here' }, { href: '/how-it-works', l: 'How It Works' }, { href: '/rules', l: 'Rules' }, { href: '/contact', l: 'Contact' }, { href: '/roles', l: 'Roles' }] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 mb-3">{title}</h5>
                <ul className="space-y-2">
                  {links.map(({ href, l }) => (
                    <li key={l}><Link href={href} className="text-slate-500 hover:text-white text-xs transition-colors">{l}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-kaf-border flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[11px] text-slate-600 font-mono uppercase tracking-widest">
            (c) 2026 KAF E-League - Architecture v2.0
          </p>
          <p className="text-[11px] text-slate-700 font-mono uppercase tracking-widest">
            All rights reserved
          </p>
        </div>
      </footer>
    </div>
  )
}

/* ─── Authenticated Feed ─── */
async function AuthenticatedFeed() {
  const [liveTickers, feedActivities, tournaments, rankings] = await Promise.all([
    fetchLiveTickers(),
    fetchFeedActivities(6),
    fetchTournaments(4),
    fetchRankings(10),
  ])

  return (
    <div className="flex flex-col w-full h-full pb-24 lg:pb-0">
      {/* Mobile Header */}
      <div className="w-full bg-kaf-panel/95 border-b border-kaf-border px-4 py-3 lg:hidden sticky top-0 z-40 backdrop-blur-xl flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/kaf-logo.png" alt="KAF" width={28} height={28} className="object-contain" />
          <span className="font-display font-black text-lg text-white tracking-wide">
            KAF<span className="text-brand-lime">CONNECT</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/notifications" aria-label="Notifications" className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/8 transition-all">
            <Bell size={20} />
          </Link>
          <Link href="/messages" aria-label="Messages" className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/8 transition-all">
            <MessageSquareDot size={20} />
          </Link>
        </div>
      </div>

      <LiveActivityTicker items={liveTickers.map(t => t.message)} />

      <div className="flex-1 overflow-y-auto no-scrollbar pt-5">
          <div className="max-w-2xl mx-auto w-full px-4 md:px-0 flex flex-col gap-8">
          <FeatureHub
            compact
            limit={4}
            title="Quick start"
            subtitle="The most common actions for your account are available here."
          />

          {/* Featured Tournaments */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="kaf-section-title text-base">
                <Flame className="text-brand-lime" size={18} /> Featured Events
              </h2>
              <Link href="/tournaments" className="text-[11px] text-brand-lime font-bold hover:underline flex items-center gap-1 uppercase tracking-wider">
                View All <ArrowRight size={12} />
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4 md:mx-0 md:px-0 snap-x">
              {tournaments.length === 0 ? (
                <div className="w-full py-12 rounded-2xl bg-kaf-card border border-dashed border-kaf-border text-center">
                  <Trophy size={32} className="text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No tournaments yet. Check back soon!</p>
                </div>
              ) : tournaments.map((t: any, i: number) => (
                <Link
                  href={`/tournaments/${t.id}/dashboard`}
                  key={t.id || i}
                  className="relative w-72 h-44 rounded-2xl overflow-hidden flex-shrink-0 group cursor-pointer border border-kaf-border hover:border-brand-cyan/60 transition-all shadow-card hover:shadow-card-hover snap-center"
                >
                  <div
                    className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 ${i % 2 === 0 ? "bg-[url('/kaf-eleague-s1-poster.png')]" : "bg-[url('/hero-stadium.jpg')]"}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-kaf-bg via-kaf-bg/70 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-kaf-bg/60 to-transparent" />

                  {t.status === 'live' && (
                    <div className="absolute top-3 left-3 live-badge px-2.5 py-1 rounded-md text-[9px] font-black bg-status-live text-white tracking-widest uppercase flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                    </div>
                  )}
                  {t.status === 'registration_open' && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[9px] font-black bg-brand-cyan text-white tracking-widest uppercase">
                      Open
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-sm font-black text-white leading-tight truncate uppercase tracking-wide">{t.title}</h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-[10px] text-brand-lime font-bold uppercase tracking-wider">
                        <Trophy size={10} /> {t.format || '1v1'}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <Users size={10} /> {t.max_participants || 64} Slots
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <RealtimeFeed initialActivities={feedActivities} />

          {/* Rising Stars */}
          <div className="kaf-card rounded-2xl p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="kaf-section-title text-sm">
                <Star size={15} className="text-brand-gold" /> Rising Stars
              </h3>
              <Link href="/rankings" className="text-[11px] text-brand-lime hover:underline font-bold uppercase tracking-wider">
                Rankings
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {rankings.length === 0 ? (
                <p className="text-slate-500 text-sm py-4 text-center w-full">No rankings yet.</p>
              ) : rankings.map((item: any, i: number) => (
                <div
                  key={item.id || i}
                  className="w-28 flex-shrink-0 rounded-xl bg-kaf-elevated border border-kaf-border p-3 flex flex-col items-center text-center hover:border-brand-cyan/40 transition-all cursor-pointer group hover:-translate-y-1"
                >
                  <div className="relative mb-2.5">
                    <div
                      className="w-12 h-12 rounded-full bg-slate-800 bg-cover border-2 border-transparent group-hover:border-brand-cyan transition-colors"
                      style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${item.profiles?.username || `p${i}`}')` }}
                    />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] border border-kaf-border
                      ${i === 0 ? 'bg-brand-gold text-black' : i === 1 ? 'bg-slate-400 text-black' : i === 2 ? 'bg-amber-700 text-white' : 'bg-kaf-panel text-white'}`}>
                      {i + 1}
                    </div>
                  </div>
                  <h4 className="font-bold text-xs text-white truncate w-full group-hover:text-brand-lime transition-colors">
                    {item.profiles?.username || `Player_${i + 1}`}
                  </h4>
                  <p className="text-[9px] text-slate-500 mt-1 font-bold uppercase tracking-widest">
                    {item.rating || '0'} <span className="text-brand-gold">pts</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions row */}
          <div className="grid grid-cols-2 gap-3 pb-4">
            <Link href="/clans/create"
              className="flex items-center gap-3 p-4 rounded-2xl bg-kaf-card border border-kaf-border hover:border-brand-cyan/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-brand-cyan/15 border border-brand-cyan/25 flex items-center justify-center shrink-0 group-hover:bg-brand-cyan/25 transition-colors">
                <Shield size={18} className="text-brand-lime" />
              </div>
              <div>
                <p className="text-white font-black text-sm">Create Clan</p>
                <p className="text-slate-500 text-[11px]">Start your org</p>
              </div>
            </Link>
            <Link href="/free-agents"
              className="flex items-center gap-3 p-4 rounded-2xl bg-kaf-card border border-kaf-border hover:border-brand-blue/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/15 border border-brand-blue/25 flex items-center justify-center shrink-0 group-hover:bg-brand-blue/25 transition-colors">
                <Users size={18} className="text-brand-blue-light" />
              </div>
              <div>
                <p className="text-white font-black text-sm">Free Agents</p>
                <p className="text-slate-500 text-[11px]">Find players</p>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

/* ─── Page router ─── */
export default async function Home() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user ? <AuthenticatedFeed /> : <LandingPage />
}
