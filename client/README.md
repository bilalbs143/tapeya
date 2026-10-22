# Tapeya App — Rewrite Scaffold

TypeScript rewrite of the user-facing app, built against
[`docs/APP_REWRITE_ARCHITECTURE.md`](../docs/APP_REWRITE_ARCHITECTURE.md).
Day-to-day rules for every file/component:
[`docs/APP_REACT_BEST_PRACTICES.md`](../docs/APP_REACT_BEST_PRACTICES.md). This is
**not** a full port of the existing `app/` — it's the foundational scaffold
(§16, rollout step 1): every cross-cutting system the doc describes, wired up
and proven with two real features against the **real Laravel contracts**, so
the pattern is validated before the team commits to porting the rest
screen-by-screen.

Graphics (`app/src/graphics`, `@tapeya/graphics-core`) is explicitly out of
scope here, same as in the architecture doc — this project has no graphics
code and never will.

## What's implemented

| Doc section        | What's here                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| §7.8 (wrap/unwrap) | `shared/api/` — envelope schemas (`data` optional per `array_filter`), full unwrap helper set      |
| §7.5               | `shared/api/errors.ts` — one `ApiError` discriminated union                                        |
| §7.3               | `shared/config/realtime.ts` — typed Echo stub; feature schemas parse payloads                      |
| §7.4               | Path builders per feature + `RequireAuth` / `RequireGuest` + `AppShell`                            |
| §8                 | Keychain/Keystore via `secureStorage` + `authSession` (Preferences only on web; one-shot migrate)  |
| §13                | Vanilla `dialogStore`, `confirm()`, 401 → `SessionExpiredDialog`, logout confirm                   |
| §12.1 / §12.2      | Bundled SVG icons + `MediaFrame` / `MEDIA_ASPECT` / `@theme` tokens                                |
| §12                | `Button` via `cva`, dark+light `@theme inline` tokens (from `tapeya-ui`), CDN helper for rasters   |
| §11                | Native façades: `secureStorage`, `share`, `push`, `orientation`                                    |
| §3 Sentry          | `@sentry/react` via `shared/config/sentry.ts` (errors + tracing + replay); DSN = `VITE_SENTRY_DSN` |
| §5                 | Features `auth` + `tournaments`; ESLint bans deep `@/features/*/*` imports                         |
| §9 / §10           | Strict TS; Vitest + MSW + Playwright; CI workflow `client-checks.yml`                              |

## Contract notes (verified against `api/`)

- Auth: phone + **4-digit** OTP — `POST /auth/register`, `POST /auth/request-otp`, `POST /auth/verify-otp` → `{ user, auth: { access_token } }`; routes `/login`, `/register`, `/otp` (phone in nav state only)
- Invalid OTP is HTTP **401** — treated as a form error, not session expiry (only Bearer-authenticated protected calls open `SessionExpiredDialog`)
- Auth UI chrome (`AuthShell`, `PhoneField`, `OtpInput`, saved profiles) ported from the `auth/` design pack
- Tournaments: list/show/create match `TournamentResource` + `StoreUserTournamentRequest` (`short_name` required)
- There is **no** User `DELETE /tournaments/{id}` — delete is not in this scaffold

## UI source of truth

Visual language (tokens, primitives, Dialog chrome, Empty/Error/Skeleton/Loading,
theme) is ported from [`tapeya-ui/`](../tapeya-ui) into `shared/ui/` — not
imported as a package. Theme is `data-theme` + CSS variables (dark default /
light / system); there is **no** separate `dark.css`.

**Adoption rules for new UI work:**

- Import from `@/shared/ui` (or a subpath for icons/toast/media). Prefer an
  existing primitive over a one-off styled `<div>`.
- Style with semantic tokens only (`bg-surface`, `text-ink`, `rounded-field`,
  `text-3xs`, …). No new hex / `rgba()` / arbitrary `text-[Npx]` /
  `rounded-[Npx]` in shared or new feature UI.
- Overlay sheet→centred card switches at **`tab:` (900px)**, not `sm` (640).
- PhoneField / OtpInput stay in `features/auth` until a second consumer needs them.

`ThemeProvider` + `ThemeToggle` + `index.html` boot snippet follow tapeya-ui.
Scaffold chrome lives in `shared/layout/`: `TopBar`, five-tab `BottomNav`,
labelled `SideNav` + Create + user chip. `toast()` + `ToastHost` cover feedback.

## Stack versions (scaffold policy)

`client/` tracks **latest stable** majors — not the legacy `app/` pin:

| Package                       | Target                                              |
| ----------------------------- | --------------------------------------------------- |
| `react` / `react-dom`         | 19.x                                                |
| `react-router-dom`            | 7.x                                                 |
| `@capacitor/core` (+ plugins) | latest stable major                                 |
| `vite` / `vitest`             | latest stable (Vite 8 + Vitest 4)                   |
| `typescript`                  | latest **5.x** until `typescript-eslint` supports 7 |

Bump with intent when new stables ship; don't wait for the old app to move first.
Prefer ecosystem-compatible majors over blind `npm install foo@latest` when peers conflict.

## Not yet ported (product parity)

Feed, reels, scoring, shop, live, notifications, profile, full nav chrome.
Port screen-by-screen per §16.

## Running it

Requires **Node.js ≥ 24.15** (see `package.json` `engines` and `.nvmrc`). Use `nvm use` in `client/`. CI uses Node 24.

```bash
npm install
cp .env.example .env       # point VITE_API_URL at your local api/
npm run dev                # http://localhost:5180 (avoids legacy app on :5173)
```

```bash
npm run typecheck
npm run lint
npm run fix                 # eslint --fix + prettier
npm test
npm run test:e2e
npm run build
```

### Native (Capacitor)

One-time (after clone, if `ios/` / `android/` are missing):

```bash
npx cap add ios
npx cap add android
```

**iOS dependency model (do not “simplify” away):**

| Layer                                | Manager                       | Why                                                                                                                   |
| ------------------------------------ | ----------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Capacitor plugins                    | CapApp-SPM (SwiftPM)          | Capacitor 8 default                                                                                                   |
| HaishinKit 2.0.9 (go-live broadcast) | CocoaPods (`ios/App/Podfile`) | Matches `TapeyaBroadcastPlugin`’s 2.0.x API; keep off SPM until a deliberate 2.2+ / `RTMPHaishinKit` plugin migration |

Always open **`ios/App/App.xcworkspace`** (Pods + app). Opening `App.xcodeproj` alone will not link HaishinKit. After clone or `Podfile` / lock changes: `npm run ios:pods`.

```bash
npm run cap:ios                    # prod web build → sync → pod install → open workspace
npm run cap:ios:staging
npm run cap:sync:ios               # web assets + CapApp-SPM + pod install (no open)
npm run cap:open:ios               # open App.xcworkspace (prefer over `cap open ios`)
npm run ios:pods                   # CocoaPods only
npm run cap:android                # prod web build → sync → open Android Studio
npm run cap:android:staging
npm run cap:android:bundle         # release AAB (needs android/ signing setup)
npm run cap:android:bundle:staging
npm run verify:android:bundle      # print AAB cert Owner / SHA1
npm run cap:sync                   # both platforms + ios pods
```

`build:production` / `build:staging` are web-only (no Cap sync).
Requires **CocoaPods** (`pod` ≥ 1.16) on the Mac for iOS.
