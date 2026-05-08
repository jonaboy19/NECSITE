'use client'

import { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronUp, Shield, Clock, CheckCircle, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'

const FAQ = [
  { q: 'How long do appeals take?', a: 'Most appeals are reviewed within 48-72 hours by the KAF moderation team.' },
  { q: 'What counts as an invalid result?', a: 'Screenshots don\'t match the submitted score, or a technical issue disconnected a player mid-match.' },
  { q: 'Can I appeal a ban?', a: 'Yes — submit the appeal form below with as much detail as possible. Include evidence if available.' },
  { q: 'What happens after I submit?', a: 'You\'ll receive an email when your appeal is reviewed. The decision is final unless new evidence is submitted.' },
]

export default function AppealsPage() {
  const supabase = createClient()
  const { success, error: toastError } = useToast()
  const [form, setForm] = useState({ reason: '', evidence_url: '', match_id: '', type: 'match_result' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.reason.trim()) return toastError('Please describe your appeal')
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toastError('You must be signed in'); setSubmitting(false); return }

    const { error } = await supabase.from('disputes').insert({
      opened_by: user.id,
      reason: `[${form.type.toUpperCase()}] ${form.reason}`,
      evidence_url: form.evidence_url || null,
      match_id: form.match_id || null,
      status: 'open',
    })

    setSubmitting(false)
    if (error) { toastError(error.message); return }
    setSubmitted(true)
    success('Appeal submitted! We\'ll review it within 48-72 hours.')
  }

  return (
    <div className="flex flex-col w-full pb-20">
      <div className="bg-kaf-panel border-b border-kaf-border px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
            <AlertTriangle size={12} /> Appeals
          </div>
          <h1 className="text-4xl font-display font-black text-white uppercase tracking-tight">
            Disputes & <span className="text-orange-400">Appeals</span>
          </h1>
          <p className="text-slate-400 mt-3 max-w-xl">
            Dispute a match result, file a complaint, or appeal a ban. All appeals are reviewed by the KAF moderation team.
          </p>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto w-full grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <div>
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-orange-400 rounded-full" />
            Submit an Appeal
          </h2>

          {submitted ? (
            <div className="kaf-card rounded-2xl border border-green-500/30 bg-green-500/5 p-8 text-center">
              <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-black text-white mb-2">Appeal Submitted</h3>
              <p className="text-slate-400 text-sm">We&apos;ll review your appeal and reach out within 48-72 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="kaf-card rounded-2xl border border-kaf-border p-6 space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Appeal Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-kaf-border rounded-xl text-white text-sm focus:border-orange-400 focus:outline-none transition-all"
                >
                  <option value="match_result">Match Result Dispute</option>
                  <option value="ban_appeal">Ban Appeal</option>
                  <option value="rank_dispute">Ranking Dispute</option>
                  <option value="technical_issue">Technical Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Match ID (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. abc123..."
                  value={form.match_id}
                  onChange={e => setForm({ ...form, match_id: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-kaf-border rounded-xl text-white text-sm placeholder-slate-600 focus:border-orange-400 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Reason *</label>
                <textarea
                  rows={5}
                  placeholder="Describe the issue in detail..."
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-kaf-border rounded-xl text-white text-sm placeholder-slate-600 focus:border-orange-400 focus:outline-none transition-all resize-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Evidence URL (screenshot/link)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={form.evidence_url}
                  onChange={e => setForm({ ...form, evidence_url: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-kaf-border rounded-xl text-white text-sm placeholder-slate-600 focus:border-orange-400 focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-black text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? 'Submitting...' : 'Submit Appeal'}
              </button>
            </form>
          )}
        </div>

        {/* FAQ + Info */}
        <div className="space-y-6">
          <div className="kaf-card rounded-2xl border border-kaf-border p-5">
            <h3 className="font-black text-white flex items-center gap-2 mb-4">
              <Clock size={16} className="text-brand-cyan" /> What to Expect
            </h3>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-cyan/20 text-brand-cyan text-[10px] font-black flex items-center justify-center shrink-0">1</span>
                Submit your appeal below with all relevant details.
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-cyan/20 text-brand-cyan text-[10px] font-black flex items-center justify-center shrink-0">2</span>
                The KAF moderation team reviews within 48-72 hours.
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-cyan/20 text-brand-cyan text-[10px] font-black flex items-center justify-center shrink-0">3</span>
                Decision communicated via notification and email.
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-cyan/20 text-brand-cyan text-[10px] font-black flex items-center justify-center shrink-0">4</span>
                Result is final unless new evidence is submitted.
              </div>
            </div>
          </div>

          <div className="kaf-card rounded-2xl border border-kaf-border p-5">
            <h3 className="font-black text-white mb-4 flex items-center gap-2">
              <Shield size={16} className="text-orange-400" /> FAQ
            </h3>
            <div className="space-y-2">
              {FAQ.map((item, i) => (
                <div key={i} className="border border-kaf-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between text-sm font-bold text-white hover:bg-white/5 transition-colors"
                  >
                    {item.q}
                    {openFaq === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-3 text-sm text-slate-400">{item.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
