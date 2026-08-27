# Broadcaster & admin — broadcast operations specification

This document describes **who runs match-day operations** in Tapeya: **broadcasters** (tournament-scoped staff) and **super admins** (platform operators). Both use the **same backoffice UI and the same HTTP APIs** for controller sessions, tournament ops, and related flows. **Only authorization and data scope differ** (tournament membership vs platform-wide access). It is written to align with existing Tapeya patterns; the **Current repo** snapshot reflects what is implemented today, while **Target** / checklist items still describe the full product when not marked partial.

**Naming note (important)**  

In code and config today, the word **“broadcaster”** often appears for **Laravel Reverb / Echo** (e.g. `broadcaster: 'reverb'`). That is **transport for WebSockets**, not this **product role**. This document means **broadcaster = user role** only.

**Related docs**

- [Actors, roles & permissions](./actors_and_roles.md) — admin-guard roles & permissions; app uses [APP_CAPABILITIES.md](./APP_CAPABILITIES.md).
- [Match controllers (backoffice)](./MATCH_CONTROLLERS_BACKOFFICE.md) — controller session, theme, graphic commands (no video pipeline in Tapeya).
- [Organizer scoring](./SCORING.md) — app scoring routes and API usage.

**Current repo (snapshot)** — aligns with code as of the broadcaster slice (CSV UI, enums, tests). Still read §9 for remaining spec gaps.

- **Roles & pivot:** Tournament app power is **assignment-based** (`organizer_id` / `created_by` / `tournament_broadcaster`) — see [APP_CAPABILITIES.md](./APP_CAPABILITIES.md). **No app-guard roles.** **`AdminRoleEnum::BROADCASTER`** (and **`RoleSeeder`**) remains for backoffice. Staff ↔ tournament link is the **`tournament_broadcaster`** pivot: **`tournament_id`**, **`user_id`**, timestamps only. **At most one broadcaster per tournament**.
- **Backoffice + admin API:** `User::canManageTournament()` / `canAccessBackofficeApi()` / `hasBroadcastBackofficeRole()`; **`admin.only`** on `routes/api/v1/admin.php`; optional **`EnsureAdminPermission`** (`admin.permission:…`) with slugs from **`PermissionSeeder`** when wired; **`type = administrator`** bypasses permission checks in that middleware. Global modules (users, shop, content, tournament-requests) rely on **`admin.only`** plus front-end guards until route-level permission splits exist. Tournament CRUD + graphics use **`AuthorizesTournamentManagement`**; singleton broadcast staff: **`GET|POST|DELETE …/tournaments/{id}/broadcaster`** (singular — at most one assignee). **`POST`** body: **`user_id`** only; **`TournamentBroadcasterUserResource`**: **`id`**, **`name`**, **`nickname`**, **`email`**. Angular: nav guard, sidebar, tournament detail (broadcast staff), **`manage-user-dialog`** **`admin_role_ids`**, **`UserResource`** admin roles.
- **Admin enums:** **`GET v1/admin/enums`** includes **`admin_roles`** (no `app_roles`). Permission rows from **`PermissionSeeder`**; route-level **`admin.permission:{slug}`** optional until wired (see §8).
- **Player CSV import:** **`POST v1/admin/players/import-csv`** — multipart **`file`**, optional **`dry_run`**: creates **app users** (`type = user`, no role attach) from a fixed header row (`name,nickname,phone,email,date_of_birth,playing_role,bowling_style,batting_style,country,city` — **no `roles` column**). Any account allowed by **`auth:api`** + **`admin.only`** may call it (platform administrators and broadcast operators). **Country/city optional**; if country is set it must be **Pakistan**, and with world PK data a non-empty city must match that list. Backoffice **Players → Import CSV** under **Users Management → Players Management**. Not tournament roster attach.
- **User typeahead (backoffice):** **`GET v1/admin/users/search?search=`** — one endpoint for organizer / team owner / squad / broadcast-staff pickers ([APP_CAPABILITIES.md](./APP_CAPABILITIES.md)). No `for_squad` or `context=broadcaster` modes.
- **App (Sanctum) API — organizer parity for tournament staff:** **`User::isTournamentStaff()`** / **`canOperateTournamentInApp()`** / **`canManageTeamSquadAsTournamentStaff()`** / **`canScoreMatchInApp`** (scorecard read/write + ball mutations + admin break-glass); see **`docs/SCORING.md`**. **`TournamentController::index`** `organizer_tournaments=1` includes pivot.
- **Tests:** **`TournamentBroadcastStaffAppTest`**, **`TournamentBackofficeImportAndBroadcastersTest`**, **`AdminBackofficePermissionMiddlewareTest`** (permissioned vs stripped broadcast operator). PHPUnit **`APP_URL`**, Sanctum **`actingAs(..., 'api')`**.
- **`created_by` on tournaments:** nullable **`tournaments.created_by`** (who created the row in backoffice/API); set on **`POST …/admin/tournaments`**; **`User::isTournamentStaff`**, app **`organizer_tournaments`** list, admin **`baseQuery`**, and **`canManageTeamSquadAsTournamentStaff`** treat creator like staff for scope. **`TournamentResource`** exposes **`created_by`** + **`creator`** when loaded.
- **Still not full spec (remainder):** bulk import **async job**, mapping UI, PII/error file rules; scoring **lease/lock** and richer audit; **§6.4** revoke UX; shared **domain services** §12.

