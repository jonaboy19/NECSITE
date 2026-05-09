import { cn } from '@/lib/utils'

const STYLES: Record<string, string> = {
  live:              'bg-red-500/10 text-red-400 border-red-500/40',
  active:            'bg-red-500/10 text-red-400 border-red-500/40',
  scheduled:         'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/40',
  upcoming:          'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/40',
  completed:         'bg-slate-500/10 text-slate-400 border-slate-500/30',
  finished:          'bg-slate-500/10 text-slate-400 border-slate-500/30',
  disputed:          'bg-orange-500/10 text-orange-400 border-orange-500/40',
  registration:      'bg-purple-500/10 text-purple-400 border-purple-500/40',
  registration_open: 'bg-purple-500/10 text-purple-400 border-purple-500/40',
  draft:             'bg-slate-500/10 text-slate-400 border-slate-500/30',
  pending:           'bg-orange-500/10 text-orange-400 border-orange-500/40',
  approved:          'bg-green-500/10 text-green-400 border-green-500/40',
  rejected:          'bg-red-500/10 text-red-400 border-red-500/40',
  open:              'bg-orange-500/10 text-orange-400 border-orange-500/40',
  reviewing:         'bg-blue-500/10 text-blue-400 border-blue-500/40',
  resolved:          'bg-green-500/10 text-green-400 border-green-500/40',
  cancelled:         'bg-slate-500/10 text-slate-400 border-slate-500/30',
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const isLive = status === 'live' || status === 'active'
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-[0_8px_18px_rgba(0,0,0,0.22)]',
      STYLES[status] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      className
    )}>
      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
      {status.replace(/_/g, ' ')}
    </span>
  )
}
