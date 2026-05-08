import Link from 'next/link'
import { Mail, MessageSquare, MapPin, ExternalLink, Send, Globe, Video } from 'lucide-react'

export default function Contact() {
  return (
    <div className="flex flex-col w-full pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-kaf-panel/95 backdrop-blur-xl border-b border-kaf-border px-6 py-4">
        <h1 className="text-2xl font-display font-black text-white uppercase tracking-wide flex items-center gap-3">
          <Mail className="text-brand-cyan" size={26} />
          Contact Us
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">Get in touch with the KAFConnect team</p>
      </div>

      <div className="p-6 max-w-4xl mx-auto w-full space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="kaf-card rounded-2xl border border-kaf-border p-6 space-y-5">
            <h2 className="text-xl font-black text-white">Send a Message</h2>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your Name</label>
              <input
                type="text"
                placeholder="Player name or organization"
                className="w-full bg-kaf-bg border border-kaf-border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-brand-cyan focus:outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full bg-kaf-bg border border-kaf-border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-brand-cyan focus:outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Subject</label>
              <select className="w-full bg-kaf-bg border border-kaf-border rounded-xl px-4 py-3 text-white focus:border-brand-cyan focus:outline-none transition-all text-sm">
                <option>General Inquiry</option>
                <option>Tournament Support</option>
                <option>Sponsorship / Partnership</option>
                <option>Report a Bug</option>
                <option>Account Issue</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Message</label>
              <textarea
                placeholder="Tell us how we can help..."
                rows={5}
                className="w-full bg-kaf-bg border border-kaf-border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-brand-cyan focus:outline-none transition-all text-sm resize-none"
              />
            </div>
            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-cyan text-kaf-bg font-black hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,102,0.3)]">
              <Send size={18} /> Send Message
            </button>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="kaf-card rounded-2xl border border-kaf-border p-6">
              <h2 className="text-xl font-black text-white mb-4">Contact Info</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-brand-cyan" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Email</p>
                    <p className="text-white font-bold text-sm">support@kafconnect.gg</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center shrink-0">
                    <MessageSquare size={18} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Discord</p>
                    <p className="text-white font-bold text-sm">discord.gg/kafconnect</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="kaf-card rounded-2xl border border-kaf-border p-6">
              <h2 className="text-xl font-black text-white mb-4">Follow Us</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Globe, label: 'X / Twitter', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
                  { icon: ExternalLink, label: 'Instagram', color: 'text-pink-400', bg: 'bg-pink-400/10 border-pink-400/20' },
                  { icon: Video, label: 'YouTube', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
                ].map((s) => (
                  <button key={s.label} className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${s.bg} hover:scale-105 transition-all`}>
                    <s.icon size={22} className={s.color} />
                    <span className="text-xs font-bold text-slate-300">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}