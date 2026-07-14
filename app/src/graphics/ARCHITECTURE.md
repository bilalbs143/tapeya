# Graphics Module — Architecture (single source of truth)

**Scope:** `app/src/graphics` and its integration with the Tapeya broadcast stack  
**Version:** 3.5 · **Last updated:** July 2026  
**Status:** Production-ready for `theme1`. P0–P3 hardening complete. Theme 2 blocked only on layout-strategy decision (§11).

**Related (outside this module):** [`shared/graphics-command-manifest.json`](../../../shared/graphics-command-manifest.json), [`shared/graphics-themes.json`](../../../shared/graphics-themes.json), [`docs/BALL_DELIVERY_ARCHITECTURE.md`](../../../docs/BALL_DELIVERY_ARCHITECTURE.md). (`tapeya-theme-controller/` — a planned standalone design harness — does not exist in this repo yet; §14 note updated accordingly.)

---

## How to use this document

| If you need…                        | Read    |
| ----------------------------------- | ------- |
| Pipeline, folders, layer rules      | §3–§5   |
| Add a new command                   | §11     |
| Start theme 2                       | §10     |
| Tests, CI, what catches regressions | §8–§9   |
| What's done vs still open           | §2, §13 |
| Naming conventions                  | §15     |

---

## 1. Executive summary

The graphics module uses a **layered, theme-agnostic pipeline**:

```
entry (React wiring) → core (normalize + process) → exit (lazy render) → themes (visual)
```

