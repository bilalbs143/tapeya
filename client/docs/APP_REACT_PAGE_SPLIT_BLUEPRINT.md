# App-react page split blueprint

**Purpose:** One checklist for splitting every route screen the same way we already did for Create Reel, Start/Quick Match, Squad Editor, Tournament Workspace, Seller Order Detail, etc.

**Rule of work:** **One page (or one screen) per session / PR stream.** Do not batch five extractions in one pass. Finish → validate → mark ✅ here → pick the next row.

**Related:** [APP_REACT_BEST_PRACTICES.md](../../docs/APP_REACT_BEST_PRACTICES.md) · [APP_REACT_PAGE_LAYOUT.md](../../docs/APP_REACT_PAGE_LAYOUT.md) · [APP_REACT_FORM_MIGRATION.md](../../docs/APP_REACT_FORM_MIGRATION.md) · `.cursor/skills/client-standards/SKILL.md`

**Inventory date:** 2026-10-22 · **68** page/screen files across **17** features · **P0–P2 priority queue complete** (53 rows) · refresh inventory checkboxes as needed

---

## 1. Target shape (non-negotiable)

Every oversized or logic-heavy screen ends as a **composition root** plus thin layers:

```
features/<name>/
  pages/<Name>Page.tsx          # Route only: params, gates, ScreenBar, compose
  ui/use<Name>.ts               # State, queries, mutations, handlers (no JSX)
  ui/<Name>Body.tsx             # Main interactive UI (or *Form / *Steps / *Detail)
  ui/<Name>Panels.tsx           # Optional: large presentational chunks
  lib/<name>Helpers.ts          # Pure: constants, options, formatters, gates
  lib/<name>Helpers.test.ts     # Unit tests for pure helpers
```

| Layer                   | Owns                                                                                                     | Must not                                                          |
| ----------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Page**                | `useParams` / search params, loading·error·empty **gates**, `DockScreen`/`PageDock` + wiring hook → body | Business rules, long JSX forms, RTK `unwrap` soup                 |
| **Hook** (`ui/use*.ts`) | Local state, derived values, mutations, toasts, navigation side-effects                                  | Import other `ui/*` presentational components; return JSX         |
| **Body / Form / Steps** | Markup, fields, sticky bars, dialogs                                                                     | Own RTK queries that the page already gated (prefer props / hook) |
| **Lib**                 | Pure functions, option tables, copy builders, payload builders                                           | Import `ui/*` or React (except types)                             |

**Naming patterns we already use (pick one that fits):**

| Kind of screen    | Hook                                      | UI                        |
| ----------------- | ----------------------------------------- | ------------------------- |
| Multi-step flow   | `useCreateReelFlow`                       | `CreateReelSteps`         |
| Form wizard       | `useStartMatchForm` / `useQuickMatchForm` | `*FormBody`               |
| Detail + save     | `useSellerOrderDetail`                    | `SellerOrderDetailBody`   |
| Editor            | `useSquadTeamEditor`                      | `SquadTeamEditor`         |
| Workspace / hub   | `useTournamentWorkspace`                  | `TournamentWorkspaceBody` |
| Feed / list shell | `useReelsPage`                            | `ReelsPageBody`           |

**Hard rules**

1. **Lib never imports ui.** Types shared with UI live in `lib/` (or `model/`), not the other way around.
2. **Page stays composition root** — early returns for invalid id / loading / error / empty stay on the page (see `SellerProductFormPage`, `SellerOrderDetailPage`, `SquadEditorPage`).
3. **One job per file** — if Body exceeds ~350 lines, extract panels (versus card, roster, dialogs) like `QuickMatchSetupPanels`.
4. **Do not change behaviour** while splitting — move first; polish only if a bug is blocking validation.
5. **Forms:** RHF+Zod when the screen already uses them or the form is non-trivial; otherwise keep controlled state in the hook (Seller Order / Start Match pattern). Prefer `Form` + `Field` + `StickyActionBar` per layout docs.
6. **Screens in `ui/` that behave like pages** (`DeclareSquadScreen`, `MatchOverScreen`, …) follow the same split; keep the filename if routes import them.

---

## 2. Step-by-step recipe (every page)

