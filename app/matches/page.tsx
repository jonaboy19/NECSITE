import PageLayout from '@/components/PageLayout'
import { Play, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function MatchCenter() {
  return (
    <PageLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-white font-display uppercase tracking-widest border-b border-kaf-border pb-4">Match Center</h1>

        <div className="depth-panel p-6 rounded-2xl">
          <h2 className="text-xl font-black text-brand-cyan mb-4 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-status-live animate-pulse shadow-[0_0_10px_rgba(255,0,60,0.8)]"></span>
             Live Matches
          </h2>
          <div className="space-y-4">
            <Link href="/matches/live-match-1" className="depth-stat flex flex-col gap-4 p-4 rounded-xl hover:border-brand-cyan/50 transition-all group sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-full bg-status-live/20 border border-status-live text-status-live flex items-center justify-center shrink-0">
                   <Play size={20} className="fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className="px-2 py-0.5 rounded text-[10px] font-black bg-status-live text-white tracking-widest uppercase">76:45</span>
                     <p className="text-sm font-bold text-slate-400">KAF Ramadan Cup 2026</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 font-black text-white text-base sm:gap-4 sm:text-lg">
                     <span>HYDROX</span>
                     <span className="text-brand-cyan text-xl">2 - 1</span>
                     <span>NOVA</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="text-slate-500 group-hover:text-brand-cyan transition-colors" />
            </Link>
          </div>
        </div>

        <div className="depth-panel p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-4">Upcoming Matches</h2>
          <div className="space-y-4">
            <Link href="/matches/upcoming-1" className="depth-stat flex flex-col gap-4 p-4 rounded-xl hover:border-slate-600 transition-all group sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-full bg-slate-700 border border-slate-600 text-slate-400 flex items-center justify-center shrink-0">
                   <Clock size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300 tracking-widest uppercase">Today 18:00</span>
                     <p className="text-sm font-bold text-slate-400">Tournex Open</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 font-black text-white text-base sm:gap-4 sm:text-lg">
                     <span>OXYGEN</span>
                     <span className="text-slate-500 text-base">vs</span>
                     <span>XENON</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="text-slate-500 group-hover:text-white transition-colors" />
            </Link>
          </div>
        </div>

        <div className="depth-panel p-6 rounded-2xl text-center">
          <h2 className="text-xl font-bold text-white mb-2">Recent Results</h2>
          <p className="text-slate-400">No completed matches yet today.</p>
        </div>
      </div>
    </PageLayout>
  )
}