| Layer       | Responsibility                                          | Theme-aware?  |
| ----------- | ------------------------------------------------------- | ------------- |
| **entry**   | Session load, WebSocket, flash queue, provider          | No            |
| **core**    | Normalize API session → `componentProps`                | No            |
| **exit**    | Resolve theme component, display shells, error boundary | Registry only |
| **themes/** | Adapters, layouts, primitives, styles                   | Yes           |

**Verdict:** Production-ready for one theme. ~**80% future-proof** for theme 2 kickoff — registry, drift CI, integration smoke, and adapter contracts are in place. Full multi-theme scale still implies ~179 files per distinct visual design unless shared layouts are extracted (§11).

---

## 2. At a glance

| Metric                          | Value                                                                       |
| ------------------------------- | --------------------------------------------------------------------------- |
| Registered themes               | 1 (`theme1`)                                                                |
| Manifest command keys           | 95                                                                          |
| Theme JSX files                 | 93 (`LT_EMPTY`, `ADD_CAPTION` have no JSX by design)                        |
| Processor map entries           | ~94 overlay keys (manifest-driven)                                          |
| Adapter modules                 | 17 domain + `_shared` + `adapterContracts.js`                               |
| Layout components               | ~45 (`bars/`, `full-screen/`, `charts/`, `shared/`)                         |
| Files under `themes/theme1/`    | ~179                                                                       |
| Total under `app/src/graphics/` | ~279                                                                       |
| Tests                           | **268** graphics (`npm test -- --run src/graphics`)                        |

### Health scorecard (post P0–P3)

| Dimension                                       | Status                                                                                        |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Layer separation (entry / core / exit / themes) | ✅ Strong                                                                                     |
| Manifest-driven processor map                   | ✅ `processorRegistry.js` + loop in `processorMap.js`                                         |
| Normalizer testability                          | ✅ Split modules + `normalizeSession.test.js`                                                 |
| Integration + render smoke                      | ✅ `pipeline.integration.test.js` + `commandSmoke.test.js`                                    |
| Adapter formal contracts                        | ⚠️ 25 high-traffic paths; expand before/during theme 2                                        |
| Presentation copy in theme                      | ✅ `presentationLabels.js` + adapters (incl. toss/result)                                     |
| TypeScript                                      | ✅ `checkJs` covers all of `core/`, `entry/`, `exit/`; `themes/theme1/**` deferred to theme 2 |
| Pixel visual regression                         | ⚠️ Playwright shell smoke only (3 commands)                                                   |

---

## 3. Pipeline overview

```mermaid
flowchart TD
  subgraph external [External]
    API["GET /matches/:id/graphic-session"]
    WS["Reverb: .activated / .flash"]
    Manifest["graphics-command-manifest.json"]
  end

  subgraph entry [entry/]
    Session["useGraphicSession"]
    Flash["useGraphicFlash"]
    Provider["GraphicControllerProvider"]
    Norm["normalizeSession()"]
  end

  subgraph core [core/]
    Proc["processGraphicCommand()"]
    Map["PROCESSOR_MAP"]
  end

  subgraph exit [exit/]
    Render["GraphicRenderer"]
    Reg["themeRegistry"]
    Shell["DisplayModeShell"]
  end

  subgraph theme [themes/theme1]
    Cmd["commands/TYPE/KEY.jsx"]
    Adp["adapters"]
    Lay["layouts"]
    Pri["primitives"]
  end

  API --> Session
  WS --> Session
  WS --> Flash
  Session --> Provider
  Flash --> Provider
  Provider --> Norm
  Norm --> Proc
  Proc --> Map
  Map --> Render
  Manifest --> Reg
  Render --> Reg
  Reg --> Cmd
  Cmd --> Adp --> Lay --> Pri
  Render --> Shell
```

### Session lifecycle

1. **Load** — RTK Query fetches signed graphics session (HTTP).
2. **Live updates** — Reverb `.match.graphic.activated` patches cache via `graphicSessionSync.js`.
3. **Context refresh** — `context_hash` change triggers full context refetch over HTTP.
4. **Normalize** — `normalizeSession(rawSession, themeSlug)` → `GraphicSessionSnapshot`.
5. **Flash override** — `applyFlashToSnapshot()` applies manifest `type` / `displayMode` when flash queue active.
6. **Process** — `PROCESSOR_MAP[commandKey](snapshot)` → `componentProps`.
7. **Plan** — `GraphicRenderPlan` with metadata + tokens.
8. **Render** — Lazy JSX via `getThemeCommandComponent()` + display shell + `ThemeRoot`.

**Processor return semantics:** `null` → no plan (blank overlay); `{}` → empty props (clear/animation); object → normal render.

**Theme selection:** `session.theme.slug` from the graphic session API (SSOT). Signed graphics URLs no longer carry `?theme=`; changing theme in backoffice updates OBS after refresh or the next Reverb theme change refetch.

---

## 4. Directory structure

```
app/src/graphics/
├── ARCHITECTURE.md                 ← this file (SSOT)
├── types.js                        JSDoc contracts (themes import via relative path)
│
├── entry/                          Graphics wiring
│   ├── GraphicsView.jsx            gates on ensureThemeAssetsLoaded()
│   ├── GraphicControllerProvider.jsx
│   ├── GraphicEchoProvider.jsx
│   └── hooks/                      session, flash, channel, graphicSessionSync
│
├── exit/                           Single render exit
│   ├── GraphicRenderer.jsx
│   ├── GraphicErrorBoundary.jsx    resets on contextHash change
│   ├── themeRegistry.js            glob loader + graphics-themes.json
│   └── shells/                     LT / FS / passthrough
│
├── __tests__/                      integration, command smoke, fixtures
│
└── themes/
    └── theme1/
        ├── themeMeta.js            ThemeRoot; styleImports (lazy-loaded)
        ├── config.js → _tokens.css
        ├── adapters/               17 *.adapter.js + adapterContracts.js
        ├── commands/{TYPE}/        93 JSX files
        ├── layouts/                bars, full-screen, charts, shared
        ├── primitives/
        └── styles/

shared/graphics-core/               Theme-agnostic engine (@tapeya/graphics-core)
├── src/
│   ├── normalizeSession/           teams, match, live, deliveries, config
│   ├── GraphicCommandProcessor.js
│   ├── processorRegistry.js        processorId → function
│   ├── processorMap.js             manifest loop → PROCESSOR_MAP
│   ├── manifestCommandMeta.js      flash override; type/displayMode lookup
│   ├── graphicCommandKeys.js       AUTO-GENERATED from PHP
│   ├── domain/                     player, playerNameResolver, ltDefaultZoneC
│   ├── processors/                 domain files + _shared/ + __tests__/
│   └── __tests__/
└── package.json
```

### Commands by TYPE (93 JSX)

| TYPE                             | Count | Role                                   |
| -------------------------------- | ----- | -------------------------------------- |
| `LOWER_THIRD`                    | 33    | Scoreboard, match chrome, officials    |
| `FULL_SCREEN`                    | 16    | Squads, summaries, MOM                 |
| `FULL_SCREEN_TRANSITION`         | 10    | Event flash headers                    |
| `BATSMAN_STATS` / `BOWLER_STATS` | 7 / 6 | Player LT/FS                           |
| `TOUR_HITS`                      | 6     | Tournament milestone bars              |
| `BREAK`                          | 5     | Innings/lunch/tea/rain/timeout         |
| `TOURNAMENT`                     | 5     | Leaderboards, point table              |
| `CHART`                          | 4     | Worm, Manhattan, run rate, wagon wheel |
| `CAPTION`                        | 1     | Custom caption                         |

---

## 5. Layer responsibilities

### `shared/graphics-core/` — data & processing

Processors know **cricket domain**, not visual presentation. English copy lives in theme adapters (`presentationLabels.js`). Imported as `@tapeya/graphics-core/*` — **graphics build only** (consumer Vite forbids it).

| Artifact                    | Role                                                                                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `normalizeSession/`         | snake_case API → camelCase `GraphicSessionSnapshot`                                                                                                                            |
| `processorRegistry.js`      | Shared `processorId` implementations                                                                                                                                           |
| `processorMap.js`           | Builds map from manifest + registry; animation/FST loops                                                                                                                       |
| `processors/_shared/`       | `scoreboardBase`, `matchContext`, `resolvePlayer`, etc.                                                                                                                        |
| `domain/playerNameResolver` | Broadcast name styles: **compact** (e.g. `M Bilal`) vs **standard** (e.g. `Muhammad Bilal`). Theme1 picks by surface via `resolveLtPlayerName` / `resolveFsPlayerName` (and matching `*NameParts`) in `_shared`. **Default:** compact on LT / scoreboard bars; standard on FS (squads, summaries, NAME_FS, MOM, charts, …). **Exception:** `LAST_WICKET` LT uses standard/full names (same as `LAST_WICKET_FS`). API live-stats `display_name` fields send the **full** player name — themes format; do not reintroduce server-side surname stripping. |

**Adding a processor:** PHP enum → manifest export → `PROCESSOR_REGISTRY` entry → (map is automatic) → theme JSX.

### `entry/` — React integration

| File                        | Role                                                    |
| --------------------------- | ------------------------------------------------------- |
| `useGraphicSession`         | HTTP + Reverb activation + flash hash refetch           |
| `useGraphicFlash`           | 5s flash queue (separate listener — refetch vs display) |
| `graphicSessionSync.js`     | Pure patch helpers (unit tested)                        |
| `GraphicControllerProvider` | Sole production caller of `processGraphicCommand`       |

`isError` is exposed in context but overlay stays blank (OBS-safe). Optional debug banner deferred.

### `exit/` — rendering

- Lazy command components: `import.meta.glob('../themes/*/commands/*/*.jsx')`
- `ensureThemeStylesLoaded(slug)` — CSS/SCSS per active theme only
- `ensureThemeFontsLoaded(slug)` — Google Fonts from `themeMeta.googleFontsUrl` (onload → `fonts.load()` per family)
- `ensureThemeAssetsLoaded(slug)` — styles + fonts in parallel (overlay gate)
- Shells inject team CSS vars (`--home-bg`, etc.)

### `themes/theme1/` — visual implementation

Three command tiers (by design):

| Tier         | Pattern                                   | ~Count |
| ------------ | ----------------------------------------- | ------ |
| Data graphic | processor → adapter → layout → primitives | ~75    |
| Animation LT | primitives only (`FourBar`, `SixFlash`)   | ~15    |
| FST event    | adapter + ControllerBar + flash           | ~10    |

Typical data command:

```jsx
// commands/LOWER_THIRD/LT_DEFAULT.jsx
const bundle = toScoreBarBundle(props, tokens);
return (
  <BroadcastShell stage="bar">
    <LowerThirdBar {...bundle} />
  </BroadcastShell>
);
```

---

## 6. Single source of truth wiring

```
PHP GraphicCommandKeyEnum
  → shared/graphics-command-manifest.json   (type, category, displayMode, processorId)
  → shared/graphics-core/src/graphicCommandKeys.js   (AUTO-GENERATED)
  → shared/graphics-core/src/processorRegistry.js   (processorId → fn)
  → shared/graphics-core/src/processorMap.js        (manifest loop)
  → themes/{slug}/commands/{TYPE}/{KEY}.jsx

shared/graphics-themes.json                 (slug → folder, completeness)
exit/themeRegistry.js                       (glob + meta)
scripts/check-graphics-drift.js             (CI parity)
```

---

## 7. Types & contracts

`types.js` defines JSDoc contracts: `GraphicSessionSnapshot`, `GraphicRenderPlan`, `GraphicProcessor`, `ThemeTokens`, plus fully-typed `match` / `live` / `tournament` sub-shapes (`GraphicMatchSnapshot`, `GraphicLiveSnapshot`, `GraphicTournamentSnapshot`) matching the real normalizer output field-for-field.

**Gaps:** Raw, per-command dynamic payloads (`snapshot.payload`, leaderboard/point-table/tour-hit rows, next-match fixture data) are intentionally typed `Record<string, any>` at the boundary rather than formalized per-command — formalizing ~95 distinct payload shapes wasn't judged worth it relative to the normalized-snapshot layer. Adapter bundle shapes partially formalized in `adapterContracts.js` (25 commands) + `adapters.test.js`.

**TypeScript:** `src/graphics/tsconfig.json` + `npm run typecheck:graphics` — `checkJs` covers all of `shared/graphics-core/src/**`, `entry/**`, and `exit/**` (types.js, react/vite/node ambient types wired in). `themes/theme1/**` is intentionally not yet included — see §13.

---

## 8. Testing & CI

### Commands

```bash
cd app && npm test -- --run src/graphics    # 268 graphics tests
cd app && npm run typecheck:graphics
node scripts/check-graphics-drift.js
cd app && npm run test:e2e:graphics         # Playwright fixture shell (3 commands)
```

### CI (`.github/workflows/graphics-checks.yml`)

| Job                       | Checks                                                |
| ------------------------- | ----------------------------------------------------- |
| `drift`                   | manifest ↔ registry ↔ processors ↔ theme JSX          |
| `graphics-tests`          | Full app unit tests                                   |
| `graphics-typecheck`      | `typecheck:graphics`                                  |
| `graphics-visual`         | Playwright fixture smoke                              |
| `manifest-export`         | PHP enum export matches committed manifest            |
| `graphics-build`          | Isolated build + output/deps gates (no color-mix/dvh) |
| `consumer-build`          | Consumer SPA build excludes graphics runtime          |
| `graphics-smoke`          | Playwright smoke against the isolated build           |
| `graphics-chrome86-smoke` | Same smoke test on a real Chrome 86 binary (vMix 24)  |

(`.github/workflows/graphics-deploy.yml` is separate — manual `workflow_dispatch`, build + output gates + atomic rsync deploy; not part of the PR-triggered checks above.)

### Test matrix (what protects what)

| File                                | Protects against                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| `normalizeSession.test.js`          | Normalizer input-shape regressions                                                         |
| `processorMapIntegrity.test.js`     | Wrong processor wired to key                                                               |
| `processors.test.js`                | Processor domain logic                                                                     |
| `pipeline.integration.test.js`      | Every overlay key → plan + registry                                                        |
| `commandSmoke.test.js`              | Every command SSR render + shell markers                                                   |
| `adapterContracts.test.js`          | 25 processor→adapter bundle keys                                                           |
| `adapters.test.js`                  | Full adapter logic (broader than contracts)                                                |
| `GraphicControllerProvider.test.js` | Plan build, flash override                                                                 |
| `GraphicRenderer.test.js`           | Theme root + shell assembly                                                                |
| `themeRegistry.test.js`             | Slug/type resolution                                                                       |
| `GraphicErrorBoundary.test.jsx`     | Render errors; hash recovery                                                               |
| `graphicSessionSync.test.js`        | Reverb cache patches                                                                       |
| `MatchFixtureBar.test.jsx`          | Title-vs-team-names branch, detail row toggle (TOSS_LT/RESULT_LT/INTRO_LT/TOURNAMENT_NAME) |
| `LeaderboardGraphic.test.jsx`       | Row/featured rendering incl. null-featured guard (HIGHEST*\*/TOP*\* — see §13)             |