---

## 1. Persona & goals

| Aspect | Description |
|--------|-------------|
| **Who (broadcaster)** | The **broadcaster** is the operational role that runs **controller** (overlay/session intent), keeps **squads, teams, fixtures, and players** accurate, uses **bulk import** where needed, and **scores** matches when required—the same surface area as an **organizer** for match-day work, with extra emphasis on **broadcast dashboard** and controller. Access is **scoped to allowed tournaments** (§3). |
| **Who (super admin)** | **Super admins** run the whole platform **and** perform the **same broadcast/tournament-ops work** as broadcasters when needed. They use the **identical screens and API routes**; policy grants **platform-wide** access (or “any tournament”) without requiring `organizer_id` or pivot membership for those modules. |
| **vs organizer** | An **organizer** is still the tournament’s **`organizer_id`** on the record (primary app identity for “my tournaments” and scoring entry). A broadcaster may **be** that organizer (**self-assign**) or **add someone else** as organizer while remaining on the tournament as broadcaster. **Policy-wise**, anyone listed as **broadcaster** on the tournament (pivot) gets **organizer-equivalent powers** in the **shared** backoffice surface for that tournament (§5). |
| **Same UI + same APIs** | Do **not** fork admin-only vs broadcaster-only Angular modules or duplicate REST trees for the same mutations. One **broadcast / tournament-ops** area in the backoffice; one set of **admin-guard** endpoints (or one canonical prefix) that both roles call. **`canManageTournament` / `canAccessBroadcastSurface`** (names illustrative) returns true for **super_admin** (full scope) **or** organizer **or** pivot broadcaster as product rules dictate. |

**Goals**

1. **Controller** — Session, theme, graphic commands per [Match controllers](./MATCH_CONTROLLERS_BACKOFFICE.md), scoped by tournament/match (super admin: any; broadcaster: allowed only).
2. **Backoffice** — **Single** implementation of heavy UI (controller, squads, imports); **super_admin** is not a separate “shadow” feature set for these flows.
3. **Dashboard** — Same dashboard components; list/filter logic respects scope (all tournaments vs assigned/created/organizer/pivot).
4. **Tournaments** — **Super admin** and **broadcaster** use the **same create/edit/assign** APIs where the product allows both to create or attach broadcasters; enforcement is **policy on the same routes** (§6).
5. **Scoring** — Organizer **or** assigned broadcaster may score; super admin policy as needed for support; concurrency + audit (§7).

---

## 2. Controller (match broadcast controller)

**Definition** (same as `MATCH_CONTROLLERS_BACKOFFICE.md`): a **match controller session** is the live operational context for one broadcast: tournament/match linkage, theme, inning context, **graphic commands**, operator notes.

**Target behaviour**