Copy this checklist into the PR / chat when you start a page. Do **not** skip steps.

### Phase A — Map (read only)

1. [ ] `wc -l` the page; list top-level functions / types / constants.
2. [ ] Note existing `lib/` helpers and `ui/` pieces already used.
3. [ ] Classify: **gates-only**, **form**, **flow (steps)**, **workspace/hub**, **media/player**, **list**.
4. [ ] Decide file names (`useX`, `XBody` / `XForm` / `XSteps`, `lib/xHelpers`).

### Phase B — Extract (write)

5. [ ] Move **pure** constants / formatters / gates → `lib/*.ts` + **tests**.
6. [ ] Move state + side effects → `ui/use*.ts` (no JSX).
7. [ ] Move markup → `ui/*Body` (or Form / Steps / Detail / Panels).
8. [ ] Rewrite page to: gates + `DockScreen`/`PageDock` (or chrome inside body) + compose hook/body.
9. [ ] Preserve `key={entity.id}` on bodies when remount-on-id-change mattered.

### Phase C — Validate (must pass before ✅)

10. [ ] `npx prettier --write` on touched files.
11. [ ] `npx eslint --fix` on touched files (import sort).
12. [ ] `npm test -- <path-to-new-lib-tests>` (and any related feature tests).
13. [ ] `npx tsc -b --noEmit` — **no new errors** on the files you touched (ignore pre-existing noise elsewhere).
14. [ ] Smoke mentally: back nav, empty/error gates, primary CTA, footer still `DockScreen`/`PageDock` `footer` (layout doc).
15. [ ] Mark the row ✅ in **§5 inventory** and note line counts (before → after page).

**Stop condition:** If typecheck/tests fail because of the split, fix **this** page before starting another.

---

## 3. Per-page validation matrix

Use after every extract. All boxes required for ✅.

| Check     | Pass criteria                                                                                  |
| --------- | ---------------------------------------------------------------------------------------------- |
| Structure | Page is composition root; hook has no JSX; lib is pure                                         |
| Behaviour | Same routes, same mutations, same empty/error copy                                             |
| Forms     | Submit via `<form onSubmit>`; sticky CTA uses `form=` / `StickyActionBar` correctly            |
| A11y      | Icon buttons have labels; alerts use `role="alert"` where they did before                      |
| Imports   | No deep `@/features/*/*` from outside; lib ↛ ui                                                |
| Tests     | New pure helpers covered; existing feature tests still green                                   |
| Size      | Page typically **&lt; ~150** lines after split (gates + chrome); exceptions OK if already thin |

**Skip / N/A (still mark ✅ with note):**

- Redirect-only pages (`ShopVendorRedirect`) — leave as-is.
- Already-thin composition roots (&lt; ~80 lines, body already extracted) — verify pattern, don’t churn.
- Feature rename-only work (e.g. `pages` → `cms`) — mark structural ✅ separately.

---

## 4. Priority queue (do next, in order)

Work **top → bottom**. Re-sort only if product urgency overrides size.

### P0 — Largest remaining monoliths (~300+ lines)

