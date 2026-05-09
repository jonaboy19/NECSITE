'use client'
import { MessageCircle, Play, Repeat2, Share2, Trophy, Heart, Star, Video } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'

export default function RealtimeFeed({ initialActivities = [] }: { initialActivities?: any[] }) {
  const [activities, setActivities] = useState<any[]>(initialActivities)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [postText, setPostText] = useState('')
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [reposted, setReposted] = useState<Record<string, boolean>>({})
  const supabase = createClient()
  const toast = useToast()

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

  function createPost() {
    const text = postText.trim()
    if (!text) {
      toast.warning('Write something before posting.')
      return
    }

    const localPost = {
      id: `local-${Date.now()}`,
      activity_type: 'media',
      title: userProfile?.username ? `${userProfile.username} posted` : 'Community post',
      description: text,
      created_at: new Date().toISOString(),
    }

    setActivities(prev => [localPost, ...prev].slice(0, 15))
    setPostText('')
    toast.success('Post added to your local feed.')
  }

  function toggleLike(id: string) {
    setLiked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function toggleRepost(id: string) {
    setReposted(prev => ({ ...prev, [id]: !prev[id] }))
    toast.info(reposted[id] ? 'Repost removed.' : 'Reposted to your activity feed.')
  }

  async function shareActivity(activity: any) {
    const shareText = `${activity.title || 'KAFConnect activity'} - ${activity.description || ''}`.trim()
    if (navigator.share) {
      await navigator.share({ title: activity.title || 'KAFConnect', text: shareText, url: window.location.href })
      return
    }
    await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`)
    toast.success('Activity link copied.')
  }

  if (activities.length === 0) return <div className="text-slate-400 p-8 text-center border border-kaf-border rounded-xl">No recent activities.</div>

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      {/* Create Post Input */}
      <div className="relative rounded-2xl p-5 border border-kaf-border/40 bg-kaf-card/50 backdrop-blur-sm mb-2 shadow-lg overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-cyan/20 via-brand-cyan to-brand-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex gap-4 relative z-10">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex-shrink-0 bg-cover border-2 border-transparent group-hover:border-brand-cyan/50 transition-colors" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.username || 'Guest'}')` }}></div>
          <div className="flex-1">
            <input
              type="text"
              value={postText}
              onChange={e => setPostText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createPost()}
              placeholder="What's happening in the arena?"
              className="w-full bg-transparent border-none focus:outline-none text-white text-lg placeholder:text-slate-500 mb-4 transition-all"
            />
            <div className="flex justify-between items-center pt-3 border-t border-kaf-border/30">
              <div className="flex gap-1 text-brand-cyan">
                <button onClick={() => toast.info('Video attachments will be connected to KAF TV uploads.')} className="p-2 hover:bg-brand-cyan/10 rounded-full transition-colors" aria-label="Add video"><Video size={20} /></button>
                <button onClick={() => toast.info('Highlight posts are marked for staff review.')} className="p-2 hover:bg-brand-cyan/10 rounded-full transition-colors" aria-label="Mark highlight"><Star size={20} /></button>
              </div>
              <button onClick={createPost} className="bg-gradient-to-r from-brand-cyan to-brand-blue shadow-glow-green-sm text-white px-6 py-2 rounded-full font-bold hover:scale-105 hover:shadow-glow-green transition-all">Post</button>
            </div>
          </div>
        </div>
      </div>

      {activities.map((activity: any) => (
        <div key={activity.id} className="kaf-card rounded-2xl p-0 border border-kaf-border/50 bg-kaf-card/80 backdrop-blur-md flex flex-col hover:border-brand-cyan/40 transition-all overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_30px_rgba(25,133,59,0.14)]">
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
                      <div className="w-16 h-16 rounded-full bg-brand-cyan/90 text-white flex items-center justify-center pl-1 shadow-[0_0_20px_rgba(25,133,59,0.5)] transform group-hover:scale-110 transition-transform backdrop-blur">
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
                  <button className="px-4 py-2 bg-brand-cyan text-white rounded-lg font-bold text-sm hover:bg-brand-lime transition-colors">Follow</button>
                </div>
              )}

              {/* Action Bar */}
              <div className="flex items-center justify-between text-slate-500 pt-2">
                <button onClick={() => toast.info('Reply composer is opening in messages soon.')} className="flex items-center gap-2 hover:text-brand-cyan transition-colors group">
                  <div className="p-2 rounded-full group-hover:bg-brand-cyan/10 transition-colors">
                    <MessageCircle size={20} />
                  </div>
                  <span className="text-xs font-bold">Reply</span>
                </button>
                <button onClick={() => toggleRepost(activity.id)} className={`flex items-center gap-2 transition-colors group ${reposted[activity.id] ? 'text-emerald-400' : 'hover:text-emerald-400'}`}>
                  <div className="p-2 rounded-full group-hover:bg-emerald-400/10 transition-colors">
                    <Repeat2 size={20} />
                  </div>
                  <span className="text-xs font-bold">Repost</span>
                </button>
                <button onClick={() => toggleLike(activity.id)} className={`flex items-center gap-2 transition-colors group ${liked[activity.id] ? 'text-red-500' : 'hover:text-red-500'}`}>
                  <div className="p-2 rounded-full group-hover:bg-red-500/10 transition-colors">
                    <Heart size={20} className={liked[activity.id] ? 'fill-current' : ''} />
                  </div>
                  <span className="text-xs font-bold">Like</span>
                </button>
                <button onClick={() => shareActivity(activity)} className="flex items-center gap-2 hover:text-brand-cyan transition-colors group" aria-label="Share activity">
                  <div className="p-2 rounded-full group-hover:bg-brand-cyan/10 transition-colors">
                    <Share2 size={20} />
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
