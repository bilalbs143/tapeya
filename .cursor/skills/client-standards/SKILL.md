---
name: client-standards
description: >-
  Coding standards for the Tapeya client rewrite (Vite + React 19 + Tailwind v4).
  Use when editing client/, porting screens from tapeya-ui or app/, adding shared/ui
  primitives, reviewing client PRs, or continuing page-by-page UI migration.
---

# client coding standards

## Sources of truth (non-negotiable)

The rewrite exists to **improve UI/UX**. Do not recreate the legacy `app/` look.

| Concern | Source of truth | Never |
|---|---|---|
| **UI / UX** — layout, chrome, tokens, primitives, typography, spacing, interaction patterns, copy tone | `tapeya-ui/` (screens + `components/ui` + design docs) | Copy or “match” legacy `app/` visual styles, splash screens, dark-only shells, hand-rolled headers, or old class soup |
| **Business logic / API contracts** — endpoints, payloads, OTP length, auth flow, validation rules, RTK shapes | `app/` + Laravel `api/` | Invent endpoints, change OTP length, invent wire fields |
| **Final product** | `client/` | Import `tapeya-ui` as a runtime package |

### How to port a screen

1. **Open the tapeya-ui screen first** (`tapeya-ui/src/screens/*`, route under `tapeya-ui/src/app/*`, plus shared chrome in `components/`). Match structure, tokens, and interaction — that is the UX target.
2. **Wire behaviour from `app/` + `api/`** — RTK endpoints, Zod wire→domain, MSW contracts, navigation rules that exist in production.
3. **If tapeya-ui and `app/` disagree on visuals** → **tapeya-ui wins**.
4. **If tapeya-ui and `app/` disagree on API / auth / data** → **`app/` + `api/` wins**.
5. **Never** open `app/src/pages/*` or `app` CSS as a styling reference. Use `app/` only for hooks, API slices, validators, and flow order.

Architecture: [`docs/APP_REWRITE_ARCHITECTURE.md`](../../../docs/APP_REWRITE_ARCHITECTURE.md). UI language: `tapeya-ui/DESIGN_SYSTEM.md`, `PAGE_INVENTORY.md`, `COMPONENT_INVENTORY.md`.

## Stack conventions

- TypeScript strict + `exactOptionalPropertyTypes` — optional props that may be `undefined` at call sites must be `prop?: T | undefined`, not bare `prop?: T`.
- Styling: Tailwind v4 + semantic tokens in `src/index.css` + `cva` for variants. **No** per-component CSS files, **no** separate `dark.css`.
- Theme: `data-theme` on `<html>` via `ThemeProvider` + boot snippet. Tokens flip; do not transition colour on theme change.
- Imports: `@/shared/ui` barrel for primitives; subpaths for `icons`, `toast`, `media`. Prefer `@/shared/ui/Field` over barrel inside other `shared/ui` files (avoid cycles).
- Forms: React Hook Form + Zod when wiring real forms; auth already uses RTK + local state.

## Design tokens (non-negotiable)

Use tokens — do not add new hex, `rgba()`, `text-[Npx]`, or `rounded-[Npx]` in feature/shared UI:

- Colour: `bg-page`, `bg-surface`, `text-ink`, `text-muted`, `border-border`, `text-brand-text`, `warning`, …
- Radius — two layers in `index.css`:
  - **Primitives:** `xs` 4 · `sm` 8 · `md` 12 · `lg` 16 · `xl` 20 · `full` 9999
  - **Semantics:** `rounded-chip` (xs) · `rounded-button` / `rounded-field` (sm) · `rounded-icon` / `rounded-panel` (md) · `rounded-card` (lg) · `rounded-sheet` (xl) · `rounded-full` / `rounded-pill` (full) · `rounded-nest` (`field − 2px` for `p-0.5` shells only)
  - **Shape roles (do not mix):**
    - Interactive filter `Chip` → `rounded-field` (same height language as buttons) — **not** `rounded-chip`
    - `rounded-chip` / xs → tiny tags, checkbox corners, compact MediaFrame `sm` only
    - Static `Badge` / status labels → `rounded-full` (pill)
    - Checkbox → slightly rounded square (`rounded-chip`); Radio → `rounded-full`
    - Alert / state glyph wells → `rounded-full`; interactive IconButton → `rounded-icon` or `rounded-button`
  - **Nesting:** formula `inner = max(xs, outer − pad)` applies **only to edge-hugging** children (segment thumbs, bleed media, highlighted rows flush to a shell). If padding ≥ parent radius, the child keeps its **role** token (`button` / `field` / etc.) — do not force nest. Use `rounded-nest` only inside `p-0.5` field shells (ThemeToggle, Tabs segmented). No `rounded-[…]`.
