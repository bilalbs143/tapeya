# Match Controllers (Backoffice) — Integration Guide

This document describes how to bring a **match graphics controller** into Tapeya’s **backoffice**, inspired by third-party broadcast backoffice UIs. The goal is to let operators configure themes, drive “what should appear on the overlay,” and persist match/session state **without** building or embedding the video pipeline (vMix, OBS, encoders, browser sources, etc.). Those concerns stay outside this feature; the backoffice produces **authoritative configuration and commands** that any future graphics renderer or integrator can consume.

---

## 1. What the reference product is doing

From typical cricket graphics backoffice screenshots, the product bundles three layers:

| Layer | Responsibility | In Tapeya (this doc) |
|--------|----------------|----------------------|
| **Graphics runtime** | Hosted HTML/Canvas/WebGL page; URL used as a browser source in production software | **Out of scope** — document only the **contract** (URL template, query params, or tokenized iframe URL) if you later host graphics separately. |
| **Operator controller** | Grids of actions: lower thirds, full-screen boards, player-specific LTs, breaks, transitions, custom captions | **In scope** — backoffice UI + APIs that record **intent** (e.g. “show lower third: last wicket”). |
| **Per-theme settings** | Theme list, channel URL display, team colors/logos, toggles (e.g. “Enable Images”), shortcuts, automation | **In scope** — settings storage and admin UI; **shortcuts/automation** can be phased. |

The **footer bar** in the reference (e.g. current inning dropdown, active theme name, refresh/export/settings) maps to **session context** + **global actions** in our app.

---

## 2. Product concept in Tapeya terms

### 2.1 Definitions

- **Graphics theme** — A named package of visual identity and widget behavior (e.g. “Pro Static”, “Urban Flow”). Each theme may expose different **configuration schema** (which color pickers, toggles, or asset slots exist).
- **Theme configuration** — Persisted JSON (or structured columns) for a **match session**: team primary/secondary/text colors, logos, feature flags, optional override URL base, etc.
- **Match controller session** — The live operational context for one broadcast: links to tournament/match, selected theme, current inning/phase, last emitted **graphic command**, optional operator notes.
- **Graphic command** — An atomic operator action: e.g. `{ type: 'LOWER_THIRD', subtype: 'LAST_WICKET', payload: { ... } }`. Commands are **append-only** for audit and replay; the “current overlay” can be derived from the latest command or a dedicated `active_graphic_id` field.

### 2.2 Why separate “controller” from “video”

- **Backoffice** owns **who**, **what**, and **when** in data form.
- **Studio software** owns **how** it is composited. Integrators paste a URL or subscribe to events — without Tapeya rendering pixels.

This matches how the reference app shows a **read-only URL** for vMix/OBS: that URL is the **graphics app**; Tapeya can store the **same URL pattern** or a **placeholder** until your graphics stack exists.

---

## 3. Alignment with the current repo

| Piece | Location / pattern |
|-------|-------------------|
| Backoffice app | `backoffice/` (Angular, lazy routes, Material) |
| Admin API | `api/routes/api/v1/admin.php`, controllers under `App\Http\Controllers\Admin` |
| Tournaments (admin) | `App\Http\Controllers\Admin\TournamentController`, `Route::apiResource('tournaments', …)`; UI `backoffice/src/app/pages/tournaments-management/` |

### 3.1 Match entity (implemented)

Tapeya already models a fixture as **`App\Models\TournamentMatch`**. It uses the **`matches`** table (not a class named `Match`, to avoid clashing with PHP’s `match` expression).

| Item | Detail |
|------|--------|
| Model | `App\Models\TournamentMatch` |
| Table | `matches` (see migration `api/database/migrations/2026_02_24_100004_create_matches_table.php`) |
| Primary key | `id` |
| Tournament | `tournament_id` → `tournaments.id` |
| Teams | `home_team_id`, `away_team_id` → `teams.id` |
| Schedule | `match_date`, `match_time`, `venue_name`, optional `group_index` |
| Match rules | `players_per_side`, `overs` |
| Progress | `status` (cast to `App\Enums\Event\MatchStatusEnum`), toss fields, `winning_team_id`, `is_no_result` |
| Relations | `tournament()`, `homeTeam()`, `awayTeam()`, `innings()`, etc. |

