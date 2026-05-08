import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Trophy, Users, BarChart3, Zap, Shield, ChevronRight, Play, Star, Flame, ArrowRight, Bell, MessageSquareDot } from 'lucide-react'
import LiveActivityTicker from '@/components/LiveActivityTicker'
import RealtimeFeed from '@/components/RealtimeFeed'
import { fetchLiveTickers, fetchFeedActivities, fetchTournaments, fetchRankings } from '@/lib/utils'
import AnimatedStats from '@/components/AnimatedStats'

/* ─── Public Header for guests ─── */
function PublicNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 py-4 bg-kaf-bg/80 backdrop-blur-xl border-b border-kaf-border/50">
      <Link href="/" className="flex items-center gap-3 group">
        <img src="/kaf-logo.png" alt="KAFConnect" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
        <span className="text-xl font-black tracking-widest text-brand-cyan">KAFCONNECT</span>
      </Link>
      <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
        <Link href="/tournaments" className="hover:text-white transition-colors">Tournaments</Link>
        <Link href="/clans" className="hover:text-white transition-colors">Clans</Link>
        <Link href="/rankings" className="hover:text-white transition-colors">Rankings</Link>
        <Link href="/news" className="hover:text-white transition-colors">News</Link>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/auth/login" className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-300 border border-kaf-border hover:text-white hover:border-white/20 transition-all">
          Sign In
        </Link>
        <Link href="/auth/register" className="px-5 py-2.5 rounded-xl text-sm font-black bg-brand-cyan text-kaf-bg hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,102,0.3)]">
          Join Now
        </Link>
      </div>
    </nav>
  )
}

/* ─── Public Landing Page (for guests) ─── */
function LandingPage() {
  return (
    <>
      <PublicNav />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background layers */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-kaf-bg via-kaf-bg/95 to-kaf-bg"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,102,0.08)_0%,transparent_70%)]"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-sm">
            <Zap size={14} /> Season 2 Now Live
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-6 leading-[0.9]">
            YOUR <span className="text-brand-cyan drop-shadow-[0_0_30px_rgba(0,255,102,0.4)]">ARENA</span>
            <br />
            <span className="text-slate-400">AWAITS</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            The ultimate esports operating system. Compete in tournaments, build your clan, climb the global rankings, and prove you're the best.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register" className="group px-10 py-4 rounded-xl bg-brand-cyan text-kaf-bg font-black text-lg hover:bg-white hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,255,102,0.3)] flex items-center gap-3">
              Enter the Arena <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/tournaments" className="px-10 py-4 rounded-xl border border-kaf-border text-slate-300 font-bold text-lg hover:border-white/30 hover:text-white transition-all">
              Browse Events
            </Link>
          </div>

          <AnimatedStats stats={[
            { end: 1000, suffix: '+', label: 'Players', color: '' },
            { end: 50, suffix: '+', label: 'Tournaments', color: 'text-brand-cyan' },
            { end: 5, prefix: '€', suffix: 'K+', label: 'Prize Pools', color: 'text-brand-gold' },
          ]} />
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-slate-600 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 rounded-full bg-brand-cyan"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-6 bg-kaf-panel border-y border-kaf-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
              EVERYTHING YOU NEED TO <span className="text-brand-cyan">COMPETE</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">One platform. Every tool. Built for competitive gamers who take their craft seriously.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Trophy, title: 'Tournaments', desc: 'Single elimination, double elimination, leagues, and custom brackets with automated seeding.', color: 'text-brand-gold' },
              { icon: Shield, title: 'Clan System', desc: 'Build your organization, recruit players, manage lineups, and compete as a team.', color: 'text-purple-400' },
              { icon: BarChart3, title: 'Rankings & MMR', desc: 'Global leaderboards powered by Elo-based matchmaking and performance tracking.', color: 'text-brand-cyan' },
              { icon: Users, title: 'Scrims & Drafts', desc: 'Find opponents, organize practice matches, and draft dream teams.', color: 'text-blue-400' },
              { icon: Play, title: 'Live Broadcasts', desc: 'Integrated live streaming and real-time match ticker for spectators.', color: 'text-status-live' },
              { icon: Star, title: 'Player Profiles', desc: 'Detailed stats, match history, and social connections all in one place.', color: 'text-amber-400' },
            ].map((feature, i) => (
              <div key={i} className="group p-6 rounded-2xl bg-kaf-card/50 border border-kaf-border hover:border-white/10 transition-all hover:-translate-y-1 cursor-default">
                <div className={`w-12 h-12 rounded-xl bg-kaf-bg border border-kaf-border flex items-center justify-center mb-4 ${feature.color} group-hover:scale-110 transition-transform`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-black text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,102,0.05)_0%,transparent_60%)]"></div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
            READY TO <span className="text-brand-cyan">DOMINATE</span>?
          </h2>
          <p className="text-slate-400 mb-10 text-lg">
            Join the fastest growing eFootball esports community. Create your account in seconds.
          </p>
          <Link href="/auth/register" className="inline-flex items-center gap-3 px-10 py-5 rounded-xl bg-brand-cyan text-kaf-bg font-black text-lg hover:bg-white hover:scale-105 transition-all shadow-[0_0_40px_rgba(0,255,102,0.3)]">
            Create Free Account <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-kaf-border bg-kaf-panel px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/kaf-logo.png" alt="KAF" className="w-8 h-8" />
                <span className="font-black text-brand-cyan tracking-widest">KAFCONNECT</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">The home of competitive eFootball esports. Powered by KAF E-League.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/tournaments" className="hover:text-white transition-colors">Tournaments</Link></li>
                <li><Link href="/clans" className="hover:text-white transition-colors">Clans</Link></li>
                <li><Link href="/rankings" className="hover:text-white transition-colors">Rankings</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Community</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/news" className="hover:text-white transition-colors">News</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/sponsors" className="hover:text-white transition-colors">Partners</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-kaf-border pt-8 text-center text-xs text-slate-600 uppercase tracking-widest">
            © 2026 KAFConnect • All Rights Reserved
          </div>
        </div>
      </footer>
    </>
  )
}