- From the **shared broadcast dashboard**, open a **controller** for a selected **match**. **Same route and UI** for super admin and broadcaster; **authorization** decides whether the user may open that match’s controller.
- Allowed when **`canRunController($user, $match)`** (or equivalent) is true: typically **super_admin** **or** tournament passes **`canAccessTournament`** (**organizer_id**, **`tournament_broadcaster`**, creator—exact union = product rule; default: **any of these**).
- Persist **theme configuration**, **session context**, and **append-only graphic commands** as in that doc.
- **Out of scope** in Tapeya: vMix/OBS embedding; only **data + URLs/contracts** as documented there.

**Implementation note**

- **One** module of backoffice + **one** set of controller APIs; restrict with **shared policy** (super admin bypass for scope + broadcaster/organizer rules for others).

---

## 3. Single backoffice surface — same UI, same APIs (admin + broadcaster)

Heavy UI (controller, squads, imports) lives in the **backoffice once**. Broadcasters must **not** get unrelated powers (all users, billing, system config, arbitrary admin modules **unless** they are super admin). **Super admins** already have global modules; for **broadcast/tournament-ops**, they should land on the **same pages and XHR/fetch calls** as broadcasters, not a parallel “admin-only” duplicate implementation.

**Recommended approach (best default)**

| Piece | Choice |
|-------|--------|
| **Account** | Same **`users` row** as today: `type = user` for broadcasters; super admins keep existing admin account model. |
| **App identity** | No app `ORGANIZER` role attach required. Tournament ops use assignment (`organizer_id` / pivot / `created_by`). See [APP_CAPABILITIES.md](./APP_CAPABILITIES.md). |
| **Backoffice identity** | **`AdminRoleEnum::BROADCASTER`** (e.g. “Broadcast operator”) on guard `admin` with **narrow** permission slugs for **global** admin shell navigation (hide billing/users unless also super admin). **`super_admin`** retains full menu; both roles navigate into the **same** “Tournament / broadcast ops” routes. |
| **HTTP** | **One canonical API surface** per feature (e.g. `PATCH /api/v1/admin/tournaments/{id}/teams/...` — paths illustrative). **Do not** maintain `Admin\SuperOnlyTournamentController` vs `Admin\BroadcasterTournamentController` that duplicate bodies; **one controller** (or one route group) calling **one service**, with **`authorize()`** using a **single policy** that encodes super_admin **OR** scoped tournament access. |
| **Front-end** | **One** Angular/React (etc.) feature area for tournament ops + controller + import; **role/permission** only toggles **nav visibility** and **which tournaments appear in lists**, not duplicate pages for the same CRUD. |
| **Enforcement** | Every route: **`hasPermission(...)`** where needed for **menu**/shell, plus **`canManageTournament($user, $tournament)`** (or match-level variants) that is **true** if **`$user` is super_admin** **or** (organizer_id **or** `tournament_broadcaster` **or** creator per §6). |

**Why not two UIs for the same work?**  

Duplication guarantees drift (validation, bugs, missing fields). **Prefer one UI + one API**; express differences **only** in policy and list queries.

**Why not only `type = administrator` for broadcasters?**  

If every broadcaster were a full **administrator** type, they are easy to confuse with super admins and harder to scope. **Prefer `type = user` + narrow `AdminRoleEnum::BROADCASTER`** for broadcast staff unless legal/IT mandates a separate account class. Super admins keep existing elevated type/role.

---

## 4. Dashboard to broadcast

**Broadcast home (backoffice) — shared**

- **Same component** for super admin and broadcaster.
- **Tournament list** query differs by actor:
  - **Broadcaster:** union of **created by them**, **`organizer_id`**, **`tournament_broadcaster`** (default: **any of these**).
  - **Super admin:** **all tournaments** (with filters/pagination), or same list with a “view as all” mode—product choice, but **same route** returning a scope the policy allows.
- Shortcuts: **Open controller** (per match), **Scoring** (deep link to app—§7), **squads / teams / matches / players**.
- Show **graphics / channel URL** contract when the controller feature defines it.

**App vs backoffice**

- **Controller + squad/team management** → primary in **backoffice** (organizer-parity), **same** for super admin and broadcaster.
- **Scoring** → existing **app** flow documented in `SCORING.md` (`/organizer/scoring/match/:matchId` today); broadcaster uses it when they are **organizer** or when API policy allows **broadcaster** without being organizer (§7). Super admin scoring/support is a **policy** decision on the **same** scoring APIs if you allow it.