**Innings** for scorekeeping and for UI like “2nd Inning” in the controller footer:

| Item | Detail |
|------|--------|
| Model | `App\Models\Innings` |
| Table | `innings` |
| Match FK | `match_id` → `matches.id` |
| Useful fields | `innings_number`, `batting_team_id`, `bowling_team_id`, `status` |

Session `context` JSON can store `active_innings_id` or `active_innings_number` aligned with this table.

### 3.2 Match-related API routes that exist today

All of the following live under the **user** API (authenticated), in `api/routes/api/v1/user.php`. They use implicit route-model binding: `{match}` resolves to **`TournamentMatch`**.

| Method | Path | Controller & purpose |
|--------|------|----------------------|
| `GET` | `/tournaments/{tournament}/matches` | `TournamentMatchController@index` — list fixtures |
| `POST` | `/tournaments/{tournament}/matches` | `TournamentMatchController@store` — create fixture (organizer-only) |
| `GET` | `/matches/{match}` | `TournamentMatchController@show` — match detail + teams |
| `PATCH` | `/matches/{match}/toss` | `MatchTossController@update` |
| `GET` | `/matches/{match}/scorecard` | `ScorecardController@scorecard` |
| `GET` | `/matches/{match}/player-stats` | `ScorecardController@playerStats` |
| `POST` / `PATCH` / `DELETE` | `/matches/{match}/innings/{innings}/balls/...` | `ScorecardController` — ball-by-ball |
| `GET` / `POST` | `/matches/{match}/teams/{team}/squad` | `MatchSquadController` |
| `GET` / `POST` | `/matches/{match}/teams/{team}/playing-eleven` | `PlayingElevenController` |

The **admin** router (`admin.php`) currently exposes **`tournaments`** and **`tournament-requests`** only — **no admin `matches/*` routes yet**. Match controller persistence (§6) should be added as new admin endpoints (or as user endpoints if only organizers operate the controller with the same auth as scoring).

### 3.3 Natural entry points (backoffice + API)

1. **Angular:** Add a lazy route (for example `tournaments-management/matches/:matchId/controller` or nested under a future “Matches” list) that loads the controller dashboard; `:matchId` is `matches.id`.
2. **Laravel:** New resources such as `GraphicTheme`, `MatchGraphicSession`, `MatchGraphicCommand` (names up to you) with FK **`match_id` → `matches.id`**; admin routes under `admin` middleware, using `TournamentMatch $match` for the `{match}` parameter consistent with user routes.

---

## 4. Functional requirements (backoffice only)

### 4.1 Controller dashboard (operator UI)

Mirror the reference **card/grid** layout conceptually; implement with Tapeya’s design system (Material cards, chips, dropdowns).

| Module (reference) | Purpose | Tapeya implementation notes |
|--------------------|---------|------------------------------|
| Lower third | Quick triggers for score/status/player lines | Button groups call API `POST .../commands` with typed codes |
| Tournament block | Draw selection + league tables / leaders | Bind to tournament stage/draw enums + existing tournament data |
| Charts | Worm, run rate, Manhattan | Commands only unless you add chart data endpoints later |
| Full screen | Squads, summaries, MOM, etc. | Same command pattern; `display_mode: FULL_SCREEN` |
| Select batsman / bowler | Player + career-type dropdowns | Load roster via existing `GET /matches/{match}/teams/{team}/squad` and playing eleven via `.../playing-eleven`; stats via `GET /matches/{match}/player-stats` |
| Tour hits & transitions | Milestones, replay, decision | Command types + optional animation id in payload |
| Breaks | Innings/tea/rain | Command or session `phase` update |
| Custom captions | Add line to show on air | CRUD on `match_captions` or command with text payload |
| Footer | Inning selector, theme name, refresh/settings | Inning dropdown backed by `TournamentMatch::innings()` (or scorecard payload); persist selection in session `context` |

