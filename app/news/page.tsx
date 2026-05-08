import { createServerSupabaseClient } from '@/lib/supabase/server'
import PublicHeader from '@/components/PublicHeader'
import { Newspaper, Calendar, ChevronRight, Megaphone } from 'lucide-react'
import Link from 'next/link'

const fallbackNews = [
  {
    id: 1,
    title: 'KAF E-League Season 2 Kicks Off!',
    category: 'Announcement',
    excerpt: 'The highly anticipated Season 2 of the KAF E-League is now live. Register now for your chance to compete against the best eFootball players across all regions.',
    created_at: '2026-05-02T00:00:00Z',
    featured: true,
  },
  {
    id: 2,
    title: 'Platform Update: New Match Reporting System',
    category: 'Platform',
    excerpt: 'We have launched an improved match reporting system with screenshot uploads, faster dispute resolution, and real-time score tracking.',
    created_at: '2026-04-28T00:00:00Z',
    featured: false,
  },
  {
    id: 3,
    title: 'Congratulations to the Season 1 Champions',
    category: 'Results',
    excerpt: 'After an incredible run of competition, we can now reveal the Season 1 champions. Check out the full results and bracket breakdown.',
    created_at: '2026-04-15T00:00:00Z',
    featured: false,
  },
]

export default async function News() {
  const supabase = await createServerSupabaseClient()

  // Try to fetch from a news/announcements table if it exists
  let newsItems: any[] = []
  const { data } = await supabase
    .from('feed_activities')
    .select('*')
    .eq('type', 'announcement')
    .order('created_at', { ascending: false })
    .limit(20)

  newsItems = data && data.length > 0 ? data : fallbackNews

  const featured = newsItems[0]
  const rest = newsItems.slice(1)

  return (
    <div className="flex flex-col w-full pb-20">
      <PublicHeader />

      {/* Hero Header */}
      <section className="relative bg-kaf-panel border-b border-kaf-border px-6 py-10 md:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,255,102,0.05)_0%,transparent_60%)]"></div>
        <div className="relative max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-bold uppercase tracking-widest mb-4">
            <Megaphone size={12} /> Latest Updates
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight">
            NEWS & <span className="text-brand-cyan">ANNOUNCEMENTS</span>
          </h1>
          <p className="text-slate-400 mt-3 max-w-xl">Stay up to date with tournament results, platform updates, and community events.</p>
        </div>
      </section>

      <div className="p-6 max-w-5xl mx-auto w-full space-y-8">
        {/* Featured Article */}
        {featured && (
          <div className="kaf-card rounded-2xl border border-kaf-border overflow-hidden group hover:border-brand-cyan/30 transition-all cursor-pointer">
            <div className="h-48 bg-[url('/hero-stadium.jpg')] bg-cover bg-center relative">
              <div className="absolute inset-0 bg-gradient-to-t from-kaf-card via-kaf-card/60 to-transparent"></div>
              <span className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-brand-cyan text-kaf-bg text-[10px] font-black uppercase tracking-widest">
                Featured
              </span>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">
                <span className="text-brand-cyan">{featured.category || 'Announcement'}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {new Date(featured.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white group-hover:text-brand-cyan transition-colors mb-3">
                {featured.title || featured.message || 'Latest Update'}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                {featured.excerpt || featured.details || 'Click to read more about this update.'}
              </p>
              <div className="flex items-center gap-1 text-brand-cyan text-sm font-bold">
                Read More <ChevronRight size={16} />
              </div>
            </div>
          </div>
        )}

        {/* News Grid */}
        {rest.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {rest.map((item: any, i: number) => (
              <div key={item.id || i} className="kaf-card rounded-2xl border border-kaf-border p-5 group hover:border-brand-cyan/30 transition-all cursor-pointer">
                <div className="flex items-center gap-3 text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">
                  <Newspaper size={12} className="text-brand-cyan" />
                  <span className="text-brand-cyan">{item.category || 'News'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-brand-cyan transition-colors mb-2">
                  {item.title || item.message || 'Update'}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                  {item.excerpt || item.details || ''}
                </p>
                <div className="flex items-center gap-1 text-brand-cyan text-xs font-bold mt-4">
                  Read More <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}