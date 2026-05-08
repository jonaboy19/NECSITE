import { MessageSquare, Search, Plus } from 'lucide-react'

export default function Messages() {
  return (
    <div className="flex flex-col w-full h-full pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-kaf-panel/95 backdrop-blur-xl border-b border-kaf-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-black text-white uppercase tracking-wide flex items-center gap-3">
            <MessageSquare className="text-brand-cyan" size={26} />
            Messages
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Direct messages with other players</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-cyan text-kaf-bg font-bold text-sm hover:bg-white hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)]">
          <Plus size={16} /> New Message
        </button>
      </div>

      {/* Search */}
      <div className="px-6 py-4 border-b border-kaf-border">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full bg-kaf-card border border-kaf-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-cyan focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-20 h-20 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center mb-6">
          <MessageSquare size={36} className="text-brand-cyan" />
        </div>
        <h2 className="text-2xl font-black text-white mb-3">No Messages Yet</h2>
        <p className="text-slate-400 max-w-sm leading-relaxed mb-8">
          Connect with other players, coordinate strategies, or challenge opponents to a match.
        </p>
        <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-cyan text-kaf-bg font-black hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,102,0.3)]">
          <Plus size={18} /> Start a Conversation
        </button>
      </div>
    </div>
  )
}