### 4.2 Settings modal (reference: CHANNELS / SHORTCUTS / AUTOMATION)

**Channels (phase 1 — recommended MVP)**

- Left sidebar: **theme catalog** (from API).
- Right panel: dynamic form driven by **theme schema** (see §5.2).
- Fields observed in reference: **graphics base URL** (read-only or templated), **per-team rows** (logo, label, text color, background color), **Enable Images** toggle.
- Actions: **Cancel** / **Update changes** → `PATCH` session or `PUT` theme configuration.

**Shortcuts (phase 2)**

- Map keyboard shortcuts to command types; store per user or per organization.

**Automation (phase 2)**

- Rules: e.g. “on wicket, queue LAST_WICKET LT” — needs event feed from scoring; optional later.

### 4.3 Global behaviors

- **Refresh** — Re-fetch session + last commands from API.
- **Export** — Download JSON of session config + command timeline for support or external tools.
- **Permissions** — Restrict controller to roles (e.g. `match.operator`, `admin`).

---

## 5. Data model (suggested)

New tables below are **not** in the repo yet; add them via migrations. Foreign keys should reference real tables: **`match_id` → `matches.id`**, **`graphic_theme_id` → `graphic_themes.id`**. You can omit a denormalized `tournament_id` on the session and always resolve it through `TournamentMatch::tournament_id`.

### 5.1 `graphic_themes`

| Column | Type | Notes |
|--------|------|--------|
| `id` | bigint | |
| `slug` | string, unique | e.g. `crickslab-pro-static` |
| `name` | string | Display name |
| `config_schema` | json | JSON Schema or internal DSL describing form fields |
| `default_config` | json | Defaults for new sessions |
| `graphics_url_template` | string, nullable | e.g. `https://graphics.example/{match_token}` — **no video coupling**; informational for operators |
| `is_active` | boolean | |

### 5.2 `match_graphic_sessions`

One session row per **`matches.id`** you want to drive (e.g. one per live broadcast).

| Column | Type | Notes |
|--------|------|--------|
| `id` | bigint | |
| `match_id` | bigint, FK | **Required.** `constrained('matches')->cascadeOnDelete()` |
| `graphic_theme_id` | bigint, FK | `constrained('graphic_themes')` (or your theme table name) |
| `config` | json | Resolved theme config (colors, logos, toggles); aligns with home/away from `matches.home_team_id` / `away_team_id` |
| `context` | json | e.g. `active_innings_id` (→ `innings.id`), `phase`, `group_index` for UI filters |
| `active_command_id` | bigint, nullable | FK to `match_graphic_commands.id`, optional |
| `created_by` / `updated_by` | FK → `users.id`, nullable | Audit |

Unique constraint: **`match_id`** (one graphic session per match), unless you intentionally support multiple streams per fixture.

### 5.3 `match_graphic_commands`

| Column | Type | Notes |
|--------|------|--------|
| `id` | bigint | |
| `match_graphic_session_id` | FK | |
| `command_type` | string | Enum: `LOWER_THIRD`, `FULL_SCREEN`, `TRANSITION`, `BREAK`, `CAPTION`, … |
| `command_key` | string | e.g. `LAST_WICKET`, `POINT_TABLE` |
| `payload` | json, nullable | Player ids, caption text, extra params |
| `display_mode` | string, nullable | `LT`, `FS`, … |
| `created_at` | timestamp | |

Indexes: `(match_graphic_session_id, id)` for timeline queries.

### 5.4 Optional: `match_captions`

For custom message list with ordering and on/off state if you do not want only command-based captions.

---

## 6. API surface

### 6.1 Read-only / operator data (already shipped)

Use the **user** API paths from §3.2 for scorecard, squads, playing eleven, and player stats when building controller UI. Base path is your configured API prefix (e.g. `/api/v1/...`). The backoffice can call these with an appropriate token if operators use the same app as organizers, or you can duplicate read-only admin endpoints later.

