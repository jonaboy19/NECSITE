export function getSafeNext(path: string | null, fallback = '/dashboard') {
  if (!path) return fallback
  if (!path.startsWith('/') || path.startsWith('//')) return fallback
  if (path.startsWith('/auth/')) return fallback
  return path
}

export function withAuthError(path: string, message: string) {
  const params = new URLSearchParams({ error: message })
  return `${path}?${params.toString()}`
}