**Not covered:** lazy-load runtime path in tests (smoke uses eager imports); pixel/screenshot baselines; cross-theme parity (no theme 2 yet).

---

## 9. Safeguards summary

| Safeguard                        | Status                                   |
| -------------------------------- | ---------------------------------------- |
| Manifest ↔ processor parity      | ✅ Drift CI                              |
| Manifest ↔ theme JSX parity      | ✅ Drift CI                              |
| Wrong processor function wired   | ✅ `processorMapIntegrity.test.js`       |
| Adapter bundle shape (25 paths)  | ✅ `adapterContracts.test.js`            |
| PHP manifest export drift        | ✅ CI `manifest-export` job              |
| Error boundary context recovery  | ✅ `contextHash` reset                   |
| Legacy `themes/tapeya/` folder   | ✅ Drift CI forbids                      |
| Token `_tokens.css` commit drift | ❌ Not diff-checked in CI (optional add) |
| Runtime theme slug validation    | ❌ Invalid slug → blank overlay          |

---

## 10. Theme 2 development

### Step 0 — Decide layout strategy (required)

| Answer                                | Approach                                                     |
| ------------------------------------- | ------------------------------------------------------------ |
| **Same structure, different styling** | Shared layouts + token-driven CSS; do **not** copy 179 files |
| **Different broadcast design**        | Full fork: copy `theme1/` → `theme2/`, restyle independently |

