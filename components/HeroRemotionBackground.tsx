'use client'
import { Player } from '@remotion/player'
import { MatchHighlight } from '@/components/remotion/MatchHighlight'

export default function HeroRemotionBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black pointer-events-none">
      {/* Remotion Player as a dynamic animated background */}
      <div className="absolute inset-0 opacity-40 mix-blend-screen scale-110">
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#111418_80%)]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#111418]/60 to-[#111418]"></div>
      
      {/* Noise / grid pattern */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(0,255,102,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,102,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
    </div>
  )
}
