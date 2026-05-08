'use client'
import { Player } from '@remotion/player'
import { MatchHighlight } from '@/components/remotion/MatchHighlight'
import { Video } from 'lucide-react'

export default function RemotionPreview() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 w-full">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-cyan/20 border border-brand-cyan/50 flex items-center justify-center text-brand-cyan shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <Video size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-display font-black text-white">Highlight Engine</h1>
            <p className="text-slate-400">Automated Remotion Video Generation Preview</p>
          </div>
        </div>

        <div className="w-full aspect-video rounded-3xl overflow-hidden border border-kaf-border shadow-2xl relative bg-black">
          <Player
            component={MatchHighlight}
            durationInFrames={120}
            compositionWidth={1920}
            compositionHeight={1080}
            fps={30}
            controls
            autoPlay
            loop
            style={{ width: '100%', height: '100%' }}
            inputProps={{
              playerA: "HYDRØX",
              playerB: "NOVA",
              scoreA: 3,
              scoreB: 1,
              tournamentName: "KAF E-League Finals"
            }}
          />
        </div>

        <div className="kaf-card p-6 rounded-2xl border border-kaf-border">
          <h3 className="font-bold text-white mb-2">How it works</h3>
          <p className="text-sm text-slate-400">
            This video is rendered entirely using React via Remotion. In production, when a match finishes, a serverless function will render this exact component into an MP4 file and automatically post it to the Center Feed and Discord.
          </p>
        </div>
        
      </div>
    </div>
  )
}
