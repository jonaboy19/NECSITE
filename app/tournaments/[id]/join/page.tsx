'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, Trophy, Users, Shield, Check } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/Toast'

export default function TournamentJoinPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const [tournament, setTournament] = useState<any>(null)
  const [myClan, setMyClan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const [{ data: t }, { data: cm }] = await Promise.all([
        supabase.from('tournaments').select('*').eq('id', params.id).single(),
        supabase.from('clan_members').select('clan_id,role,clans:clan_id(id,name,tag,logo_url,owner_id)').eq('profile_id', user.id).maybeSingle(),
      ])
      setTournament(t)
      const clan = cm?.clans as any
      setMyClan(clan ? { ...clan, memberRole: cm?.role } : null)

      if (clan) {
        const { data: reg } = await supabase.from('tournament_registrations').select('id').eq('tournament_id', params.id).eq('clan_id', clan.id).maybeSingle()
        setAlreadyRegistered(!!reg)
      }
      setLoading(false)
    }
    load()
  }, [])

  const register = async () => {
    if (!myClan) return toastError('You must be in a clan to register')
    setRegistering(true)
    const { error } = await supabase.from('tournament_registrations').insert({
      tournament_id: params.id, clan_id: myClan.id, status: 'pending',
    })
    setRegistering(false)
    if (error) toastError(error.message)
    else { success('Registered! Awaiting approval.'); setAlreadyRegistered(true) }
  }

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 size={24} className="animate-spin text-brand-cyan" /></div>

  return (
    <div className="flex flex-col w-full pb-24 max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link href={`/tournaments/${params.id}`} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-cyan mb-6 font-mono uppercase tracking-widest transition-colors">
        <ArrowLeft size={12} /> Back to Tournament
      </Link>

      <h1 className="text-3xl font-display font-black text-white uppercase mb-2">Register</h1>
      <p className="text-slate-400 text-sm mb-8">Register your clan for <span className="text-white font-bold">{tournament?.title}</span></p>

      {alreadyRegistered ? (
        <div className="kaf-card rounded-2xl border border-green-500/30 bg-green-500/5 p-8 text-center">
          <Check size={48} className="text-green-400 mx-auto mb-3" />
          <h2 className="text-xl font-black text-white">Already Registered!</h2>
          <p className="text-slate-400 text-sm mt-1">Your clan is registered and awaiting approval.</p>
        </div>
      ) : myClan ? (
        <div className="space-y-4">
          <div className="kaf-card rounded-2xl border border-kaf-border p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center font-black text-brand-cyan text-lg">
              {myClan.name[0]}
            </div>
            <div>
              <div className="font-black text-white">{myClan.name}</div>
              <div className="text-sm text-slate-400">[{myClan.tag}] · Your clan</div>
            </div>
          </div>
          <div className="kaf-card rounded-2xl border border-kaf-border p-5 space-y-2 text-sm text-slate-400">
            {[
              { Icon: Trophy, label: 'Tournament', value: tournament?.title },
              { Icon: Users, label: 'Format', value: tournament?.format },
              { Icon: Shield, label: 'Region', value: tournament?.region },
            ].map(({ Icon, label, value }) => value && (
              <div key={label} className="flex items-center gap-2">
                <Icon size={13} className="text-brand-cyan shrink-0" />
                <span>{label}:</span><span className="text-white font-bold ml-auto">{value}</span>
              </div>
            ))}
          </div>
          <button onClick={register} disabled={registering}
            className="w-full py-3.5 bg-brand-cyan hover:bg-brand-cyan/80 text-slate-900 rounded-xl font-black transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
            {registering ? <><Loader2 size={16} className="animate-spin" /> Registering...</> : 'Register My Clan'}
          </button>
          <p className="text-xs text-slate-500 text-center">Registration requires approval from the tournament organizer.</p>
        </div>
      ) : (
        <div className="kaf-card rounded-2xl border border-orange-500/30 bg-orange-500/5 p-8 text-center">
          <Shield size={40} className="text-orange-400 mx-auto mb-3 opacity-60" />
          <h2 className="text-lg font-black text-white">You need a clan</h2>
          <p className="text-slate-400 text-sm mt-1 mb-4">Join or create a clan first to register for this tournament.</p>
          <Link href="/clans" className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-black text-sm transition-colors">
            Browse Clans
          </Link>
        </div>
      )}
    </div>
  )
}
