import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

export function EmptyState({
  Icon,
  title,
  description,
  action,
}: {
  Icon: LucideIcon
  title: string
  description: string
  action?: { href: string; label: string }
}) {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-kaf-border bg-kaf-card px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-500">
        <Icon size={30} />
      </div>
      <h3 className="mb-2 text-xl font-black text-white">{title}</h3>
      <p className="mb-6 max-w-md text-sm leading-relaxed text-slate-400">{description}</p>
      {action && (
        <Link href={action.href} className="rounded-xl bg-brand-cyan px-5 py-3 text-sm font-black text-white shadow-glow-green transition-colors hover:bg-brand-lime">
          {action.label}
        </Link>
      )}
    </div>
  )
}
