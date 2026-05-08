'use client'
import { Player } from '@remotion/player'
import { MatchHighlight } from '@/components/remotion/MatchHighlight'

export default function HeroRemotionBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#020202] pointer-events-none">
      {/* Remotion Player as a dynamic animated background */}
      <div className="absolute inset-0 opacity-20 mix-blend-luminosity scale-110 grayscale">
        <Player
          component={MatchHighlight}
          durationInFrames={120}
          compositionWidth={1920}
          compositionHeight={1080}
          fps={30}
          autoPlay
          loop
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          inputProps={{
            playerA: "E-SPORT",
            playerB: "ELITE",
            scoreA: 99,
            scoreB: 1,
            tournamentName: "KAF CONNECT LIVE"
          }}
        />
      </div>
      
      {/* Heavy overlays to make text readable */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050505_90%)]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/40 to-[#050505]"></div>
      
      {/* Noise / grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
    </div>
  )
}
