import { Star, ExternalLink } from 'lucide-react'

const sponsors = [
  {
    name: 'KAF E-League',
    tier: 'Title Sponsor',
    tierColor: 'text-brand-gold border-brand-gold/40 bg-brand-gold/10',
    description: 'Official organizer of KAFConnect competitive events and tournaments across all regions.',
    logo: null,
  },
  {
    name: 'Arena Sports Media',
    tier: 'Gold Partner',
    tierColor: 'text-amber-400 border-amber-400/40 bg-amber-400/10',
    description: 'Providing live broadcast infrastructure and streaming technology for all KAFConnect events.',
    logo: null,
  },
  {
    name: 'GG Gaming Gear',
    tier: 'Official Equipment Partner',
    tierColor: 'text-brand-cyan border-brand-cyan/40 bg-brand-cyan/10',
    description: 'Supplying premium gaming peripherals to KAFConnect tournament champions.',
    logo: null,
  },
]

export default function Sponsors() {
  return (
    <div className="flex flex-col w-full pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-kaf-panel/95 backdrop-blur-xl border-b border-kaf-border px-6 py-4">
        <h1 className="text-2xl font-display font-black text-white uppercase tracking-wide flex items-center gap-3">
          <Star className="text-brand-gold" size={26} />
          Partners & Sponsors
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">The organizations powering KAFConnect</p>
      </div>

      <div className="p-6 max-w-4xl mx-auto w-full space-y-8">
        {/* Sponsor Cards */}
        <div className="space-y-4">
          {sponsors.map((s) => (
            <div key={s.name} className="kaf-card rounded-2xl border border-kaf-border p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 group hover:border-white/10 transition-all">
              {/* Logo Placeholder */}
              <div className="w-20 h-20 rounded-xl bg-kaf-bg border border-kaf-border flex items-center justify-center shrink-0">
                <Star size={28} className="text-slate-600" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-xl font-black text-white">{s.name}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${s.tierColor}`}>
                    {s.tier}
                  </span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{s.description}</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-kaf-bg border border-kaf-border text-sm font-bold text-slate-300 hover:text-white hover:border-white/20 transition-all shrink-0">
                Visit <ExternalLink size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Become a Partner CTA */}
        <div className="relative overflow-hidden rounded-2xl border border-brand-cyan/20 bg-gradient-to-br from-brand-cyan/5 to-transparent p-8 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,102,0.06)_0%,transparent_70%)]"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-black text-white mb-3">Become a Partner</h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Interested in sponsoring KAFConnect events and reaching thousands of competitive eFootball players?
            </p>
            <a href="/contact" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-cyan text-kaf-bg font-black hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,102,0.3)]">
              Get in Touch
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}