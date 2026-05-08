'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Award, Trophy, Shield, Zap, Video, Star, BadgeCheck } from 'lucide-react'

const ICON_MAP: Record<string, any> = { Award, Trophy, Shield, Zap, Video, Star, BadgeCheck }
const RARITY_GLOW: Record<string, string> = {
  common:    'ring-slate-500/30',
  rare:      'ring-blue-500/50',
  epic:      'ring-purple-500/60',
  legendary: 'ring-amber-500/70 shadow-amber-500/30 shadow-lg',
}

interface UserBadgesProps { userId: string; size?: 'sm'|'md'|'lg'; max?: number }

export function UserBadges({ userId, size = 'md', max = 8 }: UserBadgesProps) {
  const supabase = createClient()
  const [badges, setBadges] = useState<any[]>([])

  useEffect(() => {
    let cancel = false
    supabase.from('user_badges')
      .select('id,awarded_at,note,badge:badge_id(slug,name,description,icon,color,rarity,category)')
      .eq('user_id', userId)
      .order('awarded_at', { ascending: false })
      .then(({ data }) => { if (!cancel) setBadges(data ?? []) })
    return () => { cancel = true }
  }, [userId])

  if (!badges.length) return null

  const sizeMap = { sm: 'h-6 w-6', md: 'h-8 w-8', lg: 'h-11 w-11' }
  const iconSizeMap = { sm: 12, md: 14, lg: 18 }
  const list = badges.slice(0, max)
  const more = badges.length - list.length

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {list.map((ub) => {
        const b = ub.badge
        if (!b) return null
        const Icon = ICON_MAP[b.icon] ?? Award
        const glow = RARITY_GLOW[b.rarity] ?? RARITY_GLOW.common
        return (
          <div key={ub.id} title={`${b.name}${b.description ? ' — ' + b.description : ''}`}
            className={`${sizeMap[size]} rounded-full ring-2 ${glow} flex items-center justify-center transition-transform hover:scale-110 cursor-help`}
            style={{ backgroundColor: b.color + '22', borderColor: b.color + '66' }}>
            <Icon size={iconSizeMap[size]} style={{ color: b.color }} />
          </div>
        )
      })}
      {more > 0 && (
        <span className="text-[10px] text-slate-500 font-bold">+{more}</span>
      )}
    </div>
  )
}
