'use client'
import Link from 'next/link'
import { Plus, Trophy, Users, User, BarChart3 } from 'lucide-react'

const iconMap: { [key: string]: any } = {
  Plus,
  Trophy,
  Users,
  User,
  BarChart3,
}

interface QuickActionProps {
  href: string
  label: string
  icon: string
  color?: string
  className?: string
}

export function QuickAction({ href, label, icon, color = 'cyan', className = '' }: QuickActionProps) {
  const IconComponent = iconMap[icon] || Plus
  const colorClasses = {
    cyan: 'bg-cyan-400 hover:bg-cyan-300 text-slate-950',
    slate: 'bg-slate-700 hover:bg-slate-600 text-white',
    emerald: 'bg-emerald-400 hover:bg-emerald-300 text-slate-950',
  }

  const baseColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.cyan

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition ${baseColor} ${className}`}
    >
      <IconComponent size={18} />
      {label}
    </Link>
  )
}

export function QuickActionsBar({ actions }: { actions: QuickActionProps[] }) {
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {actions.map(action => (
        <QuickAction key={action.href} {...action} />
      ))}
    </div>
  )
}

export function QuickActionButton({
  href,
  label,
  icon = 'Plus',
  color = 'cyan',
  size = 'md'
}: QuickActionProps & { size?: 'sm' | 'md' | 'lg' }) {
  const IconComponent = iconMap[icon] || Plus
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const colorClasses = {
    cyan: 'bg-cyan-400 hover:bg-cyan-300 text-slate-950',
    slate: 'bg-slate-700 hover:bg-slate-600 text-white',
    emerald: 'bg-emerald-400 hover:emerald-300 text-slate-950',
  }

  const baseColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.cyan

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-lg font-semibold transition ${baseColor} ${sizes[size]}`}
    >
      <IconComponent size={20} />
      {label}
    </Link>
  )
}