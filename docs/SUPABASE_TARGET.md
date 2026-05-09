# Supabase Target

KAFConnect must use only this Supabase project:

- Project name: `KAFCONNECT`
- Project ref: `zcfiexvzbreympjhkohb`
- Project URL: `https://zcfiexvzbreympjhkohb.supabase.co`

Local app configuration is stored in `.env.local`, which is intentionally ignored by git. Do not reuse credentials, refs, or database URLs from any other Supabase project in this repository.

Current migration blocker:

- Resolved. The local Supabase CLI is linked to project ref `zcfiexvzbreympjhkohb`.
- The schema has been pushed to the KAFCONNECT project.

Current migration set:

- `20260509000000_import_combined_zip_schema.sql`
- `20260509010000_import_schema_fix_layer.sql`
- `20260509023500_analytics_events.sql`
- `20260509023600_flow_rls_hardening.sql`
- `20260509090000_esports_os_foundation.sql`
- `20260509222313_harden_clan_member_insert_policy.sql`

Expected CLI sequence for future pushes:

```powershell
.\node_modules\supabase\bin\supabase.exe db push
```