/* ─── Logged-In Feed (existing dashboard-like home) ─── */
async function AuthenticatedFeed() {
  const liveTickers = await fetchLiveTickers()
  const feedActivities = await fetchFeedActivities(6)
  const tournaments = await fetchTournaments(4)
  const rankings = await fetchRankings(10)

  return (
    <div className="flex flex-col w-full h-full pb-24 lg:pb-0">
      {/* Mobile Header - Instagram style */}
      <div className="w-full bg-kaf-bg/90 border-b border-kaf-border/50 px-4 py-3 lg:hidden sticky top-0 z-40 backdrop-blur-md flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <img src="/kaf-logo.png" alt="KAF" className="w-7 h-7 object-contain" />
          <h1 className="font-display font-black text-lg text-white tracking-wide">KAF<span className="text-brand-cyan">CONNECT</span></h1>
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/notifications"
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <Bell size={20} />
          </Link>
          <Link href="/messages"
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <MessageSquareDot size={20} />
            {/* Unread badge — populated client side via useUnreadCount */}
          </Link>
        </div>
      </div>

      <LiveActivityTicker items={liveTickers.map(t => t.message)} />

      <div className="flex-1 overflow-y-auto no-scrollbar pt-4">
        <div className="max-w-3xl mx-auto w-full px-4 md:px-0 flex flex-col gap-8">
          
          {/* Featured Events Row */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-white uppercase tracking-wider flex items-center gap-2">
                <Flame className="text-brand-cyan" size={20} /> Featured Events
              </h2>
              <Link href="/tournaments" className="text-xs text-brand-cyan font-bold hover:underline flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0 snap-x">
              {tournaments.length === 0 ? (
                <div className="w-full py-12 rounded-xl bg-kaf-card border border-dashed border-kaf-border text-center">
                  <Trophy size={32} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No tournaments yet. Check back soon!</p>
                </div>
              ) : (
                tournaments.map((t: any, i: number) => (
                  <Link href={`/tournaments/${t.id}/dashboard`} key={t.id || i} className="relative w-72 h-40 rounded-xl overflow-hidden flex-shrink-0 group cursor-pointer border border-kaf-border hover:border-brand-cyan/70 transition-all shadow-lg snap-center">
                    <div className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 ${i % 2 === 0 ? "bg-[url('/kaf-eleague-s1-poster.png')]" : "bg-[url('/hero-stadium.jpg')]"}`}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-kaf-bg via-kaf-bg/60 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-kaf-bg/80 via-transparent to-transparent"></div>
                    
                    {t.status === 'live' && (
                       <div className="absolute top-3 left-3 px-2 py-1 rounded-sm text-[9px] font-black bg-status-live text-white tracking-widest uppercase shadow-[0_0_15px_rgba(255,0,60,0.6)] flex items-center gap-1">
                         <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> LIVE
                       </div>
                    )}
                    {t.status === 'registration_open' && (
                       <div className="absolute top-3 left-3 px-2 py-1 rounded-sm text-[9px] font-black bg-brand-cyan text-kaf-bg tracking-widest uppercase shadow-[0_0_15px_rgba(0,255,102,0.6)]">
                         REGISTRATION OPEN
                       </div>
                    )}

                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-sm md:text-base font-black text-white leading-tight truncate uppercase tracking-wide drop-shadow-md">{t.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5 opacity-80">
                         <div className="flex items-center gap-1 text-[10px] text-brand-cyan font-bold uppercase tracking-wider">
                           <Trophy size={10} /> {t.format || '1v1'}
                         </div>
                         <div className="flex items-center gap-1 text-[10px] text-white/80 font-bold uppercase tracking-wider">
                           <Users size={10} /> {t.max_participants || 64} Slots
                         </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Twitter-style Main Feed */}
          <RealtimeFeed initialActivities={feedActivities} />

          {/* Embedded Top Players Widget inside Feed */}
          <div className="kaf-card rounded-2xl border border-kaf-border p-4 my-2 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                 <Star size={16} className="text-brand-gold" /> Rising Stars
              </h3>
              <Link href="/rankings" className="text-xs text-brand-cyan hover:underline">View Rankings</Link>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {rankings.length === 0 ? (
                <p className="text-slate-500 text-sm py-4 text-center w-full">No rankings yet.</p>
              ) : rankings.map((item: any, i: number) => (
                <div key={item.id || i} className="w-32 flex-shrink-0 rounded-xl bg-kaf-bg border border-kaf-border/50 p-3 flex flex-col items-center text-center hover:border-brand-cyan/30 transition-colors cursor-pointer group">
                  <div className="relative mb-2">
                    <div className="w-12 h-12 rounded-full bg-slate-800 bg-cover border-2 border-transparent group-hover:border-brand-cyan transition-colors" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${item.profiles?.username || `p${i}`}')` }}></div>
                    <div className="absolute -bottom-1 -right-1 bg-kaf-panel text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] border border-kaf-border">
                      {i + 1}
                    </div>
                  </div>
                  <h4 className="font-bold text-xs text-white truncate w-full group-hover:text-brand-cyan transition-colors">
                    {item.profiles?.username || `Player_${i + 1}`}
                  </h4>
                  <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest">{item.rating || '0'} PTS</p>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page Router ─── */
export default async function Home() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    return <AuthenticatedFeed />
  }

  return <LandingPage />
}