- Type: `text-4xs` … `text-score`, `tracking-eyebrow`, `font-mono` for scores/eyebrows
- Breakpoints:
  - `sm` (~640) — shell swap (bottom nav ↔ SideNav) only
  - `tab` (900) — overlays sheet→card, content chrome
  - `desk` (1200) — right rail
  - `wide` (1440) — labelled SideNav expansion

Overlays (`BaseDialog`) **must** use `tab:`, never `sm:`, for the sheet→centred dialog switch.

## Shared UI rules

1. New UI → check `@/shared/ui` first. Prefer Chip, Tabs, Field, Select, IconButton, Avatar, Card, EmptyState/ErrorState/LoadingState/Skeleton, Spinner.
2. Port new primitives from `tapeya-ui/src/components/ui/` as TypeScript + `cva`; keep variant/size names verbatim.
3. `IconButton` requires `label` → `aria-label`.
4. Spread `...props` **before** `aria-*` so callers cannot clobber a11y attributes.
5. Errors: `role="alert"` + message text (never colour alone). Success/status: `role="status"`.
6. `OtpDebugBanner` and any `debugOtp` nav state: **DEV only** (`import.meta.env.DEV`).
7. PhoneField / OtpInput stay under `features/auth` until a second consumer needs them. Do not add a WhatsApp banner on login/register.
8. Horizontal product/story rails use `HScroll` (`-mx-4 px-4` bleed) so scroll goes edge-to-edge like Facebook; keep section labels in `px-4`.
9. `StickyActionBar` — pass as `DockScreen` / `PageDock` `footer` (sibling of the scroll body, not nested in a `px-*` form). Owns `px-4`; never pass `-mx-*`. Home feed stays document scroll (no `PageDock`). See `docs/APP_REACT_PAGE_LAYOUT.md`.

## Icons (non-negotiable)

**No inline `<svg>` in feature/page/layout components.** All glyphs live under `client/src/shared/ui/icons/` and are imported from `@/shared/ui/icons`.

| Do | Don’t |
|---|---|
| `import { CloseIcon } from '@/shared/ui/icons'` | Copy-paste `<svg>…</svg>` into pages / sheets / chrome |
| Add `FooIcon.tsx` + export from `icons/index.ts` | One-off local `function FooGlyph()` SVGs (except true data-viz, e.g. wagon wheel) |
| Port from `tapeya-ui/src/components/icons/` when it exists | Invent a second heart/share/close path |
| Size via `size` / `className` (`h-4 w-4`); color via `currentColor` | Hardcode duplicate viewBoxes across features |

**Allowed exceptions (document in the PR if you add one):**

- `Spinner` / button loading arc (loading primitive, not an icon)
- True charts / data drawings (e.g. wagon-wheel panel)

See architecture §12.1.

## Auth / session

- OTP length is **4** (`OTP_LENGTH`) — never “upgrade” to 6 for UI parity with other products.
- Phone rides in `location.state` only — never in the URL.
- After `verifyOtp().unwrap()`, **`await persistAuthSession(...)` before `navigate`** so `RequireAuth` does not bounce to login (RTK `onQueryStarted` races).
- Register sends OTP — do **not** call `requestOtp` again after register.
- `returnTo` through `safeInternalPath`.

## Enums (single source of truth)

