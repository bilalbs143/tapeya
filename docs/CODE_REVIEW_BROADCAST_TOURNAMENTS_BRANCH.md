# Code review: broadcast / tournaments / backoffice branch

Consolidated review (chunk-by-chunk) plus the five highest-priority follow-ups.  
Generated from a static review of the working tree; re-run tests and security review after fixes.

---

## Five highest-priority follow-ups

1. **Authorize or bind `Tournament` and `TournamentMatch` (and related nested models) on admin API routes** so route-model binding cannot resolve arbitrary IDs outside the caller’s scope—especially for users with `hasBroadcastBackofficeRole()`. `TournamentController::baseQuery()` scopes list/show/update for the resource, but nested routes such as `tournaments/{tournament}/teams`, `matches/{match}/…`, etc. use implicit binding and must enforce the same staff scope (IDOR risk).

2. **`app/src/store/api/baseApi.js`**: Default `baseUrl` was changed toward local development. **Revert or environment-guard** so production builds without `VITE_API_URL` do not point at localhost.

3. **`ScorecardController` read paths** (`scorecard`, `playerStats`): Now require `canScoreMatchInApp`. **Confirm product intent**—any previous read-only access for non-staff users or tools will break unless intentionally removed.

4. **`admin.permission`**: Alias is registered but **not used on routes** (the removed `administrator.only` middleware is no longer registered). Either wire `admin.permission:…` to route groups or remove the unused alias to avoid dead configuration.

5. **Optional performance**: `match_scoring_audits` grows quickly with per-ball writes. Add an index such as `(tournament_match_id, created_at)` for reporting and retention queries.

---

## Chunk 1 (10 files)

| Area | Files reviewed (representative) |
|------|----------------------------------|
| Enums & admin auth | `AdminRoleEnum`, `AppRoleEnum`, `AdminAuthController` |
| Admin enums API | `EnumController` |
| Graphics | `MatchGraphicCaptionController` |
| Tournaments / users (admin) | `TournamentController`, `TournamentMatchController`, `UserController` |
| Shared | `BaseControllerTrait`, `MatchSquadController` (user) |

### Findings

