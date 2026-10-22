# Phase 1 — client Codebase Audit & Organization Plan

**Status:** Audit / plan only — **no files moved, renamed, or deleted**  
**Scope root:** `client/`  
**Files inventoried:** 1,058 (excludes `node_modules/`, `dist/`, iOS Pods, Android/iOS build outputs, `*.tsbuildinfo`)  
**Related blueprints:** [`docs/architecture/codebase-blueprint.md`](./architecture/codebase-blueprint.md) (Phase 2 — how files _should_ look), [`docs/APP_REWRITE_ARCHITECTURE.md`](../../docs/APP_REWRITE_ARCHITECTURE.md), [`docs/APP_REACT_BEST_PRACTICES.md`](../../docs/APP_REACT_BEST_PRACTICES.md), [`client/README.md`](../README.md)

---

## 1. Executive summary

`client` is already a **feature-sliced** Vite + React 19 + RTK Query + Capacitor app. Most domain code lives under `src/features/*` with a consistent `api` / `model` / `lib` / `ui` / `pages` / `test` / `routes` layout. Shared UI, shell chrome, API envelope, and native façades live under `src/shared/*`.

**Overall quality:** structurally strong relative to the rewrite architecture. Phase 2 should be **targeted cleanup**, not a greenfield re-folder. Highest-value fixes:

1. Shrink / split oversized pages and match-scoring UI (several files >500–1100 LOC).
2. Remove dead tilt helper (`deviceOrientationPermission.ts`) and clarify thin `app/pages/*` re-exports.
3. Split giant shop schemas / MSW handlers.
4. Normalize naming (`pages/pages` in CMS feature; optional `QuantityStepper` vs `NumberStepper`).
5. Keep Capacitor `ios/` + `android/` as platform trees — do not merge into `src/`.

---

## 2. Inventory totals by category

| Category bucket          | File count | Notes |
| ------------------------ | ---------: | ----- |
| `features (all)`         |        393 |       |
| `platform/android (219)` |        219 |       |
| `shared (all)`           |        198 |       |
| `platform/ios (197)`     |        197 |       |
| `config-root (16)`       |         16 |       |
| `app (13)`               |         13 |       |
| `entities (7)`           |          7 |       |
| `assets/public (4)`      |          4 |       |
| `src-root (3)`           |          3 |       |
| `test-harness (3)`       |          3 |       |
| `mockups (2)`            |          2 |       |
| `docs (1)`               |          1 |       |
| `e2e (1)`                |          1 |       |
| `resources (1)`          |          1 |       |

### Feature module sizes (file count)

| Feature         | Files | Dominant layers                                                                                      |
| --------------- | ----: | ---------------------------------------------------------------------------------------------------- |
| `matches`       |   104 | api (1):1, lib (36):36, model (9):9, pages (9):9, routing (2):2, test (1):1, ui (46):46              |
| `shop`          |    41 | api (2):2, lib (2):2, model (2):2, pages (21):21, routing (2):2, test (1):1, ui (11):11              |
| `tournaments`   |    38 | api (1):1, lib (4):4, model (11):11, other (2):2, pages (7):7, routing (2):2, test (1):1, ui (10):10 |
| `live`          |    35 | api (1):1, lib (16):16, model (1):1, pages (4):4, routing (2):2, test (1):1, ui (10):10              |
| `feed`          |    32 | api (2):2, lib (7):7, model (5):5, pages (3):3, routing (2):2, test (1):1, ui (12):12                |
| `auth`          |    25 | api (1):1, lib (10):10, model (1):1, pages (4):4, routing (2):2, test (1):1, ui (6):6                |
| `reels`         |    25 | api (1):1, lib (12):12, model (2):2, pages (2):2, routing (2):2, test (1):1, ui (5):5                |
| `profile`       |    14 | api (1):1, lib (2):2, model (2):2, pages (3):3, routing (2):2, test (1):1, ui (3):3                  |
| `explore`       |    12 | api (1):1, lib (1):1, model (2):2, pages (1):1, routing (2):2, test (1):1, ui (4):4                  |
| `highlights`    |    10 | api (1):1, lib (1):1, model (2):2, pages (2):2, routing (2):2, test (1):1, ui (1):1                  |
| `interest`      |    10 | api (1):1, lib (1):1, model (3):3, pages (1):1, routing (2):2, test (1):1, ui (1):1                  |
| `notifications` |    10 | api (2):2, lib (2):2, model (2):2, pages (1):1, routing (2):2, test (1):1                            |
| `ranking`       |    10 | api (1):1, lib (1):1, model (2):2, pages (2):2, routing (2):2, test (1):1, ui (1):1                  |
| `entertainment` |     9 | api (1):1, lib (1):1, model (1):1, pages (3):3, routing (2):2, test (1):1                            |
| `stats`         |     8 | api (1):1, lib (1):1, model (2):2, pages (1):1, routing (1):1, test (1):1, ui (1):1                  |
| `pages`         |     5 | pages (5):5                                                                                          |
| `support`       |     5 | api (1):1, lib (1):1, pages (1):1, routing (1):1, test (1):1                                         |

### Pages & screens (68 page modules)

Lazy route entry points under `*/pages/*.tsx` (plus thin `app/pages` re-exports):

- `src/features/auth/pages/LoginPage.tsx`
- `src/features/auth/pages/OtpPage.tsx`
- `src/features/auth/pages/RegisterPage.tsx`
- `src/features/entertainment/pages/EntertainmentDetailPage.tsx`
- `src/features/entertainment/pages/EntertainmentEpisodePage.tsx`
- `src/features/entertainment/pages/EntertainmentPage.tsx`
- `src/features/explore/pages/DiscoverPage.tsx`
- `src/features/feed/pages/CreatePostPage.tsx`
- `src/features/feed/pages/FeedPage.tsx`
- `src/features/feed/pages/PostDetailPage.tsx`
- `src/features/highlights/pages/HighlightDetailPage.tsx`
- `src/features/highlights/pages/HighlightsPage.tsx`
- `src/features/interest/pages/InterestPage.tsx`
- `src/features/live/pages/GoLiveOnAirPage.tsx`
- `src/features/live/pages/GoLivePage.tsx`
- `src/features/live/pages/LiveHubPage.tsx`
- `src/features/live/pages/WatchPage.tsx`
- `src/features/matches/pages/MatchBroadcastGraphicsPage.tsx`
- `src/features/matches/pages/MatchCardPage.tsx`
- `src/features/matches/pages/MatchScorePage.tsx`
- `src/features/matches/pages/MatchSettingsPage.tsx`
- `src/features/matches/pages/MatchTossPage.tsx`
- `src/features/matches/pages/MatchesListPage.tsx`
- `src/features/matches/pages/QuickMatchPage.tsx`
- `src/features/matches/pages/ScorecardHubPage.tsx`
- `src/features/matches/pages/StartMatchPage.tsx`
- `src/features/notifications/pages/NotificationsPage.tsx`
- `src/features/pages/pages/StaticPage.tsx`
- `src/features/profile/pages/EditProfilePage.tsx`
- `src/features/profile/pages/PublicProfilePage.tsx`
- `src/features/profile/pages/YouPage.tsx`
- `src/features/ranking/pages/RankingPage.tsx`
- `src/features/ranking/pages/RankingStatsPage.tsx`
- `src/features/reels/pages/CreateReelPage.tsx`
- `src/features/reels/pages/ReelsPage.tsx`
- `src/features/shop/pages/CartPage.tsx`
- `src/features/shop/pages/CheckoutPage.tsx`
- `src/features/shop/pages/OrderDetailPage.tsx`
- `src/features/shop/pages/OrderSuccessPage.tsx`
- `src/features/shop/pages/OrdersPage.tsx`
- `src/features/shop/pages/ProductDetailPage.tsx`
- `src/features/shop/pages/SellerApplyPage.tsx`
- `src/features/shop/pages/SellerBrandsPage.tsx`
- `src/features/shop/pages/SellerCategoriesPage.tsx`
- `src/features/shop/pages/SellerHubPage.tsx`
- `src/features/shop/pages/SellerOrderDetailPage.tsx`
- `src/features/shop/pages/SellerOrdersPage.tsx`
- `src/features/shop/pages/SellerProductFormPage.tsx`
- `src/features/shop/pages/SellerProductsPage.tsx`
- `src/features/shop/pages/SellerStorePage.tsx`
- `src/features/shop/pages/ShopBrandPage.tsx`
- `src/features/shop/pages/ShopFilterPage.tsx`
- `src/features/shop/pages/ShopHomePage.tsx`
- `src/features/shop/pages/ShopSlugPage.tsx`
- `src/features/shop/pages/ShopVendorPage.tsx`
- `src/features/shop/pages/ShopVendorRedirect.tsx`
- `src/features/stats/pages/StatsPage.tsx`
- `src/features/support/pages/SupportPage.tsx`
- `src/features/tournaments/pages/CreateTournamentPage.tsx`
- `src/features/tournaments/pages/PublicTournamentPage.tsx`
- `src/features/tournaments/pages/SquadEditorPage.tsx`
- `src/features/tournaments/pages/TournamentDetailPage.tsx`
- `src/features/tournaments/pages/TournamentWorkspacePage.tsx`
- `src/features/tournaments/pages/TournamentsListPage.tsx`
- `src/features/tournaments/pages/UpcomingTournamentsPage.tsx`

---

## 3. Architecture map (current)

```
index.html + themeBoot → src/main.tsx
  → AppProviders (Redux, RTK, Theme, Dialogs, Toast, Keyboard, ErrorBoundary)
  → App / routes.tsx
       RequireGuest → features/auth
       AppShell → public pages + RequireAuth children
         features/* route tables (lazy pages)
         bare AppShell → reels / scoring / live immersive
```

### Parent–child / dependency patterns

| Layer              | Depends on                                                     | Must not depend on                             |
| ------------------ | -------------------------------------------------------------- | ---------------------------------------------- |
| `app/`             | `features/*` public barrels, `shared/*`                        | Deep `@/features/*/internal` (ESLint-enforced) |
| `features/*/pages` | feature `ui`/`api`/`lib`/`model`, `shared/ui`, `shared/layout` | Other features’ internals                      |
| `features/*/ui`    | `shared/ui`, local lib/model                                   | Other features                                 |
| `features/*/api`   | `shared/api/baseApi`, feature Zod schemas                      | UI components                                  |
| `shared/ui`        | tokens / `cn` / cva                                            | Features                                       |
| `shared/native`    | Capacitor plugins                                              | Features                                       |
| `entities/user`    | shared UI lightly                                              | Feature pages (keep thin)                      |

### State management

| Mechanism                          | Location                                         | Role                                    |
| ---------------------------------- | ------------------------------------------------ | --------------------------------------- |
| Redux Toolkit store                | `shared/store/store.ts`                          | Auth slice + RTK Query `baseApi`        |
| RTK Query                          | `shared/api/baseApi.ts` + `features/*/api`       | Server cache                            |
| Secure storage (Keychain/Keystore) | `shared/native/secureStorage.ts` + `authSession` | Token persist                           |
| Dialog vanilla store               | `shared/dialogs/dialogStore.ts`                  | Global confirm / session expired        |
| Toast store                        | `shared/ui/toast/toastStore.ts`                  | Ephemeral feedback                      |
| Theme                              | `shared/config/theme.tsx` + `themeBoot.js`       | `system` default + localStorage persist |
| Keyboard inset                     | `shared/native/keyboardInsetStore.ts`            | Soft-keyboard padding                   |
| Orientation session                | `shared/native/orientationSession.ts`            | Portrait / Go Live locks                |
| Local React state                  | pages / ui                                       | Forms, sheets, immersive Full flag      |

