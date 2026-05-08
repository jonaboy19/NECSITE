import type { SupabaseClient } from '@supabase/supabase-js'

export async function isAdmin(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const [{ data: profile }, { data: role }] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', userId).single(),
    supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle(),
  ])
  const roles = ['admin', 'super_admin', 'moderator']
  return roles.includes(profile?.role) || roles.includes(role?.role)
}
