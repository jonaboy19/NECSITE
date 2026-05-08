'use client'

// Formation pitch positions per formation
export const FORMATIONS: Record<string, { x: number; y: number; role: string }[]> = {
  '4-3-3': [
    { x: 50, y: 8,  role: 'GK' },
    { x: 15, y: 28, role: 'LB' }, { x: 38, y: 25, role: 'CB' }, { x: 62, y: 25, role: 'CB' }, { x: 85, y: 28, role: 'RB' },
    { x: 25, y: 50, role: 'CM' }, { x: 50, y: 48, role: 'CM' }, { x: 75, y: 50, role: 'CM' },
    { x: 18, y: 78, role: 'LW' }, { x: 50, y: 82, role: 'ST' }, { x: 82, y: 78, role: 'RW' },
  ],
  '4-4-2': [
    { x: 50, y: 8,  role: 'GK' },
    { x: 15, y: 28, role: 'LB' }, { x: 38, y: 25, role: 'CB' }, { x: 62, y: 25, role: 'CB' }, { x: 85, y: 28, role: 'RB' },
    { x: 15, y: 55, role: 'LM' }, { x: 38, y: 52, role: 'CM' }, { x: 62, y: 52, role: 'CM' }, { x: 85, y: 55, role: 'RM' },
    { x: 38, y: 82, role: 'ST' }, { x: 62, y: 82, role: 'ST' },
  ],
  '4-2-3-1': [
    { x: 50, y: 8,  role: 'GK' },
    { x: 15, y: 28, role: 'LB' }, { x: 38, y: 25, role: 'CB' }, { x: 62, y: 25, role: 'CB' }, { x: 85, y: 28, role: 'RB' },
    { x: 35, y: 45, role: 'DM' }, { x: 65, y: 45, role: 'DM' },
    { x: 18, y: 68, role: 'LAM' }, { x: 50, y: 65, role: 'CAM' }, { x: 82, y: 68, role: 'RAM' },
    { x: 50, y: 88, role: 'ST' },
  ],
  '3-5-2': [
    { x: 50, y: 8,  role: 'GK' },
    { x: 28, y: 25, role: 'CB' }, { x: 50, y: 22, role: 'CB' }, { x: 72, y: 25, role: 'CB' },
    { x: 12, y: 50, role: 'LWB' }, { x: 32, y: 50, role: 'CM' }, { x: 50, y: 48, role: 'CM' }, { x: 68, y: 50, role: 'CM' }, { x: 88, y: 50, role: 'RWB' },
    { x: 38, y: 82, role: 'ST' }, { x: 62, y: 82, role: 'ST' },
  ],
  '3-4-3': [
    { x: 50, y: 8,  role: 'GK' },
    { x: 28, y: 25, role: 'CB' }, { x: 50, y: 22, role: 'CB' }, { x: 72, y: 25, role: 'CB' },
    { x: 15, y: 55, role: 'LM' }, { x: 38, y: 52, role: 'CM' }, { x: 62, y: 52, role: 'CM' }, { x: 85, y: 55, role: 'RM' },
    { x: 18, y: 78, role: 'LW' }, { x: 50, y: 82, role: 'ST' }, { x: 82, y: 78, role: 'RW' },
  ],
  '5-3-2': [
    { x: 50, y: 8,  role: 'GK' },
    { x: 12, y: 28, role: 'LWB' }, { x: 32, y: 24, role: 'CB' }, { x: 50, y: 22, role: 'CB' }, { x: 68, y: 24, role: 'CB' }, { x: 88, y: 28, role: 'RWB' },
    { x: 28, y: 55, role: 'CM' }, { x: 50, y: 52, role: 'CM' }, { x: 72, y: 55, role: 'CM' },
    { x: 38, y: 82, role: 'ST' }, { x: 62, y: 82, role: 'ST' },
  ],
}

interface Player {
  id: string
  display_name?: string
  username?: string
  avatar_url?: string | null
  position?: string
}

interface FormationPitchProps {
  formation?: string
  players?: Player[]
  interactive?: boolean
  onPlayerClick?: (position: number, player?: Player) => void
  className?: string
}