Do not bulk-copy files until design stakeholders answer this.

### Registration checklist

1. Add entry to [`shared/graphics-themes.json`](../../../shared/graphics-themes.json) — start `"completeness": "partial"` with whitelist (e.g. `LT_DEFAULT`, `LT_FOUR`, `PLAYING_11`).
2. Create `themes/theme2/themeMeta.js` (include `googleFontsUrl` + `googleFontFamilies` for overlay font loading), `config.js`, `commands/`, `adapters/`, etc.
3. Run `npm run generate:tokens` for theme2; `node scripts/check-graphics-drift.js`.
4. OBS: use the signed graphics URL from backoffice; theme follows `graphic_theme_id` on the session (no `?theme=` param).
5. Add parameterized contract tests: same processor fixture → theme1 + theme2 adapters expose required bundle keys.
6. Promote to `"completeness": "full"` when every overlay key has JSX.

### Rules

- **Never** import theme code from `core/`.
- Use generic adapter names inside each theme (`toScoreBarBundle`, not `toTheme1…`).
- Processors stay theme-agnostic; themes reimplement all 17 adapters unless `_shared/` is deliberately extracted.
- Cost model: partial theme ~30–50 files; full theme ~179 files.

---

## 11. Adding a new command

```
1. PHP GraphicCommandKeyEnum entry
2. php artisan graphics:export-manifest  (CI enforces committed sync)
3. PROCESSOR_REGISTRY entry in processorRegistry.js
4. themes/theme1/commands/{TYPE}/{KEY}.jsx
5. node scripts/check-graphics-drift.js && npm test -- --run src/graphics
```

