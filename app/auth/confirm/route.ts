import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getSafeNext, withAuthError } from '@/lib/auth-redirect'

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get('token_hash')
  const type = request.nextUrl.searchParams.get('type') as EmailOtpType | null
  const next = getSafeNext(request.nextUrl.searchParams.get('next') || request.nextUrl.searchParams.get('redirect'))
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${siteUrl}${withAuthError('/auth/login', 'Missing confirmation token')}`)
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  })

  if (error) {
    return NextResponse.redirect(`${siteUrl}${withAuthError('/auth/login', error.message)}`)
  }

  return NextResponse.redirect(`${siteUrl}${next}`)
}