---

## 4. Structural & quality issues

| ID  | Severity | Issue                           | Evidence / examples                                                                                                                                             |
| --- | -------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | High     | Oversized page/UI modules       | `MatchScorePage.tsx` (1115), `DeclareSquadScreen` (629), `AdminActionSheet` (628), `GoLiveOnAirPage` (547), `ReelsPage` (532), `EntertainmentEpisodePage` (459) |
| Q2  | High     | Oversized schemas / MSW         | `shop/model/schemas.ts` (1038), `shop/test/handlers.ts` (1019), `matches/api/matchesApi.ts` (753)                                                               |
| Q3  | Medium   | Matches feature concentration   | 104 files — 46 ui + 36 lib; scoring domain may deserve `features/scoring` later                                                                                 |
| Q4  | Medium   | Thin duplicate page entrypoints | `app/pages/StatsPage.tsx` & `SupportPage.tsx` only re-export features                                                                                           |
| Q5  | Medium   | Dead tilt permission helper     | `shared/native/deviceOrientationPermission.ts` unused after tilt removal                                                                                        |
| Q6  | Low      | Nested `features/pages/pages`   | CMS feature folder name collides with layer name                                                                                                                |
| Q7  | Low      | Parallel steppers               | `shared/ui/NumberStepper` vs `shop/ui/QuantityStepper` — clarify wrapper vs duplicate                                                                           |
| Q8  | Low      | README / path drift             | README still mentions `app-next/` in places                                                                                                                     |
| Q9  | Info     | Native project bulk             | 197 iOS + 219 Android files — mostly Capacitor scaffolding; keep out of `src/`                                                                                  |
| Q10 | Info     | Test coverage uneven            | Strong in matches lib; thinner UI/page tests outside tournaments card / auth OTP                                                                                |

### Oversized files (>400 LOC) — split candidates

|  LOC | Path                                                            | Suggested split                                                                    |
| ---: | --------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1115 | `src/features/matches/pages/MatchScorePage.tsx`                 | Extract hooks / section components / schema domains; keep page as composition root |
| 1038 | `src/features/shop/model/schemas.ts`                            | Extract hooks / section components / schema domains; keep page as composition root |
| 1019 | `src/features/shop/test/handlers.ts`                            | Extract hooks / section components / schema domains; keep page as composition root |
|  753 | `src/features/matches/api/matchesApi.ts`                        | Extract hooks / section components / schema domains; keep page as composition root |
|  629 | `src/features/matches/ui/DeclareSquadScreen.tsx`                | Extract hooks / section components / schema domains; keep page as composition root |
|  628 | `src/features/matches/ui/AdminActionSheet.tsx`                  | Extract hooks / section components / schema domains; keep page as composition root |
|  572 | `src/features/feed/api/feedApi.ts`                              | Extract hooks / section components / schema domains; keep page as composition root |
|  571 | `src/features/reels/pages/CreateReelPage.tsx`                   | Extract hooks / section components / schema domains; keep page as composition root |
|  570 | `src/features/matches/pages/StartMatchPage.tsx`                 | Extract hooks / section components / schema domains; keep page as composition root |
|  549 | `src/features/shop/pages/SellerProductFormPage.tsx`             | Extract hooks / section components / schema domains; keep page as composition root |
|  547 | `src/features/matches/test/handlers.ts`                         | Extract hooks / section components / schema domains; keep page as composition root |
|  547 | `src/features/live/pages/GoLiveOnAirPage.tsx`                   | Extract hooks / section components / schema domains; keep page as composition root |
|  538 | `src/features/matches/pages/QuickMatchPage.tsx`                 | Extract hooks / section components / schema domains; keep page as composition root |
|  532 | `src/features/reels/pages/ReelsPage.tsx`                        | Extract hooks / section components / schema domains; keep page as composition root |
|  498 | `src/features/tournaments/ui/ManageTeamDialog.tsx`              | Extract hooks / section components / schema domains; keep page as composition root |
|  485 | `src/features/tournaments/pages/SquadEditorPage.tsx`            | Extract hooks / section components / schema domains; keep page as composition root |
|  479 | `src/features/tournaments/test/handlers.ts`                     | Extract hooks / section components / schema domains; keep page as composition root |
|  477 | `src/features/tournaments/pages/TournamentWorkspacePage.tsx`    | Extract hooks / section components / schema domains; keep page as composition root |
|  475 | `src/features/profile/ui/EditProfileForm.tsx`                   | Extract hooks / section components / schema domains; keep page as composition root |
|  465 | `src/features/matches/ui/StatsPanel.tsx`                        | Extract hooks / section components / schema domains; keep page as composition root |
|  459 | `src/features/entertainment/pages/EntertainmentEpisodePage.tsx` | Extract hooks / section components / schema domains; keep page as composition root |
|  425 | `src/features/shop/pages/SellerOrderDetailPage.tsx`             | Extract hooks / section components / schema domains; keep page as composition root |
|  419 | `src/features/feed/test/handlers.ts`                            | Extract hooks / section components / schema domains; keep page as composition root |
|  417 | `src/features/matches/pages/MatchCardPage.tsx`                  | Extract hooks / section components / schema domains; keep page as composition root |
|  416 | `src/features/tournaments/ui/CreateTournamentWizard.tsx`        | Extract hooks / section components / schema domains; keep page as composition root |
|  415 | `src/features/matches/pages/MatchBroadcastGraphicsPage.tsx`     | Extract hooks / section components / schema domains; keep page as composition root |
|  406 | `src/features/matches/ui/WicketSheet.tsx`                       | Extract hooks / section components / schema domains; keep page as composition root |

---

## 5. Proposed folder & naming conventions

**Recommendation: keep the existing top-level layout** (already matches APP_REWRITE_ARCHITECTURE §4–5). Do not invent a parallel `components/` or `hooks/` at repo root.

```
client/
├── src/
│   ├── app/                 # shell only
│   ├── features/<name>/     # api, model, lib, ui, pages, test, routes.ts, index.ts
│   ├── entities/            # rare cross-feature domain widgets
│   ├── shared/              # ui, layout, api, native, store, config, dialogs, hooks, lib
│   ├── test/                # vitest/msw setup
│   ├── main.tsx
│   └── index.css
├── public/
├── ios/  android/           # Capacitor native
├── docs/
├── e2e/
└── <tooling configs>
```

### Naming rules (confirm in Phase 2)

| Kind           | Convention                                                        |
| -------------- | ----------------------------------------------------------------- |
| Feature folder | kebab-free singular domain: `live`, `shop`, `matches`             |
| Page           | `*Page.tsx` under `pages/`                                        |
| Feature UI     | PascalCase component file under `ui/`                             |
| RTK API        | `*Api.ts` under `api/`                                            |
| Zod            | `schemas.ts` (+ split `*Schemas.ts` when >~400 LOC)               |
| Hooks          | `use*.ts` in `lib/` (feature) or `shared/hooks` / `shared/native` |
| Public barrel  | `features/<name>/index.ts` — only export what app/routes need     |
| Tests          | co-located `*.test.ts(x)` or feature `test/handlers.ts` for MSW   |

---

## 6. File-by-file organization plan

### 6.1 Default rule (majority of files)

For every file under `src/features/**`, `src/shared/**` (except noted orphans), `src/entities/**`, `src/test/**`, `public/**`, `docs/**`, `e2e/**`, `ios/**`, `android/**`, and root tooling configs:

| Current  | Proposed      | Action                              |
| -------- | ------------- | ----------------------------------- |
| `<path>` | **same path** | **Keep** — already correctly placed |

The complete path list is Appendix A (every inventoried file).

### 6.2 Explicit change candidates (Phase 2+ — do not execute now)

| Current path                                       | Proposed path / action                                         | Purpose                   | Why change                                         |
| -------------------------------------------------- | -------------------------------------------------------------- | ------------------------- | -------------------------------------------------- |
| `src/shared/native/deviceOrientationPermission.ts` | **Delete** (unused)                                            | iOS tilt permission prime | Tilt removed; nothing imports it                   |
| `src/app/pages/StatsPage.tsx`                      | Delete after `shellRoutes` imports `@/features/stats`          | Re-export                 | Removes duplicate page ownership                   |
| `src/app/pages/SupportPage.tsx`                    | Delete after `shellRoutes` imports `@/features/support`        | Re-export                 | Same                                               |
| `src/app/pages/UiShowcasePage.tsx`                 | Keep **or** move → `src/features/dev/pages/UiShowcasePage.tsx` | Dev catalog               | Optional; only if we want zero pages under `app/`  |
| `src/features/pages/`                              | Rename feature → `src/features/cms/` or `static-pages/`        | CMS/legal routes          | Avoids `pages/pages` confusion                     |
| `src/features/shop/ui/QuantityStepper.tsx`         | Prefer re-export/wrap `shared/ui/NumberStepper`                | Qty control               | Deduplicate stepper UX                             |
| `src/features/matches/pages/MatchScorePage.tsx`    | Split into `pages/` + `ui/score/*` + `lib/score/*`             | Live scoring              | God-page                                           |
| `src/features/shop/model/schemas.ts`               | Split by domain (`productSchemas`, `orderSchemas`, …)          | Zod                       | Maintainability                                    |
| `src/features/matches/ui/*` (scoring sheets)       | Optionally `features/scoring/` later                           | Scoring UI                | Only if matches/non-scoring split is product-clear |
| `README.md` path refs `app-next/`                  | Update copy to `client/`                                       | Docs accuracy             | Drift                                              |

### 6.3 Platform trees

| Tree       | Count | Plan                                              |
| ---------- | ----: | ------------------------------------------------- |
| `ios/`     |   197 | Keep Capacitor layout; treat as platform artifact |
| `android/` |   219 | Keep Capacitor layout; treat as platform artifact |

No migration of native files into `src/`.

---

## 7. Risks & considerations (preserve functionality)

| Risk                                               | Mitigation                                                                              |
| -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Moving routes breaks lazy `import()` paths         | Change `shellRoutes` / feature `routes.ts` in same PR; run `typecheck` + smoke navigate |
| Splitting MatchScorePage regresses scoring         | Extract presentational pieces first; keep hooks wiring in page; device QA scoring flows |
| Deleting tilt helper while something still imports | Confirm `rg deviceOrientationPermission` empty before delete                            |
| Renaming `features/pages`                          | Update all imports + deep-link paths builders                                           |
| Capacitor sync after path changes                  | `npx cap sync` only if `webDir`/assets change — not needed for pure `src` moves         |
| MSW handler splits                                 | Keep handler registration order stable in `test/handlers.ts` barrel                     |
| ESLint deep-import ban                             | Continue exporting only through feature `index.ts`                                      |

---

## 8. Suggested Phase 2 sequencing (not started)