---

## 5. What broadcaster & super admin can manage (organizer parity)

**Product rule (confirmed)**  

For tournaments they are allowed to access, a **broadcaster** can do **everything an organizer can do in the app** for that tournament: **squads, teams, matches, tournament operational fields, players**, etc.—implemented as **the same capabilities** on the **same admin APIs** and policies as super admin **for that tournament’s payload**, not a reduced subset.

**Super admin** uses the **same endpoints and forms**; where global-only actions exist (e.g. **delete platform user**, **system settings**), those remain behind **`super_admin`**-only routes—**not** mixed into tournament-ops controllers.

**Scope**

- **Broadcaster:** only tournaments passing **`canAccessTournament`** (organizer **or** pivot membership; include **creator** if broadcasters create tournaments—see §6).
- **Super admin:** **bypass tournament scope** for tournament-ops **or** explicit “act on any tournament” in the same policy branch—**same code path**, wider predicate.

**Bulk import (players / squads)** — CSV/spreadsheet, validation, **dry-run**, **audit** (who imported, when), **async** job for large files, notifications on completion/failure. **Target:** same import UI and API for both roles where product allows; error-file download rules may still treat **super_admin** as support (§5 table below).

**Shipped (minimal) vs full spec**

- **In repo today (players CSV):** **`POST /api/v1/admin/players/import-csv`** — any **`admin.only`** user; creates **app users** (`type = user`) from CSV (see snapshot bullet). **Not** tournament roster attach.
- **Not yet:** tournament/squad bulk attach, column-mapping UI, async queue worker, per-row error file download, retention/TTL automation per the PII table below.

**Bulk import (players)** — full product columns

- Columns (example): external id, name, team code, shirt number, optional DOB/email; **column mapping** UI.
- **Idempotent** keys where possible to avoid duplicate people on re-import.
- **PII / error exports (personal data):** imports may include names, emails, phones, or IDs. Tapeya assumes **mostly trusted staff** operate imports; use the defaults below unless legal asks for stricter policy.

**Defaults when operators are trusted staff**

| Control | Suggestion |
|--------|------------|
| **Who may download** failed-row / error CSV | The **user who started the import**, plus **`super_admin`** for support. Not other broadcasters on the same tournament by default. |
| **Retention** | Auto-delete **temp upload + error export** after **7 days**; audit log records import id, actor, delete time. |
| **Payload** | Where possible, error files emphasize **row index + code + minimal fields** needed to fix the row, rather than repeating every sensitive column. |
| **Stricter mode later** | If volunteers or public uploads appear, shorten TTL (e.g. 24h) and narrow downloaders in a follow-up policy.

---

## 6. Tournaments, assignment, organizer vs broadcaster

### 6.1 Who creates tournaments

| Actor | Behaviour |
|-------|-----------|
| **Super admin** | Uses the **same backoffice tournament create/edit flows and APIs** as broadcasters (one implementation). May additionally use existing global admin tools if any; **avoid** a second “admin-only” create path that duplicates fields/validation. |
| **Broadcaster** | May **create** tournaments from backoffice (**same UI/API**), subject to `tournament.create` (or policy). |

### 6.2 `organizer_id` and app scoring

- **`organizer_id`** remains the tournament’s **primary organizer** for app behaviour (“my tournaments”, default scoring actor).
- On create (broadcaster or super admin), **same form** allows:
  - **Self as organizer** — set `organizer_id` to the creating user so they **log into the app** as organizer and use **existing scoring routes** without new “score as broadcaster” UI; **or**
  - **Another user as organizer** — pick an existing user; that person uses the app for scoring; broadcaster/super admin still runs controller/ops in backoffice.

### 6.3 Broadcaster assignment (`tournament_broadcaster` pivot)

**Model in repo:** pivot **`tournament_broadcaster`** — `tournament_id`, `user_id`, timestamps (membership only). Backoffice attach sends **`user_id`** only. **Product rule:** each tournament has **zero or one** broadcaster; **`POST …/tournaments/{id}/broadcaster`** sets (or replaces) that single assignment; **`DELETE …/broadcaster`** clears it.

