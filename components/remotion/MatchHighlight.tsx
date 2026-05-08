import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

export const MatchHighlight = ({ 
  playerA = "HYDRØX", 
  playerB = "NOVA", 
  scoreA = 3, 
  scoreB = 1,
  tournamentName = "KAF E-League"
}: { 
  playerA?: string, playerB?: string, scoreA?: number, scoreB?: number, tournamentName?: string 
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' })
  
  const slideInA = spring({ frame, fps, config: { damping: 12 } })
  const slideInB = spring({ frame: frame - 10, fps, config: { damping: 12 } })
  const popScore = spring({ frame: frame - 30, fps, config: { damping: 10, stiffness: 200 } })

  return (
    <AbsoluteFill style={{ 
      backgroundColor: '#07111A', 
      color: 'white', 
      fontFamily: 'sans-serif',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      opacity 
    }}>
      <AbsoluteFill style={{ 
        backgroundImage: "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1920')", 
        backgroundSize: 'cover', 
        opacity: 0.15 
      }} />
      
      <h2 style={{ 
        color: '#00F0FF', 
        fontSize: '40px', 
        fontWeight: 'bold', 
        marginBottom: '60px',
        textTransform: 'uppercase',
        letterSpacing: '10px'
      }}>
        {tournamentName}
      </h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '80px', zIndex: 10 }}>
        {/* Player A */}
        <div style={{ 
          transform: `translateX(${(1 - slideInA) * -300}px)`, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}>
          <div style={{ 
            width: '200px', height: '200px', borderRadius: '40px', 
            border: '8px solid #00F0FF', marginBottom: '20px',
            backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${playerA}')`,
            backgroundColor: '#15232d'
          }} />
          <h1 style={{ fontSize: '60px', fontWeight: '900', margin: 0 }}>{playerA}</h1>
        </div>

        {/* VS / Score */}
        <div style={{ 
          transform: `scale(${popScore})`, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '20px',
          fontSize: '100px',
          fontWeight: 'black'
        }}>
          <span style={{ color: '#00F0FF' }}>{scoreA}</span>
          <span style={{ color: '#475569', fontSize: '60px' }}>-</span>
          <span style={{ color: '#F43F5E' }}>{scoreB}</span>
        </div>

        {/* Player B */}
        <div style={{ 
          transform: `translateX(${(1 - slideInB) * 300}px)`, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}>
          <div style={{ 
            width: '200px', height: '200px', borderRadius: '40px', 
            border: '8px solid #F43F5E', marginBottom: '20px',
            backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${playerB}')`,
            backgroundColor: '#15232d'
          }} />
          <h1 style={{ fontSize: '60px', fontWeight: '900', margin: 0 }}>{playerB}</h1>
        </div>
      </div>
      
      <div style={{ 
        position: 'absolute', 
        bottom: '40px', 
        fontSize: '24px', 
        color: '#475569', 
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '5px'
      }}>
        KAFConnect Live Results
      </div>
    </AbsoluteFill>
  )
}
