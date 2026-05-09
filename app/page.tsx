import Image from 'next/image'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  Activity,
  ArrowRight,
  Award,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Crown,
  Eye,
  Flag,
  Flame,
  Gamepad2,
  Globe,
  Grid2X2,
  Handshake,
  MessageSquareDot,
  Newspaper,
  Radio,
  Search,
  Shield,
  Swords,
  Trophy,
  UserRound,
  Users,
  Zap,
} from 'lucide-react'
import LiveActivityTicker from '@/components/LiveActivityTicker'
import RealtimeFeed from '@/components/RealtimeFeed'
import { FeatureHub } from '@/components/FeatureHub'
import { fetchFeedActivities, fetchLiveTickers, fetchRankings, fetchTournaments } from '@/lib/utils'

const publicNav = [
  { href: '/tournaments', label: 'Tournaments' },
  { href: '/clans', label: 'Clans' },
  { href: '/transfers', label: 'Transfers' },
  { href: '/scouting', label: 'Scouting' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/news', label: 'News' },
]

function PublicNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-[#070908]/82 backdrop-blur-2xl">
      <nav className="mx-auto flex h-18 max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-lime/20 bg-brand-lime/10">
            <Image src="/kaf-logo.png" alt="KAFConnect" width={30} height={30} className="object-contain" />
          </span>
          <span className="leading-none">
            <span className="block text-base font-black tracking-wide text-white">KAF<span className="text-brand-lime">Connect</span></span>
            <span className="mt-1 block font-mono text-[9px] font-black uppercase tracking-[0.32em] text-slate-500">eFootball operations</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {publicNav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-xl px-3.5 py-2.5 text-xs font-black uppercase tracking-[0.11em] text-slate-400 transition-colors hover:bg-white/[0.045] hover:text-white">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/features" aria-label="Search features" className="hidden h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-slate-300 transition-colors hover:border-brand-lime/35 hover:text-brand-lime sm:flex">
            <Search size={17} />
          </Link>
          <Link href="/dashboard" className="hidden h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 font-mono text-[11px] font-black uppercase tracking-wider text-slate-200 transition-colors hover:border-brand-lime/35 hover:text-brand-lime md:flex">
            <Grid2X2 size={15} /> Dashboard
          </Link>
          <Link href="/auth/login" className="flex h-11 items-center gap-2 rounded-xl bg-brand-lime px-4 text-xs font-black uppercase tracking-[0.12em] text-[#041006] transition-colors hover:bg-brand-neon">
            <UserRound size={15} /> Sign in
          </Link>
        </div>
      </nav>
    </header>
  )
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/24 p-5">
      <div className="text-3xl font-black tracking-tight text-white">{value}</div>
      <div className="mt-2 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{label}</div>
    </div>
  )
}

