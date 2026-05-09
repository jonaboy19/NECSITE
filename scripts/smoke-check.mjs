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
  'app/matches/report/page.tsx',
  'app/how-it-works/page.tsx',
  'app/rules/page.tsx',
  'app/privacy/page.tsx',
  'app/terms/page.tsx',
  'components/FeatureHub.tsx',
  'components/EmptyState.tsx',
  'lib/auth-redirect.ts',
  'proxy.ts',
]

const missing = requiredPaths.filter((path) => !existsSync(join(root, path)))

if (missing.length) {
  console.error('Missing required routes/files:')
  for (const path of missing) console.error(`- ${path}`)
  process.exit(1)
}

console.log(`Smoke check passed: ${requiredPaths.length} core routes/files exist.`)
