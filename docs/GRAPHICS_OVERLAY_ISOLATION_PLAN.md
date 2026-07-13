# Graphics Overlay Isolation Plan

> **Implementation note (2026):** Product naming and URLs in this doc are partially superseded. Current canonical URL: `https://graphics.tapeya.com/{sessionId}-{expires}-{signature}`; bootstrap API: `GET /graphic-sessions/access/{token}`; build: `npm run build:graphics` → `dist-graphics/`. See `app/README.md` and `docs/DEPLOYMENT.md`.

> **Status:** Approved — implementation spec v1.3 (July 2026)  
> **Audience:** Engineering, broadcast ops, backoffice integrators  
> **Scope:** vMix / OBS browser-source overlay — **not** consumer app, **not** backoffice controller UI  
> **Related:** `[app/src/graphics/ARCHITECTURE.md](../app/src/graphics/ARCHITECTURE.md)` §17, `[shared/graphics-command-manifest.json](../shared/graphics-command-manifest.json)`, `[docs/MATCH_CONTROLLERS_BACKOFFICE.md](./MATCH_CONTROLLERS_BACKOFFICE.md)`, `[docs/DEPLOYMENT.md](./DEPLOYMENT.md)`

---

## Table of contents

1. [Executive summary](#1-executive-summary)
2. [The problem we are solving](#2-the-problem-we-are-solving)
3. [vMix / browser landscape](#3-vmix--browser-landscape)
4. [Decision: isolate the overlay artifact](#4-decision-isolate-the-overlay-artifact)
5. [What we are NOT doing](#5-what-we-are-not-doing)
6. [Consumer app vs overlay requirements](#6-consumer-app-vs-overlay-requirements)
7. [CSS strategy (no Tailwind v4 in overlay)](#7-css-strategy-no-tailwind-v4-in-overlay)
8. [JavaScript & bundle strategy](#8-javascript--bundle-strategy)
9. [Target architecture](#9-target-architecture)
10. [What stays vs what moves](#10-what-stays-vs-what-moves)
11. [Interim mitigations (already shipped)](#11-interim-mitigations-already-shipped)
12. [Implementation phases](#12-implementation-phases)
13. [Overlay store split (Phase 1 critical path)](#13-overlay-store-split-phase-1-critical-path)
14. [Proposed repo layout](#14-proposed-repo-layout)
15. [CI & quality gates](#15-ci--quality-gates)
16. [Deployment & URL versioning](#16-deployment--url-versioning)
17. [Backoffice & API integration](#17-backoffice--api-integration)
18. [Broadcaster migration & legacy route policy](#18-broadcaster-migration--legacy-route-policy)
19. [Testing checklist](#19-testing-checklist)
20. [Effort estimates](#20-effort-estimates)
21. [Locked decisions](#21-locked-decisions)
22. [Risks & mitigations](#22-risks--mitigations)
23. [Definition of done](#23-definition-of-done)

---

## 1. Executive summary

The Tapeya **broadcast overlay** (`/overlay/:sessionId`) is a production-critical surface that runs inside **vMix Browser Source**, **OBS**, and similar embedded Chromium shells. It has **opposite requirements** to the consumer mobile/web app.

**Decision:** Extract the overlay into its **own build artifact** (same monorepo initially; optional separate host later). Do **not** keep patching the shared SPA indefinitely.

**Key principles:**


| Principle                              | Meaning                                                                                                        |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Isolate the artifact**               | Separate Vite entry, separate `dist/overlay/` output, separate deploy path                                     |
| **Chrome 86 floor for overlay only**   | Consumer app stays on a modern baseline                                                                        |
| **No Tailwind v4 in overlay CSS**      | Theme SCSS + CSS variables; CI blocks forbidden output                                                         |
| **No consumer deps in overlay bundle** | No Meta Pixel, Capacitor, MainLayout, shop, live routes                                                        |
| **Single overlay URL**                 | Broadcasters load `https://graphics.tapeya.com/overlay/...` — **no `/v1/` or `/v2/` path** (one long-term URL) |
| **Session-scoped signed URL**          | Path + HMAC use `match_graphic_sessions.id` — not `matches.id` (see §17)                                       |


This document is the **implementation spec** (not only an ADR). Theme CSS rules remain in `[ARCHITECTURE.md` §17](../app/src/graphics/ARCHITECTURE.md).

---

## 2. The problem we are solving

The overlay lived inside the consumer SPA (`app/`). That caused **recurring production incidents** even when overlay-specific code was correct.

### 2.1 Incidents (2026)


| Symptom                                             | Root cause                                                                                | Category                                |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------- |
| Blank / broken graphics on vMix 24                  | `color-mix()` in theme CSS (Chrome 111+)                                                  | Overlay CSS                             |
| Hundreds of `t.entries.at is not a function`        | Meta Pixel `fbevents.js` loaded with main bundle (`Array.prototype.at` = Chrome 92+)      | Consumer JS leaked into overlay         |
| Portrait live controls under bottom nav             | `100dvh` → `100vh` changed in **live broadcast** files during graphics commit `fa6020d`   | Unrelated consumer file in wrong commit |
| ESLint cleanup broke stream controls (investigated) | `allowInteraction` removed from stream chain — separate from overlay; restored separately | Consumer live stream                    |


### 2.2 Core insight

> The graphics **pipeline** works on Chrome 86. The **packaging** does not.

Failures came from **coupling**: one build, one `index.html`, one CSS pipeline, one deploy — consumer and broadcast share fate.

### 2.3 Misunderstanding clarified

vMix **29 demo/latest** uses a newer Chromium, but **many broadcasters stay on vMix 24–28**. Supporting “latest only” is not an option. Plan for **Chrome 86 as overlay floor** for several years.

---

## 3. vMix / browser landscape


| Environment              | Typical Chromium | Notes                                     |
| ------------------------ | ---------------- | ----------------------------------------- |
| vMix 24                  | ~86              | Primary compatibility floor               |
| vMix 25–28               | 86–110+          | Varies by install; test on real machines  |
| vMix 29                  | Newer CEF        | Demo/latest ≠ installed base              |
| OBS Browser Source       | Often newer      | Still test overlay on Chrome 86 in CI     |
| Consumer Safari / Chrome | Latest           | **Out of scope** for overlay build target |


**Overlay compatibility rule:** If it runs in **Chrome 86**, it runs on the oldest supported vMix we commit to.

---

## 4. Decision: isolate the overlay artifact

### 4.1 Why patching the monolith fails long-term

- Every app feature (Tailwind utility, analytics, `100dvh`, new dependency) can break overlay mid-broadcast.
- Tailwind v4 **emits** `color-mix()` in shared CSS — cannot fully control in a shared bundle.
- Convention docs (§17) are not enforced until something breaks at a client’s live event.
- “Hidden vMix tax” on every sprint: audit deps, audit CSS output, reload browser source.

### 4.2 Why isolation wins

- **Hard boundary** between consumer velocity and broadcast stability.
- Smaller overlay bundle → faster first paint in vMix.
- **Independent deploy** from consumer app — overlay can ship without touching `tapeya.com`.
- **Single canonical URL** — no parallel version paths to maintain; stability via discipline + CI, not URL pinning.
- CI can **fail the overlay build** on forbidden CSS/JS — not hope developers remember rules.
- `core/` processors are already pure JS — ~60% of hard isolation work is done.

### 4.3 What isolation is NOT

- Not a full graphics rewrite.
- Not removing React from overlay (themes use React extensively).
- Not downgrading the consumer app to Chrome 86.
- Not “Tailwind latest + patches” in the overlay — that repeats the same game in a smaller box.

---

## 5. What we are NOT doing


| Do not                                                | Why                                                                                        |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Downgrade entire `app/` build to `chrome86`           | Punishes mobile, Capacitor, modern browsers                                                |
| Polyfill every modern API globally in `index.html`    | Belt for third-party scripts only; not a strategy                                          |
| Use Tailwind v4 in overlay build “with patches”       | Still emits forbidden CSS; patching every release                                          |
| Change `100dvh` → `100vh` in consumer routes for vMix | `100dvh` is correct for mobile Safari live broadcast; overlay theme CSS should avoid `dvh` |
| Put overlay-only fixes in unrelated files             | e.g. `AuthLayout`, `LiveBroadcast.jsx` — see commit hygiene below                          |
| Assume vMix 29 makes vMix 24 irrelevant               | Broadcasters upgrade slowly                                                                |


---

## 6. Consumer app vs overlay requirements


| Dimension          | Consumer app (`tapeya.com`)             | Broadcast overlay                                     |
| ------------------ | --------------------------------------- | ----------------------------------------------------- |
| **Browser target** | Modern Chrome / Safari                  | Chrome 86 floor                                       |
| **CSS**            | Tailwind v4, `100dvh`, modern utilities | Theme SCSS, CSS variables, **no Tailwind v4 app CSS** |
| **JS**             | Latest syntax OK (within Vite default)  | `build.target: chrome86`; no forbidden APIs in output |
| **Bundle size**    | Acceptable                              | Must be small; fast transparent first paint           |
| **Updates**        | User refreshes                          | Mid-broadcast break = client disaster                 |
| **Analytics**      | Meta Pixel, native SDK                  | **None**                                              |
| **Routes**         | Full SPA                                | Overlay entry only                                    |
| **Dependencies**   | Capacitor, Redux, Radix, Swiper, …      | Minimal: React, Reverb client, RTK for session API    |


---

## 7. CSS strategy (no Tailwind v4 in overlay)

### 7.1 Overlay uses

- `themes/{slug}/styles/_tokens.css`
- `themes/{slug}/styles/animations.scss`
- `themes/{slug}/styles/controller.scss` (if loaded by overlay — audit)
- CSS custom properties: `--accentA`, `--panel-base`, `--glow`, etc.
- JS helpers: `[shared/accentColor.js](../app/src/graphics/shared/accentColor.js)`, theme `accentMix()`, `visualEffects.js`

### 7.2 Overlay must NOT import

- `app/src/index.css` (Tailwind v4)
- `app/src/assets/css/style.scss` (consumer global styles)
- Any Tailwind `@import 'tailwindcss'` pipeline

### 7.3 Forbidden in overlay **built output**


| Feature                                                            | Chrome min | Action                 |
| ------------------------------------------------------------------ | ---------- | ---------------------- |
| `color-mix()`                                                      | 111        | CI fail                |
| `100dvh` / `dvh` units                                             | 108        | CI fail in overlay CSS |
| `@supports (color: color-mix(...))` blocks without legacy fallback | —          | CI fail                |


Source rules: `[ARCHITECTURE.md` §17](../app/src/graphics/ARCHITECTURE.md).

### 7.4 Optional later

A **tiny** overlay-only PostCSS/Tailwind preset with safelist + CI on output is possible but **not recommended for v1** — plain SCSS is simpler and matches existing themes.

---

## 8. JavaScript & bundle strategy

### 8.1 Overlay build config (full example)

```js
// vite.overlay.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/** Paths that must never resolve in the overlay bundle — build fails at import time. */
const FORBIDDEN_OVERLAY_PREFIXES = [
  '@/pages',
  '@/features',
  '@/layouts',
  '@/lib/analytics',
  '@/components/FacebookAnalyticsBoot',
  '@capacitor',
];

function forbidConsumerImports() {
  return {
    name: 'forbid-consumer-imports',
    resolveId(source) {
      if (FORBIDDEN_OVERLAY_PREFIXES.some((p) => source.startsWith(p))) {
        throw new Error(`[overlay build] Forbidden import: ${source}`);
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [react(), forbidConsumerImports()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  build: {
    target: ['chrome86', 'edge86', 'firefox78', 'safari14'],
    outDir: 'dist-overlay',
    rollupOptions: {
      input: { overlay: resolve(__dirname, 'overlay.html') },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Confirm `sass` is a direct dependency in app/package.json
        api: 'modern-compiler',
      },
    },
  },
});
```

**Note:** Confirm `sass` is listed in `app/package.json` `devDependencies` (not only transitive). Overlay theme SCSS will not compile without it.

### 8.2 Overlay entry must not import


| Module                         | Reason                             |
| ------------------------------ | ---------------------------------- |
| `App.jsx`                      | Full router, consumer routes       |
| `MainLayout` / `AuthLayout`    | Navbar, bottom nav, analytics boot |
| `@/lib/analytics/facebook`*    | Meta Pixel / `.at()` crashes       |
| `@capacitor/*`                 | Native only                        |
| Consumer pages (shop, live, …) | Bundle bloat                       |


### 8.3 Overlay entry MAY import


| Module                                  | Notes                                                                 |
| --------------------------------------- | --------------------------------------------------------------------- |
| `graphics/entry/GraphicOverlay.jsx`     | Root component                                                        |
| `graphics/core/*`                       | Processors, normalizers                                               |
| `graphics/exit/*`                       | Renderer, theme registry                                              |
| `graphics/themes/*`                     | Layouts, adapters, SCSS                                               |
| Minimal store/API                       | Session fetch + Reverb only — trim `StoreProvider` to required slices |
| `shared/graphics-command-manifest.json` | Via existing drift script                                             |


### 8.4 `overlay.html` bootstrap

- Transparent `<html>` / `<body>` from first paint (inline script — no consumer `index.html`)
- **Font preconnect** (theme faces load via `themeRegistry`, but DNS/TLS warmup matters in vMix):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

- Theme fonts (Saira, Saira Condensed) injected by `ensureThemeAssetsLoaded()` from `themeMeta.googleFontsUrl` — **do not** rely on consumer `index.html` Montserrat links
- **No** Meta Pixel, Capacitor, or consumer analytics
- Optional: minimal `.at()` guard only if a third-party script ever slips in (prefer zero third-party scripts)

### 8.5 Routing — no React Router in overlay (locked)

The overlay has **one URL per browser source**. Graphic **session id** + signed query params come from the address bar; **match id** for Reverb comes from the session bootstrap JSON; **all live graphic changes** arrive via Reverb (`useGraphicSession` → `useGraphicChannel`).

**Decision:** Do **not** ship `react-router-dom` in the overlay bundle.


| Step | Action                                                                                                                |
| ---- | --------------------------------------------------------------------------------------------------------------------- |
| 1    | `src/overlay/parseOverlayLocation.js` — parse `/overlay/:sessionId` + `URLSearchParams`                               |
| 2    | Refactor `GraphicOverlay.jsx` — accept `sessionId` + `searchParams` **props**; remove `useParams` / `useSearchParams` |
| 3    | `src/overlay/main.jsx` — `parseOverlayLocation(window.location)` → render `<GraphicOverlay … />`                      |
| 4    | After HTTP bootstrap, subscribe to Reverb using `session.match_id` from API response                                  |


Benefits long-term: smaller bundle, no router edge cases in vMix, no accidental consumer routes.

---

## 9. Target architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        tapeya monorepo                          │
├────────────────────────────┬────────────────────────────────────┤
│   Consumer SPA (app/)      │   Overlay artifact (app/overlay/)  │
│   vite.config.js           │   vite.overlay.config.js           │
│   index.html               │   overlay.html                     │
│   target: modern           │   target: chrome86                 │
│   Tailwind v4              │   Theme SCSS only                  │
│   tapeya.com/*             │   graphics.tapeya.com/overlay/*      │
└────────────────────────────┴────────────────────────────────────┘
              │                              │
              └──────────┬───────────────────┘
                         ▼
              shared/graphics-command-manifest.json
              API: GET /graphic-sessions/:id/overlay (signed)
              WS:  Reverb match.{matchId}.graphics (match_id from session JSON)
              Backoffice: operator controller (separate Angular app)
```

**Operator controller** (backoffice) stays separate — it publishes commands; overlay consumes session + Reverb. See `[MATCH_CONTROLLERS_BACKOFFICE.md](./MATCH_CONTROLLERS_BACKOFFICE.md)`.

---

## 10. What stays vs what moves

### Stays in consumer app

- All scoring, tournament, shop, profile, auth
- Live broadcast (`/live/broadcast/:matchId`) — uses `100dvh`, **not** overlay
- Backoffice integration (unchanged contract)
- `App.jsx` route `/overlay/:sessionId` (legacy monolith may still use `:matchId` until removed) → **redirect or legacy fallback** after migration
- Capacitor, Meta Pixel, push notifications

### Moves to overlay-only artifact


| Path                                | Role                           |
| ----------------------------------- | ------------------------------ |
| `app/src/graphics/entry/`           | Overlay shell, session, Reverb |
| `app/src/graphics/core/`            | Processors (shared logic)      |
| `app/src/graphics/exit/`            | Renderer, theme registry       |
| `app/src/graphics/themes/`          | Visual components + SCSS       |
| `app/src/graphics/shared/`          | `accentColor.js`, etc.         |
| Theme static assets (fonts, images) | Per themeRegistry              |


### Shared (both may import)

- `shared/graphics-command-manifest.json`
- `shared/graphics-themes.json`
- API types / session shape (document in OpenAPI or TS types when added)

---

## 11. Interim mitigations (already shipped)

Until overlay isolation is complete, these **monolith patches** reduce risk:


| Mitigation                                            | Location                                                        |
| ----------------------------------------------------- | --------------------------------------------------------------- |
| `color-mix()` removed from theme1; `accentMix()` SSOT | `graphics/shared/accentColor.js`, theme files                   |
| Meta Pixel blocked on overlay route                   | `facebookPixel.js`, `FacebookAnalyticsBoot`, lazy layouts       |
| Overlay-only `.at()` polyfill + FB script block       | `index.html` (overlay pathname only)                            |
| `build.target: chrome86` on main Vite config          | `vite.config.js` — **move to overlay-only config later**        |
| Consumer `100dvh` restored in live broadcast          | `liveBroadcastLayout.js`, `LiveBroadcast.jsx`, `AuthLayout.jsx` |
| §17 compatibility docs                                | `ARCHITECTURE.md`                                               |


**Action:** After overlay build exists, **remove `chrome86` target from main consumer `vite.config.js`** so consumer app can use modern syntax again.

---

## 12. Implementation phases

### Phase 0 — Hygiene (1–2 days) ✅ partial

- [x] Restore `100dvh` in consumer live broadcast + AuthLayout (not overlay-related)
- [x] Document mistaken `fa6020d` non-overlay file changes
- [ ] Add PR checklist: “Does this touch files outside `graphics/` or consumer routes? Explain.”
- [ ] Revert consumer `vite.config.js` `chrome86` target **after** Phase 1 ships

### Phase 1 — Separate overlay build (same repo) — **MVP**

**Goal:** `npm run build:overlay` produces a standalone `dist-overlay/` with no consumer code.

**Effort:** **10–14 days** (store split + import graph + CORS validation dominate; not 5–8).


| #    | Task                                     | Details                                                                                                                                                    |
| ---- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1  | Create `overlay.html`                    | Transparent body; font preconnect; module entry `/src/overlay/main.jsx`                                                                                    |
| 1.2  | Create `src/overlay/main.jsx`            | Parse URL → props; **no React Router** (see §8.5)                                                                                                          |
| 1.3  | Refactor `GraphicOverlay.jsx`            | Props: `sessionId`, `searchParams`; drop `react-router-dom` imports                                                                                        |
| 1.4  | Update `graphicSessionApi` / overlay API | Signed fetch: `GET /graphic-sessions/{sessionId}/overlay?expires=&signature=`                                                                              |
| 1.5  | **Overlay store**                        | See **§13** — `overlayStore.js` + `overlayBaseApi.js` (not consumer `StoreProvider`)                                                                       |
| 1.6  | Create `vite.overlay.config.js`          | §8.1 — `chrome86`, forbidden-import plugin, SCSS config                                                                                                    |
| 1.7  | CSS / fonts                              | Theme SCSS via `themeRegistry` only; verify Saira loads via `themeMeta.googleFontsUrl`                                                                     |
| 1.8  | **CORS / API smoke (Phase 1 gate)**      | Serve overlay on `localhost:4174`; API from `VITE_API_URL`; confirm signed `GET …/graphic-sessions/{id}/overlay` + public Reverb channel work cross-origin |
| 1.9  | `package.json` scripts                   | `dev:overlay`, `build:overlay`                                                                                                                             |
| 1.10 | Bundle size audit                        | Overlay JS **< 200KB gzip** target (excluding theme lazy chunks); no `fbevents`, `capacitor`, `swiper`, consumer slices                                    |


### Phase 2 — CI gates + Chrome 86 smoke (2–3 days)


| #   | Task                                      | Details                                                                                                                                                                                                                  |
| --- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2.1 | `check:overlay-output`                    | After `build:overlay`, fail on `color-mix`, `100dvh`, `\bdvh\b` in `dist-overlay/`                                                                                                                                       |
| 2.2 | `check:overlay-deps`                      | Fail if dist contains `fbevents`, `connect.facebook.net`, `@capacitor`                                                                                                                                                   |
| 2.3 | **Chrome 86 Playwright smoke (required)** | Build overlay → serve `dist-overlay/` → run smoke in Chrome 86 (Docker image or pinned browser). Assert: page loads, no uncaught console errors, transparent background, one command renders (fixture or mocked session) |
| 2.4 | CI job                                    | `npm test -- --run src/graphics` + `build:overlay` + all checks on PRs touching `graphics/` or `src/overlay/`                                                                                                            |
| 2.5 | Keep existing                             | `check:graphics-drift`, accent tests, command smoke                                                                                                                                                                      |


String checks alone are **necessary but not sufficient** — they miss silent CSS ignores and Chrome 86-only JS API gaps.

### Phase 3 — Deploy & host `graphics.tapeya.com` (3–5 days)


| #   | Task            | Details                                                                                                                                           |
| --- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1 | DNS + TLS       | `graphics.tapeya.com` → CDN or app server                                                                                                         |
| 3.2 | Deploy pipeline | `npm run build:overlay` → upload to graphics host root (single artifact path)                                                                     |
| 3.3 | **API CORS**    | Laravel: allow `Origin: https://graphics.tapeya.com` on `graphic-sessions/{id}/overlay` (signed route uses **query auth**, not cookies — see §17) |
| 3.4 | Reverb          | Public channel `match.{id}.graphics` — confirm WSS from graphics subdomain (no `/broadcasting/auth` for overlay)                                  |
| 3.5 | Cache headers   | `overlay.html`: `no-cache`; hashed assets: `immutable`, 1 year                                                                                    |
| 3.6 | Env             | `VITE_API_URL`, `VITE_APP_URL` baked at overlay build time per environment                                                                        |


### Phase 4 — Migration & deprecate monolith SPA route (see §18)


| #   | Task                                            | Details                                                                                                                                                    |
| --- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1 | Backoffice URL template                         | `https://graphics.tapeya.com/overlay/{sessionId}?expires=…&signature=…`                                                                                    |
| 4.2 | Legacy redirect                                 | `tapeya.com/overlay/`* → **302** to `graphics.tapeya.com/overlay/{sessionId}?…` — resolve match → session server-side; preserve or re-sign query (see §18) |
| 4.3 | Remove `/overlay` from `App.jsx`                | When §18 criteria met — shrink consumer bundle                                                                                                             |
| 4.4 | Remove overlay hacks from consumer `index.html` | FB block / polyfills move to `overlay.html` only                                                                                                           |
| 4.5 | Restore consumer Vite target                    | Remove `chrome86` from main `vite.config.js`                                                                                                               |


### Phase 5 — Optional later

- [x] Extract `graphics-core` internal package → `shared/graphics-core/` (`core/` + manifest types)
- [ ] Separate repo if release cadence fully diverges
- [ ] Theme 2 ships on overlay artifact only from day one

---

## 13. Overlay store split (Phase 1 critical path)

This is the **highest-risk** part of Phase 1. A one-line “trim StoreProvider” task is not enough.

### 13.1 What the overlay actually needs from Redux today

Audit of `app/src/graphics/` imports:


| Need                      | Current import                                      | Overlay requirement                              |
| ------------------------- | --------------------------------------------------- | ------------------------------------------------ |
| Session HTTP              | `useGetGraphicSessionQuery` via `graphicSessionApi` | **Yes** — signed overlay endpoint                |
| Cache patches             | `graphicSessionApi.util.updateQueryData`            | **Yes** — Reverb handlers in `useGraphicSession` |
| Dispatch                  | `useDispatch` in `useGraphicSession`                | **Yes**                                          |
| Auth token                | `baseApi` `prepareHeaders` reads `auth.accessToken` | **No** for production overlay (signed URL)       |
| Persist / auth / shop / … | `rootReducer`, `redux-persist`                      | **No**                                           |


Reverb (`GraphicEchoProvider` → `createEcho()`) uses **public** channels — no Bearer token, no `/broadcasting/auth`.

### 13.2 Files to create

```
app/src/overlay/
├── main.jsx
├── parseOverlayLocation.js
├── OverlayStoreProvider.jsx
├── overlayStore.js
└── overlayBaseApi.js          # RTK Query API — no auth slice

app/src/store/api/
└── graphicSessionOverlayApi.js   # injectEndpoints into overlayBaseApi only
```

### 13.3 `overlayBaseApi.js` (sketch)

- Copy `fetchBaseQuery` pattern from `baseApi.js` **without**:
  - `getState().auth?.accessToken`
  - `clearCredentials()` on 401
- Same `VITE_API_URL` / `Accept: application/json`
- Minimal `tagTypes` (or none — single endpoint)

### 13.4 `overlayStore.js` (sketch)

```js
import { configureStore } from '@reduxjs/toolkit';
import { overlayBaseApi } from './overlayBaseApi';
import './graphicSessionOverlayApi'; // side-effect: injectEndpoints

export const overlayStore = configureStore({
  reducer: {
    [overlayBaseApi.reducerPath]: overlayBaseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(overlayBaseApi.middleware),
});
```

**No** `redux-persist`. **No** `rootReducer`. Expected reducer count: **1**.

### 13.5 Wire-up tasks


| #      | Task                                                                                                                                                                                                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 13.5.1 | Add `graphicSessionOverlayApi.js` — move or duplicate `getGraphicSession` endpoint from `graphicSessionApi.js` targeting `overlayBaseApi`                                                                                                                                       |
| 13.5.2 | Update `useGraphicSession.js` to import from overlay API when `import.meta.env.VITE_OVERLAY_BUILD` **or** split hook: `useGraphicSession` imports from `@/overlay/graphicSessionOverlayApi` in overlay entry only (prefer env flag + alias to avoid dual maintenance long-term) |
| 13.5.3 | `OverlayStoreProvider.jsx` — `<Provider store={overlayStore}>` only (no `PersistGate`)                                                                                                                                                                                          |
| 13.5.4 | Grep `graphics/` for `@/store` — today only `useGraphicSession.js`; keep it that way                                                                                                                                                                                            |
| 13.5.5 | Bundle verify: `overlayStore` chunk must not contain `authSlice`, `shopSlice`, `reelsSlice`, etc.                                                                                                                                                                               |


### 13.6 Acceptance criteria (store)

- [ ] `rg 'authSlice|persistReducer|shopSlice' dist-overlay/` → 0 matches
- [ ] Overlay bundle includes exactly one RTK reducer path (`overlayBaseApi`)
- [ ] Signed session URL works with empty auth state
- [ ] Reverb patch + flash hash refetch still works

---

## 14. Proposed repo layout

```
app/
├── index.html                    # Consumer SPA
├── overlay.html                  # NEW — overlay only
├── vite.config.js                # Consumer — modern target (after Phase 4)
├── vite.overlay.config.js        # NEW — chrome86, dist-overlay
├── package.json                  # + dev:overlay, build:overlay
└── src/
    ├── overlay/
    │   ├── main.jsx
    │   ├── parseOverlayLocation.js
    │   ├── overlayStore.js
    │   ├── overlayBaseApi.js
    │   ├── OverlayStoreProvider.jsx
    │   └── graphicSessionOverlayApi.js   # or under store/api/ — inject into overlayBaseApi
    ├── graphics/                 # Shared source (both builds import)
    ├── App.jsx                   # Remove /overlay route when §18 criteria met
    └── ...

shared/
├── graphics-command-manifest.json
└── graphics-themes.json

docs/
└── GRAPHICS_OVERLAY_ISOLATION_PLAN.md   # This file
```

---

## 15. CI & quality gates

### On every PR touching `app/src/graphics/**`

```bash
cd app
npm test -- --run src/graphics
npm run check:graphics-drift
npm run build:overlay
npm run check:overlay-output
npm run check:overlay-deps
npm run test:e2e:overlay-chrome86   # Phase 2 — required
```

### Proactive import blocking (not just post-build audit)

§8.1 `forbidConsumerImports` Vite plugin — forbidden `@/` paths **fail at build time**, not in a post-hoc `rg` of dist.

### Source checks

```bash
# Theme source — no color-mix
rg 'color-mix' app/src/graphics/themes/

# Consumer files — do not drive overlay compatibility
# (review in PR; no automated rule yet)
```

### Manual smoke (before major release)

1. Signed overlay URL in **vMix 24** real install (not only demo 29)
2. Transparent background from first paint
3. Console clean (no `fbevents`, no `.at` errors)
4. LT + FST + scorebar commands via backoffice
5. Reverb flash / live update
6. Reload browser source after deploy

---

## 16. Deployment & URL versioning

### Production URL (locked — single long-term path)

```
https://graphics.tapeya.com/overlay/{sessionId}?expires=...&signature=...
```

- `{sessionId}` = `match_graphic_sessions.id` (primary key of the graphic session row)
- Dedicated subdomain — **not** `tapeya.com/overlay/…`
- **No `/v1/` or `/v2/`** in the path — one URL forever; we cannot operate two stable overlay versions in parallel

We are **not** using same-origin `tapeya.com/graphics/...` — separate subdomain keeps cookie, CDN, and deploy boundaries clean.

### How stability works without URL versioning

Isolation gives most of the safety (separate bundle, no consumer deps, Chrome 86 CI). The **URL stays fixed**; deploy discipline replaces version paths:


| Mechanism                                | Role                                                                                                                                               |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Separate artifact**                    | Overlay deploy ≠ consumer app deploy                                                                                                               |
| **Hashed JS/CSS**                        | Vite emits `assets/index-[hash].js` — browsers fetch new code after deploy                                                                         |
| `**overlay.html` no-cache**              | Each visit resolves latest hashed asset names                                                                                                      |
| **Backward-compatible overlay releases** | Session API + manifest commands must not break in-flight matches; breaking changes require API/session tolerance or deploy in off-hours with comms |
| **Rollback**                             | Redeploy **previous overlay build** to the same URL (keep last N builds in CDN/deploy history)                                                     |
| **Chrome 86 CI**                         | Every overlay PR passes build target + smoke tests                                                                                                 |


**What we do not do:** maintain `/v1/` and `/v2/` simultaneously — too costly for a small team.

### Asset caching


| File                     | Cache                   |
| ------------------------ | ----------------------- |
| `overlay.html`           | `no-cache` or short TTL |
| `assets/*-[hash].js/css` | `immutable`, 1 year     |


---

## 17. Backoffice & API integration

### Signed URL identity — session ID (locked)

The signed overlay URL and HMAC payload use `**match_graphic_sessions.id`**, not `matches.id`.


| Layer                    | Value                                                                  | Notes                                                                   |
| ------------------------ | ---------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Page URL path**        | `/overlay/{sessionId}`                                                 | `{sessionId}` = `match_graphic_sessions.id`                             |
| **Public bootstrap API** | `GET /api/v1/graphic-sessions/{session}/overlay?expires=…&signature=…` | Load session by PK; verify signature for that id                        |
| **HMAC payload**         | `{sessionId}|{expiresUnix}`                                            | `GraphicOverlaySigner::sign($sessionId, $expires)`                      |
| **Persisted URL**        | `match_graphic_sessions.signed_overlay_url`                            | Already stored on the session row — URL identity aligns with DB         |
| **Reverb channel**       | `match.{matchId}.graphics`                                             | **Unchanged** — `match_id` comes from session JSON after HTTP bootstrap |


**Why session ID, not match ID**

- The capability token authorizes read access to **this graphic session** (theme, config, context, active command) — the session row is the SSOT.
- Today `match_id` is unique on `match_graphic_sessions` (1:1), so behavior is similar — but match-scoped URLs are the wrong abstraction.
- If a session is ever reset or recreated for the same match, a session-scoped signature correctly invalidates old links; match-scoped URLs would silently bind to “whatever session exists now”.
- Public API is simpler: load by primary key → verify → return JSON (no match route binding).

**Overlay client flow**

1. Parse URL → `sessionId`, `expires`, `signature`
2. `GET /api/v1/graphic-sessions/{sessionId}/overlay?…` → full session JSON (includes `match_id`, `theme`, `context`, `active_command`)
3. Subscribe to `match.{session.match_id}.graphics` for live updates

**Migration from match-based URLs (current code)**

Existing production uses `/overlay/{matchId}` and signs `matchId|expires`. During migration:

- [ ] Change `MatchGraphicOverlayUrlService` to sign and embed **session id** in generated URLs
- [ ] Add `SignedGraphicSessionController` (or rename) at `graphic-sessions/{session}/overlay`
- [ ] Keep deprecated `GET /matches/{match}/graphic-session/overlay` **temporarily** for in-flight vMix links until §18 criteria met
- [ ] Update `graphicSessionApi` / overlay RTK endpoint to session-scoped path
- [ ] Backoffice “New link” / refresh emits session-based URLs only

Authenticated backoffice / preview routes stay match-nested: `GET /admin/matches/{match}/graphic-session` (operator thinks in matches; only the **pasted vMix URL** uses session id).

### API contracts

- Signed overlay: `GET /api/v1/graphic-sessions/{id}/overlay?expires=&signature=`
- Authenticated (non-OBS): `GET /api/v1/matches/{id}/graphic-session` — backoffice / preview only
- Reverb: `match.{matchId}.graphics` public channel + `.match.graphic.activated` / `.match.graphic.flash` listeners
- `[shared/graphics-command-manifest.json](../shared/graphics-command-manifest.json)`

### Cross-origin auth model (`graphics.tapeya.com`)

Production vMix browser sources use the **signed overlay endpoint** — query params authenticate the request. **No HttpOnly session cookie required.** This avoids `SameSite` / third-party cookie issues between `tapeya.com` and `graphics.tapeya.com`.


| Concern      | Overlay production behavior                                                             |
| ------------ | --------------------------------------------------------------------------------------- |
| Session API  | Signed query — validate CORS `Access-Control-Allow-Origin: https://graphics.tapeya.com` |
| Bearer token | Not used on overlay                                                                     |
| Reverb       | Public channels — `createEcho()` without `authToken`                                    |
| Cookies      | Not relied upon                                                                         |


**Phase 1 gate:** Prove signed session + Reverb from overlay dev server before Phase 3 deploy.

### Laravel / API tasks

- [ ] Add CORS allowlist entry for `https://graphics.tapeya.com` (and staging equivalent)
- [ ] Add `GET /api/v1/graphic-sessions/{session}/overlay` with session-scoped signature verification
- [ ] Update `MatchGraphicOverlayUrlService` + `GraphicOverlaySigner` to sign `sessionId|expires`
- [ ] Deprecate match-scoped signed route after migration window (see §18)
- [ ] Document `GRAPHICS_OVERLAY_BASE_URL` env for backoffice URL generation (e.g. `https://graphics.tapeya.com` — no path version suffix)

### Backoffice changes (Phase 3+)

- **Overlay URL field** on match / broadcast setup: base URL configurable per environment (`GRAPHICS_OVERLAY_BASE_URL`)
- Copy-to-clipboard for vMix browser source
- Optional: “Compatibility: vMix 24+” label

See `[MATCH_CONTROLLERS_BACKOFFICE.md](./MATCH_CONTROLLERS_BACKOFFICE.md)` — operator UI stays in backoffice; only the **runtime URL** changes.

---

## 18. Broadcaster migration & legacy route policy

### Rollout communication

1. New URL: `https://graphics.tapeya.com/overlay/{sessionId}?…` (from backoffice “Overlay URL” — uses `match_graphic_sessions.id`)
2. Update vMix Browser Input URL once — URL does not change across Tapeya overlay deploys
3. Reload browser source after Tapeya deploy (clears cached `overlay.html` / assets if vMix holds cache)
4. vMix 24–29 supported
5. Consumer app URL unchanged

### Legacy redirect (locked)

Old vMix projects may still have **match-based** URLs (`/overlay/{matchId}?…`). New links use **session id**.


| Rule   | Value                                                                                                                                                                                                      |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| From   | `https://tapeya.com/overlay/{matchId}?…` (legacy match-scoped URL)                                                                                                                                         |
| To     | `https://graphics.tapeya.com/overlay/{sessionId}?…` — resolve `matchId` → current `match_graphic_sessions` row; preserve query string if signature still valid, or operator refreshes link from backoffice |
| Status | **302 Temporary** — not 301 (vMix may cache aggressive 301s)                                                                                                                                               |
| Owner  | Nginx/CDN rule — **keep permanently** even after SPA route removed                                                                                                                                         |


During transition, graphics host may accept **deprecated** match-scoped signed URLs (same query params) until traffic drops below §18 threshold. New URLs from backoffice are always session-scoped.

### When to remove `/overlay` from consumer `App.jsx`

Remove the React route (shrink consumer bundle) when **all** are true:

1. `graphics.tapeya.com/overlay` in production ≥ **8 weeks**
2. Backoffice emits **only** graphics subdomain URLs for new matches
3. **Zero P0** overlay incidents on graphics host for **4 consecutive weeks**
4. Legacy `tapeya.com/overlay` traffic **< 5%** of overlay hits for **2 weeks** (CDN/access logs)

**Do not** remove the nginx **302** redirect — only remove in-app route + monolith overlay bundle weight.

### Rollback

If a deploy breaks overlay: redeploy the **previous overlay build** to `graphics.tapeya.com` (same URL). Temporarily disable redirect from monolith only if graphics host is down entirely.

---

## 19. Testing checklist

### Automated

- [ ] `src/graphics` unit + integration tests (232+)
- [ ] `accentColor.test.js`, `accent.test.js`
- [ ] `check:graphics-drift`
- [ ] `build:overlay` succeeds
- [ ] `check:overlay-output` — zero forbidden CSS
- [ ] `check:overlay-deps` — no analytics/capacitor strings
- [ ] `test:e2e:overlay-chrome86` — Playwright smoke on built dist in Chrome 86
- [ ] Font smoke — Saira / Saira Condensed render (not system-ui fallback)
- [ ] Cross-origin session fetch from `graphics.tapeya.com` origin

### Manual — overlay artifact

- [ ] First paint transparent (no white flash)
- [ ] **Saira / Saira Condensed** render correctly (not system-ui fallback)
- [ ] Commands render (smoke: `INTRO_LT`, `LT_DEFAULT`, FST scorebar)
- [ ] Team colors / `accentMix` borders visible on vMix 24
- [ ] Reverb live update when operator triggers command
- [ ] No scrollbars; 1920×1080 browser source

### Manual — consumer app (regression)

- [ ] Live broadcast portrait: controls **above** bottom nav (`100dvh`)
- [ ] Live broadcast landscape unchanged
- [ ] Meta Pixel **not** loaded on overlay URL (until monolith route removed)
- [ ] Shop, auth, Capacitor builds unaffected

---

## 20. Effort estimates


| Phase                          | Effort              | Outcome                                  |
| ------------------------------ | ------------------- | ---------------------------------------- |
| Phase 0 — Hygiene              | 1–2 days            | Consumer fixes decoupled from overlay    |
| Phase 1 — Overlay build MVP    | **10–14 days**      | Store split + no router + CORS validated |
| Phase 2 — CI + Chrome 86 smoke | 2–3 days            | Forbidden output + real browser smoke    |
| Phase 3 — Host                 | 2–5 days            | `graphics.tapeya.com/overlay` live       |
| Phase 4 — Migration            | 4–12 weeks calendar | Criteria-based SPA route removal         |


**Total engineering:** ~3–4 weeks focused implementation + migration window.

**vs patching:** Lower cumulative cost after **~4–6 months** of active consumer development (conservative; depends on team size and sprint cadence).

---

## 21. Locked decisions


| Question                | Decision                                                                                           | Rationale                                                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Host**                | `https://graphics.tapeya.com/overlay/`                                                             | Dedicated broadcast surface; one URL long-term                                                                               |
| **URL versioning**      | **None** — no `/v1/` or `/v2/`                                                                     | Team cannot maintain parallel stable overlay versions                                                                        |
| **Routing**             | **No React Router** — parse URL once, props into `GraphicOverlay`                                  | Single static URL; Reverb drives all display changes                                                                         |
| **Auth**                | Signed query params (`expires`, `signature`) scoped to `**match_graphic_sessions.id`**             | Capability token for the graphic session row; no cookies on `graphics.tapeya.com`; `match_id` from bootstrap for Reverb only |
| **CSS**                 | Theme SCSS only — **no Tailwind v4** in overlay build                                              | Prevent `color-mix` emission from shared CSS pipeline                                                                        |
| **Legacy route**        | **302 redirect** from `tapeya.com/overlay/`* permanently; remove SPA route only after §18 criteria | Production-safe migration; old vMix projects keep working                                                                    |
| **Consumer app target** | Modern Chrome after overlay split                                                                  | Overlay owns `chrome86` exclusively                                                                                          |


---

## 22. Risks & mitigations


| Risk                                 | Mitigation                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------- |
| RTK store pulls entire consumer app  | §13 overlay store — dedicated `overlayBaseApi` + verify with bundle grep                    |
| Theme fonts fall back to system-ui   | Font preconnect in `overlay.html` + verify `themeRegistry` loads `themeMeta.googleFontsUrl` |
| Forbidden `@/` imports slip in       | `forbidConsumerImports` Vite plugin (§8.1) — **build error**, not post-hoc audit            |
| CORS breaks on `graphics.tapeya.com` | Phase 1 cross-origin smoke; Laravel CORS before Phase 3                                     |
| Chrome 86 silent failures            | Phase 2 Playwright smoke on real Chrome 86 binary                                           |
| Two deploys out of sync              | Overlay-only pipeline; rollback = redeploy previous build to same URL                       |
| Theme 2 doubles work                 | Theme 2 ships on overlay artifact only                                                      |


---

## 23. Definition of done

Overlay isolation is complete when:

- [ ] `npm run build:overlay` produces deployable artifact with **no** consumer/analytics/capacitor code
- [ ] `overlayStore` — no consumer slices; no `react-router-dom` in overlay bundle
- [ ] CI fails on `color-mix` / `dvh` in overlay dist; Chrome 86 Playwright smoke passes
- [ ] Saira fonts + CORS validated for `graphics.tapeya.com`
- [ ] Session-scoped signed URL live; backoffice emits `https://graphics.tapeya.com/overlay/{sessionId}?…`
- [ ] Legacy `tapeya.com/overlay/`* → **302** redirect live
- [ ] vMix 24 manual smoke passed on real install
- [ ] Consumer app on **modern** Vite build target (overlay-only `chrome86`)
- [ ] §18 runbook written before SPA route removal from `App.jsx`

---

## Revision history


| Date      | Change                                                                                                                                                                        |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| July 2026 | v1.3 — **Session-scoped signed URL** — path + HMAC use `match_graphic_sessions.id`; API `GET /graphic-sessions/{id}/overlay`; Reverb still `match.{matchId}.graphics`         |
| July 2026 | v1.2 — **Single URL** — no `/v1/`/`/v2/` path; stability via deploy discipline + rollback                                                                                     |
| July 2026 | v1.1 — Locked decisions (`graphics.tapeya.com`, no React Router); §13 overlay store spec; Phase 1 CORS + fonts; Chrome 86 smoke in Phase 2; legacy 302 policy; effort revised |
| June 2026 | v1.0 — Initial plan from vMix 24 production incidents + isolation decision                                                                                                    |


