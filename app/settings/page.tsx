'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User, Globe, MessageSquare, Save, LogOut, Loader2, Check, Camera } from 'lucide-react'
import { useToast } from '@/components/Toast'

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const { success: toastSuccess, error: toastError } = useToast()
  const [form, setForm] = useState({
    username: '',
    display_name: '',
    bio: '',
    region: '',
    discord_id: '',
    discord_username: '',
    twitch_username: '',
    efootball_id: '',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login?redirect=/settings&message=Sign%20in%20to%20continue%20to%20settings')
        return
      }
      
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) {
        setProfile(p)
        setForm({
          username: p.username || '',
          display_name: p.display_name || '',
          bio: p.bio || '',
          region: p.region || '',
          discord_id: p.discord_id || '',
          discord_username: p.discord_username || '',
          twitch_username: p.twitch_username || '',
          efootball_id: p.efootball_id || '',
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
      toastSuccess('Profile saved successfully!')
      setTimeout(() => setSaved(false), 3000)
    } else {
      toastError('Error saving: ' + error.message)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `avatars/${profile.id}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })
    if (uploadError) {
      toastError('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id)
    setProfile({ ...profile, avatar_url: publicUrl })
    toastSuccess('Avatar updated!')
    setUploading(false)
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

      {/* Avatar Upload */}
      <div className="kaf-card rounded-2xl border border-kaf-border p-6">
        <h2 className="text-lg font-black text-white flex items-center gap-2 mb-4">
          <Camera size={20} className="text-brand-cyan" /> Profile Picture
        </h2>
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            <div
              className="w-20 h-20 rounded-2xl bg-slate-800 bg-cover bg-center border-2 border-kaf-border"
              style={{ backgroundImage: `url('${profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username}`}')` }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-brand-cyan flex items-center justify-center hover:bg-white transition-colors shadow-lg disabled:opacity-50"
            >
              {uploading ? <Loader2 size={14} className="animate-spin text-kaf-bg" /> : <Camera size={14} className="text-kaf-bg" />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div>
            <p className="text-white font-bold">{profile?.username || 'Player'}</p>
            <p className="text-slate-400 text-sm mt-1">Click the camera icon to upload a new avatar.</p>
            <p className="text-slate-500 text-xs mt-1">PNG, JPG up to 5MB</p>
          </div>
        </div>
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
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-brand-cyan uppercase tracking-widest mb-2">Konami eFootball ID</label>
            <input
              className="w-full bg-kaf-bg border border-brand-cyan/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-brand-cyan focus:outline-none transition-all text-sm shadow-[inset_0_0_10px_rgba(25,133,59,0.1)]"
              value={form.efootball_id}
              onChange={(e) => setForm({ ...form, efootball_id: e.target.value })}
              placeholder="e.g., 123-456-789"
            />
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Required for Official KAF E-League Matches</p>
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
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Discord Username</label>
            <input
              className="w-full bg-kaf-bg border border-kaf-border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-[#5865F2] focus:outline-none transition-all text-sm"
              value={form.discord_username}
              onChange={(e) => setForm({ ...form, discord_username: e.target.value })}
              placeholder="username"
            />
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">We use this to verify tournament sign-ups.</p>
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