**Assignment behaviour:**

- **Super admin** can assign, replace, or clear the tournament broadcaster (**same assign UI/API** as an authorized broadcaster if product allows self-service assignment; otherwise only super admin has `tournament.broadcaster.assign`).
- **Broadcaster who creates** a tournament: auto-add self to pivot (and set `organizer_id` per choice above).
- **Late assignment:** super admin (or authorized user) sets the broadcaster via **the same** pivot endpoint; choosing a different user **replaces** the current one.
- **Same person** may be both **`organizer_id`** and in **pivot**; implementation may dedupe checks.

### 6.4 Session UX when access is removed

If a user is **removed** from `tournament_broadcaster` (or loses organizer) **during** a live controller or scoring session: **prefer** a clear **grace period or immediate read-only** with a toast, then **disconnect**—avoid silent failure. Exact choice is implementation detail; document in release notes once chosen.

---

## 7. Scoring: broadcaster + organizer (+ super admin if allowed)

**Repo today (app API):** several **user** scoring and match-prep controllers authorize with **`canOperateTournamentInApp($tournament)`**, so a user on the **`tournament_broadcaster`** pivot (and the organizer) may use the same app endpoints as the organizer for those actions. **Not shipped:** dedicated scoring lock/lease, ball-level audit trail, and **`SCORING.md`** updates called out in §9.

**Target**

| Rule | Detail |
|------|--------|
| **Who may score** | **`organizer_id`** for the match’s tournament **or** user on **`tournament_broadcaster`** for that tournament (with `matches.score` or equivalent). **Optional:** **`super_admin`** for break-glass/support—same scoring **API** and app routes, extended policy only. |
| **Concurrency** | Prefer **one active scoring editor** per match (lock or lease + TTL); document in `SCORING.md` when shipped. |
| **Audit** | Log `user_id`, action, timestamp (and optionally IP) on ball mutations when multiple actor types exist. |
| **App routes** | Keep **`/organizer/scoring/match/:matchId`** for users who are organizer; if broadcaster scores **without** being organizer, either **neutral route** `/scoring/match/:id` or **same route** with extended policy—pick one and document. **Do not** fork scoring **business logic**—one service (§12). |

If the broadcaster **always** sets themselves as `organizer_id`, the app can stay **unchanged** for entry until you want a dedicated “broadcast scoring” menu.

---

## 8. Permissions (admin guard slugs)

**Single source of truth:** Permission **records** (name + slug + guard), and which **roles** receive them, are defined in **`api/database/seeders/PermissionSeeder.php`**. This section mirrors that seeder for humans—if wording ever disagrees with the file, **fix the doc** (or change the seeder on purpose).

**Route enforcement (current repo):** `routes/api/v1/admin.php` uses **`auth:api`** + **`admin.only`** (`User::canAccessBackofficeApi()`). The **`EnsureAdminPermission`** middleware alias is **`admin.permission:{slug}`**; it is **not** applied to route groups yet, so HTTP does **not** gate most admin endpoints by individual slugs. When you wire it, use **exactly** the slugs below (same strings as `PermissionSeeder`).

Use **admin guard** for backoffice routes; **super_admin** typically satisfies “all permissions” for navigation, but **tournament-ops routes** should still call **`canManageTournament`** (or equivalent) so logic stays centralized.

**Admin guard slugs** (seeded; assigned to **`AdminRoleEnum::BROADCASTER`** and **`AdminRoleEnum::SUPER_ADMIN`** when those roles exist):

- `broadcast.dashboard.view`
- `broadcast.controller.session` (create/read/update per match)
- `tournament.manage` (scoped: for non–super-admin, only allowed tournaments—**or** split into `tournament.update`, `tournament.teams.manage`, `tournament.matches.manage`, `tournament.players.manage` if you want finer RBAC)
- `tournament.create` (broadcasters who may create; super admin implied or explicit)
- `tournament.broadcaster.assign` (who may edit pivot—often **super admin only**, sometimes another authorized broadcast staff member)
- `matches.score` (if scoring from API without being organizer—else rely on organizer only)

**`super_admin`** receives the **same** slug bundle as **`BROADCASTER`** in the seeder; both use the **same tournament-ops UI/API** without a second code path.

