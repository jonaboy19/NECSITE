export function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-800 rounded-xl ${className}`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="kaf-card rounded-2xl border border-kaf-border p-5 space-y-4">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-1/2" />
          <SkeletonBlock className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonBlock className="h-3 w-full" />
      <SkeletonBlock className="h-3 w-4/5" />
      <div className="grid grid-cols-2 gap-3">
        <SkeletonBlock className="h-10" />
        <SkeletonBlock className="h-10" />
      </div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-kaf-border/50">
      <SkeletonBlock className="w-8 h-8 rounded-full shrink-0" />
      <SkeletonBlock className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="h-3 w-20" />
      </div>
      <SkeletonBlock className="h-6 w-16 hidden md:block" />
      <SkeletonBlock className="h-6 w-16 ml-auto" />
    </div>
  )
}

export function SkeletonHero() {
  return (
    <div className="relative w-full h-72 bg-kaf-panel border-b border-kaf-border overflow-hidden animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-t from-kaf-bg to-transparent" />
      <div className="absolute bottom-8 left-8 space-y-3">
        <SkeletonBlock className="h-6 w-32" />
        <SkeletonBlock className="h-10 w-64" />
        <SkeletonBlock className="h-4 w-80" />
      </div>
    </div>
  )
}

export function SkeletonProfile() {
  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-end gap-6">
        <SkeletonBlock className="w-28 h-28 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-3 pb-2">
          <SkeletonBlock className="h-8 w-48" />
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-3 w-64" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
      <SkeletonBlock className="h-64 rounded-2xl" />
    </div>
  )
}
