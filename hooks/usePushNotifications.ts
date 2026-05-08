'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// Convert base64url → Uint8Array (needed for VAPID public key)
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export function usePushNotifications() {
  const supabase = createClient()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    const setup = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Register service worker
        const reg = await navigator.serviceWorker.register('/sw.js')

        // Check if already subscribed
        const existing = await reg.pushManager.getSubscription()
        if (existing) return // already subscribed

        // Request permission
        const perm = await Notification.requestPermission()
        if (perm !== 'granted') return

        // Subscribe
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        })

        const subJson = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } }

        // Save subscription to DB
        await supabase.from('push_subscriptions').upsert(
          { user_id: user.id, endpoint: subJson.endpoint, keys: subJson.keys },
          { onConflict: 'user_id,endpoint' }
        )
      } catch (err) {
        console.warn('[Push] Setup failed:', err)
      }
    }

    setup()
  }, [])
}

// Utility: send push to a user via Edge Function
export async function sendPushToUser(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  title: string,
  body: string,
  url = '/messages'
) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-push-notification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ user_id: userId, title, body, url }),
      }
    )
  } catch {}
}
