# Supabase Target

KAFConnect must use only this Supabase project:

- Project name: `KAFCONNECT`
- Project ref: `zcfiexvzbreympjhkohb`
- Project URL: `https://zcfiexvzbreympjhkohb.supabase.co`

Local app configuration is stored in `.env.local`, which is intentionally ignored by git. Do not reuse credentials, refs, or database URLs from any other Supabase project in this repository.

Current migration blocker:

- The publishable browser key is enough for the Next.js client to connect to the project.
- Supabase CLI migrations require a valid Supabase personal access token plus the project database password, or a direct Postgres connection string for this project.
- A valid Supabase personal access token starts with `sbp_`.

Expected CLI sequence once the correct credentials are available:

```powershell
.\node_modules\supabase\bin\supabase.exe login --token <supabase_personal_access_token>
.\node_modules\supabase\bin\supabase.exe link --project-ref zcfiexvzbreympjhkohb --password <project_database_password>
.\node_modules\supabase\bin\supabase.exe db push
```
