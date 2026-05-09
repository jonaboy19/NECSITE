import { existsSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

const requiredPaths = [
  'app/page.tsx',
  'app/features/page.tsx',
  'app/auth/login/page.tsx',
  'app/auth/register/page.tsx',
  'app/auth/callback/route.ts',
  'app/auth/confirm/route.ts',
  'app/auth/reset-password/page.tsx',
  'app/auth/update-password/page.tsx',
  'app/tournaments/page.tsx',
  'app/clans/page.tsx',
  'app/players/page.tsx',
  'app/transfers/page.tsx',
  'app/scouting/page.tsx',
  'app/seasons/page.tsx',
  'app/awards/page.tsx',
  'app/calendar/page.tsx',
  'app/moderation/page.tsx',
  'app/matches/report/page.tsx',
  'app/how-it-works/page.tsx',
  'app/rules/page.tsx',
  'app/privacy/page.tsx',
  'app/terms/page.tsx',
  'components/FeatureHub.tsx',
  'components/MobileTabBar.tsx',
  'components/RightSidebar.tsx',
  'components/EmptyState.tsx',
  'lib/auth-redirect.ts',
  'proxy.ts',
  'supabase/migrations/20260509000000_import_combined_zip_schema.sql',
  'supabase/migrations/20260509010000_import_schema_fix_layer.sql',
  'supabase/migrations/20260509023500_analytics_events.sql',
  'supabase/migrations/20260509023600_flow_rls_hardening.sql',
  'supabase/migrations/20260509090000_esports_os_foundation.sql',
  'supabase/migrations/20260509222313_harden_clan_member_insert_policy.sql',
  'docs/manual-flow-test-checklist.md',
  'docs/ESPORTS_OPERATING_SYSTEM_AUDIT.md',
  'docs/SUPABASE_TARGET.md',
]

const missing = requiredPaths.filter((path) => !existsSync(join(root, path)))

if (missing.length) {
  console.error('Missing required routes/files:')
  for (const path of missing) console.error(`- ${path}`)
  process.exit(1)
}

console.log(`Smoke check passed: ${requiredPaths.length} core routes/files exist.`)