**App guard (optional)**

- `app.broadcast.dashboard` if the mobile app shows a slim broadcast home; not required if all ops are backoffice.

---

## 9. Implementation checklist (engineering)

1. **Tournament staff assignment** (`organizer_id` / `created_by` / `tournament_broadcaster`) — app auth is assignment-based ([APP_CAPABILITIES.md](./APP_CAPABILITIES.md)); **`AdminRoleEnum::BROADCASTER`**, `RoleSeeder`, permission seeder bundle for backoffice.
2. Migration **`tournament_broadcaster`** + Eloquent relations; optional indexes on `(tournament_id, user_id)`.
3. **Tournament create** in backoffice: **one** flow for super admin + broadcaster; **`organizer_id`** picker (self / other user).
4. **Admin UI**: assign/remove pivot rows; tournament list respects scope—**same components**, different query when `user.isSuperAdmin`.
5. **Policies**: **`canManageTournament($user, $tournament)`** = **`$user` is super_admin** **OR** organizer **OR** pivot broadcaster (and create permissions for new tournaments).
6. **Shared domain layer + shared HTTP surface:** user + admin (and app where relevant) call the **same services** after policy checks; see **§12**. **No parallel “admin tournament” vs “broadcaster tournament” controllers** for identical mutations.
7. **Bulk import** — **partial:** **Players** CSV (`players/import-csv`) + backoffice UI + **dry_run** for any `admin.only` user (no tournament roster import yet, no async, no mapping UI, no error-file PII flow).
8. **Controller** APIs + UI per `MATCH_CONTROLLERS_BACKOFFICE.md` — **single** implementation.
9. **Scoring** — **partial:** **`canScoreMatchInApp`**, **`match_scoring_audits`** on ball mutations, **`SCORING.md`** authorization section. **Remaining:** lock/lease, neutral vs organizer-only URL product choice, deeper audit.
10. **Tests** — **partial:** broadcast staff app + backoffice import/dry run + **`AdminBackofficePermissionMiddlewareTest`** (+ **`TournamentCreatedByScopeTest`**). Optional cases can be added ad hoc when regressions appear.

---

## 10. Resolved decisions & short follow-ups

| Topic | Decision |
|-------|----------|
| Persona | Broadcaster = controller + scoring + full **organizer-equivalent ops**; **super admin does the same work via the same UI/APIs** with broader scope. |
| Controller | As `MATCH_CONTROLLERS_BACKOFFICE.md`; **one** implementation. |
| Admin access | **Broadcaster:** least privilege, **`AdminRoleEnum::BROADCASTER`** + narrow permissions for shell. **Super admin:** existing global access; **tournament-ops** = **same routes/components** as broadcaster. |
| Dashboard | Yes: **shared** tournaments/matches, controller, scoring links, import; list scope differs by role. |
| Manage | **Full organizer parity** on **shared** admin APIs for scoped tournaments; super admin = same APIs, full tournament access. |
| Assignment | **`tournament_broadcaster` pivot**; super admin + broadcaster creators; **`organizer_id`** = self or other for app scoring. |
| Scoring | Organizer **or** pivot broadcaster; optional super admin; lock + audit. |
| **UI + APIs** | **Single** backoffice surface and **one** canonical REST layer per feature; **policy** encodes super_admin vs scoped staff. |

**Short follow-ups (optional later)**  

- **Many tournaments in one weekend:** dashboard filters/pinning (UX scale).  
- **Access revoked mid-session:** grace vs hard disconnect (§6.4).  

The old “open questions” list is folded above; **PII / import files** defaults for **trusted staff** are in §5 (downloaders + **7-day** TTL).

---

## 11. Summary