1. Dead-code removal (`deviceOrientationPermission`) + README drift.
2. Eliminate `app/pages` Stats/Support re-exports.
3. Split top oversized files (matches score → shop schemas → live/reels pages).
4. Optional: rename `features/pages` → `cms`.
5. Optional: scoring sub-feature extraction (only with product buy-in).

---

## Appendix A — Complete file inventory

Every inventoried path, grouped by category. Proposed location is **keep** unless listed in §6.2.

### `app (13)` (13 files)

| Current path                       | Proposed                                                     | Reason                                           |
| ---------------------------------- | ------------------------------------------------------------ | ------------------------------------------------ |
| `src/app/App.tsx`                  | _(keep)_                                                     | Keep — app shell / providers / route aggregation |
| `src/app/AppProviders.tsx`         | _(keep)_                                                     | Keep — app shell / providers / route aggregation |
| `src/app/AppShell.tsx`             | _(keep)_                                                     | Keep — app shell / providers / route aggregation |
| `src/app/ErrorBoundary.tsx`        | _(keep)_                                                     | Keep — app shell / providers / route aggregation |
| `src/app/NativeEffects.tsx`        | _(keep)_                                                     | Keep — app shell / providers / route aggregation |
| `src/app/RealtimeEffects.tsx`      | _(keep)_                                                     | Keep — app shell / providers / route aggregation |
| `src/app/RequireAuth.tsx`          | _(keep)_                                                     | Keep — app shell / providers / route aggregation |
| `src/app/RequireGuest.tsx`         | _(keep)_                                                     | Keep — app shell / providers / route aggregation |
| `src/app/pages/StatsPage.tsx`      | Remove after updating shellRoutes to import @/features/stats | support directly                                 | Thin re-export indirection; duplicates mental model of page ownership |
| `src/app/pages/SupportPage.tsx`    | Remove after updating shellRoutes to import @/features/stats | support directly                                 | Thin re-export indirection; duplicates mental model of page ownership |
| `src/app/pages/UiShowcasePage.tsx` | _(keep)_                                                     | Keep — app shell / providers / route aggregation |
| `src/app/routes.tsx`               | _(keep)_                                                     | Keep — app shell / providers / route aggregation |
| `src/app/shellRoutes.ts`           | _(keep)_                                                     | Keep — app shell / providers / route aggregation |

### `assets/public (4)` (4 files)

| Current path                         | Proposed | Reason |
| ------------------------------------ | -------- | ------ |
| `public/brand/tapeya-logo-dark.png`  | _(keep)_ | Keep   |
| `public/brand/tapeya-logo-light.png` | _(keep)_ | Keep   |
| `public/favicon.png`                 | _(keep)_ | Keep   |
| `public/favicon.svg`                 | _(keep)_ | Keep   |

### `config-root (16)` (16 files)

| Current path           | Proposed | Reason               |
| ---------------------- | -------- | -------------------- |
| `.env`                 | _(keep)_ | Keep — tooling / env |
| `.env.example`         | _(keep)_ | Keep — tooling / env |
| `.gitignore`           | _(keep)_ | Keep — tooling / env |
| `.nvmrc`               | _(keep)_ | Keep — tooling / env |
| `.prettierrc`          | _(keep)_ | Keep — tooling / env |
| `README.md`            | _(keep)_ | Keep — tooling / env |
| `capacitor.config.ts`  | _(keep)_ | Keep — tooling / env |
| `eslint.config.js`     | _(keep)_ | Keep — tooling / env |
| `index.html`           | _(keep)_ | Keep — tooling / env |
| `package-lock.json`    | _(keep)_ | Keep — tooling / env |
| `package.json`         | _(keep)_ | Keep — tooling / env |
| `playwright.config.ts` | _(keep)_ | Keep — tooling / env |
| `tsconfig.app.json`    | _(keep)_ | Keep — tooling / env |
| `tsconfig.json`        | _(keep)_ | Keep — tooling / env |
| `tsconfig.node.json`   | _(keep)_ | Keep — tooling / env |
| `vite.config.ts`       | _(keep)_ | Keep — tooling / env |

### `docs (1)` (1 files)

| Current path          | Proposed | Reason |
| --------------------- | -------- | ------ |
| `docs/ORIENTATION.md` | _(keep)_ | Keep   |

### `e2e (1)` (1 files)

| Current path        | Proposed | Reason |
| ------------------- | -------- | ------ |
| `e2e/smoke.spec.ts` | _(keep)_ | Keep   |

### `entities (7)` (7 files)

| Current path                                | Proposed | Reason                                                    |
| ------------------------------------------- | -------- | --------------------------------------------------------- |
| `src/entities/user/UserAvatar.tsx`          | _(keep)_ | Keep — cross-feature user entity (thin; expand carefully) |
| `src/entities/user/UserIdentity.tsx`        | _(keep)_ | Keep — cross-feature user entity (thin; expand carefully) |
| `src/entities/user/index.ts`                | _(keep)_ | Keep — cross-feature user entity (thin; expand carefully) |
| `src/entities/user/types.test.ts`           | _(keep)_ | Keep — cross-feature user entity (thin; expand carefully) |
| `src/entities/user/types.ts`                | _(keep)_ | Keep — cross-feature user entity (thin; expand carefully) |
| `src/entities/user/userProfilePath.test.ts` | _(keep)_ | Keep — cross-feature user entity (thin; expand carefully) |
| `src/entities/user/userProfilePath.ts`      | _(keep)_ | Keep — cross-feature user entity (thin; expand carefully) |

### `feature:auth/api (1)` (1 files)

| Current path                       | Proposed | Reason                                                                   |
| ---------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/auth/api/authApi.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:auth/lib (10)` (10 files)

| Current path                                         | Proposed | Reason                                                                   |
| ---------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/auth/lib/constants.ts`                 | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/auth/lib/cooldown.ts`                  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/auth/lib/isClientTestOtpPhone.test.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/auth/lib/isClientTestOtpPhone.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/auth/lib/justRegistered.ts`            | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/auth/lib/otpPreviewSession.test.ts`    | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/auth/lib/otpPreviewSession.ts`         | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/auth/lib/phone.ts`                     | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/auth/lib/profiles.ts`                  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/auth/lib/returningUser.ts`             | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:auth/model (1)` (1 files)

| Current path                         | Proposed | Reason                                                                   |
| ------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/auth/model/schemas.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:auth/pages (4)` (4 files)

| Current path                               | Proposed | Reason                                                                   |
| ------------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/auth/pages/LoginPage.tsx`    | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/auth/pages/OtpPage.test.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/auth/pages/OtpPage.tsx`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/auth/pages/RegisterPage.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:auth/routing (2)` (2 files)

| Current path                  | Proposed | Reason                                                                   |
| ----------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/auth/index.ts`  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/auth/routes.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:auth/test (1)` (1 files)

| Current path                         | Proposed | Reason                                                                   |
| ------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/auth/test/handlers.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:auth/ui (6)` (6 files)

| Current path                                   | Proposed | Reason                                                                   |
| ---------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/auth/ui/AuthShell.tsx`           | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/auth/ui/OtpInput.tsx`            | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/auth/ui/PhoneField.tsx`          | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/auth/ui/SavedProfileList.tsx`    | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/auth/ui/TermsAcceptanceGate.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/auth/ui/WhatsAppNotice.tsx`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:entertainment/api (1)` (1 files)

| Current path                                         | Proposed | Reason                                                                   |
| ---------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/entertainment/api/entertainmentApi.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:entertainment/lib (1)` (1 files)

| Current path                                           | Proposed | Reason                                                                   |
| ------------------------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/entertainment/lib/entertainmentPaths.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:entertainment/model (1)` (1 files)

| Current path                                  | Proposed | Reason                                                                   |
| --------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/entertainment/model/schemas.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:entertainment/pages (3)` (3 files)

| Current path                                                    | Proposed | Reason                                                                   |
| --------------------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/entertainment/pages/EntertainmentDetailPage.tsx`  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/entertainment/pages/EntertainmentEpisodePage.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/entertainment/pages/EntertainmentPage.tsx`        | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:entertainment/routing (2)` (2 files)

| Current path                           | Proposed | Reason                                                                   |
| -------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/entertainment/index.ts`  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/entertainment/routes.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:entertainment/test (1)` (1 files)

| Current path                                  | Proposed | Reason                                                                   |
| --------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/entertainment/test/handlers.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:explore/api (1)` (1 files)

| Current path                             | Proposed | Reason                                                                   |
| ---------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/explore/api/exploreApi.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:explore/lib (1)` (1 files)

| Current path                                   | Proposed | Reason                                                                   |
| ---------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/explore/lib/confirmBlockUser.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:explore/model (2)` (2 files)

| Current path                                 | Proposed | Reason                                                                   |
| -------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/explore/model/schemas.test.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/explore/model/schemas.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:explore/pages (1)` (1 files)

| Current path                                  | Proposed | Reason                                                                   |
| --------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/explore/pages/DiscoverPage.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:explore/routing (2)` (2 files)

| Current path                     | Proposed | Reason                                                                   |
| -------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/explore/index.ts`  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/explore/routes.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:explore/test (1)` (1 files)

| Current path                            | Proposed | Reason                                                                   |
| --------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/explore/test/handlers.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:explore/ui (4)` (4 files)

| Current path                                      | Proposed | Reason                                                                   |
| ------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/explore/ui/ExploreRail.tsx`         | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/explore/ui/SuggestedForYouCard.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/explore/ui/SuggestedPeopleBand.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/explore/ui/SuggestedUserRow.tsx`    | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:feed/api (2)` (2 files)

| Current path                       | Proposed | Reason                                                                   |
| ---------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/feed/api/feedApi.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/api/homeApi.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:feed/lib (7)` (7 files)

| Current path                                       | Proposed | Reason                                                                   |
| -------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/feed/lib/composeBackgrounds.test.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/lib/composeBackgrounds.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/lib/heroSliderCta.test.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/lib/heroSliderCta.ts`           | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/lib/homeExploreTiles.ts`        | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/lib/useFeedHomeData.ts`         | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/lib/useHeroStoreLinks.ts`       | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:feed/model (5)` (5 files)

| Current path                                  | Proposed | Reason                                                                   |
| --------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/feed/model/commentSchemas.ts`   | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/model/homeSchemas.test.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/model/homeSchemas.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/model/schemas.test.ts`     | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/model/schemas.ts`          | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:feed/pages (3)` (3 files)

| Current path                                 | Proposed | Reason                                                                   |
| -------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/feed/pages/CreatePostPage.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/pages/FeedPage.tsx`       | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/pages/PostDetailPage.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:feed/routing (2)` (2 files)

| Current path                  | Proposed | Reason                                                                   |
| ----------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/feed/index.ts`  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/routes.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:feed/test (1)` (1 files)

| Current path                         | Proposed | Reason                                                                   |
| ------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/feed/test/handlers.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:feed/ui (12)` (12 files)

| Current path                                     | Proposed | Reason                                                                   |
| ------------------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/feed/ui/CommentComposer.tsx`       | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/ui/CommentThread.tsx`         | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/ui/ComposerTrigger.tsx`       | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/ui/PostCard.tsx`              | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/ui/ReelBand.tsx`              | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/ui/ReportSheet.tsx`           | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/ui/home/FeedHomeRail.tsx`     | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/ui/home/HomeDashboard.tsx`    | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/ui/home/HomeHeroCarousel.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/ui/home/HomeRail.tsx`         | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/ui/home/HomeSections.tsx`     | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/feed/ui/home/MobileHomeHeader.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:highlights/api (1)` (1 files)

