import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSafeNext, withAuthError } from '@/lib/auth-redirect'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = getSafeNext(searchParams.get('next') || searchParams.get('redirect'))
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin

  if (!code) {
    return NextResponse.redirect(`${siteUrl}${withAuthError('/auth/login', 'Missing authentication code')}`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${siteUrl}${withAuthError('/auth/login', error.message)}`)
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const raw = user.user_metadata?.username || user.user_metadata?.gamertag || user.email?.split('@')[0] || 'player'
    const username = raw.replace(/[^a-z0-9_]/gi, '_').slice(0, 30)

    await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username,
        display_name: user.user_metadata?.display_name || username,
      }, { onConflict: 'id', ignoreDuplicates: true })
  }

  return NextResponse.redirect(`${siteUrl}${next}`)
}
