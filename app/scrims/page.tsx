import { Swords, Plus } from 'lucide-react'

export default function Scrims() {
  return (
    <div className="flex flex-col w-full p-6 lg:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-kaf-border pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-white flex items-center gap-3 uppercase tracking-wide">
            <Swords className="text-brand-cyan" size={36} /> Scrim Finder
          </h1>
          <p className="text-slate-400 mt-2">Find and schedule practice matches against other players and clans.</p>
        </div>
        <button className="bg-brand-cyan text-kaf-bg px-6 py-3 rounded-xl font-bold hover:bg-white hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center gap-2">
          <Plus size={20} /> Post Scrim Request
        </button>
      </div>

      <div className="kaf-card p-12 text-center rounded-2xl border border-kaf-border">
        <Swords size={48} className="text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No active scrim requests</h3>
        <p className="text-slate-400 max-w-md mx-auto">Be the first to post a request and find an opponent for some practice matches.</p>
      </div>
    </div>
  )
}