Dropdowns, chips, and scoring option lists that map to Laravel enums **must** come from `GET /enums` via `shared/api/enumsApi` (`useGetEnumsQuery`, `usePlayerProfileEnums`, `useCricketFormatOptions`, `useDismissalOptions`, …).

- **Never** hardcode option tables for API enums (`playing_role`, `cricket_format`, `dismissal_type`, `stats_bucket`, …).
- UI copy for those options comes from API `label` (and metadata like `requires_fielder` / `valid_on_free_hit`).
- Pure cricket **logic** / unit tests may still use string literals for known values; UI lists must prefer enum metadata.
- While loading: disabled Select/Chip row or skeleton — do **not** invent fallback option lists that can drift from the API.
- Non-enum UX presets (overs steppers like 5/10/20, team-count chips) may stay local.

## Feature folder discipline

```
features/<name>/{api,model,pages,ui,lib,routes,test}/
```

- ESLint bans deep `@/features/*/*` imports from outside the feature — use the feature barrel.
- Keep RTK queries/mutations and Zod schemas from `app/`/`api/`; **restyle only from tapeya-ui**, never from legacy `app/` pages.
- Page migration order preference: Auth → Feed → Explore → shell → Matches → Tournaments → Reels → You.
- Matches scoring = toss → crease → pad. Quick match (mockup 4d) is chip choices, roster progress, and a sticky save + toss bar; toss only with a full XI. Start-match wizard, scorecard, and rare ball events still follow.
- Tournaments hub = Active · Previous on real `active`|`inactive` statuses; create opens workspace directly (no request/review queue).
- Reels v1 = snap player + tabs on `/reels/*` feeds; HLS via hls.js; auth-gated Following/Mine/Saved; comments/report/follow wired; match chip when wire includes `match`.
- You v1 = own profile (`features/profile`) with Reels/Posts/Saved shelves + Edit Profile (`/profile`, mockup 4e: grouped sections, strength chips, sticky discard + save, quiet delete). Public `/u/:handle` (id or nickname via lookup) with Follow + Reels/Posts/Stats.

## A11y checklist (every screen touch)

- [ ] Interactive icons have accessible names
- [ ] Media links with empty `alt` have `aria-label`
- [ ] Toggle actions use `aria-pressed` when on/off
- [ ] `<nav>` / primary `<aside>` have `aria-label`
- [ ] Forms: submit via `<form onSubmit>` (Enter works); errors linked with `aria-describedby`
- [ ] Menus: prefer Radix DropdownMenu — do not hand-roll mouse-only menus

## Verification before handing off

```bash
cd client && npm run typecheck && npm run test && npm run lint
```

Fix failures you introduced. Do not weaken TypeScript or skip tests to greenwash.

## Deferred (track, don't ignore)

