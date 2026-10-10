# app-react best-practices audit (TEMP)

Tracking file for fixes against [APP_REACT_BEST_PRACTICES.md](./APP_REACT_BEST_PRACTICES.md).  
**Delete this file when the checklist is done** (or fold remaining nits into a follow-up issue).

Status: `todo` → `doing` → `done` · skip with reason if intentional.

---

## Priority A — should-fix

### A1. Cross-feature deep imports (§1.2)

| # | Status | File | Issue |
|---|---|---|---|
| A1.1–A1.6 | done | entertainment / highlights / tournaments | Barrels on `feed` / `live` / `matches` |

### A2. Missing async error UI (§8)

| # | Status | File | Issue |
|---|---|---|---|
| A2.1–A2.5 | done | You / feed home / shop brands / Create Reel settings / tournament detail | ErrorState + ScreenBar where needed |

### A3. Copy casing (§10)

| # | Status | File | Issue |
|---|---|---|---|
| A3.1–A3.2 | done | QuickMatch / Notifications | Title Case CTAs |

### A4. Inline SVG (§5)

| # | Status | File | Issue |
|---|---|---|---|
| A4.1 | done | QuickMatch | → `ProgressRingIcon` |
| A4.2 | skip | StatsPanel | Data-viz exception (wagon wheel + chart colours) |

### A5. Tokens / hex (§4)

| # | Status | File | Issue |
|---|---|---|---|
| A5.1 | done | PostCard + CreatePostPage | `bg-post-turf` / `bg-post-floodlit` utilities |
| A5.2 | done | HomeDashboard | `bg-stripe-soft` |
| A5.3 | done | CreateReelPage | `bg-media-ink` / `bg-media-deep` |
| A5.4 | done | GoLivePage | `rounded-sm` |
| A5.5 | done | GoLiveOnAirPage | `bg-stripe-scrim` |
| A5.6 | done* | broadcast + FanPublicScoreCard | Fan card → `shadow-positive-*`; broadcast hex kept as **OBS wire constants** (`GRAPHIC_*_FALLBACK`) — not UI paint |
| A5.7 | done | MainDrawer | `px-4` |

\* A5.6 broadcast: `<input type="color">` + theme API require CSS hex strings; centralized in `broadcastGraphics.ts`.

---

## Priority B — nits

| # | Status | File | Issue |
|---|---|---|---|
| B1 | skip | OtpInput | `text-[27px]` / `h-[66px]` — tapeya-ui parity; keep |
| B2 | done | EntertainmentPage SearchBar | `h-11` |
| B3 | todo | `stats` feature shape | Page in `app/pages` — optional later |
| B4 | todo | Same-feature `@/features/feed/…` in feed home | Prefer relative — optional |
| B5 | todo | Widespread `h-[Npx]` / in-card `px-3.5` | Batch later |

---

## Progress log

| Date | Items | Notes |
|---|---|---|
| 2026-10-10 | A1–A4, A2, A3, A5.4/7 | First pass |
| 2026-10-10 | A5.1–3, A5.5–6, B2 | Token utilities in `index.css` + feature rewires |

## Remaining (optional)

- B3 / B4 / B5 batch nits
- Delete this TEMP file when satisfied