| #   | Status | Page                         | Feature       | ~Lines | Suggested split                                                                                 |
| --- | ------ | ---------------------------- | ------------- | -----: | ----------------------------------------------------------------------------------------------- |
| 1   | [x]    | `MatchCardPage`              | matches       |     71 | `useMatchCard` + `MatchCardBody` + `lib/matchCard` (was 417)                                    |
| 2   | [x]    | `MatchBroadcastGraphicsPage` | matches       |     62 | `useBroadcastGraphics` + `MatchBroadcastGraphicsBody` + `lib/broadcastGraphics` (was 415)       |
| 3   | [x]    | `OtpPage`                    | auth          |     60 | `useOtpFlow` + `OtpForm` + `lib/otpFlow` (was 355)                                              |
| 4   | [x]    | `SellerHubPage`              | shop          |    108 | `useSellerHub` + `SellerHubBody` + `lib/sellerHub` (was 355)                                    |
| 5   | [x]    | `FeedPage`                   | feed          |     12 | `useFeedPage` + `FeedPageBody` + `lib/feedPage` (was 353)                                       |
| 6   | [x]    | `PublicTournamentPage`       | tournaments   |     61 | `usePublicTournament` + `PublicTournamentBody` + `lib/publicTournament` (was 349)               |
| 7   | [x]    | `WatchPage`                  | live          |     61 | `useWatchPage` + `WatchPageBody` + `lib/watchPage` (was 332)                                    |
| 8   | [x]    | `CreatePostPage`             | feed          |     16 | `useCreatePost` + `CreatePostFormBody` + `lib/createPost` (was 321)                             |
| 9   | [x]    | `InterestPage`               | interest      |     93 | `useInterestForm` + `InterestFormBody` + existing `InterestForm` + `lib/interestForm` (was 319) |
| 10  | [x]    | `MatchOverScreen`            | matches       |     55 | `useMatchOver` + `MatchOverBody` + `lib/matchOver` (screen stays in `ui/`; was 297)             |
| 11  | [x]    | `PostDetailPage`             | feed          |     33 | `usePostDetail` + `PostDetailBody` + `lib/postDetail` (was 291)                                 |
| 12  | [x]    | `HighlightDetailPage`        | highlights    |     73 | `useHighlightDetail` + `HighlightDetailBody` + `lib/highlightDetail` (was 290)                  |
| 13  | [x]    | `PublicProfilePage`          | profile       |     45 | `usePublicProfile` + `PublicProfileBody` + `lib/publicProfile` (was 271)                        |
| 14  | [x]    | `NotificationsPage`          | notifications |     31 | `useNotifications` + `NotificationsBody` + `lib/notificationsPage` (was 269)                    |
| 15  | [x]    | `GoLivePage`                 | live          |     16 | `useGoLiveForm` + `GoLiveFormBody` + `lib/goLiveForm` (on-air already split; was 261)           |
| 16  | [x]    | `SupportPage`                | support       |     18 | `useSupportForm` + `SupportFormBody` + `lib/supportForm` (was 260)                              |
| 17  | [x]    | `CheckoutPage`               | shop          |     77 | `useCheckout` + `CheckoutFormBody` + `lib/checkout` (was 251)                                   |

### P1 — Mid size (~150–250)

| #   | Status | Page                  | Feature     | ~Lines |
| --- | ------ | --------------------- | ----------- | -----: |
| 18  | [x]    | `RegisterPage`        | auth        |      7 |
| 19  | [x]    | `MatchSettingsPage`   | matches     |     69 |
| 20  | [x]    | `LoginPage`           | auth        |      7 |
| 21  | [x]    | `CartPage`            | shop        |     84 |
| 22  | [x]    | `ProductDetailPage`   | shop        |     71 |
| 23  | [x]    | `YouPage`             | profile     |     37 |
| 24  | [x]    | `OrderDetailPage`     | shop        |     67 |
| 25  | [x]    | `SellerStorePage`     | shop        |     41 |
| 26  | [x]    | `MatchTossPage`       | matches     |     61 |
| 27  | [x]    | `ShopHomePage`        | shop        |      7 |
| 28  | [x]    | `ShopVendorPage`      | shop        |     66 |
| 29  | [x]    | `ShopBrandPage`       | shop        |     77 |
| 30  | [x]    | `TournamentsListPage` | tournaments |      9 |
| 31  | [x]    | `SellerApplyPage`     | shop        |      9 |

### P2 — Smaller / verify-or-light-split (~80–150)

