'use client'
import { Play, Trophy, Star, Video } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function RealtimeFeed({ initialActivities = [] }: { initialActivities?: any[] }) {
  const [activities, setActivities] = useState<any[]>(initialActivities)
  const [userProfile, setUserProfile] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setUserProfile(profile)
      }
    }
    loadUser()

    const channel = supabase.channel('feed-activities-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feed_activities',
        },
        (payload) => {
          if (payload.new) {
            setActivities((prev) => [payload.new, ...prev].slice(0, 15))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  if (activities.length === 0) return <div className="text-slate-400 p-8 text-center border border-kaf-border rounded-xl">No recent activities.</div>

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      {/* Create Post Input */}
      <div className="relative rounded-2xl p-5 border border-kaf-border/40 bg-kaf-card/50 backdrop-blur-sm mb-2 shadow-lg overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-cyan/20 via-brand-cyan to-brand-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex gap-4 relative z-10">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex-shrink-0 bg-cover border-2 border-transparent group-hover:border-brand-cyan/50 transition-colors" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.username || 'Guest'}')` }}></div>
          <div className="flex-1">
            <input type="text" placeholder="What's happening in the arena?" className="w-full bg-transparent border-none focus:outline-none text-white text-lg placeholder:text-slate-500 mb-4 transition-all" />
            <div className="flex justify-between items-center pt-3 border-t border-kaf-border/30">
              <div className="flex gap-1 text-brand-cyan">
                <button className="p-2 hover:bg-brand-cyan/10 rounded-full transition-colors"><Video size={20} /></button>
                <button className="p-2 hover:bg-brand-cyan/10 rounded-full transition-colors"><Star size={20} /></button>
              </div>
              <button className="bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_15px_rgba(0,240,255,0.3)] text-white px-6 py-2 rounded-full font-bold hover:scale-105 hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-all">Post</button>
            </div>
          </div>
        </div>
      </div>

      {activities.map((activity: any) => (
        <div key={activity.id} className="kaf-card rounded-2xl p-0 border border-kaf-border/50 bg-kaf-card/80 backdrop-blur-md flex flex-col hover:border-brand-cyan/40 transition-all overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_30px_rgba(0,240,255,0.1)]">
          <div className="p-5 flex gap-4">
            <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center bg-cover shadow-inner ${
              activity.activity_type === 'transfer' ? 'bg-purple-500/10 border border-purple-500/30' :
              activity.activity_type === 'tournament' ? 'bg-emerald-500/10 border border-emerald-500/30' :
              'bg-brand-cyan/10 border border-brand-cyan/30'
            }`}>
              {activity.activity_type === 'transfer' && <Star size={20} className="text-purple-400 fill-current" />}
              {activity.activity_type === 'tournament' && <Trophy size={20} className="text-emerald-400" />}
              {activity.activity_type === 'media' && <Video size={20} className="text-brand-cyan" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-white flex items-center gap-2">
                  {activity.activity_type === 'transfer' ? 'Transfer Market' : 
                   activity.activity_type === 'tournament' ? 'Tournament Desk' : 'KAF Connect'}
                   <span className="text-slate-500 font-normal text-sm">@kaf_official</span>
                </p>
                <p className="text-xs text-slate-500 whitespace-nowrap">2m ago</p>
              </div>
              
              <p className="text-base text-white mb-3 font-medium">{activity.title}</p>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">{activity.description}</p>
              
              {activity.image_url && (
                <div 
                  className="relative h-48 md:h-64 mb-4 rounded-xl bg-slate-800 bg-cover bg-center border border-kaf-border overflow-hidden group cursor-pointer"
                  style={{ backgroundImage: `url(${activity.image_url})` }}
                >
                  {activity.activity_type === 'media' && (
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-brand-cyan/90 text-kaf-bg flex items-center justify-center pl-1 shadow-[0_0_20px_rgba(0,240,255,0.5)] transform group-hover:scale-110 transition-transform backdrop-blur">
                        <Play size={24} className="fill-current" />
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {activity.activity_type === 'tournament' && !activity.image_url && (
                <div className="w-full bg-slate-900 rounded-xl border border-kaf-border p-4 mb-4 flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer">
                  <div>
                    <div className="font-bold text-brand-gold text-sm uppercase tracking-widest mb-1">Live Event</div>
                    <div className="font-bold text-white">Match Day Ongoing</div>
                  </div>
                  <button className="px-4 py-2 bg-brand-cyan text-kaf-bg rounded-lg font-bold text-sm">Follow</button>
                </div>
              )}

              {/* Action Bar */}
              <div className="flex items-center justify-between text-slate-500 pt-2">
                <button className="flex items-center gap-2 hover:text-brand-cyan transition-colors group">
                  <div className="p-2 rounded-full group-hover:bg-brand-cyan/10 transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  </div>
                  <span className="text-xs font-bold">Reply</span>
                </button>
                <button className="flex items-center gap-2 hover:text-emerald-400 transition-colors group">
                  <div className="p-2 rounded-full group-hover:bg-emerald-400/10 transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                  </div>
                  <span className="text-xs font-bold">Repost</span>
                </button>
                <button className="flex items-center gap-2 hover:text-red-500 transition-colors group">
                  <div className="p-2 rounded-full group-hover:bg-red-500/10 transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  </div>
                  <span className="text-xs font-bold">Like</span>
                </button>
                <button className="flex items-center gap-2 hover:text-brand-cyan transition-colors group">
                  <div className="p-2 rounded-full group-hover:bg-brand-cyan/10 transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