**Implementation pattern:**

```
Is category = animation?
  ├─ FST → adapter? + ControllerBar + *Flash
  └─ LT  → *Bar + *Flash from primitives

Is category = clear / backoffice_only?
  └─ No JSX; processor only (or neither)

Else (data graphic):
  └─ processor → adapter → layout → primitives → BroadcastShell
```

**Note on duplication across command families** (e.g. TOUR*HITS' 6 files, FST*\*'s 10 files, BATSMAN/BOWLER stats' 12 files — near-identical bodies differing only in a title string, a Flash component, or an adapter+layout pair): a shared-factory approach (each command file reduced to a 1-line `export default createXCommand(...)`) was tried and intentionally reverted — it added an indirection layer across the theme that outweighed the line-count savings. Each command file stays a standalone, fully-readable component per the pattern above, even when that means repeating a few lines across siblings.

---

## 12. Hardening completed (P0–P3)

| #    | Item                                                                     | Status                            |
| ---- | ------------------------------------------------------------------------ | --------------------------------- |
| P0-1 | `normalizeSession.test.js` + split sub-modules                           | ✅                                |
| P0-2 | Manifest-driven `PROCESSOR_MAP`                                          | ✅                                |
| P0-3 | Registry, facade, `processorMapIntegrity` tests                          | ✅                                |
| P0-4 | Theme 2 onboarding doc                                                   | ✅                                |
| P0-5 | Adapter rename (drop Theme1 prefix)                                      | ✅                                |
| P1   | Pipeline integration, entry/exit tests, presentation labels              | ✅                                |
| P2   | Lazy theme CSS, adapter contracts (25), manifest export CI               | ✅                                |
| P3   | Command smoke, Playwright fixtures, error boundary, FS flash, TS started | ✅                                |
| P3   | `themes/_shared/` extraction                                             | ⏸️ Deferred — §10 layout decision |

**Refactor phases 1–5** (boundary cleanup, domain extraction, dynamic theme meta, layouts rename) — all complete. Details archived in git history; no action required.

---

## 13. Open & deferred (not blockers)

| Item                               | Recommendation                                                                                       |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Adapter contracts 25/~40           | **Leave** until theme 2 or adapter change; many paths already in `adapters.test.js`                  |
| Full TypeScript `themes/theme1/**` | **Defer** until theme 2 or theme1 churn slows — `core/`, `entry/`, `exit/` are already fully covered |
| Pixel Playwright snapshots         | **Defer** — high maintenance; shell smoke + commandSmoke sufficient for now                          |
| `themes/_shared/`                  | **Defer** — blocked on §10 layout decision                                                           |
| `isError` debug banner             | **Optional** — blank overlay is OBS-safe                                                             |
| Duplicate flash listeners          | **Leave** — intentional (hash refetch vs queue)                                                      |
| Token CSS diff in CI               | **Done** — `graphics-checks.yml`'s `drift` job runs `git diff --exit-code` on `_tokens.css`          |
| Layout unit tests (37/38)          | **Leave** — exercised via command smoke; `MatchFixtureBar`/`LeaderboardGraphic` added this pass      |

---

## 14. Cross-repo integration

| Location                                | Role                                                                                                                    |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `shared/graphics-command-manifest.json` | Command catalog                                                                                                         |
| `shared/graphics-themes.json`           | Theme registry                                                                                                          |
| `shared/graphics-core/`                 | Processors, normalizers, domain (`@tapeya/graphics-core`)                                                               |
| `scripts/check-graphics-drift.js`       | Structural parity                                                                                                       |
| `app/src/graphics/bootstrap/`           | Graphics bootstrap + store (graphics.tapeya.com artifact)                                                               |
| `tapeya-theme-controller/`              | **Not yet created** — planned standalone design harness, referenced here as a forward pointer, not a current dependency |

---

## 15. Naming conventions

| Artifact       | Convention                       | Example               |
| -------------- | -------------------------------- | --------------------- |
| Command key    | `SCREAMING_SNAKE`                | `LT_DEFAULT`          |
| TYPE folder    | Manifest `type`                  | `LOWER_THIRD`         |
| Command file   | `{commandKey}.jsx`               | `LT_DEFAULT.jsx`      |
| Processor      | `process{Feature}`               | `processTossLt`       |
| Adapter file   | `{domain}.adapter.js`            | `scoreBar.adapter.js` |
| Adapter export | `to{Target}Bundle`               | `toScoreBarBundle`    |
| Layout         | `{Purpose}{Bar\|Graphic\|LTBar}` | `MatchSummaryLTBar`   |
| Theme slug     | lowercase                        | `theme1`              |

---

## 17. Browser & CSS compatibility (graphics / vMix)

> **Isolation roadmap:** Long-term plan to ship graphics as a separate build (no Tailwind v4, Chrome 86 floor) — see [`docs/GRAPHICS_OVERLAY_ISOLATION_PLAN.md`](../../../docs/GRAPHICS_OVERLAY_ISOLATION_PLAN.md).

The signed graphics URL (`https://graphics.tapeya.com/{sessionId}-{expires}-{signature}` — `match_graphic_sessions.id`) runs inside **OBS**, **vMix 29**, and **vMix 24**. vMix 24 embeds an old Chromium (~86–103). Graphics that rely on Chrome 111+ CSS can render **blank or broken** in vMix 24 while working everywhere else.

**Scope:** All code under `themes/` (JSX, SCSS, inline styles). The main Tapeya app may use newer CSS elsewhere; **theme broadcast assets must not**.

### Utility CSS toolchain (graphics build)

The graphics build has its own Tailwind pipeline, separate from the consumer app's Tailwind v4:

- Config: [`app/tailwind.graphics.config.cjs`](../../tailwind.graphics.config.cjs) — Tailwind **v3** (installed as the `tailwindcss3` npm alias), content-scanning `src/graphics/**` and `shared/graphics-core/src/**`. `preflight: false` (themes own their resets via SCSS + `graphicsSurface.css`).
- v3, not v4, is deliberate: v4 emits `color-mix()`, which is exactly the CSS feature §17 prohibits.
- Wired into `vite.graphics.config.js` via inline PostCSS (`tailwindcss3` + `autoprefixer`, browserslist pinned to `chrome >= 86`) — the consumer app's `@tailwindcss/vite` plugin never runs in this build.
- Entry stylesheet: `app/src/graphics/shared/styles/tailwind.css` (`@tailwind utilities;`), imported once from `bootstrap/main.jsx`.
- Any Tailwind-shaped class (including arbitrary values) used anywhere in graphics JSX works automatically — no manual utilities file or generator script to keep in sync.

### Do not use in themes

| Feature                                       | Chrome min | Why it breaks                                                            |
| --------------------------------------------- | ---------- | ------------------------------------------------------------------------ |
| `color-mix()`                                 | 111        | Invalid/ignored in vMix 24 → missing borders, glows, gradients           |
| `color-mix` inside Tailwind arbitrary classes | 111        | Same — e.g. `border-[color-mix(in_srgb,var(--accentA)_40%,transparent)]` |
| `100dvh`                                      | 108        | Low risk but avoid in overlay/theme CSS; use `100vh` or fixed px         |
| Hard-coded `color-mix` in `@keyframes`        | 111        | Use `#rrggbbaa` or `rgba()` instead                                      |
| `padding-inline` / React `paddingInline`      | 87         | Ignored in Chrome 86 → zero horizontal padding (crowded LT / FS rows)    |
| Tailwind `inset-0` / CSS `inset:`             | 87         | Ignored → absolute/fixed layers do not pin to edges                      |

**Do not** add `@supports (color: color-mix(...))` blocks in theme SCSS expecting a fallback — theme bundles are loaded as-is in vMix. Always ship the legacy-safe value directly.

### Use instead — SSOT helpers

| Need                             | Use                                                   | Location                                                                         |
| -------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------- |
| Color resolve + mix (all themes) | `mixColorWithTransparent()`, `resolveCssColorRgb()`   | **`shared/accentColor.js`** (SSOT)                                               |
| Translucent team/global accent   | `accentMix(accent, percent)`                          | `themes/{slug}/primitives/accent.js` (theme wrapper)                             |
| LT bar head gradient             | `accentPanelHeadGradient(accent)`                     | theme `primitives/accent.js`                                                     |
| Box glow from accent             | `accentGlowShadow(accent, percent, size)`             | `themes/theme1/visualEffects.js`                                                 |
| Halo on panels / labels          | `accentHaloShadow(accent, size, mixPercent)`          | `visualEffects.js`                                                               |
| Crest ring halo                  | `crestRingBoxShadow(accent)` + `crestRingClassName()` | `visualEffects.js`                                                               |
| Text neon (when enabled)         | `textGlowClass(variant)`                              | `visualEffects.js` — use existing variants; add `rgba()` only, never `color-mix` |

**Rules for `accentMix()` / `mixColorWithTransparent()`:**

- Shared logic lives in **`shared/accentColor.js`** — copy or import from there in theme 2; do not duplicate parsers.
- Pass the **accent string** you already have (`#rrggbb`, `rgb(...)`, or `'var(--accentA)'`). Do not hand-write `color-mix`.
- For hex inputs it returns **8-digit hex** (`#5b7cff21`); for vars/rgb it returns **`rgba(...)`** resolved at runtime.
- Prefer passing **team hex from props** over `'var(--accentA)'` when the adapter already supplies `accent`.
- Do **not** compute accent styles at **module scope** (e.g. top-level `const style = { borderColor: accentMix(...) }`) — resolve in render so CSS vars and team colors stay correct.

**Exports:** `primitives/index.js` re-exports `accentMix`, `accentPanelHeadGradient`, `accentGlowShadow`.

### Patterns

```jsx
// ✅ Border + glow — inline style
style={{
  borderColor: accentMix(accent, 40),
  boxShadow: `0 0 calc(22px * var(--glow)) ${accentMix(accent, 20)}, inset 0 1px 0 rgba(255,255,255,0.06)`,
}}

// ✅ LT head band
style={{ background: accentPanelHeadGradient(accent) }}

// ❌ Never — vMix 24
className="border-[color-mix(in_srgb,var(--accentA)_40%,transparent)]"
style={{ borderColor: 'color-mix(in srgb, var(--accentA) 40%, transparent)' }}
```

```scss
// ✅ Keyframes — fixed rgba or 8-digit hex matching default --accentA (#5b7cff)
box-shadow: 0 0 calc(12px * var(--glow, 1)) rgba(91, 124, 255, 0.35);

// ❌ Never
box-shadow: 0 0 calc(12px * var(--glow, 1)) color-mix(in srgb, var(--accentA) 35%, transparent);
```

When SCSS must follow `--accentA` but cannot call JS, use **precomputed rgba/hex for the default token** (`#5b7cff` → `91, 124, 255`). Dynamic per-team colors belong in JSX via `accentMix(teamColor, percent)`.

### Tailwind note (main app bundle)

Tailwind v4 in the shared SPA CSS may emit `@supports (color: color-mix(...))` with **8-digit hex fallbacks** for utilities like `bg-white/10`. That is OK for main-app pages; **do not rely on it in theme JSX/SCSS**. Theme chunks (`animations.css`, `controller.css`) must contain **zero** `color-mix`.

### Verification before deploy

```bash
# No color-mix in theme source
rg 'color-mix' app/src/graphics/themes/

# Theme CSS chunks clean after build
npm run build
rg 'color-mix' app/dist/assets/animations*.css app/dist/assets/controller*.css app/dist/assets/_tokens*.css
# (expect 0 matches)

cd app && npm test -- --run src/graphics/themes/theme1/primitives/__tests__/accent.test.js
```

Smoke in **vMix 24**: signed graphics URL, transparent background, highest browser version on the input, reload after deploy.

---

## 16. Appendix — file counts

| Path                        | Files    |
| --------------------------- | -------- |
| `core/`                     | ~28      |
| `entry/`                    | ~11      |
| `exit/`                     | 7        |
| `themes/theme1/adapters/`   | 18       |
| `themes/theme1/commands/`   | 93       |
| `themes/theme1/layouts/`    | ~45      |
| `themes/theme1/primitives/` | 19       |
| **Total**                   | **~279** |

---

## Revision history

| Version | Date      | Changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0–1.2 | June 2026 | Initial structure doc; refactor phases; theme1 sync                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2.0     | June 2026 | Split audit/review into separate docs                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **3.0** | June 2026 | **Merged SSOT:** absorbed `GRAPHICS_MODULE_REVIEW.md` + `ARCHITECTURE_REVIEW.md`; theme 2 guide; P0–P3; test matrix; open items                                                                                                                                                                                                                                                                                                                                                                                             |
| **3.1** | June 2026 | §17 overlay CSS compatibility (`color-mix`, `100dvh`); SSOT accent helpers; merge checklist in §11                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **3.2** | July 2026 | Link to [`docs/GRAPHICS_OVERLAY_ISOLATION_PLAN.md`](../../../docs/GRAPHICS_OVERLAY_ISOLATION_PLAN.md) in §17; session-scoped signed URL                                                                                                                                                                                                                                                                                                                                                                                     |
| **3.3** | July 2026 | Signed graphics URL uses `match_graphic_sessions.id` (see isolation plan §17)                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **3.4** | July 2026 | Production-readiness audit fixes: corrected stale CI job table (§8) and cross-repo links (§14); documented the graphics Tailwind v3 toolchain (§17); TypeScript coverage now spans all of `core/`, `entry/`, `exit/` (§2, §7, §13); deploy workflow gated on `graphics-checks` CI status; added `MatchFixtureBar`/`LeaderboardGraphic` tests and fixed a null-`featured` crash found by the latter (§13). Command-family factories were tried and reverted per team preference — each command stays a standalone file (§11) |
| **3.5** | July 2026 | Dual broadcast name styles in `domain/playerNameResolver` (§5): compact LT vs standard FS via theme1 `_shared` helpers; `LAST_WICKET` LT uses full/standard names; API live-stats keep full `display_name` (themes format). Refreshed test/file counts in §2 / §8 / appendix. |