| #   | Status | Page                      | Feature       | ~Lines | Note                                                           |
| --- | ------ | ------------------------- | ------------- | -----: | -------------------------------------------------------------- |
| 32  | [x]    | `SellerOrdersPage`        | shop          |      9 |                                                                |
| 33  | [x]    | `SellerProductsPage`      | shop          |      7 |                                                                |
| 34  | [x]    | `HighlightsPage`          | highlights    |      9 |                                                                |
| 35  | [x]    | `RankingStatsPage`        | ranking       |     28 |                                                                |
| 36  | [x]    | `EntertainmentPage`       | entertainment |      8 |                                                                |
| 37  | [x]    | `OrdersPage`              | shop          |     62 |                                                                |
| 38  | [x]    | `SellerCategoriesPage`    | shop          |      7 |                                                                |
| 39  | [x]    | `RankingPage`             | ranking       |      7 |                                                                |
| 40  | [x]    | `SellerBrandsPage`        | shop          |      9 |                                                                |
| 41  | [x]    | `WicketSummaryScreen`     | matches       |     23 |                                                                |
| 42  | [x]    | `MatchesListPage`         | matches       |      9 |                                                                |
| 43  | [x]    | `EntertainmentDetailPage` | entertainment |     62 |                                                                |
| 44  | [x]    | `ScorecardHubPage`        | matches       |      9 |                                                                |
| 45  | [x]    | `ShopSlugPage`            | shop          |     32 |                                                                |
| 46  | [x]    | `ShopFilterPage`          | shop          |     30 |                                                                |
| 47  | [x]    | `UpcomingTournamentsPage` | tournaments   |      9 |                                                                |
| 48  | [x]    | `DiscoverPage`            | explore       |      7 |                                                                |
| 49  | [x]    | `OrderSuccessPage`        | shop          |      7 |                                                                |
| 50  | [x]    | `TournamentDetailPage`    | tournaments   |     59 | Redirect shell: `useTournamentDetail` + `lib/tournamentDetail` |
| 51  | [x]    | `LiveHubPage`             | live          |      8 |                                                                |
| 52  | [x]    | `StatsPage`               | stats         |     20 | Thin shell → `ProfileStats`; OK as-is                          |
| 53  | [x]    | `ShopVendorRedirect`      | shop          |     11 | N/A redirect                                                   |

---

## 5. Full inventory by feature

Update checkboxes when a page finishes Phase C. Line counts are approximate (2026-10-22); refresh with `wc -l` after splits.

### auth

| Status | Page           | ~Lines | Split artifacts                                                       |
| ------ | -------------- | -----: | --------------------------------------------------------------------- |
| [x]    | `OtpPage`      |     60 | `useOtpFlow` + `OtpForm` + `lib/otpFlow` (was 355)                    |
| [x]    | `RegisterPage` |      7 | `useRegisterForm` + `RegisterFormBody` + `lib/registerForm` (was 221) |
| [x]    | `LoginPage`    |      7 | `useLoginForm` + `LoginFormBody` + `lib/loginForm` (was 215)          |

### cms

| Status | Page         | ~Lines | Split artifacts                                    |
| ------ | ------------ | -----: | -------------------------------------------------- |
| [x]    | `StaticPage` |     63 | Feature renamed `pages` → `cms`; page already thin |

### entertainment

| Status | Page                       | ~Lines | Split artifacts                                                                            |
| ------ | -------------------------- | -----: | ------------------------------------------------------------------------------------------ |
| [x]    | `EntertainmentPage`        |      8 | `useEntertainmentPage` + `EntertainmentPageBody` + `lib/entertainmentPage` (was 131)       |
| [x]    | `EntertainmentDetailPage`  |     62 | `useEntertainmentDetail` + `EntertainmentDetailBody` + `lib/entertainmentDetail` (was 103) |
| [x]    | `EntertainmentEpisodePage` |     81 | `EntertainmentEpisodeDetail` (+ detail hooks as needed)                                    |

### explore

| Status | Page           | ~Lines | Split artifacts                                                      |
| ------ | -------------- | -----: | -------------------------------------------------------------------- |
| [x]    | `DiscoverPage` |      7 | `useDiscoverPage` + `DiscoverPageBody` + `lib/discoverPage` (was 72) |

### feed

| Status | Page             | ~Lines | Split artifacts                                                     |
| ------ | ---------------- | -----: | ------------------------------------------------------------------- |
| [x]    | `FeedPage`       |     12 | `useFeedPage` + `FeedPageBody` + `lib/feedPage` (was 353)           |
| [x]    | `CreatePostPage` |     16 | `useCreatePost` + `CreatePostFormBody` + `lib/createPost` (was 321) |
| [x]    | `PostDetailPage` |     33 | `usePostDetail` + `PostDetailBody` + `lib/postDetail` (was 291)     |

### highlights

| Status | Page                  | ~Lines | Split artifacts                                                                |
| ------ | --------------------- | -----: | ------------------------------------------------------------------------------ |
| [x]    | `HighlightDetailPage` |     73 | `useHighlightDetail` + `HighlightDetailBody` + `lib/highlightDetail` (was 290) |
| [x]    | `HighlightsPage`      |      9 | `useHighlightsPage` + `HighlightsPageBody` + `lib/highlightsPage` (was 133)    |