const FORMATION_KEYS = Object.keys(FORMATIONS)

export function FormationPitch({ formation = '4-3-3', players = [], interactive = false, onPlayerClick, className = '' }: FormationPitchProps) {
  const positions = FORMATIONS[formation] || FORMATIONS['4-3-3']

  return (
    <div className={`relative w-full rounded-xl overflow-hidden ${className}`} style={{ aspectRatio: '0.65' }}>
      {/* Pitch background */}
      <svg viewBox="0 0 100 154" className="absolute inset-0 w-full h-full">
        {/* Grass stripes */}
        {Array.from({ length: 11 }).map((_, i) => (
          <rect key={i} x="0" y={i * 14} width="100" height="14"
            fill={i % 2 === 0 ? '#166534' : '#15803d'} />
        ))}
        {/* Pitch outline */}
        <rect x="3" y="3" width="94" height="148" fill="none" stroke="#4ade80" strokeWidth="0.4" strokeOpacity="0.5" rx="0.5" />
        {/* Centre circle */}
        <circle cx="50" cy="77" r="12" fill="none" stroke="#4ade80" strokeWidth="0.3" strokeOpacity="0.5" />
        <line x1="3" y1="77" x2="97" y2="77" stroke="#4ade80" strokeWidth="0.3" strokeOpacity="0.5" />
        {/* Centre spot */}
        <circle cx="50" cy="77" r="0.6" fill="#4ade80" fillOpacity="0.6" />
        {/* Top penalty area */}
        <rect x="22" y="3" width="56" height="20" fill="none" stroke="#4ade80" strokeWidth="0.3" strokeOpacity="0.5" />
        <rect x="34" y="3" width="32" height="10" fill="none" stroke="#4ade80" strokeWidth="0.3" strokeOpacity="0.5" />
        {/* Bottom penalty area */}
        <rect x="22" y="131" width="56" height="20" fill="none" stroke="#4ade80" strokeWidth="0.3" strokeOpacity="0.5" />
        <rect x="34" y="141" width="32" height="10" fill="none" stroke="#4ade80" strokeWidth="0.3" strokeOpacity="0.5" />
        {/* Goals */}
        <rect x="41" y="0" width="18" height="3" fill="none" stroke="#4ade80" strokeWidth="0.3" strokeOpacity="0.4" />
        <rect x="41" y="151" width="18" height="3" fill="none" stroke="#4ade80" strokeWidth="0.3" strokeOpacity="0.4" />
      </svg>

      {/* Players */}
      {positions.map((pos, i) => {
        const player = players[i]
        const initials = player
          ? ((player.display_name || player.username || '?')[0] || '?').toUpperCase()
          : pos.role[0]
        const hasPlayer = !!player

        return (
          <button
            key={i}
            onClick={() => interactive && onPlayerClick?.(i, player)}
            disabled={!interactive}
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
            className={`absolute flex flex-col items-center gap-0.5 group transition-all ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          >
            {/* Avatar circle */}
            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center text-[9px] md:text-[10px] font-black shadow-lg transition-all
              ${hasPlayer
                ? 'bg-brand-cyan/90 border-white/60 text-slate-900'
                : 'bg-slate-800/80 border-slate-600/50 text-slate-400'
              } ${interactive ? 'group-hover:border-white group-hover:shadow-brand-cyan/30 group-hover:shadow-xl' : ''}`}>
              {hasPlayer && player.avatar_url ? (
                <img src={player.avatar_url} alt={initials}
                  className="w-full h-full rounded-full object-cover" />
              ) : initials}
            </div>
            {/* Role label */}
            <span className="text-[7px] md:text-[8px] font-black text-white bg-black/60 px-1 rounded leading-tight">
              {hasPlayer ? (player.display_name || player.username || pos.role) : pos.role}
            </span>
          </button>
        )
      })}

      {/* Formation label */}
      <div className="absolute bottom-2 right-2 text-[9px] font-black text-white/60 bg-black/40 px-1.5 py-0.5 rounded">
        {formation}
      </div>
    </div>
  )
}

export { FORMATION_KEYS }
