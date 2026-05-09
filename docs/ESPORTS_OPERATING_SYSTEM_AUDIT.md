# KAFConnect Esports Operating System Audit

## Current State

KAFConnect is no longer just a tournament site. The repo already contains real Supabase-backed surfaces for:

- Public discovery: clans, tournaments, players, rankings, news, forum, free agents.
- Competition operations: tournament create, join, dashboard, bracket, matches, start flow, score reporting.
- Clan operations: clan HQ, roster, applications, recruitment status, clan wars, clan chat, match rooms, trophies, audit logs in schema.
- Community operations: direct messages, friends, notifications, forum, feed, appeals, admin panel.
- Platform shell: authenticated left navigation, right context panel, mobile tab bar, command search.

The strongest parts are the schema depth and route coverage. The weakest parts are consistency, real workflow completion, and mismatched status/relationship naming across older pages.

## Completed In This Pass

- Rebuilt the public look around the provided KAFConnect reference: black/green stadium atmosphere, compact navigation, clipped command panels, sharper cards, and esports typography.
- Deepened `/clans` with real search, recruiting filter, clan control stats, direct create/search actions, and KAF-styled organization cards.
- Deepened `/tournaments` with real search, status filters, event control stats, status-aware cards, and direct dashboard links.
- Updated `/e-league` to use the same theme language.
- Added a persistent collapsible authenticated left sidebar with icon-only mode.
- Added global `Ctrl+K` command search support from the sidebar.
- Removed the hardcoded right-panel "Active Lounges" mock block.
- Replaced the missing `broadcasts` query with real notifications, scheduled matches, and clan match rooms.
- Fixed dashboard links/status handling so the player dashboard routes users into their actual clan HQ.

## Must-Fix Before Heavy Community Use

1. Normalize status names.
   The app uses `active`, `live`, and `in_progress` in different places. Pick one canonical tournament live state, ideally `active`, and map legacy labels only in UI helpers.

2. Normalize clan member relationships.
   Some flows use `profile_id`; the original schema used `player_id`. Keep both only if necessary, but build helper functions/views so pages do not guess.

3. Replace seed/demo data policy.
   Historical migrations include multiple demo clans, players, and tournaments. Production should either start empty or use one clearly labeled demo clan and one clearly labeled demo tournament. Do not insert many fake rankings/players into production.

4. Add workflow audit logs to every mutation.
   Clan applications, role changes, tournament starts, score reports, disputes, transfers, and admin decisions should write to audit/activity tables.

5. Finish permission matrix.
   Define platform roles, clan roles, tournament roles, and per-action permissions in one shared layer. Buttons should render only when the current user can actually perform the action.

6. Finish realtime subscriptions.
   Chat, notifications, match states, clan applications, match rooms, and tournament progression should subscribe to Supabase realtime where needed.

7. Complete dispute center.
   The schema supports disputes, but the user journey needs evidence collection, moderator assignment, decision logging, and appeal routing.

8. Complete transfer/scouting workflows.
   Tables exist for transfers and scouting notes. The UI needs player listings, offer creation, negotiation state, acceptance/rejection, and history timelines.

9. Complete tournament operations.
   Tournament HQ should expose rules, participants, check-in, roster lock, schedule, bracket, disputes, media, admins, and statistics in one consistent control center.

10. Make mobile first-class.
   The mobile tab bar exists, but clan management, tournament dashboards, chat, disputes, and match lobbies need phone-sized verification.

## Recommended Build Order

1. Data contract cleanup: statuses, IDs, views, helper functions.
2. Permission/audit foundation: one permission helper and one audit write path.
3. Clan HQ v2: command center, roster contracts, applications, chat, feed, media, trophies.
4. Tournament HQ v2: participants, check-in, match lobby, bracket operations, disputes, admin panel.
5. Transfer/scouting system: free agents, offers, negotiation, timeline.
6. Realtime pass: notifications, chat, match state, applications.
7. Mobile QA pass: all core captain/player/admin flows.

## Definition Of Done For New Features

- Reads and writes real Supabase data.
- Has empty, loading, error, and success states.
- Logs the important action.
- Respects permissions.
- Has no dead buttons.
- Uses the KAF black/green/yellow/red theme.
- Works on mobile and desktop.
- Passes `npm run typecheck` and `npm run smoke`.