| Topic | Intent |
|-------|--------|
| **Personas** | **Broadcaster:** controller, scoring, organizer-equivalent ops, **scoped**. **Super admin:** **same** ops surface, **platform-wide** (or unrestricted tournament access) via policy. |
| **Controller** | Match session, theme, commands — see match-controller doc; **one** UI/API. |
| **Backoffice** | **`AdminRoleEnum::BROADCASTER`** for narrow shell; **`super_admin`** unchanged; **shared** tournament-ops modules. |
| **Dashboard** | **Same** components; tournaments (create + assigned + organizer), matches, controller, scoring deep links. |
| **Manage** | **Same capability as organizer in app**, delivered via **shared** admin APIs (tournament roster bulk import still target / not in repo). |
| **Assignment** | Pivot **`tournament_broadcaster`**; super admin + broadcaster creators; **`organizer_id`** = self or other for app scoring. |
| **Scoring** | Organizer or assigned broadcaster; optional super admin; concurrency + audit; see `SCORING.md`. |
| **Engineering** | **One** UI tree and **one** HTTP handler per use case; **no duplicate** broadcaster vs admin tournament controllers. |

---

## 12. Development notes — shared business logic (no duplication)

**Problem:** Organizer flows today may live under **user** routes/controllers; broadcasters and super admins use **admin** routes and a different guard. Copy-pasting the same Eloquent mutations into multiple controller trees will drift and break.

**Direction:** keep **HTTP thin**, put **one implementation** of each business rule in PHP **domain / application services** (or small **Action** classes), and call them from **every** authorized entry point after the **same** **authorization** rules (with a **single policy** that branches on `super_admin` vs scoped access).

### 12.1 Recommended layering (Laravel API)

| Layer | Responsibility |
|-------|----------------|
| **HTTP** (prefer **one** `Admin\…` controller per resource, not split by “who is calling”) | Auth middleware, `authorize()`, validate input (`FormRequest`), map to primitives/DTO, **call one service method**, return JSON/resource. If legacy **user** routes remain, they call the **same service**. |
| **Policy / gate** | **`canManageTournament($user, $tournament)`** (and `canScoreMatch`, `canRunController`) — **single place** for “**super_admin** **OR** organizer **OR** pivot broadcaster (+ creator rules)”. Controllers and jobs call `$this->authorize(...)` or `Gate::authorize` before the service. |
| **Service** (`App\Services\Tournament\…` or `App\Services\…`) | **Transactions**, domain invariants, Eloquent writes, events, side-effects (notifications). No guard logic inside beyond trusting the caller already authorized—or pass an explicit **`ActingUser $user`** and let the service assert nothing about HTTP. |
| **Form requests / rules** | Shared `rules()` via static arrays, `Rule` objects, or dedicated **input DTOs** built from requests so all clients cannot diverge on validation silently. |