### 6.2 New routes (admin — recommended for Tapeya backoffice)

Register inside `Route::middleware(['auth:api', 'admin.only'])->group(...)` in `api/routes/api/v1/admin.php`. Use **`{match}`** with type-hint `TournamentMatch $match` so binding matches user routes.

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/admin/graphic-themes` | Theme catalog |
| `GET` | `/admin/matches/{match}/graphic-session` | Get or create session for this `TournamentMatch` |
| `PATCH` | `/admin/matches/{match}/graphic-session` | Update `config`, `context` |
| `POST` | `/admin/matches/{match}/graphic-session/commands` | Append command |
| `GET` | `/admin/matches/{match}/graphic-session/commands` | Paginated history (`?since_id=`, `per_page=`) |
| `POST` | `/admin/matches/{match}/graphic-session/commands/{command}/activate` | Set active on-air (optional) |
| `GET` | `/admin/matches/{match}/graphic-session/signed-url` | Build a **time-limited signed URL** for the React overlay (OBS / vMix); see §6.3 |

**Alternative:** If only **tournament organizers** (not `admin.only`) should run the controller, mirror the same paths under the user prefix with a policy that checks `$request->user()->id === $match->tournament->organizer_id` (or your RBAC equivalent).

Validation: whitelist `command_key` per `command_type` to avoid arbitrary client payloads.

**Authorization:** Admin and/or organizer-as-operator; enforce access using `tournament_id` from `$match->tournament_id`.

### 6.3 OBS / vMix overlay URL (signed link — operator note)

The **Tapeya app** (`app/`, Vite) exposes a transparent overlay route: `/overlay/:matchId?theme=…`. Browser sources (OBS, vMix, etc.) cannot rely on a normal user login, so the **initial** graphic session is loaded with a **signed query string** (`expires` + `signature`) issued by the API. Real-time updates still use the public Reverb channel `match.{matchId}.graphics` (no token).

**What operators do**

1. In **Match Graphics Controller**, open **Graphics Settings** (gear / first-load dialog).
2. Wait for **“Overlay URL (signed)”** to appear, then **copy** the full URL.
3. In OBS: **Sources → + → Browser** → paste the URL as the address. Set width/height to match your output; leave custom CSS empty unless you know you need it.
4. Before the link **expires** (default **24 hours** after generation; see `OVERLAY_DEFAULT_TTL_SECONDS` / `config/overlay.php`), use **“New link”** in the same dialog and **update the Browser Source URL** in OBS, or re-open settings and copy again.

Changing **theme** in the dialog updates only the `theme=` query parameter on the client; you do **not** need a new signature for that. **“New link”** issues a fresh `expires` + `signature` (use if the old link expired or was rotated).

**What engineers configure**

| Setting | Purpose |
|---------|---------|
| `OVERLAY_FRONTEND_URL` (Laravel `api/.env`) | Origin of the React app used when building the pasted URL (e.g. `http://localhost:5173` or `https://app.tapeya.com`). Must match where OBS loads the page. |
| `OVERLAY_SIGNING_SECRET` (optional) | Dedicated HMAC secret for overlay links; if unset, `APP_KEY` is used. |
| `OVERLAY_DEFAULT_TTL_SECONDS` (optional) | Lifetime of each signed link in seconds (default **86400** = 24 hours). Same key as `default_ttl_seconds` in `api/config/overlay.php`. |

**Public bootstrap endpoint** (no auth; signature required): `GET /api/v1/matches/{match}/graphic-session/overlay?expires=…&signature=…` — same session JSON shape as the authenticated user `GET …/graphic-session`. The signed **page** URL from the admin endpoint already includes `theme`, `expires`, and `signature` for the operator to paste wholesale.

---

## 7. Command taxonomy (contract for future graphics app)

Define a **stable enum** of `command_type` + `command_key` pairs in code (PHP enum + TypeScript const). Example:

