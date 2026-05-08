'use client'
import { Flame } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LiveActivityTicker({ items = [] }: { items?: string[] }) {
  const [activeItems, setActiveItems] = useState<string[]>(items)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase.channel('live-tickers-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_tickers',
        },
        (payload) => {
          if (payload.new && payload.new.is_active && payload.new.message) {
            setActiveItems((prev) => [payload.new.message, ...prev].slice(0, 10))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  if (activeItems.length === 0) return null;

  return (
    <div className="relative flex h-12 overflow-hidden border-b border-kaf-border bg-kaf-panel">
      <div className="absolute left-0 top-0 z-10 flex h-full items-center bg-kaf-panel px-4 font-black tracking-widest text-status-live shadow-[20px_0_20px_-5px_rgba(11,22,34,1)] border-r border-kaf-border">
        <Flame size={18} className="mr-2" /> LIVE
      </div>
      
        <div className="flex w-full items-center overflow-hidden pl-24">
        <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap">
          {activeItems.map((activity, i) => (
            <span key={i} className="mx-8 text-sm font-semibold text-slate-300">
              {activity}
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {activeItems.map((activity, i) => (
            <span key={`dup-${i}`} className="mx-8 text-sm font-semibold text-slate-300">
              {activity}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
