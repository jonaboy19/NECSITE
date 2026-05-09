'use client'
import { useState } from 'react'
import { Upload, AlertOctagon, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'

export default function DisputeUpload({ matchId }: { matchId: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [reason, setReason] = useState('')
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  const toast = useToast()

  const handleUpload = async () => {
    if (!file) return
    if (!reason.trim()) {
      setError('Describe the dispute reason first.')
      return
    }

    setUploading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Sign in to submit evidence.')
      setUploading(false)
      return
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${matchId}_${Math.random()}.${fileExt}`
    const filePath = `${matchId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('match-evidence')
      .upload(filePath, file)

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data: signedUrl } = await supabase.storage
      .from('match-evidence')
      .createSignedUrl(filePath, 60 * 60 * 24 * 7)

    const { data: dispute, error: disputeError } = await supabase
      .from('disputes')
      .insert({
        match_id: matchId,
        opened_by: user.id,
        reason,
        evidence_url: signedUrl?.signedUrl || filePath,
        status: 'open',
      })
      .select('id')
      .single()

    if (disputeError) {
      setError(disputeError.message)
      setUploading(false)
      return
    }

    const [{ error: evidenceError }, { error: matchError }] = await Promise.all([
      supabase.from('evidence_items').insert({
        dispute_id: dispute?.id,
        match_id: matchId,
        uploaded_by: user.id,
        evidence_type: file.type.startsWith('video/') ? 'clip' : 'screenshot',
        file_url: signedUrl?.signedUrl || filePath,
        notes: reason,
      }),
      supabase
      .from('matches')
      .update({ status: 'disputed' })
        .eq('id', matchId),
      supabase.from('platform_audit_events').insert({
        actor_id: user.id,
        action: 'match.dispute.opened',
        entity_type: 'dispute',
        entity_id: dispute?.id,
        match_id: matchId,
      }),
    ])

    if (evidenceError || matchError) {
      setError(evidenceError?.message || matchError?.message || 'Evidence submitted but follow-up update failed.')
    } else {
      toast.success('Dispute opened and evidence uploaded.')
      setSuccess(true)
    }
    setUploading(false)
  }

  if (success) {
    return (
      <div className="kaf-card p-4 rounded-xl border border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center gap-3">
        <CheckCircle className="text-emerald-500" />
        <span className="text-emerald-500 font-bold text-sm">Dispute filed and evidence uploaded successfully.</span>
      </div>
    )
  }

  return (
    <div className="kaf-card p-4 rounded-xl border border-status-live/30">
      <h3 className="text-sm font-bold text-status-live uppercase tracking-widest mb-3 flex items-center gap-2">
        <AlertOctagon size={16} /> Report Dispute
      </h3>
      <p className="text-xs text-slate-400 mb-4">
        If the reported score is incorrect, upload video/screenshot evidence here. This will pause the bracket and alert moderators.
      </p>
      <textarea
        value={reason}
        onChange={e => setReason(e.target.value)}
        placeholder="Explain the dispute..."
        className="mb-3 h-20 w-full resize-none rounded-lg border border-kaf-border bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-status-live"
      />
      
      <div className="flex items-center gap-3">
        <input 
          type="file" 
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer w-full"
        />
        <button 
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-status-live text-white px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap flex items-center gap-2 hover:bg-red-500 disabled:opacity-50 transition-colors"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          Upload Evidence
        </button>
      </div>
      {error && <p className="text-status-live text-xs mt-2">{error}</p>}
    </div>
  )
}
