'use client'

import { useEffect, useRef, useState } from 'react'

interface StatCounterProps {
  end: number
  suffix?: string
  prefix?: string
  duration?: number
}

function StatCounter({ end, suffix = '', prefix = '', duration = 2000 }: StatCounterProps) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return
    let startTime: number | null = null
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [hasStarted, end, duration])

  return (
    <div ref={ref} className="text-3xl md:text-4xl font-black text-white">
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  )
}

export default function AnimatedStats({ stats }: {
  stats: Array<{ end: number; suffix?: string; prefix?: string; label: string; color?: string }>
}) {
  return (
    <div className="grid grid-cols-3 gap-8 mt-20 max-w-lg mx-auto">
      {stats.map((stat, i) => (
        <div key={i}>
          <div className={stat.color || 'text-white'}>
            <StatCounter end={stat.end} suffix={stat.suffix} prefix={stat.prefix} />
          </div>
          <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
