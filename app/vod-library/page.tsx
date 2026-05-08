import { Play, Film, ExternalLink, Calendar } from 'lucide-react'

export const metadata = {
  title: 'VOD Library — KAFConnect',
  description: 'Watch past tournament matches, highlights, and community streams on KAFConnect.',
}

const PLACEHOLDER_VODS = [
  { id: 1, title: 'KAF E-League S1 Grand Final', tournament: 'KAF E-League Season 1', date: '2026-04-28', thumbnail: null, duration: '2h 14m', views: 1240 },
  { id: 2, title: 'Semi-Final: HYDRØX vs NOVA', tournament: 'KAF E-League Season 1', date: '2026-04-25', thumbnail: null, duration: '58m', views: 890 },
  { id: 3, title: 'Quarter-Final Highlights Pack', tournament: 'KAF E-League Season 1', date: '2026-04-22', thumbnail: null, duration: '34m', views: 640 },
  { id: 4, title: 'Opening Day Ceremony', tournament: 'KAF E-League Season 1', date: '2026-04-15', thumbnail: null, duration: '22m', views: 420 },
]

export default function VodLibrary() {
  return (
    <div className="flex flex-col w-full pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-kaf-panel/95 backdrop-blur-xl border-b border-kaf-border px-6 py-4">
        <h1 className="text-2xl font-display font-black text-white uppercase tracking-wide flex items-center gap-3">
          <Film className="text-brand-cyan" size={26} />
          VOD Library
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">Past matches, highlights, and community streams</p>
      </div>

      <div className="p-6 max-w-6xl mx-auto w-full space-y-8">
        {/* Featured */}
        <div className="relative rounded-2xl overflow-hidden border border-kaf-border bg-kaf-card h-72 flex items-end group cursor-pointer hover:border-brand-cyan/30 transition-all">
          <div className="absolute inset-0 bg-[url('/hero-stadium.jpg')] bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-kaf-bg via-kaf-bg/60 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play size={36} className="text-white ml-1" />
            </div>
          </div>
          <div className="relative z-10 p-6">
            <span className="text-[10px] text-brand-cyan font-black uppercase tracking-widest mb-2 block">Featured Match</span>
            <h2 className="text-2xl font-black text-white">KAF E-League S1 Grand Final</h2>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1"><Calendar size={10} /> Apr 28, 2026</span>
              <span>2h 14m</span>
              <span>1,240 views</span>
            </div>
          </div>
        </div>

        {/* VOD Grid */}
        <div>
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-brand-cyan rounded-full" />
            All Recordings
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PLACEHOLDER_VODS.map(vod => (
              <div key={vod.id} className="kaf-card rounded-2xl border border-kaf-border overflow-hidden group cursor-pointer hover:border-brand-cyan/30 transition-all">
                {/* Thumbnail */}
                <div className="relative h-40 bg-slate-900 flex items-center justify-center">
                  <div className="absolute inset-0 bg-[url('/hero-stadium.jpg')] bg-cover bg-center opacity-20 group-hover:scale-105 transition-transform duration-500" />
                  <div className="relative z-10 w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-brand-cyan/20 transition-colors">
                    <Play size={20} className="text-white ml-0.5" />
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 rounded text-[10px] text-white font-bold">
                    {vod.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-white text-sm group-hover:text-brand-cyan transition-colors line-clamp-2">{vod.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{vod.tournament}</span>
                    <span className="text-[10px] text-slate-500">{vod.views.toLocaleString()} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
