'use client'

type EventPayload = Record<string, string | number | boolean | null | undefined>

export function trackEvent(name: string, payload: EventPayload = {}) {
  if (typeof window === 'undefined') return

  const body = JSON.stringify({
    name,
    payload,
    path: window.location.pathname,
    at: new Date().toISOString(),
  })

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', new Blob([body], { type: 'application/json' }))
    return
  }

  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {})
}