function OpsRow({ icon: Icon, title, body, tone = 'green' }: { icon: any; title: string; body: string; tone?: 'green' | 'gold' | 'blue' | 'red' }) {
  const color = tone === 'gold' ? 'text-brand-gold' : tone === 'blue' ? 'text-brand-blue-light' : tone === 'red' ? 'text-red-300' : 'text-brand-lime'
  const border = tone === 'gold' ? 'border-brand-gold/25 bg-brand-gold/8' : tone === 'blue' ? 'border-brand-blue/25 bg-brand-blue/8' : tone === 'red' ? 'border-red-400/25 bg-red-400/8' : 'border-brand-lime/25 bg-brand-lime/8'
  return (
    <div className="flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-colors hover:border-white/[0.14]">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${border} ${color}`}>
        <Icon size={19} />
      </span>
      <span>
        <span className="block text-sm font-black text-white">{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-slate-500">{body}</span>
      </span>
    </div>
  )
}

function PublicLanding() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-kaf-bg text-white">
      <PublicNav />

      <section className="kaf-stadium-bg relative overflow-hidden pt-24">
        <div className="absolute inset-0 bg-line-grid opacity-35" />
        <div className="relative z-10 mx-auto grid min-h-[860px] w-full max-w-[1500px] items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_470px] lg:px-10">
          <div className="max-w-4xl">
            <div className="mb-7 flex flex-wrap gap-3">
              <span className="kaf-chip kaf-chip-green"><span className="h-2 w-2 rounded-full bg-brand-lime" /> Live tournament operations</span>
              <span className="kaf-chip"><Globe size={13} /> Community ready</span>
            </div>

            <h1 className="kaf-display max-w-5xl text-[clamp(3.6rem,8.2vw,8.4rem)] text-white">
              Run eFootball like a real esport.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              KAFConnect brings clans, tournaments, scouting, transfers, match rooms, disputes, announcements and rankings into one serious operations hub.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/tournaments" className="btn-primary">
                Open tournaments <ArrowRight size={16} />
              </Link>
              <Link href="/clans" className="btn-secondary">
                Manage clans <Shield size={16} />
              </Link>
              <Link href="/features" className="btn-secondary">
                Explore system <Grid2X2 size={16} />
              </Link>
            </div>

            <div className="mt-12 grid max-w-4xl gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric value="150+" label="player events" />
              <Metric value="24/7" label="match rooms" />
              <Metric value="Clan" label="first workflow" />
              <Metric value="Live" label="admin control" />
            </div>
          </div>

          <aside className="kaf-frame p-5 lg:self-center">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="kaf-panel-title">Control stack</div>
                <h2 className="mt-2 text-2xl font-black text-white">Operations Center</h2>
              </div>
              <span className="rounded-full border border-brand-lime/25 bg-brand-lime/10 px-3 py-1 font-mono text-[10px] font-black uppercase tracking-widest text-brand-lime">Online</span>
            </div>
            <div className="space-y-3">
              <OpsRow icon={Trophy} title="Tournament lifecycle" body="Creation wizard, check-ins, bracket state, match deadlines and live admin visibility." />
              <OpsRow icon={Shield} title="Clan headquarters" body="Roster, roles, contracts, recruitment, tactics and internal operational history." tone="blue" />
              <OpsRow icon={Handshake} title="Transfer market" body="Player listings, scouting notes, offers, negotiations and transfer timelines." tone="gold" />
              <OpsRow icon={Swords} title="Match rooms" body="Readiness, lineup lock, proof upload, disputes and referee decisions." tone="red" />
            </div>
            <Link href="/dashboard" className="mt-5 flex items-center justify-between rounded-2xl border border-brand-lime/25 bg-brand-lime/10 p-4 text-sm font-black text-brand-lime transition-colors hover:bg-brand-lime hover:text-[#041006]">
              Enter dashboard <ChevronRight size={17} />
            </Link>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1500px] gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-10">
        <div>
          <div className="kaf-panel-title">Built for communities</div>
          <h2 className="mt-4 max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl">One platform for the work people now do across chats and spreadsheets.</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: CalendarDays, title: 'Scheduling', body: 'Registration windows, check-ins, fixture deadlines and season phases.' },
            { icon: Eye, title: 'Scouting', body: 'Filter talent by region, platform, role, activity and playstyle.' },
            { icon: Award, title: 'Reputation', body: 'Track reliability, awards, trophies, penalties and career history.' },
            { icon: Radio, title: 'Live operations', body: 'Monitor late matches, disputes, proofs and active tournament rooms.' },
          ].map((item) => (
            <div key={item.title} className="kaf-card p-5">
              <item.icon className="text-brand-lime" size={22} />
              <h3 className="mt-5 text-lg font-black text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1500px] px-4 pb-20 sm:px-6 lg:px-10">
        <div className="grid gap-5 lg:grid-cols-2">
          <Link href="/e-league" className="kaf-frame kaf-frame-green p-8 transition-transform hover:-translate-y-1">
            <span className="kaf-chip kaf-chip-green"><Crown size={13} /> Flagship league</span>
            <h3 className="mt-8 text-5xl font-black tracking-tight text-brand-lime">KAF E-League</h3>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-400">Season ecosystem with players, draft flow, rankings, match rooms, broadcasts and admin workflows.</p>
            <span className="mt-8 inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">Enter league <ArrowRight size={16} /></span>
          </Link>
          <Link href="/tournaments" className="kaf-frame kaf-frame-yellow p-8 transition-transform hover:-translate-y-1">
            <span className="kaf-chip kaf-chip-yellow"><Trophy size={13} /> Open circuit</span>
            <h3 className="mt-8 text-5xl font-black tracking-tight text-brand-gold">Tournex</h3>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-400">Fast monthly cups with check-ins, live bracket progression, proof handling and dispute resolution.</p>
            <span className="mt-8 inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">View tournaments <ArrowRight size={16} /></span>
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/[0.07] px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="text-lg font-black text-white">KAF<span className="text-brand-lime">Connect</span></div>
            <div className="mt-1 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">eFootball esports operations</div>
          </div>
          <div className="text-xs text-slate-600">Built for clan tournaments, community seasons and competitive history.</div>
        </div>
      </footer>
    </div>
  )
}

function QuickLink({ href, icon: Icon, label, detail }: { href: string; icon: any; label: string; detail: string }) {
  return (
    <Link href={href} className="kaf-card flex items-center gap-4 p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-lime/20 bg-brand-lime/10 text-brand-lime">
        <Icon size={20} />
      </span>
      <span>
        <span className="block text-sm font-black text-white">{label}</span>
        <span className="mt-1 block text-xs text-slate-500">{detail}</span>
      </span>
    </Link>
  )
}

async function AuthenticatedFeed() {
  const [liveTickers, feedActivities, tournaments, rankings] = await Promise.all([
    fetchLiveTickers(),
    fetchFeedActivities(6),
    fetchTournaments(4),
    fetchRankings(8),
  ])

  return (
    <div className="kaf-app-page min-h-full pb-24 lg:pb-0">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/[0.07] bg-[#070908]/86 px-4 py-3 backdrop-blur-2xl lg:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/kaf-logo.png" alt="KAF" width={28} height={28} className="object-contain" />
          <span className="text-lg font-black text-white">KAF<span className="text-brand-lime">Connect</span></span>
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/notifications" aria-label="Notifications" className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-white/[0.05] hover:text-white">
            <Bell size={20} />
          </Link>
          <Link href="/messages" aria-label="Messages" className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-white/[0.05] hover:text-white">
            <MessageSquareDot size={20} />
          </Link>
        </div>
      </div>

      <LiveActivityTicker items={liveTickers.map(t => t.message)} />

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-6">
        <section className="kaf-page-hero rounded-[20px] border border-white/[0.08] p-6 sm:p-8">
          <div className="relative z-10">
            <div className="flex flex-wrap gap-2">
              <span className="kaf-chip kaf-chip-green"><Activity size={13} /> Command home</span>
              <span className="kaf-chip"><CheckCircle2 size={13} /> Live data</span>
            </div>
            <h1 className="mt-7 max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl">Your esports operations desk.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Jump into tournament work, clan management, scouting, match reporting and community communication from one place.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <QuickLink href="/tournaments" icon={Trophy} label="Tournaments" detail="Join or host events" />
              <QuickLink href="/clans" icon={Shield} label="Clan HQ" detail="Roster and operations" />
              <QuickLink href="/scouting" icon={Eye} label="Scouting" detail="Find players" />
              <QuickLink href="/matches/report" icon={Flag} label="Report" detail="Submit results" />
            </div>
          </div>
        </section>

        <FeatureHub compact limit={6} title="Operations shortcuts" subtitle="The most used KAFConnect systems for players, clan staff and tournament admins." />

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="kaf-section-title text-lg"><Flame className="text-brand-gold" size={18} /> Featured Events</h2>
            <Link href="/tournaments" className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-brand-lime">View all <ArrowRight size={13} /></Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {tournaments.length === 0 ? (
              <div className="kaf-card p-8 text-center text-sm text-slate-500 sm:col-span-2">No tournaments are configured yet.</div>
            ) : tournaments.map((t: any, index: number) => (
              <Link key={t.id || index} href={`/tournaments/${t.id}/dashboard`} className="kaf-card min-h-44 p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="kaf-chip kaf-chip-green">{t.status || 'event'}</span>
                  <Trophy size={20} className="text-brand-gold" />
                </div>
                <h3 className="mt-8 text-xl font-black text-white">{t.title}</h3>
                <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-slate-500">
                  <span>{t.format || '1v1'}</span>
                  <span>{t.max_participants || 64} slots</span>
                  <span>{t.region || 'Global'}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <RealtimeFeed initialActivities={feedActivities} />

        <section className="kaf-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="kaf-section-title text-base"><Award size={16} className="text-brand-gold" /> Ranking Watch</h3>
            <Link href="/rankings" className="text-xs font-black uppercase tracking-wider text-brand-lime">Rankings</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {rankings.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500 sm:col-span-2">No rankings yet.</p>
            ) : rankings.map((item: any, index: number) => (
              <div key={item.id || index} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lime/10 text-sm font-black text-brand-lime">#{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-black text-white">{item.profiles?.username || `Player_${index + 1}`}</div>
                  <div className="text-xs text-slate-500">{item.rating || 0} rating points</div>
                </div>
                <Zap size={16} className="text-brand-gold" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default async function Home() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user ? <AuthenticatedFeed /> : <PublicLanding />
}
