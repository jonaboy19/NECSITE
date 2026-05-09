import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  let event: { name?: string; payload?: unknown; path?: string; at?: string }

  try {
    event = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!event.name || event.name.length > 80) {
    return NextResponse.json({ error: 'Invalid event name' }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('analytics_events').insert({
    name: event.name,
    payload: event.payload ?? {},
    path: event.path ?? null,
    occurred_at: event.at ?? new Date().toISOString(),
    user_id: user?.id ?? null,
  })

  if (error) {
    return NextResponse.json({ ok: false }, { status: 202 })
  }

  return NextResponse.json({ ok: true })
}
