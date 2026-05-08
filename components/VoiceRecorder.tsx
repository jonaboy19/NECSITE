'use client'
import { useRef, useState, useEffect } from 'react'
import { Mic, Square, Play, Pause, Trash2, Send } from 'lucide-react'

interface Props {
  onSend: (audioBlob: Blob, durationSec: number) => void
  onCancel: () => void
}

export function VoiceRecorder({ onSend, onCancel }: Props) {
  const [state, setState] = useState<'idle' | 'recording' | 'recorded'>('recording')
  const [elapsed, setElapsed] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [audioDuration, setAudioDuration] = useState(0)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    startRecording()
    return () => cleanup()
  }, [])

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      mediaRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const b = new Blob(chunksRef.current, { type: 'audio/webm' })
        setBlob(b)
        setAudioDuration(elapsed)
        setState('recorded')
        stream.getTracks().forEach(t => t.stop())
      }
      mr.start(100)
      setState('recording')
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } catch {
      onCancel()
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current)
    mediaRef.current?.stop()
  }

  function cleanup() {
    if (timerRef.current) clearInterval(timerRef.current)
    mediaRef.current?.stop()
    audioRef.current?.pause()
  }

  function togglePlay() {
    if (!blob) return
    if (!audioRef.current) {
      audioRef.current = new Audio(URL.createObjectURL(blob))
      audioRef.current.onended = () => setPlaying(false)
    }
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play(); setPlaying(true) }
  }

  function discard() { cleanup(); onCancel() }

  function send() {
    if (blob) { cleanup(); onSend(blob, audioDuration) }
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-t border-kaf-border">
      {/* Discard */}
      <button onClick={discard} className="p-2 rounded-full text-red-400 hover:bg-red-500/10 transition-colors">
        <Trash2 size={18} />
      </button>

      {/* Waveform / timer */}
      <div className="flex-1 flex items-center gap-2">
        {state === 'recording' ? (
          <>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-mono text-white">{fmt(elapsed)}</span>
            <div className="flex-1 flex items-center gap-0.5 h-6">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="flex-1 bg-brand-cyan/40 rounded-full animate-pulse"
                  style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 50}ms` }} />
              ))}
            </div>
          </>
        ) : (
          <>
            <button onClick={togglePlay} className="p-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan">
              {playing ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <span className="text-sm font-mono text-white">{fmt(audioDuration)}</span>
            <div className="flex-1 h-1 bg-slate-700 rounded-full">
              <div className="h-full bg-brand-cyan rounded-full w-0 transition-all" />
            </div>
          </>
        )}
      </div>

      {/* Stop / Send */}
      {state === 'recording' ? (
        <button onClick={stopRecording} className="p-2.5 rounded-full bg-red-500 hover:bg-red-400 text-white transition-colors">
          <Square size={16} fill="white" />
        </button>
      ) : (
        <button onClick={send} className="p-2.5 rounded-full bg-brand-cyan hover:bg-brand-cyan/80 text-slate-900 transition-colors">
          <Send size={16} />
        </button>
      )}
    </div>
  )
}