| Current path                                   | Proposed | Reason                                                                   |
| ---------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/highlights/api/highlightsApi.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:highlights/lib (1)` (1 files)

| Current path                             | Proposed | Reason                                                                   |
| ---------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/highlights/lib/youtube.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:highlights/model (2)` (2 files)

| Current path                                    | Proposed | Reason                                                                   |
| ----------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/highlights/model/schemas.test.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/highlights/model/schemas.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:highlights/pages (2)` (2 files)

| Current path                                            | Proposed | Reason                                                                   |
| ------------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/highlights/pages/HighlightDetailPage.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/highlights/pages/HighlightsPage.tsx`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:highlights/routing (2)` (2 files)

| Current path                        | Proposed | Reason                                                                   |
| ----------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/highlights/index.ts`  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/highlights/routes.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:highlights/test (1)` (1 files)

| Current path                               | Proposed | Reason                                                                   |
| ------------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/highlights/test/handlers.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:highlights/ui (1)` (1 files)

| Current path                                    | Proposed | Reason                                                                   |
| ----------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/highlights/ui/HighlightThumb.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:interest/api (1)` (1 files)

| Current path                               | Proposed | Reason                                                                   |
| ------------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/interest/api/interestApi.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:interest/lib (1)` (1 files)

| Current path                          | Proposed | Reason                                                                   |
| ------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/interest/lib/upload.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:interest/model (3)` (3 files)

| Current path                                  | Proposed | Reason                                                                   |
| --------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/interest/model/actions.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/interest/model/schemas.test.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/interest/model/schemas.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:interest/pages (1)` (1 files)

| Current path                                   | Proposed | Reason                                                                   |
| ---------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/interest/pages/InterestPage.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:interest/routing (2)` (2 files)

| Current path                      | Proposed | Reason                                                                   |
| --------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/interest/index.ts`  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/interest/routes.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:interest/test (1)` (1 files)

| Current path                             | Proposed | Reason                                                                   |
| ---------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/interest/test/handlers.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:interest/ui (1)` (1 files)

| Current path                                | Proposed | Reason                                                                   |
| ------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/interest/ui/InterestForm.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:live/api (1)` (1 files)

| Current path                       | Proposed | Reason                                                                   |
| ---------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/live/api/liveApi.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:live/lib (16)` (16 files)

| Current path                                           | Proposed | Reason                                                                   |
| ------------------------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/live/lib/appendLiveComment.ts`           | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/lib/broadcastCameraUtils.ts`        | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/lib/displayInitials.ts`             | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/lib/playback.test.ts`               | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/lib/playback.ts`                    | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/lib/useBroadcastCameraUnderlay.ts`  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/lib/useBroadcastNativePreview.ts`   | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/lib/useBroadcastOrientationLock.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/lib/useFloatingHearts.ts`           | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/lib/useLiveHubChannel.ts`           | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/lib/useLiveStreamChannel.ts`        | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/lib/useStreamChatChannel.ts`        | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/lib/useStreamVideoLoading.test.ts`  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/lib/useStreamVideoLoading.ts`       | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/lib/useVanityViewerCount.test.ts`   | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/lib/useVanityViewerCount.ts`        | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:live/model (1)` (1 files)

| Current path                         | Proposed | Reason                                                                   |
| ------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/live/model/schemas.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:live/pages (4)` (4 files)

| Current path                                  | Proposed | Reason                                                                   |
| --------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/live/pages/GoLiveOnAirPage.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/pages/GoLivePage.tsx`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/pages/LiveHubPage.tsx`     | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/pages/WatchPage.tsx`       | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:live/routing (2)` (2 files)

| Current path                  | Proposed | Reason                                                                   |
| ----------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/live/index.ts`  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/routes.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:live/test (1)` (1 files)

| Current path                         | Proposed | Reason                                                                   |
| ------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/live/test/handlers.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:live/ui (10)` (10 files)

| Current path                                     | Proposed | Reason                                                                   |
| ------------------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/live/ui/ChatDock.tsx`              | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/ui/FloatingHeartsOverlay.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/ui/StreamActionRow.tsx`       | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/ui/StreamCard.tsx`            | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/ui/StreamHostRow.tsx`         | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/ui/StreamPlayer.tsx`          | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/ui/StreamVideoLoading.tsx`    | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/ui/StreamVideoRetry.tsx`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/ui/UploadVideoPlayer.tsx`     | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/live/ui/YoutubeProxyPlayer.tsx`    | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:matches/api (1)` (1 files)

| Current path                             | Proposed | Reason                                                                   |
| ---------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/matches/api/matchesApi.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:matches/lib (36)` (36 files)

| Current path                                          | Proposed | Reason                                                                   |
| ----------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/matches/lib/ballLog.test.ts`            | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/ballLog.ts`                 | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/ballQueueStorage.test.ts`   | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/ballQueueStorage.ts`        | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/broadcastGraphics.ts`       | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/commentary.test.ts`         | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/commentary.ts`              | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/editBallPayload.test.ts`    | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/editBallPayload.ts`         | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/extraRunOptions.ts`         | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/extrasHelpers.test.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/fanMatchView.test.ts`       | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/fanMatchView.ts`            | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/format.ts`                  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/noBallExtras.ts`            | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/overthrowExtras.test.ts`    | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/overthrowExtras.ts`         | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/partnerships.test.ts`       | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/partnerships.ts`            | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/quickMatchPayload.test.ts`  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/quickMatchPayload.ts`       | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/scorecardColumns.ts`        | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/scorecardFace.test.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/scorecardFace.ts`           | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/startMatchPayload.test.ts`  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/startMatchPayload.ts`       | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/statsFromScorecard.test.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/statsFromScorecard.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/storeBallPayload.test.ts`   | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/storeBallPayload.ts`        | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/useMatchScoringChannel.ts`  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/useOfflineBallQueue.ts`     | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/useScorerConnection.ts`     | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/wicketSummary.test.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/wicketSummary.ts`           | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/lib/wideBallExtras.ts`          | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:matches/model (9)` (9 files)

| Current path                                     | Proposed | Reason                                                                   |
| ------------------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/matches/model/liveSchemas.test.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/model/liveSchemas.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/model/schemas.test.ts`     | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/model/schemas.ts`          | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/model/scorecardSchemas.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/model/scoringFixture.ts`   | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/model/scoringSession.ts`   | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/model/squadSchemas.ts`     | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/model/storeBallSchemas.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:matches/pages (9)` (9 files)

| Current path                                                | Proposed | Reason                                                                   |
| ----------------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/matches/pages/MatchBroadcastGraphicsPage.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/pages/MatchCardPage.tsx`              | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/pages/MatchScorePage.tsx`             | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/pages/MatchSettingsPage.tsx`          | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/pages/MatchTossPage.tsx`              | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/pages/MatchesListPage.tsx`            | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/pages/QuickMatchPage.tsx`             | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/pages/ScorecardHubPage.tsx`           | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/pages/StartMatchPage.tsx`             | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:matches/routing (2)` (2 files)

| Current path                     | Proposed | Reason                                                                   |
| -------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/matches/index.ts`  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/routes.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:matches/test (1)` (1 files)

| Current path                            | Proposed | Reason                                                                   |
| --------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/matches/test/handlers.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:matches/ui (46)` (46 files)

| Current path                                           | Proposed | Reason                                                                   |
| ------------------------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/matches/ui/AddQuickMatchPlayerSheet.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/AdminActionSheet.tsx`         | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/BallLog.tsx`                  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/CommentaryFeed.tsx`           | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/ConnectionBanner.tsx`         | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/CreaseSetupSheet.tsx`         | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/CreaseStrip.tsx`              | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/CreateMatchTiles.tsx`         | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/DeclareResultSheet.tsx`       | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/DeclareSquadScreen.tsx`       | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/EditBallSheet.tsx`            | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/EndMatchSheet.tsx`            | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/ExtraRunsSheet.tsx`           | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/FanLiveDock.tsx`              | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/FanLivePanel.tsx`             | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/FanMatchHeader.tsx`           | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/FanPublicScoreCard.tsx`       | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/FirstBallSetup.tsx`           | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/LiveInningsStrip.tsx`         | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/MatchActionMenu.tsx`          | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/MatchBand.tsx`                | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/MatchInfoPanel.tsx`           | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/MatchListSections.tsx`        | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/MatchMoreSheet.tsx`           | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/MatchOverScreen.tsx`          | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/MatchScoreSkeleton.tsx`       | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/MatchStateSheet.tsx`          | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/NoBallSheet.tsx`              | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/OverflowSheet.tsx`            | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/OverthrowSheet.tsx`           | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/PartnershipPanel.tsx`         | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/PenaltySheet.tsx`             | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/PlayingElevenPanel.tsx`       | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/ScheduledMatchRow.tsx`        | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/ScorecardPanel.tsx`           | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/ScorerLiveCard.tsx`           | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/ScorerMatchHeader.tsx`        | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/ScoringPad.tsx`               | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/StandingsPane.tsx`            | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/StatsPanel.tsx`               | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/TossPendingCard.tsx`          | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/ViewOnlyPad.tsx`              | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/WicketSheet.tsx`              | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/WicketSummaryScreen.tsx`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/WideBallSheet.tsx`            | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/matches/ui/ZonePickerSheet.tsx`          | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:notifications/api (2)` (2 files)

| Current path                                         | Proposed | Reason                                                                   |
| ---------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/notifications/api/deviceTokenApi.ts`   | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/notifications/api/notificationsApi.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:notifications/lib (2)` (2 files)

| Current path                                             | Proposed | Reason                                                                   |
| -------------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/notifications/lib/useAppDeepLink.ts`       | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/notifications/lib/usePushNotifications.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:notifications/model (2)` (2 files)

| Current path                                       | Proposed | Reason                                                                   |
| -------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/notifications/model/schemas.test.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/notifications/model/schemas.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:notifications/pages (1)` (1 files)

| Current path                                             | Proposed | Reason                                                                   |
| -------------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/notifications/pages/NotificationsPage.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:notifications/routing (2)` (2 files)

| Current path                           | Proposed | Reason                                                                   |
| -------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/notifications/index.ts`  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/notifications/routes.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:notifications/test (1)` (1 files)

| Current path                                  | Proposed | Reason                                                                   |
| --------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/notifications/test/handlers.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:pages/pages (5)` (5 files)

| Current path                               | Proposed | Reason                                                                   |
| ------------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/pages/api/staticPagesApi.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/pages/index.ts`              | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/pages/lib/slugs.ts`          | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/pages/pages/StaticPage.tsx`  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/pages/routes.ts`             | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:profile/api (1)` (1 files)

| Current path                             | Proposed | Reason                                                                   |
| ---------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/profile/api/profileApi.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:profile/lib (2)` (2 files)

| Current path                                     | Proposed | Reason                                                                   |
| ------------------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/profile/lib/resolveHandle.test.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/profile/lib/resolveHandle.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:profile/model (2)` (2 files)

| Current path                                 | Proposed | Reason                                                                   |
| -------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/profile/model/schemas.test.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/profile/model/schemas.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:profile/pages (3)` (3 files)

