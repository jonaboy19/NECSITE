import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Trophy, Users, BarChart3, Zap, Shield, ChevronRight, Play, Star, Flame, ArrowRight, Bell, MessageSquareDot } from 'lucide-react'
import LiveActivityTicker from '@/components/LiveActivityTicker'
import RealtimeFeed from '@/components/RealtimeFeed'
import { fetchLiveTickers, fetchFeedActivities, fetchTournaments, fetchRankings } from '@/lib/utils'
import HeroRemotionBackground from '@/components/HeroRemotionBackground'

/* ─── Public Header for guests ─── */
function PublicNav() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 py-8 text-white pointer-events-auto border-b border-kaf-border/30 bg-black/50 backdrop-blur-md">
      <Link href="/" className="flex items-center gap-2 group">
        <span className="text-2xl font-display font-black tracking-[0.2em] uppercase">KAF<span className="text-brand-cyan">CONNECT</span></span>
      </Link>
      <div className="flex items-center gap-4 sm:gap-8">
        <Link href="/auth/login" className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Login</Link>
        <Link href="/auth/register" className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] px-6 py-3 sm:px-8 sm:py-4 bg-brand-cyan text-white hover:bg-brand-teal transition-colors [clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)]">Join Arena</Link>
      </div>
    </nav>
  )
}