### interest

| Status | Page           | ~Lines | Split artifacts                                                                                 |
| ------ | -------------- | -----: | ----------------------------------------------------------------------------------------------- |
| [x]    | `InterestPage` |     93 | `useInterestForm` + `InterestFormBody` + existing `InterestForm` + `lib/interestForm` (was 319) |

### live

| Status | Page              | ~Lines | Split artifacts                                                                 |
| ------ | ----------------- | -----: | ------------------------------------------------------------------------------- |
| [x]    | `WatchPage`       |     61 | `useWatchPage` + `WatchPageBody` + `lib/watchPage` (was 332)                    |
| [x]    | `GoLivePage`      |     16 | `useGoLiveForm` + `GoLiveFormBody` + `lib/goLiveForm` (was 261)                 |
| [x]    | `GoLiveOnAirPage` |    140 | `useGoLiveOnAirSession`, `GoLiveOnAirStage`, `GoLiveEndedView`, `GoLiveWebGate` |
| [x]    | `LiveHubPage`     |      8 | `useLiveHub` + `LiveHubBody` + `lib/liveHub` (was 51)                           |

### matches

| Status | Page / screen                | ~Lines | Split artifacts                                                                           |
| ------ | ---------------------------- | -----: | ----------------------------------------------------------------------------------------- |
| [x]    | `MatchCardPage`              |     71 | `useMatchCard`, `MatchCardBody`, `lib/matchCard`                                          |
| [x]    | `MatchBroadcastGraphicsPage` |     62 | `useBroadcastGraphics` + `MatchBroadcastGraphicsBody` + `lib/broadcastGraphics` (was 415) |
| [x]    | `MatchOverScreen`            |     55 | `useMatchOver` + `MatchOverBody` + `lib/matchOver` (was 297)                              |
| [x]    | `DeclareSquadScreen`         |    247 | `useDeclareSquadScreen`, roster UI pieces                                                 |
| [x]    | `MatchSettingsPage`          |     69 | `useMatchSettings` + `MatchSettingsBody` + `lib/matchSettings` (was 219)                  |
| [x]    | `MatchTossPage`              |     61 | `useMatchToss` + `MatchTossBody` + `lib/matchToss` (was 186)                              |
| [x]    | `WicketSummaryScreen`        |     23 | `useWicketSummary` + `WicketSummaryBody` + `lib/wicketSummary` display helpers (was 116)  |
| [x]    | `MatchesListPage`            |      9 | `useMatchesList` + `MatchesListBody` + `lib/matchesList` (was 105)                        |
| [x]    | `ScorecardHubPage`           |      9 | `useScorecardHub` + `ScorecardHubBody` + `lib/scorecardHub` (was 103)                     |
| [x]    | `StartMatchPage`             |     87 | `useStartMatchForm`, `StartMatchFormBody`, `lib/startMatchForm`                           |
| [x]    | `MatchScorePage`             |     42 | Already composition root (scoring desk hooks)                                             |
| [x]    | `QuickMatchPage`             |     26 | `useQuickMatchForm`, `QuickMatchFormBody`, `QuickMatchSetupPanels`, `lib/quickMatchForm`  |

### notifications

| Status | Page                | ~Lines | Split artifacts                                                              |
| ------ | ------------------- | -----: | ---------------------------------------------------------------------------- |
| [x]    | `NotificationsPage` |     31 | `useNotifications` + `NotificationsBody` + `lib/notificationsPage` (was 269) |

### profile

| Status | Page                | ~Lines | Split artifacts                                                          |
| ------ | ------------------- | -----: | ------------------------------------------------------------------------ |
| [x]    | `PublicProfilePage` |     45 | `usePublicProfile` + `PublicProfileBody` + `lib/publicProfile` (was 271) |
| [x]    | `YouPage`           |     37 | `useYouPage` + `YouPageBody` + `lib/youPage` (was 208)                   |
| [x]    | `EditProfilePage`   |     74 | `EditProfileForm`                                                        |

### ranking