| Current path                                       | Proposed | Reason                                                                   |
| -------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/profile/pages/EditProfilePage.tsx`   | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/profile/pages/PublicProfilePage.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/profile/pages/YouPage.tsx`           | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:profile/routing (2)` (2 files)

| Current path                     | Proposed | Reason                                                                   |
| -------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/profile/index.ts`  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/profile/routes.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:profile/test (1)` (1 files)

| Current path                            | Proposed | Reason                                                                   |
| --------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/profile/test/handlers.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:profile/ui (3)` (3 files)

| Current path                                  | Proposed | Reason                                                                   |
| --------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/profile/ui/EditProfileForm.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/profile/ui/ProfileHeader.tsx`   | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/profile/ui/ReelGrid.tsx`        | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:ranking/api (1)` (1 files)

| Current path                             | Proposed | Reason                                                                   |
| ---------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/ranking/api/rankingApi.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:ranking/lib (1)` (1 files)

| Current path                            | Proposed | Reason                                                                   |
| --------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/ranking/lib/constants.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:ranking/model (2)` (2 files)

| Current path                                 | Proposed | Reason                                                                   |
| -------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/ranking/model/schemas.test.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/ranking/model/schemas.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:ranking/pages (2)` (2 files)

| Current path                                      | Proposed | Reason                                                                   |
| ------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/ranking/pages/RankingPage.tsx`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/ranking/pages/RankingStatsPage.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:ranking/routing (2)` (2 files)

| Current path                     | Proposed | Reason                                                                   |
| -------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/ranking/index.ts`  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/ranking/routes.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:ranking/test (1)` (1 files)

| Current path                            | Proposed | Reason                                                                   |
| --------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/ranking/test/handlers.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:ranking/ui (1)` (1 files)

| Current path                                 | Proposed | Reason                                                                   |
| -------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/ranking/ui/RankingSection.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:reels/api (1)` (1 files)

| Current path                         | Proposed | Reason                                                                   |
| ------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/reels/api/reelsApi.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:reels/lib (12)` (12 files)

| Current path                                      | Proposed | Reason                                                                   |
| ------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/reels/lib/extractReelPoster.ts`     | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/reels/lib/inlineVideo.ts`           | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/reels/lib/publishReel.ts`           | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/reels/lib/reelPlayerWindow.test.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/reels/lib/reelPlayerWindow.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/reels/lib/reelUploadSession.ts`     | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/reels/lib/reelVideoFormats.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/reels/lib/uploadReelPart.ts`        | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/reels/lib/useReelHls.test.ts`       | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/reels/lib/useReelHls.ts`            | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/reels/lib/useReelPrefetch.test.ts`  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/reels/lib/useReelPrefetch.ts`       | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:reels/model (2)` (2 files)

| Current path                               | Proposed | Reason                                                                   |
| ------------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/reels/model/schemas.test.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/reels/model/schemas.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:reels/pages (2)` (2 files)

| Current path                                  | Proposed | Reason                                                                   |
| --------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/reels/pages/CreateReelPage.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/reels/pages/ReelsPage.tsx`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:reels/routing (2)` (2 files)

| Current path                   | Proposed | Reason                                                                   |
| ------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/reels/index.ts`  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/reels/routes.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:reels/test (1)` (1 files)

| Current path                          | Proposed | Reason                                                                   |
| ------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/reels/test/handlers.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:reels/ui (5)` (5 files)

| Current path                                         | Proposed | Reason                                                                   |
| ---------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/reels/ui/ReelActions.tsx`              | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/reels/ui/ReelCaption.tsx`              | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/reels/ui/ReelCommentSheet.tsx`         | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/reels/ui/ReelSlide.tsx`                | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/reels/ui/ReelUploadProgressDialog.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:shop/api (2)` (2 files)

| Current path                             | Proposed | Reason                                                                   |
| ---------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/shop/api/shopApi.ts`       | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/api/vendorShopApi.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:shop/lib (2)` (2 files)

| Current path                         | Proposed | Reason                                                                   |
| ------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/shop/lib/money.ts`     | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/lib/shopPaths.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:shop/model (2)` (2 files)

| Current path                              | Proposed | Reason                                                                   |
| ----------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/shop/model/schemas.test.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/model/schemas.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:shop/pages (21)` (21 files)

| Current path                                        | Proposed | Reason                                                                   |
| --------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/shop/pages/CartPage.tsx`              | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/pages/CheckoutPage.tsx`          | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/pages/OrderDetailPage.tsx`       | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/pages/OrderSuccessPage.tsx`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/pages/OrdersPage.tsx`            | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/pages/ProductDetailPage.tsx`     | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/pages/SellerApplyPage.tsx`       | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/pages/SellerBrandsPage.tsx`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/pages/SellerCategoriesPage.tsx`  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/pages/SellerHubPage.tsx`         | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/pages/SellerOrderDetailPage.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/pages/SellerOrdersPage.tsx`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/pages/SellerProductFormPage.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/pages/SellerProductsPage.tsx`    | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/pages/SellerStorePage.tsx`       | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/pages/ShopBrandPage.tsx`         | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/pages/ShopFilterPage.tsx`        | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/pages/ShopHomePage.tsx`          | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/pages/ShopSlugPage.tsx`          | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/pages/ShopVendorPage.tsx`        | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/pages/ShopVendorRedirect.tsx`    | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:shop/routing (2)` (2 files)

| Current path                  | Proposed | Reason                                                                   |
| ----------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/shop/index.ts`  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/routes.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:shop/test (1)` (1 files)

| Current path                         | Proposed | Reason                                                                   |
| ------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/shop/test/handlers.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:shop/ui (11)` (11 files)

| Current path                                    | Proposed | Reason                                                                   |
| ----------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/shop/ui/BrandRail.tsx`            | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/ui/CartLink.tsx`             | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/ui/CategoryChips.tsx`        | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/ui/MoneyRows.tsx`            | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/ui/ProductCard.tsx`          | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/ui/ProductGrid.tsx`          | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/ui/QuantityStepper.tsx`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/ui/SellerBrandDialog.tsx`    | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/ui/SellerCategoryDialog.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/ui/SellerContactCard.tsx`    | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/shop/ui/ShopSectionHeader.tsx`    | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:stats/api (1)` (1 files)

| Current path                         | Proposed | Reason                                                                   |
| ------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/stats/api/statsApi.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:stats/lib (1)` (1 files)

| Current path                       | Proposed | Reason                                                                   |
| ---------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/stats/lib/format.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:stats/model (2)` (2 files)

| Current path                               | Proposed | Reason                                                                   |
| ------------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/stats/model/schemas.test.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/stats/model/schemas.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:stats/pages (1)` (1 files)

| Current path                             | Proposed | Reason                                                                   |
| ---------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/stats/pages/StatsPage.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:stats/routing (1)` (1 files)

| Current path                  | Proposed | Reason                                                                   |
| ----------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/stats/index.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:stats/test (1)` (1 files)

| Current path                          | Proposed | Reason                                                                   |
| ------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/stats/test/handlers.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:stats/ui (1)` (1 files)

| Current path                             | Proposed | Reason                                                                   |
| ---------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/stats/ui/ProfileStats.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:support/api (1)` (1 files)

| Current path                             | Proposed | Reason                                                                   |
| ---------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/support/api/supportApi.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:support/lib (1)` (1 files)

| Current path                                 | Proposed | Reason                                                                   |
| -------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/support/lib/supportContact.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:support/pages (1)` (1 files)

| Current path                                 | Proposed | Reason                                                                   |
| -------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/support/pages/SupportPage.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:support/routing (1)` (1 files)

| Current path                    | Proposed | Reason                                                                   |
| ------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/support/index.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:support/test (1)` (1 files)

| Current path                            | Proposed | Reason                                                                   |
| --------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/support/test/handlers.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:tournaments/api (1)` (1 files)

| Current path                                     | Proposed | Reason                                                                   |
| ------------------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/tournaments/api/tournamentsApi.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:tournaments/lib (4)` (4 files)

| Current path                                            | Proposed | Reason                                                                   |
| ------------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/tournaments/lib/createTournamentSteps.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/lib/nextAction.ts`            | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/lib/workspaceView.test.ts`    | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/lib/workspaceView.ts`         | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:tournaments/model (11)` (11 files)

| Current path                                              | Proposed | Reason                                                                   |
| --------------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/tournaments/model/matchSchemas.test.ts`     | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/model/matchSchemas.ts`          | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/model/schemas.test.ts`          | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/model/schemas.ts`               | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/model/seasonStatsSchemas.ts`    | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/model/squadSchemas.test.ts`     | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/model/squadSchemas.ts`          | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/model/standingsSchemas.test.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/model/standingsSchemas.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/model/teamSchemas.test.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/model/teamSchemas.ts`           | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:tournaments/other (2)` (2 files)

| Current path                                       | Proposed | Reason                                                                   |
| -------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/tournaments/TournamentRedirects.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/tournamentPaths.ts`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:tournaments/pages (7)` (7 files)

| Current path                                                 | Proposed | Reason                                                                   |
| ------------------------------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `src/features/tournaments/pages/CreateTournamentPage.tsx`    | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/pages/PublicTournamentPage.tsx`    | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/pages/SquadEditorPage.tsx`         | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/pages/TournamentDetailPage.tsx`    | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/pages/TournamentWorkspacePage.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/pages/TournamentsListPage.tsx`     | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/pages/UpcomingTournamentsPage.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:tournaments/routing (2)` (2 files)

| Current path                          | Proposed | Reason                                                                   |
| ------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/tournaments/index.ts`   | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/routes.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:tournaments/test (1)` (1 files)

| Current path                                | Proposed | Reason                                                                   |
| ------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/tournaments/test/handlers.ts` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `feature:tournaments/ui (10)` (10 files)

| Current path                                               | Proposed | Reason                                                                   |
| ---------------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/features/tournaments/ui/CreateTournamentWizard.tsx`   | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/ui/ManageTeamDialog.tsx`         | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/ui/PublicTournamentLiveTab.tsx`  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/ui/PublicTournamentStatsTab.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/ui/PublicTournamentTableTab.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/ui/TournamentCard.test.tsx`      | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/ui/TournamentCard.tsx`           | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/ui/TournamentFixturesPanel.tsx`  | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/ui/TournamentStandingsTable.tsx` | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |
| `src/features/tournaments/ui/TournamentTeamsPanel.tsx`     | _(keep)_ | Keep — feature module already follows api/model/lib/ui/pages/test/routes |

### `mockups (2)` (2 files)

| Current path                        | Proposed | Reason |
| ----------------------------------- | -------- | ------ |
| `mockups/Tapeya-All-Screens-2.html` | _(keep)_ | Keep   |
| `mockups/Tapeya-All-Screens.html`   | _(keep)_ | Keep   |

### `platform/android (219)` (219 files)

