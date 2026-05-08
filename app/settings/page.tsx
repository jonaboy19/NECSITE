'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User, Globe, MessageSquare, Save, LogOut, Loader2, Check, Camera } from 'lucide-react'

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [form, setForm] = useState({
    username: '',
    display_name: '',
    bio: '',
    region: '',
    discord_id: '',
    twitch_username: '',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) {
        setProfile(p)
        setForm({
          username: p.username || '',
          display_name: p.display_name || '',
          bio: p.bio || '',
          region: p.region || '',
          discord_id: p.discord_id || '',
          twitch_username: p.twitch_username || '',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    setSaved(false)
    const { error } = await supabase.from('profiles').update(form).eq('id', profile.id)
    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      alert('Error saving: ' + error.message)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-brand-cyan" size={32} />
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full pb-20 p-6 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-black text-white">Settings</h1>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors font-bold">
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* Profile Section */}
      <div className="kaf-card rounded-2xl border border-kaf-border p-6 space-y-6">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <User size={20} className="text-brand-cyan" /> Profile Information
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Username / Gamertag</label>
            <input
              className="w-full bg-kaf-bg border border-kaf-border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-brand-cyan focus:outline-none transition-all text-sm"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Your gamertag"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Display Name</label>
            <input
              className="w-full bg-kaf-bg border border-kaf-border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-brand-cyan focus:outline-none transition-all text-sm"
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              placeholder="Public display name"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Bio</label>
          <textarea
            className="w-full bg-kaf-bg border border-kaf-border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-brand-cyan focus:outline-none transition-all text-sm resize-none h-24"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Tell other players about yourself..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            <Globe size={12} className="inline mr-1" /> Region
          </label>
          <select
            className="w-full bg-kaf-bg border border-kaf-border rounded-xl px-4 py-3 text-white focus:border-brand-cyan focus:outline-none transition-all text-sm"
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
          >
            <option value="">Select Region</option>
            <option value="EU">Europe</option>
            <option value="NA">North America</option>
            <option value="SA">South America</option>
            <option value="ASIA">Asia</option>
            <option value="MENA">Middle East & North Africa</option>
            <option value="OCE">Oceania</option>
          </select>
        </div>
      </div>

      {/* Social Connections */}
      <div className="kaf-card rounded-2xl border border-kaf-border p-6 space-y-6">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <MessageSquare size={20} className="text-[#5865F2]" /> Social Connections
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Discord ID</label>
            <input
              className="w-full bg-kaf-bg border border-kaf-border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-[#5865F2] focus:outline-none transition-all text-sm"
              value={form.discord_id}
              onChange={(e) => setForm({ ...form, discord_id: e.target.value })}
              placeholder="username#1234"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Twitch Username</label>
            <input
              className="w-full bg-kaf-bg border border-kaf-border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-[#9146FF] focus:outline-none transition-all text-sm"
              value={form.twitch_username}
              onChange={(e) => setForm({ ...form, twitch_username: e.target.value })}
              placeholder="twitch.tv/username"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4">
        {saved && (
          <span className="text-brand-cyan text-sm font-bold flex items-center gap-1">
            <Check size={16} /> Saved successfully
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 rounded-xl bg-brand-cyan text-kaf-bg font-black hover:bg-white transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,102,0.3)]"
        >
          {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
        </button>
      </div>
    </div>
  )
}
