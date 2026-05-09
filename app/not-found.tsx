import Link from 'next/link'
import { Home, Search, Trophy, Frown } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-kaf-bg flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(25,133,59,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="relative z-10 max-w-lg mx-auto">
        {/* 404 Number */}
        <div className="text-[10rem] md:text-[14rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-slate-700 to-kaf-bg select-none mb-2">
          404
        </div>

        <div className="w-16 h-16 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center mx-auto mb-6 -mt-6">
          <Frown size={32} className="text-brand-cyan" />
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
          PAGE <span className="text-brand-cyan">NOT FOUND</span>
        </h1>
        <p className="text-slate-400 mb-10 text-lg leading-relaxed">
          This page doesn't exist or was moved. Head back to the arena.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-cyan text-white font-black hover:bg-brand-lime hover:scale-105 transition-all shadow-glow-green"
          >
            <Home size={18} /> Go Home
          </Link>
          <Link
            href="/tournaments"
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-kaf-border text-slate-300 font-bold hover:border-white/20 hover:text-white transition-all"
          >
            <Trophy size={18} /> Browse Tournaments
          </Link>
        </div>
      </div>
    </div>
  )
}