The repo already uses **`App\Services\…`** (e.g. `MatchCompletionService`, `PlayerStatsService`). **Prefer new tournament/team/squad/player services in that namespace** (or `App\Domain\Tournament\` if you introduce a domain folder later) rather than growing controllers.

### 12.2 “Services everywhere” vs alternatives

| Approach | When to use |
|----------|-------------|
| **Service class** (methods like `attachTeam(Tournament $t, Team $team, User $actor)`) | Default for **multi-step** or **reused** flows (attach team, set playing eleven, bulk import pipeline). |
| **Single invokable Action** (`AttachTeamToTournament`) | Good when one **clear command** and you want one class per use case; still call from every HTTP entry point. |
| **Fat model** (`$tournament->attachTeam(...)`) | Only if logic stays tiny; avoid models knowing about “broadcaster vs organizer vs super admin” — keep that in **policy**. |

**Suggestion:** start with **named service classes** grouped by aggregate (`TournamentTeamService`, `TournamentSquadService`, `PlayerCsvImportService`) so you do not create 40 one-off Action files on day one. Split into Actions later if a class grows too large.

### 12.3 What must not duplicate

- **Authorization condition** (“who may touch this tournament”) — **policy only**, referenced from controllers and optionally from queued jobs using `Gate::forUser($user)`.
- **Validation** for the same payload — **shared rules** or one FormRequest used by a route group if paths align; otherwise shared static `rules()` consumed by two requests.
- **DB writes** — **one service method** per use case; **not** `User\TournamentTeamController` vs `Admin\BroadcasterTournamentTeamController` vs `Admin\SuperAdminTournamentTeamController` with copy-paste bodies—**one** admin controller (or one user controller during migration) calling the service.
- **Side-effects** (events, cache bust, `MatchCompletionService`-style hooks) — **inside the service**, not in one controller only.

### 12.4 Admin + broadcaster: one entry point per feature

```text
[ Backoffice UI (super admin + broadcaster) ]
                    │
                    ▼
            [ One Admin HTTP handler ]
                    │
                    ▼
         Policy::canManageTournament (super_admin OR scoped)
                    │
                    ▼
         TournamentTeamService::attach(...)   ← single implementation
```

- **Do not** “mirror” by re-implementing queries in the front-end for business rules that should live server-side; backoffice calls the **same REST** for both personas.
- If routes live under **`api/v1/admin`**, **super admin and broadcaster** both use that prefix for tournament-ops; **middleware + policy** distinguish global vs scoped behaviour.

### 12.5 Scoring and controller

- **Balls / innings / toss** — same idea: a **`MatchScoringService`** (or extend existing ball pipeline) called from the existing user scoring controller; any broadcaster/super-admin scoring entry calls the **same** methods after `canScoreMatch`.
- **Match controller / graphic commands** — **one write path** (e.g. `MatchGraphicSessionService`) whether the actor is super admin or broadcaster.

### 12.6 Tests

- **Feature tests** on the **canonical** admin routes: super admin **and** broadcaster fixtures assert **HTTP + auth** wiring on the **same URLs**.
- **Unit or integration tests** on **services** assert business rules once (attach fails when roster full, etc.).

**Current tests (broadcaster slice):**

| File | What it covers |
|------|------------------|
| `tests/Feature/TournamentBroadcastStaffAppTest.php` | App user on **`tournament_broadcaster`** may **`POST /api/v1/tournaments/{id}/teams`**; unassigned user gets **403**. Uses **`APP_URL=http://localhost`** (see `phpunit.xml`) and **`Sanctum::actingAs(..., [], 'api')`**. |
| `tests/Feature/TournamentBackofficeImportAndBroadcastersTest.php` | **`POST …/broadcaster`** (tournament singleton); CSV import + **dry run** (no `tournament_player_import_logs` on dry run). |
| `tests/Feature/AdminBackofficePermissionMiddlewareTest.php` | Broadcast operator **without** detached admin permissions → **403** on **`GET …/admin/enums`**; with **`PermissionSeeder`** defaults → **200**. |

### 12.7 Checklist tie-in

Implements checklist §9 item **6** explicitly: **extract shared logic to services (or actions); single policy for tournament access; shared validation; single UI + API surface** — then wire actors by scope only.

---

Core enums, **`tournament_broadcaster`** pivot, backoffice UI, minimal CSV import, app tournament-staff checks, and the tests above are **in the repo**. This file still serves as the **spec** for permission-per-route wiring, full import/scoring polish, and remaining checklist items in §9.

---

## Follow-up backlog: four areas (skip vs do)

Engineering stance for optional work not required for the current broadcaster slice:

| # | Area | Skip for now? | Do when / how |
|---|------|-----------------|---------------|
| **1** | **Queued async import, column mapping UI, PII/error export retention** | **Yes (full pipeline).** Apply + dry run + import logs are enough until files are large, CSV shapes vary, or compliance requires retention/download rules. | Revisit as a **dedicated** import project (queue job, notifications, mapping UI, PII table from §5). |
| **2** | **Scoring lock / lease** (beyond audit + policy) | **Yes, until there is pain.** Audit rows and `canScoreMatchInApp` do not prevent concurrent writers. | **Do** when double-scoring or races show up in production. Pick **one** mechanism (e.g. cache lock around ball writes **or** a DB lease column), document in **`SCORING.md`**, and keep break-glass rules explicit. |
| **3** | **§6.4 — Revoke mid-session UX** (Echo toast, grace vs hard disconnect) | **Yes.** | **Do** when broadcast staff are routinely removed during live controller/scoring and confusion warrants product behaviour. |
| **4** | **Shared domain services** (user + admin paths) | **Yes, as a big-bang refactor.** | **Do opportunistically:** extract a small service only when the **same** mutation or validation would otherwise be duplicated again; do not schedule a repo-wide rewrite up front. |

**Bottom line:** none of these four blocks **block** what is already shipped. Prioritize **(2)** only after real scoring conflicts; treat **(1), (3), (4)** as defer unless product or compliance forces them.