| Current path                                                                           | Proposed | Reason                                                                                |
| -------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| `android/.gitignore`                                                                   | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/.gitignore`                                                               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/build.gradle`                                                             | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/capacitor.build.gradle`                                                   | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/google-services.json`                                                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/proguard-rules.pro`                                                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/androidTest/java/com/getcapacitor/myapp/ExampleInstrumentedTest.java` | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/AndroidManifest.xml`                                             | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/capacitor.config.json`                                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/capacitor.plugins.json`                                   | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/AddQuickMatchPlayerSheet-gHP2f_qt.js`       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/Alert-DueV2Ps1.js`                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/AuthShell-BI1qSyWh.js`                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/BallChip-DhWutnGz.js`                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/CartLink-DHA6gazS.js`                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/CartPage-mQ9G2Gmo.js`                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/Checkbox-V7gn906r.js`                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/CheckoutPage-BT79-PHi.js`                   | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/CountryCityFields-DR3jVVdv.js`              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/CreatePostPage-D7bKGlqP.js`                 | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/CreateReelPage-MVC75ySs.js`                 | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/CreateTournamentPage-B6uaY6kH.js`           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/DatePicker-Dwnti6Hm.js`                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/DiscoverPage-DRxXLPpq.js`                   | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/EditProfilePage-Bpl80NEp.js`                | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/EntertainmentDetailPage-B4pgEet8.js`        | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/EntertainmentEpisodePage-THO8uVNP.js`       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/EntertainmentPage-IeUPugvC.js`              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/FeedPage-Bdbi0viN.css`                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/FeedPage-CmfU9dsL.js`                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/Form-CjeEQI5b.js`                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/GoLiveOnAirPage-BwHtn_EX.js`                | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/GoLivePage-BN1BZPDu.js`                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/HighlightDetailPage-DMwnlzVt.js`            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/HighlightThumb-DSL11ySO.js`                 | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/HighlightsPage-dMtDuQAF.js`                 | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/IconButton-BQQOSVHu.js`                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/ImmersiveLandscapeStage-Ss0igCFB.js`        | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/Input-CZw_fg4j.js`                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/InterestPage-Cne-gbt6.js`                   | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/LiveBadge-DnOXZxqa.js`                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/LiveHubPage-CbQfiKu_.js`                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/LoginPage-D4dGsorM.js`                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/MatchBroadcastGraphicsPage-ri8KBFWU.js`     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/MatchCardPage-B1VIxpvT.js`                  | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/MatchScorePage-CEef76Ym.js`                 | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/MatchSettingsPage-BANDK5QP.js`              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/MatchTossPage-Ce1RqYhO.js`                  | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/MatchesListPage-DVPBjLGY.js`                | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/MoneyRows-Bjw-r5Aq.js`                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/NotificationsPage-C-YopHqr.js`              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/NumberStepper-iy_D8GC2.js`                  | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/OrderDetailPage-BignPCHC.js`                | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/OrderSuccessPage-CxYkGFIz.js`               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/OrdersPage-D-2eglRr.js`                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/OtpPage-7QYOTDVC.js`                        | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/PhoneField-CFvVhcJo.js`                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/PostCard-ClOt4gnB.js`                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/PostDetailPage-CmK-Mp8y.js`                 | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/ProductDetailPage-BRWhZdGY.js`              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/ProductGrid-CWxlBYJR.js`                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/PublicProfilePage-CcbcALHD.js`              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/PublicTournamentPage-BSqw1nSY.js`           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/QuickMatchPage-C2-gaiY8.js`                 | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/RadioGroup-WEWgWOR_.js`                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/RankingPage-2Rz9WAJi.js`                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/RankingStatsPage-BTaIcwQn.js`               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/ReelSlide-CefTTkjz.js`                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/ReelsPage-DD8LpdzW.js`                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/RegisterPage-5OuVlHNF.js`                   | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/ScorecardHubPage-CclPoHKF.js`               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/Scrubber-qjgCUiA9.js`                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/SearchBar-B38C7_Ji.js`                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/SellerApplyPage-G6oWkgdH.js`                | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/SellerBrandDialog-DT0nUULz.js`              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/SellerBrandsPage-C1pExxV-.js`               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/SellerCategoriesPage-DzjucrJU.js`           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/SellerCategoryDialog-OCSRqSJ-.js`           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/SellerContactCard-i_Z4Zp4n.js`              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/SellerHubPage-DDmoxtZ7.js`                  | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/SellerOrderDetailPage-B7nVEK2G.js`          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/SellerOrdersPage-1oqkI06e.js`               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/SellerProductFormPage-DELpuSdj.js`          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/SellerProductsPage-Cb9DbjCk.js`             | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/SellerStorePage-CI-2i_pF.js`                | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/ShopBrandPage-CJH-oH_V.js`                  | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/ShopFilterPage-Bva8cjov.js`                 | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/ShopHomePage-Cvvj9RXW.js`                   | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/ShopSlugPage-CRqu0sFB.js`                   | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/ShopVendorRedirect-CPg2j1E8.js`             | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/SquadEditorPage-4ChhwcxT.js`                | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/StartMatchPage-CS1RN1hl.js`                 | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/StaticPage-DJWgw_Og.js`                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/StatsPage-D6OkVXmw.js`                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/StatsPanel-C_--NS27.js`                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/StatusBadge-B90mItvr.js`                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/StickyActionBar-DUPVRxsr.js`                | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/StreamHostRow-BvAafzzB.js`                  | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/SuggestedUserRow-pVpF878t.js`               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/SupportPage-BF9tmKIn.js`                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/Switch-B2ZNk2KI.js`                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/Tabs-CMbZfUz7.js`                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/ThemeToggle-C8pJD2ol.js`                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/TournamentDetailPage-DqEGP6O_.js`           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/TournamentsListPage-iYUTpRCY.js`            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/UiShowcasePage-QnuyJ7A3.js`                 | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/UpcomingTournamentsPage-CEU64d8z.js`        | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/WatchPage-DNJ8RQlo.js`                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/YouPage-Erq-rDrR.js`                        | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/commentComposeChrome-CUoz_Ygw.js`           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/dist-Btb5Jv1E.js`                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/entertainmentPaths-CD4JuN_w.js`             | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/errors-DgAgTDqL.js`                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/esm-AS2f8nPk.js`                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/esm-Bf5ITKgS.js`                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/feed-SzfVubcl.js`                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/helpers-D_ihgQr4.js`                        | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/hls-LX1QUbY1.js`                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/homeApi-EnLdvGCl.js`                        | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/hooks-BA3QOM3P.js`                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/index-DvNYTZa4.css`                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/index-mPRlKPnn.js`                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/interestApi-Dm7uNGYQ.js`                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/justRegistered-C4N9asEY.js`                 | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/layout-BWt5OwHg.js`                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/location-6SYPP1Vg.js`                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/matchesApi-1dGPPIbY.js`                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/mediaApi-CIw44Aiz.js`                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/mergeCursorPages-Co_FFZdJ.js`               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/money-DlnufjZ0.js`                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/paths-NysK20Js.js`                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/phone-DgZs9Nsk.js`                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/preload-helper-Czpn1I53.js`                 | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/reelUploadSession-Df_GF8dD.js`              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/reelsApi-BMH3W3SL.js`                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/routes-0d0Gxoin.js`                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/routes-BIbqR2EU.js`                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/share-BcvXylPn.js`                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/shopPaths-BazJysLW.js`                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/states-C05Jr6ij.js`                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/systemSettingsApi-DkfgZnab.js`              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/toast-CHlhDcKX.js`                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/userProfilePath-_T_hYk0n.js`                | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/web-BP-1yMvb.js`                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/web-BqWUk5UL.js`                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/web-CB9fPul8.js`                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/web-CIa1Qgfs.js`                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/assets/web-JA_qF35_.js`                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/brand/tapeya-logo-dark.png`                        | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/brand/tapeya-logo-light.png`                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/cordova.js`                                        | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/cordova_plugins.js`                                | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/favicon.png`                                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/favicon.svg`                                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/assets/public/index.html`                                        | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/java/com/tapbytapeya/app/MainActivity.java`                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/drawable-land-hdpi/splash.png`                               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/drawable-land-mdpi/splash.png`                               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/drawable-land-xhdpi/splash.png`                              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/drawable-land-xxhdpi/splash.png`                             | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/drawable-land-xxxhdpi/splash.png`                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/drawable-port-hdpi/splash.png`                               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/drawable-port-mdpi/splash.png`                               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/drawable-port-xhdpi/splash.png`                              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/drawable-port-xxhdpi/splash.png`                             | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/drawable-port-xxxhdpi/splash.png`                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/drawable-v24/ic_launcher_foreground.xml`                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/drawable/ic_launcher_background.xml`                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/drawable/splash.png`                                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/layout/activity_main.xml`                                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml`                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-hdpi/ic_launcher.png`                                 | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-hdpi/ic_launcher_background.png`                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png`                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-hdpi/ic_launcher_monochrome.png`                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png`                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-mdpi/ic_launcher.png`                                 | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-mdpi/ic_launcher_background.png`                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png`                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-mdpi/ic_launcher_monochrome.png`                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png`                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png`                                | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-xhdpi/ic_launcher_background.png`                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png`                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-xhdpi/ic_launcher_monochrome.png`                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png`                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png`                               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-xxhdpi/ic_launcher_background.png`                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png`                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-xxhdpi/ic_launcher_monochrome.png`                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png`                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`                              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_background.png`                   | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png`                   | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_monochrome.png`                   | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png`                        | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/values/ic_launcher_background.xml`                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/values/strings.xml`                                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/values/styles.xml`                                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/xml/config.xml`                                              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/main/res/xml/file_paths.xml`                                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/app/src/test/java/com/getcapacitor/myapp/ExampleUnitTest.java`                | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/build.gradle`                                                                 | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/capacitor-cordova-android-plugins/build.gradle`                               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/capacitor-cordova-android-plugins/cordova.variables.gradle`                   | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/capacitor-cordova-android-plugins/src/main/AndroidManifest.xml`               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/capacitor-cordova-android-plugins/src/main/java/.gitkeep`                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/capacitor-cordova-android-plugins/src/main/res/.gitkeep`                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/capacitor.settings.gradle`                                                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/gradle.properties`                                                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/gradle/wrapper/gradle-wrapper.jar`                                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/gradle/wrapper/gradle-wrapper.properties`                                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/gradlew`                                                                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/gradlew.bat`                                                                  | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/keystore.properties.example`                                                  | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/keystores/README.md`                                                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/settings.gradle`                                                              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `android/variables.gradle`                                                             | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |

### `platform/ios (197)` (197 files)