| Status | Page               | ~Lines | Split artifacts                                                       |
| ------ | ------------------ | -----: | --------------------------------------------------------------------- |
| [x]    | `RankingStatsPage` |     28 | `useRankingStats` + `RankingStatsBody` + `lib/rankingStats` (was 132) |
| [x]    | `RankingPage`      |      7 | `useRankingPage` + `RankingPageBody` + `lib/rankingPage` (was 123)    |

### reels

| Status | Page             | ~Lines | Split artifacts                                              |
| ------ | ---------------- | -----: | ------------------------------------------------------------ |
| [x]    | `ReelsPage`      |    131 | `useReelsPage`, `ReelsPageBody`, chrome                      |
| [x]    | `CreateReelPage` |     62 | `useCreateReelFlow`, `CreateReelSteps`, `lib/createReelFlow` |

### shop

| Status | Page                    | ~Lines | Split artifacts                                                                   |
| ------ | ----------------------- | -----: | --------------------------------------------------------------------------------- |
| [x]    | `SellerHubPage`         |    108 | `useSellerHub` + `SellerHubBody` + `lib/sellerHub` (was 355)                      |
| [x]    | `CheckoutPage`          |     77 | `useCheckout` + `CheckoutFormBody` + `lib/checkout` (was 251)                     |
| [x]    | `CartPage`              |     84 | `useCartPage` + `CartPageBody` + `lib/cartPage` (was 213)                         |
| [x]    | `ProductDetailPage`     |     71 | `useProductDetail` + `ProductDetailBody` + `lib/productDetail` (was 212)          |
| [x]    | `OrderDetailPage`       |     67 | `useOrderDetail` + `OrderDetailBody` + `lib/orderDetail` (was 204)                |
| [x]    | `SellerStorePage`       |     41 | `useSellerStoreForm` + `SellerStoreFormBody` + `lib/sellerStore` (was 198)        |
| [x]    | `ShopHomePage`          |      7 | `useShopHome` + `ShopHomeBody` + `lib/shopHome` (was 184)                         |
| [x]    | `ShopVendorPage`        |     66 | `useShopVendor` + `ShopVendorBody` + `lib/shopVendor` (was 162)                   |
| [x]    | `ShopBrandPage`         |     77 | `useShopBrand` + `ShopBrandBody` + `lib/shopBrand` (was 158)                      |
| [x]    | `SellerApplyPage`       |      9 | `useSellerApplyForm` + `SellerApplyFormBody` + `lib/sellerApply` (was 153)        |
| [x]    | `SellerOrdersPage`      |      9 | `useSellerOrders` + `SellerOrdersBody` + `lib/sellerOrders` (was 141)             |
| [x]    | `SellerProductsPage`    |      7 | `useSellerProducts` + `SellerProductsBody` + `lib/sellerProducts` (was 135)       |
| [x]    | `OrdersPage`            |     62 | `useOrdersPage` + `OrdersPageBody` + `lib/ordersPage` (was 131)                   |
| [x]    | `SellerCategoriesPage`  |      7 | `useSellerCategories` + `SellerCategoriesBody` + `lib/sellerCategories` (was 129) |
| [x]    | `SellerBrandsPage`      |      9 | `useSellerBrands` + `SellerBrandsBody` + `lib/sellerBrands` (was 122)             |
| [x]    | `SellerOrderDetailPage` |     96 | `useSellerOrderDetail`, `SellerOrderDetailBody`, `lib/sellerOrderDetail`          |
| [x]    | `ShopSlugPage`          |     32 | `useShopSlug` + `ShopSlugBody` + `lib/shopSlug` (was 95)                          |
| [x]    | `ShopFilterPage`        |     30 | `useShopFilter` + `ShopFilterBody` + `lib/shopFilter` (was 85)                    |
| [x]    | `SellerProductFormPage` |     65 | `useSellerProductForm`, `SellerProductFormBody`, `lib/sellerProduct*`             |
| [x]    | `OrderSuccessPage`      |      7 | `useOrderSuccess` + `OrderSuccessBody` + `lib/orderSuccess` (was 61)              |
| [x]    | `ShopVendorRedirect`    |     11 | N/A redirect — left as-is                                                         |

### stats