```text
LOWER_THIRD / MINI_SCORECARD
LOWER_THIRD / LAST_WICKET
FULL_SCREEN / BATTING_SUMMARY
BREAK / TEA
CAPTION / CUSTOM
TRANSITION / SIX
```

The **graphics consumer** (future) subscribes to the same contract via:

- Polling admin (or public-scoped) `GET /admin/matches/{match}/graphic-session/commands?since_id=`, or
- **WebSocket / SSE** (optional enhancement) for low latency.

The **shipped overlay app** uses **Reverb** for live activations and a single **HTTP bootstrap**: authenticated `GET /api/v1/matches/{match}/graphic-session`, or **signed** `GET /api/v1/matches/{match}/graphic-session/overlay` (§6.3).

Tapeya backoffice does not need WebSockets for MVP; HTTP is enough for operator UX.

---

## 8. Front-end architecture (`backoffice/`)

### 8.1 Structure

- `pages/match-controller/` (new feature module)
  - `match-controller.routes.ts`
  - `controller-dashboard/` — main grid UI
  - `controller-settings-dialog/` — theme sidebar + CHANNELS form
  - `services/match-graphic-session.service.ts` — HTTP to admin API
  - `models/graphic-command.model.ts` — TS types mirroring API

### 8.2 Dynamic theme form

- Load `config_schema` from theme (or a static map per `slug` in v1).
- Render color pickers, toggles, file upload for logos (store URLs via existing media patterns).

### 8.3 State

- **Session state** in a facade service or signal store: `theme`, `config`, `context.inning`, `lastCommands`.
- **Optimistic UI** optional for buttons; prefer server truth for “active graphic.”

### 8.4 Navigation

- Add a **Matches** sub-area under **Tournaments Management** (or open controller from tournament detail once admin match listing exists). Today, match lists are available to **organizers** via user API `GET /tournaments/{tournament}/matches`; the backoffice may need a small **admin** `GET /admin/tournaments/{tournament}/matches` (or reuse client-side tournament context + user token) before the controller page can list fixtures without the public app.

---

## 9. Explicit out-of-scope (video / studio)

The following are **not** required for the backoffice feature to ship:

- vMix/OBS plugins, NDI, WebRTC, or browser source embed inside Tapeya
- Pixel-perfect parity with third-party themes
- Real-time video compositing or latency tuning
- Hardware integration

**Do** document for integrators:

- How to obtain `graphics_url_template` and `match_token` (if you add tokens)
- **Signed overlay URL** flow for OBS / vMix: §6.3 (`signed-url` admin route + public `graphic-session/overlay` bootstrap)
- Command JSON shape and polling/WebSocket plan (when added)

---

## 10. Phased rollout

| Phase | Deliverable |
|-------|-------------|
| **P0** | Migrations + `graphic_themes` seed + session `PATCH` + single “send command” endpoint + minimal dashboard (one column of buttons) + settings dialog (colors, toggle, URL display) |
| **P1** | Full module grid parity with your sport’s needs; captions CRUD; command history panel |
| **P2** | Shortcuts tab; export; WebSocket for external graphics app |
| **P3** | Automation rules tied to ball-by-ball events (requires scoring pipeline) |

---

## 11. Testing and operations

- **Feature tests** (Laravel): session update, command validation, RBAC.
- **E2E** (optional): operator clicks button → API receives expected payload.
- **Audit**: `match_graphic_commands` is a natural audit log for “what was sent to graphics.”

---

## 12. Summary

Integrating **match controllers** in Tapeya means treating the reference product’s dashboard and settings as **operations + configuration UIs** backed by **sessions**, **theme schemas**, and an **append-only command log**, all keyed to **`TournamentMatch` / `matches.id`** and, where needed, **`Innings`**. Video software remains downstream: it consumes URLs and/or commands you define. This extends the existing **user** match/scorecard APIs (§3.2) and sits next to **admin** tournament routes; add **admin** match-graphic routes as in §6.2 when you implement the feature.
