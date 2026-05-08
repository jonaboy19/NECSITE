'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowRight, Check, Loader2, X } from 'lucide-react'

const REGIONS = ['Africa','Middle East','Europe','Asia','Americas','Global']
const GAME_ROLES = ['Striker','Midfielder','Defender','Goalkeeper','Coach','Casual Fan']
const STEPS = ['welcome','profile','game','done'] as const

interface Props { userId: string; username: string }

export function OnboardingWizard({ userId, username }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<typeof STEPS[number]>('welcome')
  const [region, setRegion] = useState('')
  const [country, setCountry] = useState('')
  const [gameRole, setGameRole] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const key = `kaf.onboarded.${userId}`
    const done = localStorage.getItem(key)
    if (done) return
    // Check if profile has region (means onboarding was done)
    supabase.from('profiles').select('region,display_name').eq('id', userId).single()
      .then(({ data }) => {
        if (!data?.region) {
          setDisplayName(data?.display_name || username)
          setOpen(true)
        }
        setChecked(true)
      })
  }, [userId])

  async function save() {
    setSaving(true)
    await supabase.from('profiles').update({
      region,
      country: country || null,
      display_name: displayName || username,
    }).eq('id', userId)

    // Create user_trust_scores if not exists
    await supabase.from('user_trust_scores').upsert(
      { user_id: userId, score: 100, tier: 'new' },
      { onConflict: 'user_id', ignoreDuplicates: true }
    )

    localStorage.setItem(`kaf.onboarded.${userId}`, '1')
    setSaving(false)
    setStep('done')
  }

  if (!open || !checked) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-kaf-border rounded-3xl w-full max-w-md shadow-2xl animate-slideUp overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-slate-800">
          <div className="h-full bg-brand-cyan transition-all duration-500 rounded-full"
            style={{ width: `${(STEPS.indexOf(step) + 1) / STEPS.length * 100}%` }} />
        </div>

        <div className="p-6 sm:p-8">
          {step === 'welcome' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-cyan/10 border-2 border-brand-cyan/30 flex items-center justify-center">
                <Sparkles size={28} className="text-brand-cyan" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-black text-white">Welcome to KAFConnect!</h2>
                <p className="text-slate-400 mt-2 text-sm">Let's set up your profile in 2 quick steps.</p>
              </div>
              <button onClick={() => setStep('profile')}
                className="w-full py-3 bg-brand-cyan hover:bg-brand-cyan/80 text-slate-900 rounded-xl font-black flex items-center justify-center gap-2 transition-colors">
                Get Started <ArrowRight size={16} />
              </button>
              <button onClick={() => { setOpen(false); localStorage.setItem(`kaf.onboarded.${userId}`, 'skip') }}
                className="text-slate-500 text-sm hover:text-slate-300 transition-colors">
                Skip for now
              </button>
            </div>
          )}

          {step === 'profile' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-display font-black text-white">Your Profile</h2>
                <p className="text-slate-400 text-sm mt-1">How should we display your name?</p>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Display Name</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-kaf-border rounded-xl text-white text-sm focus:border-brand-cyan focus:outline-none transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Country</label>
                <input value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. Nigeria"
                  className="w-full px-3 py-2.5 bg-slate-800 border border-kaf-border rounded-xl text-white text-sm placeholder-slate-600 focus:border-brand-cyan focus:outline-none transition-all" />
              </div>
              <button onClick={() => setStep('game')}
                className="w-full py-3 bg-brand-cyan hover:bg-brand-cyan/80 text-slate-900 rounded-xl font-black flex items-center justify-center gap-2 transition-colors">
                Next <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === 'game' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-display font-black text-white">Your Region & Role</h2>
                <p className="text-slate-400 text-sm mt-1">Help us match you with local players and tournaments.</p>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Region</label>
                <div className="grid grid-cols-2 gap-2">
                  {REGIONS.map(r => (
                    <button key={r} onClick={() => setRegion(r)}
                      className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                        region === r ? 'bg-brand-cyan/10 border-brand-cyan text-brand-cyan' : 'border-kaf-border text-slate-400 hover:border-slate-500'
                      }`}>{r}</button>
                  ))}
                </div>
              </div>
              <button onClick={save} disabled={saving || !region}
                className="w-full py-3 bg-brand-cyan hover:bg-brand-cyan/80 text-slate-900 rounded-xl font-black flex items-center justify-center gap-2 transition-colors disabled:opacity-40">
                {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <>Finish <Check size={16} /></>}
              </button>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center">
                <Check size={28} className="text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-black text-white">You're all set!</h2>
                <p className="text-slate-400 mt-2 text-sm">Your profile has been updated. Welcome to KAFConnect!</p>
              </div>
              <button onClick={() => { setOpen(false); router.refresh() }}
                className="w-full py-3 bg-brand-cyan hover:bg-brand-cyan/80 text-slate-900 rounded-xl font-black transition-colors">
                Start Exploring
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