| Status | Page        | ~Lines | Split artifacts                                     |
| ------ | ----------- | -----: | --------------------------------------------------- |
| [x]    | `StatsPage` |     20 | Thin composition root → `ProfileStats`; verified OK |

### support

| Status | Page          | ~Lines | Split artifacts                                                    |
| ------ | ------------- | -----: | ------------------------------------------------------------------ |
| [x]    | `SupportPage` |     18 | `useSupportForm` + `SupportFormBody` + `lib/supportForm` (was 260) |

### tournaments

| Status | Page                      | ~Lines | Split artifacts                                                                           |
| ------ | ------------------------- | -----: | ----------------------------------------------------------------------------------------- |
| [x]    | `PublicTournamentPage`    |     61 | `usePublicTournament` + `PublicTournamentBody` + `lib/publicTournament` (was 349)         |
| [x]    | `TournamentsListPage`     |      9 | `useTournamentsList` + `TournamentsListBody` + `lib/tournamentsList` (was 157)            |
| [x]    | `SquadEditorPage`         |    138 | `useSquadTeamEditor`, `SquadTeamEditor`, `lib/squadEditor`                                |
| [x]    | `TournamentWorkspacePage` |     92 | `useTournamentWorkspace`, `TournamentWorkspaceBody`, `lib/workspaceView`                  |
| [x]    | `UpcomingTournamentsPage` |      9 | `useUpcomingTournaments` + `UpcomingTournamentsBody` + `lib/upcomingTournaments` (was 82) |
| [x]    | `TournamentDetailPage`    |     59 | `useTournamentDetail` + `lib/tournamentDetail` (redirect shell; gates on page)            |
| [x]    | `CreateTournamentPage`    |     45 | `CreateTournamentWizard`                                                                  |

---

## 6. Already-done reference extractions (copy these)

Use as templates when picking the next P0 row:

| Page                             | Pattern                  | Key files                                                                            |
| -------------------------------- | ------------------------ | ------------------------------------------------------------------------------------ |
| Match Card                       | Fan tabs + live poll     | `matches/ui/useMatchCard.ts`, `MatchCardBody.tsx`, `lib/matchCard.ts`                |
| Create Reel                      | Flow hook + steps        | `reels/ui/useCreateReelFlow.ts`, `CreateReelSteps.tsx`, `lib/createReelFlow.ts`      |
| Start Match                      | Form hook + body         | `matches/ui/useStartMatchForm.ts`, `StartMatchFormBody.tsx`, `lib/startMatchForm.ts` |
| Quick Match                      | Form + panels            | `useQuickMatchForm.ts`, `QuickMatchFormBody.tsx`, `QuickMatchSetupPanels.tsx`        |
| Squad Editor                     | Page gates + team editor | `SquadEditorPage.tsx`, `useSquadTeamEditor.ts`, `SquadTeamEditor.tsx`                |
| Tournament Workspace             | Workspace hook + body    | `useTournamentWorkspace.ts`, `TournamentWorkspaceBody.tsx`                           |
| Seller Order Detail              | Detail form              | `useSellerOrderDetail.ts`, `SellerOrderDetailBody.tsx`                               |
| Seller Product Form              | Form + page gates        | `useSellerProductForm.ts`, `SellerProductFormBody.tsx`                               |
| Reels / Go Live On Air / Episode | Page + body/detail       | See feature `ui/`                                                                    |

Non-page but same discipline: `AdminActionSheet` → `useAdminActionSheet` + `AdminActionSheetBody` + `lib/adminActionSheet*`.

---

## 7. How to continue (agent / human)

1. Open **§4 Priority queue** — take the **first unchecked** row.
2. Run **§2 recipe** A → B → C on **that page only**.
3. Check the box in **§4** and **§5**; append artifacts in the Split artifacts column.
4. Stop and report: page name, before/after line counts, tests run.
5. Only then ask / take the next row.

**Do not** start Match Card + Broadcast Graphics in the same turn. One page, full validation, then next.

---

## 8. Refreshing this inventory

```bash
cd client
find src/features -path '*/pages/*.tsx' -o -name '*Screen.tsx' \
  | grep -v '.test.' | xargs wc -l | sort -rn
```

After a batch of ✅s, update ~line counts in §4–§5 so the queue stays honest.
