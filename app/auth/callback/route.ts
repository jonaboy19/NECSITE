import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Use the production URL if set, fallback to request origin (works for local dev too)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
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

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', user.id)
          .single()

        if (!existingProfile) {
          // First login — create profile
          const raw = user.user_metadata?.username || user.email?.split('@')[0] || 'player'
          const username = raw.replace(/[^a-z0-9_]/gi, '_').slice(0, 30)

          await supabase.from('profiles').insert({
            id: user.id,
            username,
            display_name: user.user_metadata?.display_name || username,
            role: 'user',
          })

          // Add to user_roles table
          await supabase.from('user_roles').insert({
            user_id: user.id,
            role: 'user',
          })
        }
      }

      return NextResponse.redirect(`${siteUrl}${next}`)
    }
  }

  return NextResponse.redirect(`${siteUrl}/auth/login?error=Could not authenticate`)
}