/* ─── Brutalist Unique Landing Page (for guests) ─── */
function LandingPage() {
  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-brand-cyan/30 flex flex-col">
      <PublicNav />
      
      {/* Heavy Brutalist Hero with Remotion Video Background */}
      <section className="relative min-h-[90vh] flex flex-col justify-end px-6 lg:px-12 pb-24 overflow-hidden border-b border-kaf-border">
        <HeroRemotionBackground />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12 pointer-events-auto mt-32">
          
          <div className="w-full lg:w-2/3">
            <div className="overflow-hidden mb-6 flex items-center gap-3 border-l-4 border-brand-cyan pl-3">
              <span className="w-2 h-2 bg-brand-cyan animate-pulse"></span>
              <p className="text-brand-cyan font-mono text-xs md:text-sm tracking-[0.4em] uppercase">
                System Online • V2.0.4
              </p>
            </div>
            <h1 className="text-[14vw] lg:text-[8vw] font-black leading-[0.85] tracking-tighter uppercase drop-shadow-2xl">
              UNLEASH <br/> <span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.4)' }}>THE</span> APEX
            </h1>
          </div>

          <div className="w-full lg:w-1/3 flex flex-col gap-8">
            <p className="text-base lg:text-lg text-slate-400 font-medium leading-relaxed bg-black/60 border border-kaf-border p-6 [clip-path:polygon(0_0,100%_0,100%_calc(100%-15px),calc(100%-15px)_100%,0_100%)] backdrop-blur-sm">
              The premier eFootball architecture. Live highlights, absolute global rankings, and relentless tournament brackets. 
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <Link href="/auth/register" className="flex items-center justify-center p-5 bg-brand-cyan text-white font-black uppercase tracking-widest text-xs sm:text-sm hover:bg-brand-teal transition-colors [clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)]">
                Initiate
              </Link>
              <Link href="/tournaments" className="flex items-center justify-center p-5 border border-kaf-border bg-black text-white font-black uppercase tracking-widest text-xs sm:text-sm hover:bg-white hover:text-black transition-colors [clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)]">
                Observe
              </Link>
            </div>
          </div>
          
        </div>

        {/* Marquee Ticker at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-kaf-border/50 bg-black/50 backdrop-blur-xl overflow-hidden py-4 flex z-20 pointer-events-none">
          <div className="animate-marquee whitespace-nowrap flex gap-12 text-[10px] sm:text-xs font-mono tracking-[0.3em] text-brand-cyan opacity-80 uppercase">
            <span>• Global Matchmaking</span>
            <span>• Remotion Engine</span>
            <span>• Clan Wars Active</span>
            <span>• E-League Season 2</span>
            <span>• Global Matchmaking</span>
            <span>• Remotion Engine</span>
            <span>• Clan Wars Active</span>
            <span>• E-League Season 2</span>
            <span>• Global Matchmaking</span>
            <span>• Remotion Engine</span>
            <span>• Clan Wars Active</span>
            <span>• E-League Season 2</span>
            <span>• Global Matchmaking</span>
            <span>• Remotion Engine</span>
            <span>• Clan Wars Active</span>
            <span>• E-League Season 2</span>
          </div>
        </div>
      </section>

      {/* Feature Section - Abstract Cards */}
      <section className="py-24 md:py-32 px-6 lg:px-12 w-full max-w-7xl mx-auto flex-1">
        <h2 className="text-4xl md:text-6xl font-black mb-16 tracking-tighter uppercase drop-shadow-lg">
          Core <br/><span className="text-slate-600">Architecture</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* Card 1 */}
          <div className="group relative p-8 lg:p-12 border border-kaf-border bg-[#0a0a0c] hover:border-brand-cyan transition-colors [clip-path:polygon(0_0,100%_0,100%_calc(100%-20px),calc(100%-20px)_100%,0_100%)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/5 blur-3xl group-hover:bg-brand-cyan/10 transition-all"></div>
            <div className="text-7xl font-black text-white/5 mb-8 tracking-tighter">01</div>
            <h3 className="text-2xl font-black uppercase tracking-widest mb-4">Live Video Synthesis</h3>
            <p className="text-slate-400 leading-relaxed font-mono text-sm">
              Powered by Remotion. Real-time match data is compiled into cinematic MP4 highlights server-side instantly upon match resolution.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group relative p-8 lg:p-12 border border-kaf-border bg-[#0a0a0c] hover:border-brand-gold transition-colors [clip-path:polygon(0_0,100%_0,100%_calc(100%-20px),calc(100%-20px)_100%,0_100%)]">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-gold/5 blur-3xl group-hover:bg-brand-gold/10 transition-all"></div>
            <div className="text-7xl font-black text-white/5 mb-8 tracking-tighter">02</div>
            <h3 className="text-2xl font-black uppercase tracking-widest mb-4">Relentless Elo</h3>
            <p className="text-slate-400 leading-relaxed font-mono text-sm">
              Global rankings mathematically forged in the fire of competition. Every match dynamically shifts the balance of power.
            </p>
          </div>
          
          {/* Card 3 */}
          <div className="group relative p-8 lg:p-12 border border-kaf-border bg-[#0a0a0c] hover:border-purple-500 transition-colors md:col-span-2 flex flex-col md:flex-row gap-8 items-center [clip-path:polygon(20px_0,100%_0,100%_100%,0_100%,0_20px)]">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center opacity-5 grayscale group-hover:grayscale-0 group-hover:opacity-10 transition-all"></div>
            <div className="flex-1 relative z-10">
              <div className="text-7xl font-black text-white/5 mb-4 tracking-tighter">03</div>
              <h3 className="text-2xl font-black uppercase tracking-widest mb-4">Clan Warfare Protocol</h3>
              <p className="text-slate-400 leading-relaxed font-mono text-sm max-w-lg">
                Mobilize your organization. Issue direct challenges, manage your roster, and conquer the leaderboard as a unified front.
              </p>
            </div>
            <div className="shrink-0 relative z-10 hidden sm:block">
              <Link href="/auth/register" className="inline-flex items-center justify-center w-32 h-32 bg-brand-cyan text-white font-black text-xs tracking-widest uppercase hover:bg-brand-teal transition-colors [clip-path:polygon(15px_0,100%_0,100%_calc(100%-15px),calc(100%-15px)_100%,0_100%,0_15px)]">
                Enter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="border-t border-kaf-border px-6 lg:px-12 py-12 flex flex-col md:flex-row justify-between items-center gap-6 bg-[#050505]">
        <div className="text-xl md:text-2xl font-black tracking-[0.2em] uppercase">KAF<span className="text-brand-cyan">CONNECT</span></div>
        <div className="text-[10px] sm:text-xs font-mono text-slate-500 uppercase tracking-widest">© 2026 KAF E-League. Architecture v2.0</div>
      </footer>
    </div>
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
