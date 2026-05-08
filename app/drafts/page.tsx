import { Target, Users, GitMerge, TrendingUp, TrendingDown, Eye, Shield } from 'lucide-react'

export default function DraftRoom() {
  const trendingPlayers = [
    { name: 'Spxd', stock: 'rising', role: 'Attacker', rating: 1100, form: '+124 PTS' },
    { name: 'KafKing', stock: 'rising', role: 'Midfielder', rating: 980, form: '+89 PTS' },
    { name: 'Ninja', stock: 'falling', role: 'Defender', rating: 850, form: '-45 PTS' },
  ]

  return (
    <div className="flex flex-col w-full p-4 md:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-kaf-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-bold uppercase tracking-widest mb-4">
            <Eye size={14} className="text-brand-cyan" /> Scouting Network Active
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-black text-white uppercase tracking-wide">
            Draft & Scout
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Analyze player stocks, discover free agents, and scout for your clan.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-kaf-panel border border-kaf-border text-white px-6 py-3 rounded-xl font-bold hover:bg-white/5 transition-colors">
            My Watchlist
          </button>
          <button className="bg-brand-cyan text-kaf-bg px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            Declare for Draft
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Player Stocks (Market) */}
        <div className="xl:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-wide">
            <TrendingUp className="text-brand-cyan" size={24} /> Player Stock Market
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trendingPlayers.map((p, i) => (
              <div key={i} className="kaf-card rounded-2xl p-5 border border-kaf-border hover:border-brand-cyan/40 transition-colors relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingUp size={100} className={p.stock === 'rising' ? 'text-emerald-500' : 'text-red-500'} />
                </div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 bg-cover border-2 border-slate-700" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}')` }}></div>
                  <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${p.stock === 'rising' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {p.form}
                  </div>
                </div>
                
                <h3 className="font-bold text-lg text-white mb-1">{p.name}</h3>
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">{p.role}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-kaf-border/50">
                  <div className="text-xs text-slate-500 font-bold uppercase">Current Rating</div>
                  <div className="text-brand-cyan font-black">{p.rating}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full h-[250px] bg-kaf-card rounded-2xl border border-kaf-border flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('/hero-stadium.jpg')] bg-cover opacity-10"></div>
             <Shield className="text-brand-gold w-16 h-16 mb-4 opacity-50" />
             <h3 className="text-2xl font-black text-white mb-2">Combine Season 1</h3>
             <p className="text-slate-400 max-w-md">The next combine event begins in 14 days. Scouts from top clans will be watching. Register to get evaluated.</p>
             <button className="mt-6 px-6 py-2 bg-brand-gold/20 border border-brand-gold/50 text-brand-gold font-bold rounded-lg hover:bg-brand-gold hover:text-kaf-bg transition-colors">
               Register for Combine
             </button>
          </div>
        </div>

        {/* Free Agent Pool */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-wide">
            <Users className="text-purple-400" size={24} /> Free Agent Pool
          </h2>
          
          <div className="kaf-card rounded-2xl border border-kaf-border overflow-hidden">
            <div className="p-4 border-b border-kaf-border bg-slate-900/50">
              <input type="text" placeholder="Search players..." className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-cyan" />
            </div>
            <div className="divide-y divide-kaf-border">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 bg-cover border border-slate-700" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=fa${i}')` }}></div>
                    <div>
                      <p className="font-bold text-white group-hover:text-brand-cyan transition-colors">FreeAgent_{i}</p>
                      <p className="text-xs text-slate-400">Looking for Clan</p>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-brand-cyan group-hover:text-kaf-bg transition-colors text-slate-400">
                    <Eye size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-900/50 text-center">
              <button className="text-xs font-bold text-brand-cyan hover:underline uppercase tracking-widest">View All Agents</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
