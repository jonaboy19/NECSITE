# Manual Flow Test Checklist

Use this on the deployed site after Vercel has the correct Supabase environment variables.

## Auth

- Register with a new email and username.
- Open the confirmation email and verify that `/auth/callback` lands on `/dashboard`.
- Sign out from `/settings`.
- Sign in again with the magic link.
- Open `/dashboard` while signed out and confirm the login page explains why sign-in is required.
- Request a password reset from `/auth/reset-password`.

## Profile

- Open `/settings`.
- Update display name, bio, region, Discord username, Twitch username, and eFootball ID.
- Upload an avatar and confirm the image still loads after refresh.

## Clan

- Open `/clans`.
- Search by clan name.
- Toggle the recruiting filter.
- Create or join a clan with a normal user account.

## Tournament

- Open `/tournaments`.
- Search by tournament name.
- Filter by open, live, and completed.
- Join a tournament as a clan member.
- Confirm the registration appears as pending for staff/admin review.

## Match Report

- Open `/matches/report`.
- Submit a score for a scheduled or live match.
- Confirm a row is created in `match_results` with `status = 'pending'`.
- Confirm normal users cannot directly update the canonical `matches` row.

## Access Control

- Confirm logged-out users are redirected from `/dashboard`, `/settings`, `/messages`, and tournament management pages.
- Confirm normal users cannot open admin-only actions.
- Confirm public pages still load: `/features`, `/how-it-works`, `/rules`, `/privacy`, `/terms`, `/tournaments`, `/clans`, `/players`, `/rankings`.