| Current path                                                                                               | Proposed | Reason                                                                                |
| ---------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| `ios/.gitignore`                                                                                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App.xcodeproj/project.pbxproj`                                                                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App.xcodeproj/project.xcworkspace/xcshareddata/IDEWorkspaceChecks.plist`                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved`                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App.xcodeproj/project.xcworkspace/xcuserdata/muhammad.xcuserdatad/UserInterfaceState.xcuserstate` | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App.xcodeproj/xcuserdata/muhammad.xcuserdatad/xcschemes/xcschememanagement.plist`                 | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/AppDelegate.swift`                                                                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/.DS_Store`                                                                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-20@2x.png`                                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-20@2x~ipad.png`                                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-20@3x.png`                                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-20~ipad.png`                                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-29.png`                                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-29@2x.png`                                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-29@2x~ipad.png`                                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-29@3x.png`                                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-29~ipad.png`                                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-40@2x.png`                                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-40@2x~ipad.png`                                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-40@3x.png`                                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-40~ipad.png`                                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-60@2x~car.png`                                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-60@3x~car.png`                                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-83.5@2x~ipad.png`                                  | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon@2x.png`                                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon@2x~ipad.png`                                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon@3x.png`                                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon~ios-marketing.png`                                 | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon~ipad.png`                                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json`                                             | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/Contents.json`                                                                | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/SplashBrand.imageset/Contents.json`                                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/SplashBrand.imageset/splash-2732x2732-1.png`                                  | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/SplashBrand.imageset/splash-2732x2732-2.png`                                  | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Assets.xcassets/SplashBrand.imageset/splash-2732x2732.png`                                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Base.lproj/LaunchScreen.storyboard`                                                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Base.lproj/Main.storyboard`                                                                   | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/Info.plist`                                                                                   | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/SceneDelegate.swift`                                                                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/capacitor.config.json`                                                                        | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/config.xml`                                                                                   | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/AddQuickMatchPlayerSheet-DMlfcRrJ.js`                                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/Alert-DueV2Ps1.js`                                                              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/AuthShell-BI1qSyWh.js`                                                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/BallChip-DhWutnGz.js`                                                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/CartLink-Bc_nbhs1.js`                                                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/CartPage-DEqlb2Eb.js`                                                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/Checkbox-V7gn906r.js`                                                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/CheckoutPage-38zV3T7B.js`                                                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/CountryCityFields-DR3jVVdv.js`                                                  | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/CreatePostPage-CHgw3Y-8.js`                                                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/CreateReelPage-8Ck9Eao_.js`                                                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/CreateTournamentPage-DrdT8mvg.js`                                               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/DatePicker-Dwnti6Hm.js`                                                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/DiscoverPage-CTZXkAnM.js`                                                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/EditProfilePage-B_ub8a79.js`                                                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/EntertainmentDetailPage-Dg4bh0Tu.js`                                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/EntertainmentEpisodePage-BAxYj9VT.js`                                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/EntertainmentPage-BBG5SllI.js`                                                  | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/FeedPage-Bdbi0viN.css`                                                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/FeedPage-cqrwl2HE.js`                                                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/Form-CjeEQI5b.js`                                                               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/GoLiveOnAirPage-DmR9TWdU.js`                                                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/GoLivePage-DrUu9AaW.js`                                                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/HighlightDetailPage-CJll5EjA.js`                                                | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/HighlightThumb-DSL11ySO.js`                                                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/HighlightsPage-DHbSiRnv.js`                                                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/IconButton-BQQOSVHu.js`                                                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/ImmersiveLandscapeStage-BuELEMd9.js`                                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/Input-CZw_fg4j.js`                                                              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/InterestPage-D-nbHYpx.js`                                                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/LiveBadge-DnOXZxqa.js`                                                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/LiveHubPage-C3TF-8zi.js`                                                        | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/LoginPage-D4dGsorM.js`                                                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/MatchBroadcastGraphicsPage-DoQTApEN.js`                                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/MatchCardPage-B9jGGQ--.js`                                                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/MatchScorePage-8KlP08DE.js`                                                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/MatchSettingsPage-CpIU4Njn.js`                                                  | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/MatchTossPage-Dv43PLY7.js`                                                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/MatchesListPage-e4sEOufE.js`                                                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/MediaActionRow-CKVwZuC-.js`                                                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/MoneyRows-Bjw-r5Aq.js`                                                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/NotificationsPage-vABw90kK.js`                                                  | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/NumberStepper-iy_D8GC2.js`                                                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/OrderDetailPage-BhiL1LqV.js`                                                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/OrderSuccessPage-DzeqKnPK.js`                                                   | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/OrdersPage-C9LcDdek.js`                                                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/OtpPage-7QYOTDVC.js`                                                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/PhoneField-CFvVhcJo.js`                                                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/PostCard-CHqZxzVt.js`                                                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/PostDetailPage-SiwOiMAp.js`                                                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/ProductDetailPage-YZPBvceq.js`                                                  | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/ProductGrid-CWxlBYJR.js`                                                        | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/PublicProfilePage-CHzJGnuv.js`                                                  | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/PublicTournamentPage-CFeZtGKV.js`                                               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/QuickMatchPage-w_tcu9mZ.js`                                                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/RadioGroup-CFU4LHq_.js`                                                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/RankingPage-zpAYoCFf.js`                                                        | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/RankingStatsPage-KlOmcjMl.js`                                                   | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/ReelSlide-p3VZEkvz.js`                                                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/ReelsPage-CoIKjJiu.js`                                                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/RegisterPage-5OuVlHNF.js`                                                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/ScorecardHubPage-BTupckMB.js`                                                   | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/Scrubber-qjgCUiA9.js`                                                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/SearchBar-B38C7_Ji.js`                                                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/SellerApplyPage-DVOaKuiB.js`                                                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/SellerBrandDialog-WmHhSNbd.js`                                                  | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/SellerBrandsPage-BBMek6Xx.js`                                                   | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/SellerCategoriesPage-BDW1GKyG.js`                                               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/SellerCategoryDialog-CSeU0QXC.js`                                               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/SellerContactCard-i_Z4Zp4n.js`                                                  | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/SellerHubPage-rpY_suBH.js`                                                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/SellerOrderDetailPage-D8iEVfgt.js`                                              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/SellerOrdersPage-DsbtpHvk.js`                                                   | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/SellerProductFormPage-DjI0b3B_.js`                                              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/SellerProductsPage-Tp8LUL-R.js`                                                 | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/SellerStorePage-C4Jy3whi.js`                                                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/ShopBrandPage-DiJlrufH.js`                                                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/ShopFilterPage-DOMjHzMx.js`                                                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/ShopHomePage-DGejt4ZQ.js`                                                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/ShopSlugPage-BuH8qbIh.js`                                                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/ShopVendorRedirect-CPg2j1E8.js`                                                 | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/SquadEditorPage-B3lOu7F5.js`                                                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/StartMatchPage-DUy8PNLv.js`                                                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/StaticPage-DxpS_yVg.js`                                                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/StatsPage-DVlyiq7e.js`                                                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/StatsPanel-CGZ0ooHY.js`                                                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/StatusBadge-B90mItvr.js`                                                        | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/StickyActionBar-DUPVRxsr.js`                                                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/StreamHostRow-eVN74-7h.js`                                                      | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/SuggestedUserRow-pVpF878t.js`                                                   | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/SupportPage-BQ6ihD_L.js`                                                        | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/Switch-B2ZNk2KI.js`                                                             | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/Tabs-DTGRMe_a.js`                                                               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/ThemeToggle-C8pJD2ol.js`                                                        | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/TournamentDetailPage-CAYm6OBI.js`                                               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/TournamentsListPage-BuTwObvE.js`                                                | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/UiShowcasePage-CZ2PKt5F.js`                                                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/UpcomingTournamentsPage-xiSIU-0r.js`                                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/WatchPage-Bpt6HRah.js`                                                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/YouPage-O1NH_DnL.js`                                                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/commentComposeChrome-CUoz_Ygw.js`                                               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/dist-Btb5Jv1E.js`                                                               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/entertainmentPaths-CD4JuN_w.js`                                                 | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/errors-DgAgTDqL.js`                                                             | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/esm-AS2f8nPk.js`                                                                | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/esm-Bf5ITKgS.js`                                                                | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/feed-B-jUD77W.js`                                                               | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/helpers-D_ihgQr4.js`                                                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/hls-LX1QUbY1.js`                                                                | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/homeApi-EnLdvGCl.js`                                                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/hooks-BA3QOM3P.js`                                                              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/index-Bv9hZ2bk.js`                                                              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/index-DeYXxFzX.css`                                                             | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/interestApi-Dm7uNGYQ.js`                                                        | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/justRegistered-C4N9asEY.js`                                                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/layout-FAwpXGx3.js`                                                             | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/location-6SYPP1Vg.js`                                                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/matchesApi-1dGPPIbY.js`                                                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/mediaApi-CIw44Aiz.js`                                                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/mergeCursorPages-Co_FFZdJ.js`                                                   | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/money-DlnufjZ0.js`                                                              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/paths-NysK20Js.js`                                                              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/phone-DgZs9Nsk.js`                                                              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/preload-helper-Czpn1I53.js`                                                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/reelUploadSession-Df_GF8dD.js`                                                  | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/reelsApi-BMH3W3SL.js`                                                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/routes-DA_A3GGC.js`                                                             | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/routes-DxIbQ2hp.js`                                                             | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/share-iff5V35e.js`                                                              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/shopPaths-BazJysLW.js`                                                          | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/states-C05Jr6ij.js`                                                             | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/systemSettingsApi-DkfgZnab.js`                                                  | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/toast-CHlhDcKX.js`                                                              | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/userProfilePath-_T_hYk0n.js`                                                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/web-BP-1yMvb.js`                                                                | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/web-BqWUk5UL.js`                                                                | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/web-CB9fPul8.js`                                                                | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/web-CIa1Qgfs.js`                                                                | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/web-D4cnqPKq.js`                                                                | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/assets/web-JA_qF35_.js`                                                                | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/brand/tapeya-logo-dark.png`                                                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/brand/tapeya-logo-light.png`                                                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/cordova.js`                                                                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/cordova_plugins.js`                                                                    | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/favicon.png`                                                                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/favicon.svg`                                                                           | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/App/public/index.html`                                                                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/CapApp-SPM/.gitignore`                                                                            | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/CapApp-SPM/.swiftpm/xcode/xcuserdata/muhammad.xcuserdatad/xcschemes/xcschememanagement.plist`     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/CapApp-SPM/Package.swift`                                                                         | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/CapApp-SPM/README.md`                                                                             | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/App/CapApp-SPM/Sources/CapApp-SPM/CapApp-SPM.swift`                                                   | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/capacitor-cordova-ios-plugins/CordovaPluginsResources.podspec`                                        | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/capacitor-cordova-ios-plugins/resources/.gitkeep`                                                     | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/capacitor-cordova-ios-plugins/sources/.gitkeep`                                                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |
| `ios/debug.xcconfig`                                                                                       | _(keep)_ | Keep — Capacitor native projects (do not reorganize generated plugin wiring casually) |

### `resources (1)` (1 files)

| Current path         | Proposed | Reason |
| -------------------- | -------- | ------ |
| `resources/icon.png` | _(keep)_ | Keep   |

### `shared/api (13)` (13 files)

| Current path                          | Proposed | Reason                                                   |
| ------------------------------------- | -------- | -------------------------------------------------------- |
| `src/shared/api/baseApi.ts`           | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/api/enumsApi.ts`          | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/api/enumsHandlers.ts`     | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/api/envelope.ts`          | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/api/errors.test.ts`       | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/api/errors.ts`            | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/api/locationApi.ts`       | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/api/locationHandlers.ts`  | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/api/mediaApi.ts`          | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/api/mergeCursorPages.ts`  | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/api/systemSettingsApi.ts` | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/api/types.ts`             | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/api/unwrap.ts`            | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |

### `shared/config (8)` (8 files)

| Current path                       | Proposed | Reason                                                   |
| ---------------------------------- | -------- | -------------------------------------------------------- |
| `src/shared/config/env.ts`         | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/config/paths.test.ts`  | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/config/paths.ts`       | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/config/realtime.ts`    | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/config/sentry.ts`      | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/config/theme.tsx`      | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/config/themeBoot.d.ts` | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/config/themeBoot.js`   | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |

### `shared/dialogs (9)` (9 files)

| Current path                                  | Proposed | Reason                                                   |
| --------------------------------------------- | -------- | -------------------------------------------------------- |
| `src/shared/dialogs/BaseDialog.tsx`           | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/dialogs/ConfirmDialog.tsx`        | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/dialogs/DialogHost.tsx`           | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/dialogs/SessionExpiredDialog.tsx` | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/dialogs/dialogStore.ts`           | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/dialogs/helpers.ts`               | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/dialogs/index.ts`                 | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/dialogs/registry.ts`              | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/dialogs/useDialog.ts`             | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |

### `shared/hooks (3)` (3 files)

| Current path                            | Proposed | Reason                                                   |
| --------------------------------------- | -------- | -------------------------------------------------------- |
| `src/shared/hooks/useCountryCity.ts`    | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/hooks/useCursorSentinel.ts` | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/hooks/useDebounce.ts`       | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |

### `shared/layout (20)` (20 files)

| Current path                                | Proposed | Reason                                                   |
| ------------------------------------------- | -------- | -------------------------------------------------------- |
| `src/shared/layout/BottomNav.tsx`           | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/layout/MainDrawer.tsx`          | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/layout/ScreenBar.tsx`           | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/layout/SectionLabel.tsx`        | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/layout/ShellContext.tsx`        | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/layout/ShellRail.tsx`           | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/layout/ShellScrollport.test.ts` | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/layout/ShellScrollport.tsx`     | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/layout/SideNav.tsx`             | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/layout/SideRail.tsx`            | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/layout/TopBar.tsx`              | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/layout/index.ts`                | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/layout/navConfig.ts`            | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/layout/navGroups.ts`            | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/layout/navMenu.tsx`             | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/layout/shellDrawerContext.ts`   | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/layout/shellRailContext.ts`     | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/layout/shellScroll.ts`          | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/layout/useShell.ts`             | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/layout/useShellRail.ts`         | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |

### `shared/lib (6)` (6 files)

| Current path                              | Proposed | Reason                                                   |
| ----------------------------------------- | -------- | -------------------------------------------------------- |
| `src/shared/lib/cdn.ts`                   | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/lib/cn.ts`                    | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/lib/deepLinks.test.ts`        | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/lib/deepLinks.ts`             | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/lib/safeInternalPath.test.ts` | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/lib/safeInternalPath.ts`      | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |

### `shared/native (17)` (17 files)

| Current path                                       | Proposed            | Reason                                                                     |
| -------------------------------------------------- | ------------------- | -------------------------------------------------------------------------- |
| `src/shared/native/KeyboardInsetProvider.tsx`      | _(keep)_            | Keep — shared kernel (ui/layout/api/native/store/config)                   |
| `src/shared/native/deviceOrientationPermission.ts` | DELETE (or archive) | Orphan — tilt priming leftover; useImmersiveLandscape no longer imports it |
| `src/shared/native/keepAwake.ts`                   | _(keep)_            | Keep — shared kernel (ui/layout/api/native/store/config)                   |
| `src/shared/native/keyboardInsetStore.ts`          | _(keep)_            | Keep — shared kernel (ui/layout/api/native/store/config)                   |
| `src/shared/native/orientation.ts`                 | _(keep)_            | Keep — shared kernel (ui/layout/api/native/store/config)                   |
| `src/shared/native/orientationSession.test.ts`     | _(keep)_            | Keep — shared kernel (ui/layout/api/native/store/config)                   |
| `src/shared/native/orientationSession.ts`          | _(keep)_            | Keep — shared kernel (ui/layout/api/native/store/config)                   |
| `src/shared/native/push.ts`                        | _(keep)_            | Keep — shared kernel (ui/layout/api/native/store/config)                   |
| `src/shared/native/secureStorage.ts`               | _(keep)_            | Keep — shared kernel (ui/layout/api/native/store/config)                   |
| `src/shared/native/share.ts`                       | _(keep)_            | Keep — shared kernel (ui/layout/api/native/store/config)                   |
| `src/shared/native/splash.ts`                      | _(keep)_            | Keep — shared kernel (ui/layout/api/native/store/config)                   |
| `src/shared/native/tapeyaBroadcast.ts`             | _(keep)_            | Keep — shared kernel (ui/layout/api/native/store/config)                   |
| `src/shared/native/useImmersiveLandscape.ts`       | _(keep)_            | Keep — shared kernel (ui/layout/api/native/store/config)                   |
| `src/shared/native/useKeepAwake.ts`                | _(keep)_            | Keep — shared kernel (ui/layout/api/native/store/config)                   |
| `src/shared/native/useKeyboardInset.ts`            | _(keep)_            | Keep — shared kernel (ui/layout/api/native/store/config)                   |
| `src/shared/native/useNativeAppVersions.ts`        | _(keep)_            | Keep — shared kernel (ui/layout/api/native/store/config)                   |
| `src/shared/native/useOrientationLock.ts`          | _(keep)_            | Keep — shared kernel (ui/layout/api/native/store/config)                   |

### `shared/other (7)` (7 files)

| Current path                                 | Proposed | Reason                                                   |
| -------------------------------------------- | -------- | -------------------------------------------------------- |
| `src/shared/model/enums.test.ts`             | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/model/enums.ts`                  | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/model/location.ts`               | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/platform/platform.ts`            | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/routing/termsGateExempt.test.ts` | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/routing/termsGateExempt.ts`      | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/types/index.ts`                  | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |

### `shared/store (5)` (5 files)

| Current path                           | Proposed | Reason                                                   |
| -------------------------------------- | -------- | -------------------------------------------------------- |
| `src/shared/store/authSession.test.ts` | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/store/authSession.ts`      | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/store/authSlice.ts`        | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/store/hooks.ts`            | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/store/store.ts`            | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |

### `shared/ui (45)` (45 files)

| Current path                                | Proposed | Reason                                                   |
| ------------------------------------------- | -------- | -------------------------------------------------------- |
| `src/shared/ui/Alert.tsx`                   | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/Avatar.tsx`                  | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/Badge.tsx`                   | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/BallChip.tsx`                | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/Button.tsx`                  | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/Card.tsx`                    | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/Checkbox.tsx`                | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/Chip.tsx`                    | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/CountryCityFields.tsx`       | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/DatePicker.tsx`              | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/DenseTable.tsx`              | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/DropdownMenu.tsx`            | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/Field.tsx`                   | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/Form.tsx`                    | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/IconButton.tsx`              | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/ImmersiveLandscapeStage.tsx` | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/Input.tsx`                   | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/ListRow.tsx`                 | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/LiveBadge.tsx`               | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/MediaActionRow.tsx`          | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/NumberStepper.tsx`           | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/Popover.tsx`                 | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/RadioGroup.tsx`              | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/Scrubber.tsx`                | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/SearchBar.tsx`               | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/Select.tsx`                  | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/SlidingText.tsx`             | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/Spinner.tsx`                 | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/StatusBadge.tsx`             | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/StickyActionBar.tsx`         | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/Switch.tsx`                  | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/Tabs.tsx`                    | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/ThemeToggle.tsx`             | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/TimePicker.tsx`              | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/commentComposeChrome.ts`     | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/index.ts`                    | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/media/MediaFrame.tsx`        | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/media/aspectRatios.ts`       | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/media/index.ts`              | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/states/States.tsx`           | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/states/index.ts`             | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/statusMeta.ts`               | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/toast/ToastHost.tsx`         | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/toast/index.ts`              | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |
| `src/shared/ui/toast/toastStore.ts`         | _(keep)_ | Keep — shared kernel (ui/layout/api/native/store/config) |

### `shared/ui/icons (65)` (65 files)

| Current path                               | Proposed | Reason                     |
| ------------------------------------------ | -------- | -------------------------- |
| `src/shared/ui/icons/BallIcon.tsx`         | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/BarChartIcon.tsx`     | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/BatIcon.tsx`          | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/BellIcon.tsx`         | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/BoltIcon.tsx`         | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/BookmarkIcon.tsx`     | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/BroadcastIcon.tsx`    | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/CalendarIcon.tsx`     | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/CartIcon.tsx`         | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/CheckIcon.tsx`        | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/ChevronDownIcon.tsx`  | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/ChevronLeftIcon.tsx`  | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/ChevronRightIcon.tsx` | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/ClipboardIcon.tsx`    | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/ClockIcon.tsx`        | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/CloseIcon.tsx`        | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/CommentIcon.tsx`      | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/DocumentIcon.tsx`     | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/DrawerIcon.tsx`       | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/DrawerNavIcons.tsx`   | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/ExclamationIcon.tsx`  | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/EyeIcon.tsx`          | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/FilmIcon.tsx`         | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/FlagIcon.tsx`         | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/HeartIcon.tsx`        | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/Icon.types.ts`        | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/InfoIcon.tsx`         | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/ListIcon.tsx`         | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/LiveIcon.tsx`         | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/LockIcon.tsx`         | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/MenuIcon.tsx`         | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/MinusIcon.tsx`        | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/MoonIcon.tsx`         | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/MoreIcon.tsx`         | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/NavGlyphs.tsx`        | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/PauseIcon.tsx`        | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/PencilIcon.tsx`       | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/PhotoIcon.tsx`        | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/PinIcon.tsx`          | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/PlayFillIcon.tsx`     | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/PlayIcon.tsx`         | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/PlusIcon.tsx`         | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/ProgressRingIcon.tsx` | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/QuickMatchIcon.tsx`   | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/RefreshIcon.tsx`      | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/RepostIcon.tsx`       | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/RotateIcon.tsx`       | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/ScoreboardIcon.tsx`   | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/SearchIcon.tsx`       | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/SendIcon.tsx`         | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/SettingsIcon.tsx`     | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/ShareIcon.tsx`        | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/StumpsIcon.tsx`       | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/SunIcon.tsx`          | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/ThumbsDownIcon.tsx`   | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/ThumbsUpIcon.tsx`     | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/TrashIcon.tsx`        | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/TrophyIcon.tsx`       | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/UndoIcon.tsx`         | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/UsersIcon.tsx`        | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/VideoIcon.tsx`        | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/WarningIcon.tsx`      | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/WhatsAppIcon.tsx`     | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/WifiOffIcon.tsx`      | _(keep)_ | Keep — shared icon catalog |
| `src/shared/ui/icons/index.ts`             | _(keep)_ | Keep — shared icon catalog |

### `src-root (3)` (3 files)

| Current path        | Proposed | Reason                  |
| ------------------- | -------- | ----------------------- |
| `src/index.css`     | _(keep)_ | Keep — review if unused |
| `src/main.tsx`      | _(keep)_ | Keep — review if unused |
| `src/vite-env.d.ts` | _(keep)_ | Keep — review if unused |

### `test-harness (3)` (3 files)

| Current path                       | Proposed | Reason                    |
| ---------------------------------- | -------- | ------------------------- |
| `src/test/renderWithProviders.tsx` | _(keep)_ | Keep — Vitest/MSW harness |
| `src/test/server.ts`               | _(keep)_ | Keep — Vitest/MSW harness |
| `src/test/setup.ts`                | _(keep)_ | Keep — Vitest/MSW harness |