- ~~Profile tokens / saved profiles → `secureStorage` (migrates legacy `localStorage`)~~
- ~~Phone **MainDrawer** (tapeya-ui logout / nav groups)~~
- ~~Shell: `tab`/`desk`/`wide` SideNav, desktop TopBar, default SideRail, “Get the app” footer~~
- ~~Feed home: `HomeDashboard` / `MobileHomeHeader` / `HomeRail` + explore interstitials (products, highlights, people)~~
- ~~Post detail: CommentThread + sticky composer (tapeya-ui 20a)~~
- ~~Create reel: full upload/progress flow (not stub)~~
- ~~Reels CommentSheet (reuses post comments API); feed comment → `/p/:id#comments`~~
- ~~ReportSheet + delete post (shared `POST /posts/{id}/report`, `DELETE /posts/{id}`)~~
- ~~Repost (`POST /posts/{id}/repost`)~~
- ~~Reels: ReelCaption expand/profile link + Scrubber~~
- ~~Auth polish: OtpInput ~27px digits, WhatsAppNotice CommentIcon, sticky Save on Edit Profile~~
- ~~Matches: wire create tiles to real routes; live scores / done result+MOTM when API fields exist~~
- ~~Tournaments: hub + create wizard (direct create, no review queue); workspace vs public `TournamentPage`~~
- ~~Public profile Stats tab; handle-based `/u/:nickname` (lookup resolve; profile API still id)~~
- ~~Reels: auth-gated tabs, HLS playback~~
- ~~Rankings hub + stats tables (`GET /rankings`, open tournament)~~
- Match chip on reel caption waits on API `match` payload (UI ready; needs `posts.match_id` + PostResource — not a frontend gap)
- ~~Scoring pad: extras + OverflowSheet + wicket summary + wagon zone picker; edit-ball / ball log / scorecard / partnership / stats / fan `/m/:id`~~
- ~~Scorer desk chrome: MatchHeader, LiveInningsStrip, FirstBallSetup, CreaseDialog, ViewOnlyPad, pill tabs~~
- ~~StartMatch wizard (tapeya-ui 10b → create fixture → toss; Save Fixture)~~
- ~~One-tap extras defaults on scoring pad (WD/NB/BYE/LB); sheets kept for rare cases~~
- ~~MOTM MatchOver (`PATCH /matches/:id/player-of-match`)~~
- ~~Declare XI in first-ball (`DeclareSquadScreen` → match squad / playing-eleven / C / WK)~~
- ~~WicketChain two-step (how → detail → summary; free-hit dims)~~
- ~~MatchActionMenu admin sheets (lifecycle + keeper / sub / runs / breaks / notes / rules)~~
- ~~Match settings (`/matches/:id/settings` — wagon wheel + officials; save-as-you-go)~~
- ~~Broadcast graphics (`/matches/:id/graphics` — themes + signed OBS URL)~~
- ~~ConnectionBanner (16a) — Echo `match.{id}.scoring` + offline/reconnect strip; `?conn=` demos; no offline queue yet~~
- ~~Live / Go live — hub + watch + go-live form + on-air (stream-scoped Echo; external `/live/streaming*` deferred)~~
- ~~Tournaments: squad editor (`/tournaments/:id/squad` — search, occupancy, autosave)~~
- ~~Tournaments: teams attach (`/tournaments/:id/teams` + ManageTeamDialog; logo upload deferred)~~
- ~~Notifications inbox (`/notifications` + shell bell unread badge)~~
- ~~Upcoming tournaments fan discover (`/upcoming-tournaments` + detail)~~
- ~~Interest form (`/interest/:slug` — submit / withdraw / media; dialog + sidebar deferred)~~
- ~~Highlights hub (`/highlights` + detail; home rail + explore tile)~~

## Page layout (non-negotiable)

Every screen picks a **page type** and follows the shared gutters / sticky / safe-area rules. Do not hand-roll headers or invent `px-*` / sticky offsets.

Full blueprint + PR checklist: [docs/APP_REACT_PAGE_LAYOUT.md](../../../docs/APP_REACT_PAGE_LAYOUT.md).

## UI copy casing

- **Title Case** (Chicago): screen titles, short subtitles, dialog titles, buttons, empty/error titles, short toast titles.
- **ALL CAPS**: Field / FormSection / SectionLabel eyebrows — keep CSS `uppercase`; do not restyle to Title Case.
- **Sentence case**: long descriptions, hints, placeholders, toast descriptions, API labels.

Full rules + checklist: [docs/APP_REACT_COPY_CASING.md](../../../docs/APP_REACT_COPY_CASING.md).

## Additional resources

- **Master best practices (all files/components)**: [docs/APP_REACT_BEST_PRACTICES.md](../../../docs/APP_REACT_BEST_PRACTICES.md)
- Token + primitive inventory: [reference.md](reference.md)
- **Page layout blueprint**: [docs/APP_REACT_PAGE_LAYOUT.md](../../../docs/APP_REACT_PAGE_LAYOUT.md)
- Form density migration: [docs/APP_REACT_FORM_MIGRATION.md](../../../docs/APP_REACT_FORM_MIGRATION.md)
- Copy casing: [docs/APP_REACT_COPY_CASING.md](../../../docs/APP_REACT_COPY_CASING.md)