- **Roles / auth**: `canAccessBackofficeApi()` for admin login and `AdminOnly` aligns Broadcast Operator with backoffice access; ensure all sensitive endpoints apply consistent authorization (see top priority #1).
- **`EnumController`**: `tournament_schedule_window`, `app_roles`, and `admin_roles` are clear; confirm all clients consume `admin_roles` where needed.
- **`BaseControllerTrait::noContent()`**: Returns `JsonResponse` with status 204 instead of Laravel’s `response()->noContent()`; minor semantic difference for clients expecting a non-JSON empty 204.
- **`TournamentController`**: Scoped `baseQuery()`, `created_by`, broadcaster sync on create for broadcast staff, and `EnsuresTournamentStaffAppRoles` are coherent.
- **`TournamentMatchController::store` (admin)**: Scheduling logic parallels the user API; risk of **logic drift** over time—consider a shared domain service later.
- **`UserController`**: App + admin role ID merge with guard-filtered queries is sound; edge cases around empty `role_ids` payloads depend on validation rules.
- **`MatchGraphicCaptionController`**: Return type widened for destroy; acceptable.
- **`MatchSquadController`**: `canOperateTournamentInApp` replaces organizer-only check; consistent with staff model.

---

## Chunk 2 (10 files)

| Area | Files |
|------|--------|
| User app — match ops | `MatchTossController`, `PlayingElevenController`, `ScorecardController` |
| User app — teams / tournaments | `TeamController`, `TournamentController`, `TournamentMatchController`, `TournamentTeamController` |
| Middleware / requests | `AdminOnly`, `AdminOnlyServiceProvider`, `StoreUserRequest` |

### Findings

- **Scorecard mutations + reads**: Permission checks use `canScoreMatchInApp`; **read endpoints gated the same way** is a notable product/API change (priority #3).
- **Audit trail**: Synchronous DB writes on ball create/update/delete increase load and storage (priority #5).
- **`TeamController::storeSquad`**: Tournament staff can manage squads for other sponsors’ teams when `canManageTeamSquadAsTournamentStaff` passes; verify this matches sponsor privacy rules.
- **`AdminOnlyServiceProvider`**: Registers `admin.permission` (see priority #4); `administrator.only` was removed as unused.
- **`StoreUserRequest`**: `admin_role_ids` optional alongside required `role_ids`; consistent with controller.

---

## Chunk 3 (10 files)

| Area | Files |
|------|--------|
| Requests / resources | `UpdateUserRequest`, `LoginResource`, `TournamentResource`, `UserResource` |
| Models / provider / seeders | `Team`, `User`, `AppServiceProvider`, `DatabaseSeeder`, `GraphicThemeSeeder`, `RoleSeeder` |

### Findings

- **`User`**: `isTournamentStaff`, `canOperateTournamentInApp`, `canScoreMatchInApp`, `canManageTeamSquadAsTournamentStaff`, `creator()` relationship—good centralization. `canScoreMatchInApp` uses `$match->loadMissing('tournament')` (extra query if not eager-loaded).
- **`LoginResource`**: `is_broadcast_staff` for backoffice UI is appropriate.
- **`TournamentResource`**: `created_by`, `creator`, `squad_player_count`, schedule phase fields support new UI.
- **`UserResource`**: `admin_roles`, `admin_role_ids`, `created_by`, `creator` align with user management changes.
- **`Team::getFilters`**: Search uses `LIKE` / `LOWER`; acceptable for admin-scale lists; not ideal for huge tables without indexes.
- **`AppServiceProvider`**: Custom `player` route binding scopes `{player}` to app users with player role—good for admin player routes.
- **Seeders**: Broadcaster app/admin roles, graphic theme for broadcast, `PermissionSeeder` in `DatabaseSeeder`—ensure production migration/seed strategy matches Spatie (if used).

---

## Chunk 4 (10 paths)

| Area | Paths |
|------|--------|
| API | `ScoringDemoSeeder`, `api/routes/api/v1/admin.php`, `api/routes/channels.php` |
| App (Vite) | `app/src/store/api/baseApi.js` |
| Backoffice shell | `backoffice/src/app/app.routes.ts`, `full.component.html/ts`, horizontal `header`/`sidebar` (partial) |

### Findings

- **`baseApi.js`**: Default API URL → **local dev risk in production** (priority #2).
- **`admin.php`**: Many new nested routes; **must** pair with scoped authorization for `{tournament}` / `{match}` (priority #1).
- **`channels.php`**: `canAccessBackofficeApi()` widens who may subscribe vs `isAdmin()` only; confirm notification channel policy is intended.
- **`app.routes.ts`**: `backofficeScopeGuard` after `authGuard` correctly narrows Broadcast Operator routes.
- **Layout / header**: Dynamic nav (`visibleNavItems`), user display, notification menu structure; horizontal header loads notifications on menu open + broadcast—reasonable.

---

## Chunk 5 (10 paths)

| Area | Paths |
|------|--------|
| Nav / header | `horizontal/sidebar.component.ts`, `shared/nav/sidebar-data.ts`, `vertical/header.*` |
| Models | `backoffice/src/app/models/auth.models.ts` |
| Dialogs / match controller | CM dialogs, `controller-settings-dialog.*` |

### Findings

- **`sidebar-data.ts`**: `getVisibleNavItems`, `broadcastStaffNavItems`, Teams link under tournaments; removed placeholder “Blocked users / Login history” entries—cleanup.
- **`vertical/header`**: Removed demo “Apps / Quick links”; notifications behind `isAdmin()`—confirm broadcast staff should not see admin notification inbox.
- **`auth.models.ts`**: `is_broadcast_staff` optional flag documented in UI logic.
- **Dialog grid classes**: Minor spacing tweaks (`gap-y` removed)—visual regression risk is low.
- **`controller-settings-dialog`**: `app-dialog-wrapper`, form `ngSubmit`, `app-submit-button` with `type="submit"`—consistent pattern.

---

## Chunk 6 (remaining modified backoffice + shared)

| Area | Examples |
|------|-----------|
| Tournaments UI | `tournament-matches`, `tournament-requests`, `tournaments`, `manage-user-dialog`; old `tournament-detail-dialog` removed (no code refs) |
| Services / utils | `location.service`, `tournament-matches.service`, `tournaments.service`, `users.service`, `http-params`, `list-params`, `status-class.util` |
| Styles / docs | `custom.scss`, header/expansion SCSS, `docs/SCORING.md` |

### Findings

- **`users.service` / `tournaments.service`**: Broadcaster endpoints, `UserSearchRow`, `adminUserSearch` with `toHttpParamsWithSearch`—clean consolidation.
- **`list-params`**: `filter[schedule_window]` matches API filters.
- **Tournament list/detail UX**: Large feature surface; rely on E2E/manual QA for navigation after removing the old detail dialog.
- **SCSS**: Small layout tweaks—low risk.

---

## Chunk 7 (new admin controllers & middleware)

| Components |
|-------------|
| `PlayerController`, `TeamController`, `TournamentBroadcasterController`, `TournamentMatchSquadController`, `TournamentTeamSquadController`, `TournamentTeamsController`, `UserSearchController` |
| `EnsuresTournamentStaffAppRoles`, `EnsureAdminPermission` |

### Findings

- **IDOR / authorization gap** (priority #1): Nested controllers generally validate **business rules** (pivot, team in match, etc.) but **do not assert** the authenticated user may operate on the resolved tournament or match for **backoffice-scoped** users.
- **`UserSearchController`**: `broadcasterResults` loads any tournament by id for search context without proving the requester may access that tournament—smaller leak / consistency issue.
- **`PlayerController::importCsv`**: Now any caller passing `admin.only` may import (resolved: no extra role gate).
- **`TournamentTeamsController::destroy`**: Deletes matches involving team inside transaction—heavy but intentional; ensure messaging matches product.
- **Unused middleware on routes** (priority #4).

---

## Chunk 8 (new migrations, requests, resources, services, guards, front pages, docs, samples)

| Area | Examples |
|------|-----------|
| Migrations | `tournament_broadcaster`, `match_scoring_audits`, `created_by` on tournaments/users |
| Services | `PlayerCsvImportService` |
| Backoffice | Guards, dashboard, players-management, tournament-detail shell/tabs, teams, services (`players`, `teams`, `tournament-teams`), shared helpers |
| Docs / samples | `BROADCASTER_ROLE.md`, `SHARED_DOMAIN_SERVICES.md`, sample CSV |

### Findings

- **`PlayerCsvImportService`**: Header validation, row cap (500), streaming read—reasonable; watch operational limits for large imports.
- **`match_scoring_audits`**: Table growth; index suggestion (priority #5).
- **Front guards**: `backoffice-scope`, broadcast players guard, dashboard match—align with API scope fixes after server-side hardening.
- **Docs / sample CSV**: Support onboarding and QA.

---

## How to use this document

- Treat **section “Five highest-priority follow-ups”** as the pre-merge checklist.
- Use **chunks** for ownership (API vs backoffice vs app) and for incremental fixes.
- After changes, update this file or replace it with a short “resolved” note linking to PR/commits.

---

## Coverage: 148 paths, 15 chunks

The working tree contains **148 paths** (modified tracked + untracked), counted with:

`(git diff --name-only HEAD; git ls-files --others --exclude-standard) | sort -u | wc -l`

**Chunks 1–8** (earlier in this doc) were the first pass. **Chunks 9–15** below continue the review for paths that were only summarized before, plus **Appendix A** (full manifest) and **Appendix B** (checkbox list you can tick manually).

---

## Chunk 9 — Admin FormRequests & small resources

| Path | Note |
|------|------|
| `StoreTournamentBroadcasterRequest` | `authorize(): true`; relies entirely on route middleware — pair with scoped tournament policy (top fix #1). |
| `StoreBroadcasterPlayerRequest` / `UpdateBroadcasterPlayerRequest` / `StorePlayerCsvImportRequest` | Same: `authorize()` is open; CSV rules (`mimes:csv,txt`, `max:5120`) are reasonable — consider stricter MIME / virus scan if uploads are untrusted. |
| `StoreTeamRequest` / `UpdateTeamRequest` | `authorize()` only checks user logged in, not role — OK if `admin.only` is enough; broadcast staff can hit teams API per current routes. |
| `TournamentBroadcasterUserResource` | Minimal fields; fine for pickers. |

---

## Chunk 10 — Models, custom relation, migrations

| Path | Note |
|------|------|
| `MatchScoringAudit` | Model is fine; migration lacks composite index (top fix #5). |
| `TournamentSquadPlayersRelation` | Non-trivial `BelongsToMany` override — worth **unit/feature tests** for `withCount`/eager loads; regression risk if Laravel internals change. |
| `2026_04_18_100000_create_tournament_broadcaster_table` | `unique(tournament_id)` matches “one staff per tournament” — good. |
| `2026_04_18_150000_add_created_by_to_tournaments_table` | `nullOnDelete` on `created_by` — good for user removal. |
| `2026_04_21_210000_add_created_by_to_users_table` | Self-FK on `users` — same. |
| `TournamentScheduleWindowEnum` | Clear labels; schedule phase uses app timezone (`now()`) — document if you need UTC. |

---

## Chunk 11 — `TournamentTeamSquadController` & squad payload

| Path | Note |
|------|------|
| `TournamentTeamSquadController` | No explicit “caller may manage this tournament” check (same IDOR family as other nested admin routes). Returns **`UserResource::collection`** for squad — may expose **more PII** than `TournamentBroadcasterUserResource`; confirm whether full user rows are intended for broadcast UI. |

---

## Chunk 12 — `PermissionSeeder` & permission model

| Path | Note |
|------|------|
| `PermissionSeeder` | Seeds slugs and assigns to Broadcaster + Super Admin roles — **align with routes**: middleware `admin.permission` is still unused (top fix #4). Until wired, permissions are **documentation-only**. |

---

## Chunk 13 — Backoffice: routes, guards, shell, dashboard

| Path | Note |
|------|------|
| `tournaments-management.routes.ts` | Detail shell + tabs + `match-controller/:matchId` — confirm `matchId` loads only matches user may access once API is fixed. |
| `dashboard.routes.ts` | `canMatch` for broadcast dashboard vs default eCommerce — correct pattern; order of route entries matters (first match wins). |
| `backoffice-scope.guard.ts` | Allows `/tournaments-management/*` broadly — **server must still enforce** scope (defense in depth). |
| `players-management.routes.ts` | ~~`broadcast-players-management.guard`~~ removed — players area + CSV import use `auth` + `admin.only` like other admin modules. |
| `broadcast-staff-dashboard.match.ts` | Matches broadcast-only dashboard — OK. |
| `full.component.ts/html` | `visibleNavItems` + profile signals — consistent with horizontal layout. |

---

## Chunk 14 — Backoffice: services, utils, players/teams pages

| Path | Note |
|------|------|
| `tournament-teams.service.ts` / `tournament-matches.service.ts` | Admin URLs align with `admin.php`; `createMatch` added — ensure UI handles 403/422 from new validations. |
| `players.service.ts` / `teams.service.ts` | Global registry/list APIs — if broadcast staff should not list **all** teams/players, add server-side scoping (product decision). |
| `location.service.ts` | Refactor to `toHttpParamsWithSearch` — good consistency. |
| `auth-user-display.ts` | `Broadcast Staff` label — OK; keep in sync with `LoginResource` flags. |
| `form-control-error-message.ts` | Generic helper — low risk. |
| `status-class.util.ts` | Adds `upcoming` / `live` for schedule phase badges — matches `TournamentResource` schedule phase strings. |
| `players-management.routes.ts` + players components | Wire CSV + CRUD — **manually test** import dry-run, validation errors, and list pagination. |
| `teams.component` + `manage-team-dialog` | FormData create/update — test logo upload size (2MB) and sponsor picker. |

---

## Chunk 15 — Tournament detail UI, match controller, misc

| Path | Note |
|------|------|
| `tournament-detail-shell` | On `getById` error, redirects to list — good UX; 403 from API will behave same as 404 unless you distinguish. |
| `tournament-overview-tab` / `tournament-teams-tab` / `tournament-squads-tab` | Broadcaster assignment, attach teams, squad editors — heavy QA surface (see checklist B.3). |
| `attach-tournament-teams-dialog` / `edit-tournament-team-group-dialog` / `manage-team-squad-dialog` / `schedule-tournament-match-dialog` | Same-group / group-index validation mirrors API — retest edge cases (single group vs multi-group). |
| `tournament-matches.component` | List + open match controller — confirm routing to `match-controller/:matchId`. |
| `match-controller-dashboard` / `match-caption-dialog` | Graphics/scoring UX — retest with broadcast account after API hardening. |
| `tournaments.component` / `manage-tournament-dialog` | Filters include `schedule_window` — confirm enum values match API. |
| `tournament-detail-dialog` (deleted) | **Resolved:** repo grep shows **no** remaining imports/routes; only this doc’s historical manifest lines were stale (removed below). |
| `manage-user-dialog` | `admin_role_ids` UI — verify create/update payloads match `StoreUserRequest` / `UpdateUserRequest`. |
| `tournament-request-detail-dialog.component.html` | If only HTML tweak — low risk. |
| `order-detail-dialog` / CM dialogs | Grid `gap-y` removals — quick visual check. |
| `custom.scss`, `_header.scss`, `_expansion.scss` | Visual regression on header/expansion. |
| `sample-players-import.csv` | Keep in sync with `PlayerCsvImportService::HEADER_KEYS`. |
| `BROADCASTER_ROLE.md` / `SHARED_DOMAIN_SERVICES.md` | Reference for § scoring / domain — keep consistent with implemented code. |
| `SCORING.md` | Updated for `canScoreMatchInApp` + audits — good; matches top fix #3 discussion. |
| `app/src/store/api/baseApi.js` | **Production default host** (top fix #2). |
| `CODE_REVIEW_BROADCAST_TOURNAMENTS_BRANCH.md` | This file (meta; exclude from release notes if desired). |

---

## Appendix A — Full manifest (148 paths)

<details>
<summary>Click to expand all paths (sorted)</summary>

```
api/app/Enums/Tournament/TournamentScheduleWindowEnum.php
api/app/Enums/User/AdminRoleEnum.php
api/app/Enums/User/AppRoleEnum.php
api/app/Http/Controllers/Admin/Auth/AdminAuthController.php
api/app/Http/Controllers/Admin/Concerns/EnsuresTournamentStaffAppRoles.php
api/app/Http/Controllers/Admin/EnumController.php
api/app/Http/Controllers/Admin/MatchGraphicCaptionController.php
api/app/Http/Controllers/Admin/PlayerController.php
api/app/Http/Controllers/Admin/TeamController.php
api/app/Http/Controllers/Admin/TournamentBroadcasterController.php
api/app/Http/Controllers/Admin/TournamentController.php
api/app/Http/Controllers/Admin/TournamentMatchController.php
api/app/Http/Controllers/Admin/TournamentMatchSquadController.php
api/app/Http/Controllers/Admin/TournamentTeamSquadController.php
api/app/Http/Controllers/Admin/TournamentTeamsController.php
api/app/Http/Controllers/Admin/UserController.php
api/app/Http/Controllers/Admin/UserSearchController.php
api/app/Http/Controllers/BaseControllerTrait.php
api/app/Http/Controllers/User/MatchSquadController.php
api/app/Http/Controllers/User/MatchTossController.php
api/app/Http/Controllers/User/PlayingElevenController.php
api/app/Http/Controllers/User/ScorecardController.php
api/app/Http/Controllers/User/TeamController.php
api/app/Http/Controllers/User/TournamentController.php
api/app/Http/Controllers/User/TournamentMatchController.php
api/app/Http/Controllers/User/TournamentTeamController.php
api/app/Http/Middleware/AdminOnly.php
api/app/Http/Middleware/AdminOnlyServiceProvider.php
api/app/Http/Middleware/EnsureAdminPermission.php
api/app/Http/Requests/Admin/Player/StoreBroadcasterPlayerRequest.php
api/app/Http/Requests/Admin/Player/StorePlayerCsvImportRequest.php
api/app/Http/Requests/Admin/Player/UpdateBroadcasterPlayerRequest.php
api/app/Http/Requests/Admin/StoreTournamentBroadcasterRequest.php
api/app/Http/Requests/Admin/Team/StoreTeamRequest.php
api/app/Http/Requests/Admin/Team/UpdateTeamRequest.php
api/app/Http/Requests/Admin/User/StoreUserRequest.php
api/app/Http/Requests/Admin/User/UpdateUserRequest.php
api/app/Http/Resources/Admin/Auth/LoginResource.php
api/app/Http/Resources/Admin/TournamentBroadcasterUserResource.php
api/app/Http/Resources/Admin/TournamentResource.php
api/app/Http/Resources/Admin/User/UserResource.php
api/app/Models/MatchScoringAudit.php
api/app/Models/Relations/TournamentSquadPlayersRelation.php
api/app/Models/Team.php
api/app/Models/Tournament.php
api/app/Models/User.php
api/app/Providers/AppServiceProvider.php
api/app/Services/User/PlayerCsvImportService.php
api/database/migrations/2026_04_18_100000_create_tournament_broadcaster_table.php
api/database/migrations/2026_04_18_140000_create_match_scoring_audits_table.php
api/database/migrations/2026_04_18_150000_add_created_by_to_tournaments_table.php
api/database/migrations/2026_04_21_210000_add_created_by_to_users_table.php
api/database/seeders/DatabaseSeeder.php
api/database/seeders/GraphicThemeSeeder.php
api/database/seeders/PermissionSeeder.php
api/database/seeders/RoleSeeder.php
api/database/seeders/ScoringDemoSeeder.php
api/routes/api/v1/admin.php
api/routes/channels.php
app/src/store/api/baseApi.js
backoffice/src/app/app.routes.ts
backoffice/src/app/guards/backoffice-scope.guard.ts
backoffice/src/app/guards/broadcast-staff-dashboard.match.ts
backoffice/src/app/layouts/full/full.component.html
backoffice/src/app/layouts/full/full.component.ts
backoffice/src/app/layouts/full/horizontal/header/header.component.html
backoffice/src/app/layouts/full/horizontal/header/header.component.ts
backoffice/src/app/layouts/full/horizontal/sidebar/sidebar.component.html
backoffice/src/app/layouts/full/horizontal/sidebar/sidebar.component.ts
backoffice/src/app/layouts/full/shared/nav/sidebar-data.ts
backoffice/src/app/layouts/full/vertical/header/header.component.html
backoffice/src/app/layouts/full/vertical/header/header.component.ts
backoffice/src/app/models/auth.models.ts
backoffice/src/app/pages/content-management/hero-slider/manage-hero-slider-dialog/manage-hero-slider-dialog.component.html
backoffice/src/app/pages/content-management/static-pages/manage-static-page-dialog/manage-static-page-dialog.component.html
backoffice/src/app/pages/dashboard/broadcaster-dashboard/broadcaster-dashboard.component.html
backoffice/src/app/pages/dashboard/broadcaster-dashboard/broadcaster-dashboard.component.scss
backoffice/src/app/pages/dashboard/broadcaster-dashboard/broadcaster-dashboard.component.ts
backoffice/src/app/pages/dashboard/dashboard.routes.ts
backoffice/src/app/pages/players-management/players-management.routes.ts
backoffice/src/app/pages/players-management/players/import-players-csv-dialog/import-players-csv-dialog.component.html
backoffice/src/app/pages/players-management/players/import-players-csv-dialog/import-players-csv-dialog.component.ts
backoffice/src/app/pages/players-management/players/manage-player-dialog/manage-player-dialog.component.html
backoffice/src/app/pages/players-management/players/manage-player-dialog/manage-player-dialog.component.ts
backoffice/src/app/pages/players-management/players/players.component.html
backoffice/src/app/pages/players-management/players/players.component.ts
backoffice/src/app/pages/shop-management/orders/order-detail-dialog/order-detail-dialog.component.html
backoffice/src/app/pages/tournaments-management/match-controller/controller-settings-dialog/controller-settings-dialog.component.html
backoffice/src/app/pages/tournaments-management/match-controller/controller-settings-dialog/controller-settings-dialog.component.ts
backoffice/src/app/pages/tournaments-management/match-controller/match-caption-dialog/match-caption-dialog.component.html
backoffice/src/app/pages/tournaments-management/match-controller/match-caption-dialog/match-caption-dialog.component.ts
backoffice/src/app/pages/tournaments-management/match-controller/match-controller-dashboard.component.html
backoffice/src/app/pages/tournaments-management/teams/manage-team-dialog/manage-team-dialog.component.html
backoffice/src/app/pages/tournaments-management/teams/manage-team-dialog/manage-team-dialog.component.ts
backoffice/src/app/pages/tournaments-management/teams/teams.component.html
backoffice/src/app/pages/tournaments-management/teams/teams.component.ts
backoffice/src/app/pages/tournaments-management/tournament-detail/attach-tournament-teams-dialog/attach-tournament-teams-dialog.component.html
backoffice/src/app/pages/tournaments-management/tournament-detail/attach-tournament-teams-dialog/attach-tournament-teams-dialog.component.scss
backoffice/src/app/pages/tournaments-management/tournament-detail/attach-tournament-teams-dialog/attach-tournament-teams-dialog.component.ts
backoffice/src/app/pages/tournaments-management/tournament-detail/edit-tournament-team-group-dialog/edit-tournament-team-group-dialog.component.html
backoffice/src/app/pages/tournaments-management/tournament-detail/edit-tournament-team-group-dialog/edit-tournament-team-group-dialog.component.ts
backoffice/src/app/pages/tournaments-management/tournament-detail/manage-team-squad-dialog/manage-team-squad-dialog.component.html
backoffice/src/app/pages/tournaments-management/tournament-detail/manage-team-squad-dialog/manage-team-squad-dialog.component.scss
backoffice/src/app/pages/tournaments-management/tournament-detail/manage-team-squad-dialog/manage-team-squad-dialog.component.ts
backoffice/src/app/pages/tournaments-management/tournament-detail/schedule-tournament-match-dialog/schedule-tournament-match-dialog.component.html
backoffice/src/app/pages/tournaments-management/tournament-detail/schedule-tournament-match-dialog/schedule-tournament-match-dialog.component.ts
backoffice/src/app/pages/tournaments-management/tournament-detail/tournament-detail-shell.component.html
backoffice/src/app/pages/tournaments-management/tournament-detail/tournament-detail-shell.component.ts
backoffice/src/app/pages/tournaments-management/tournament-detail/tournament-overview-tab.component.html
backoffice/src/app/pages/tournaments-management/tournament-detail/tournament-overview-tab.component.ts
backoffice/src/app/pages/tournaments-management/tournament-detail/tournament-squads-tab.component.html
backoffice/src/app/pages/tournaments-management/tournament-detail/tournament-squads-tab.component.ts
backoffice/src/app/pages/tournaments-management/tournament-detail/tournament-teams-tab.component.html
backoffice/src/app/pages/tournaments-management/tournament-detail/tournament-teams-tab.component.ts
backoffice/src/app/pages/tournaments-management/tournament-matches/tournament-matches.component.html
backoffice/src/app/pages/tournaments-management/tournament-matches/tournament-matches.component.ts
backoffice/src/app/pages/tournaments-management/tournament-requests/tournament-request-detail-dialog/tournament-request-detail-dialog.component.html
backoffice/src/app/pages/tournaments-management/tournaments-management.routes.ts
backoffice/src/app/pages/tournaments-management/tournaments/manage-tournament-dialog/manage-tournament-dialog.component.html
backoffice/src/app/pages/tournaments-management/tournaments/manage-tournament-dialog/manage-tournament-dialog.component.ts
backoffice/src/app/pages/tournaments-management/tournaments/tournaments.component.html
backoffice/src/app/pages/tournaments-management/tournaments/tournaments.component.ts
backoffice/src/app/pages/users-management/users/manage-user-dialog/manage-user-dialog.component.html
backoffice/src/app/pages/users-management/users/manage-user-dialog/manage-user-dialog.component.ts
backoffice/src/app/services/location.service.ts
backoffice/src/app/services/players.service.ts
backoffice/src/app/services/teams.service.ts
backoffice/src/app/services/tournament-matches.service.ts
backoffice/src/app/services/tournament-teams.service.ts
backoffice/src/app/services/tournaments.service.ts
backoffice/src/app/services/users.service.ts
backoffice/src/app/shared/functions/auth-user-display.ts
backoffice/src/app/shared/functions/form-control-error-message.ts
backoffice/src/app/shared/functions/http-params.function.ts
backoffice/src/app/shared/functions/list-params.function.ts
backoffice/src/app/utils/status-class.util.ts
backoffice/src/assets/samples/sample-players-import.csv
backoffice/src/assets/scss/custom.scss
backoffice/src/assets/scss/layouts/_header.scss
backoffice/src/assets/scss/override-component/_expansion.scss
docs/BROADCASTER_ROLE.md
docs/CODE_REVIEW_BROADCAST_TOURNAMENTS_BRANCH.md
docs/SCORING.md
docs/SHARED_DOMAIN_SERVICES.md
```

</details>

---

## Appendix B — Manual fix checklist (tick as you go)

Copy into issues or tick in-editor preview where supported.

### B.0 Cross-cutting (from “Five highest-priority follow-ups”)

- [ ] **B.0.1** Scope `Tournament` / `TournamentMatch` (and related) for **all** nested `v1/admin/...` routes — custom `Route::bind`, middleware, or shared `assertTournamentStaff` / `assertMatchInStaffTournaments` (broadcast + future roles).
- [ ] **B.0.2** `app/src/store/api/baseApi.js` — restore safe production default or require `VITE_API_URL` in CI.
- [ ] **B.0.3** Product sign-off: scorecard **read** APIs vs `canScoreMatchInApp` (`ScorecardController`, mobile app).
- [ ] **B.0.4** Use `admin.permission:…` on routes **or** remove the unused alias from `AdminOnlyServiceProvider` (`administrator.only` middleware removed).
- [ ] **B.0.5** Migration: index on `match_scoring_audits` (e.g. `tournament_match_id`, `created_at`).

### B.1 API — authorization & policy

- [ ] **B.1.1** `UserSearchController::broadcasterResults` — require caller can access `tournament_id`.
- [ ] **B.1.2** `TournamentTeamsController` / `TournamentTeamSquadController` / `TournamentMatchSquadController` / `TournamentBroadcasterController` / match graphic routes — explicit staff check per resolved tournament/match.
- [ ] **B.1.3** `TournamentTeamSquadController::show` — decide if response should be minimal DTO vs full `UserResource`.
- [ ] **B.1.4** FormRequests with `authorize(): true` (`StoreTournamentBroadcasterRequest`, player requests) — acceptable only if route policy is complete.

### B.2 API — logic, performance, tests

- [ ] **B.2.1** Deduplicate admin vs user `TournamentMatchController::store` scheduling rules into one service/action.
- [ ] **B.2.2** `User::canScoreMatchInApp` — reduce redundant `loadMissing('tournament')` in hot paths (caller eager-load).
- [ ] **B.2.3** `TournamentSquadPlayersRelation` — add tests for `withCount` / filters used by `Tournament::withSquadPlayerCount()` (if present).
- [ ] **B.2.4** `BaseControllerTrait::noContent()` — confirm all API clients accept JSON 204.

### B.3 Backoffice — UX & QA (grouped)

- [ ] **B.3.1** Tournament list: filters (`schedule_window`, status, type) + table columns + links to new detail shell (`tournaments.component`, `manage-tournament-dialog`).
- [ ] **B.3.2** Tournament detail shell + tabs: load error, tab deep-links (`tournament-detail-shell`, `tournament-overview-tab`, `tournament-teams-tab`, `tournament-squads-tab`).
- [ ] **B.3.3** Dialogs: attach teams, group edit, squad, schedule match (all `tournament-detail/*dialog*` + SCSS).
- [ ] **B.3.4** Tournament matches list → match controller (`tournament-matches`, `match-controller-dashboard`, `match-caption-dialog`, `controller-settings-dialog`).
- [ ] **B.3.5** Players management: list, create/edit dialog, CSV import (`players-management/*`, `import-players-csv-dialog`).
- [ ] **B.3.6** Global teams: list + manage team (`teams/*`, `manage-team-dialog`).
- [ ] **B.3.7** Users: `admin_role_ids` in `manage-user-dialog` (create/update paths).
- [ ] **B.3.8** Guards: broadcast-only dashboard, `backoffice-scope` redirect paths (`guards/*`, `dashboard.routes`, `app.routes`).
- [x] **B.3.9** Layout: vertical + horizontal header/sidebar, `full.component`, breadcrumb titles for new routes — visual pass OK.
- [x] **B.3.10** Grep: no remaining references to `tournament-detail-dialog` / `TournamentDetailDialog` in `backoffice/` or app code; Appendix A manifest lines for deleted files removed.

### B.4 Config, docs, assets

- [x] **B.4.1** `channels.php` — `canAccessBackofficeApi` on `backoffice.notifications` confirmed OK (admins + broadcast operators).
- [x] **B.4.2** `PermissionSeeder` vs docs — **`PermissionSeeder.php`** is canonical; **`BROADCASTER_ROLE.md` §8** and **`SHARED_DOMAIN_SERVICES.md`** (admin permission table) aligned. Wire **`admin.permission:{slug}`** on routes when you enforce slugs at HTTP layer.
- [x] **B.4.3** `sample-players-import.csv` vs `PlayerCsvImportService` headers — confirmed aligned (`HEADER_KEYS` / sample header row).
- [x] **B.4.4** SCSS: `custom.scss`, `_header.scss`, `_expansion.scss` — visual pass OK.
- [ ] **B.4.5** `docs/SCORING.md` — stays accurate after any auth changes.

### B.5 Optional cleanup

- [x] **B.5.1** `PlayerController::importCsv` — opened to all `admin.only` users (no broadcast-only gate; nav link under Users Management for full admins).
- [x] **B.5.2** `EnumController` / clients — verified: only **`manage-user-dialog`** uses **`getOptions('admin_roles')`**; other callers use **`getOptions(...)`** for other keys or **`getEnums()`** with explicit keys (`import-players-csv-dialog` ignores extra keys). OK.
