# Backoffice UI/UX Design Audit

A grounded review of the Angular 21 + Angular Material 3 + Tailwind v4 admin panel. Every finding below was verified against the running codebase — file paths and class names are exact, not illustrative. This is the source of truth for bringing buttons, forms, tables, dialogs, and every other surface up to one consistent standard, without a rewrite.

**Scope:** `backoffice/src/app`
**Stack:** Angular 21 · Angular Material 3 · Tailwind CSS v4
**Audience:** UI/UX design + frontend engineering

## How to read this

Each numbered section covers one interface concern. Findings use four fixed fields:

- **Current** — what exists today, with exact file paths and class names
- **Issue** — why it hurts the product
- **Standard** — the one rule to converge on
- **Implement** — the concrete change

Priority follows one rule:

| Priority | Meaning |
|---|---|
| **Critical** | Users can misread state, or the brand breaks (wrong toast color, dead filter) |
| **High** | Visibly inconsistent across pages, worth fixing before more pages build on top of it |
| **Medium** | Real but cosmetic; batch it into whichever page you're already touching |
| **Low** | Nice-to-have polish, do last |

**Current tally:** 3 Critical · 14 High · 21 Medium · 18 Low — 56 findings across 22 sections.

**Progress:** Phases 0 through 3 are complete (see §21). Everything below still describes the original audit state; a finding marked "✅ Fixed" or "🟡 Partial" in its heading has already shipped — the rest of its writeup is left as-is as the historical record of what was wrong and why. A finding's own **Implement** line may still say "see §21 Phase N" even after that phase shipped — treat the heading's status marker as authoritative, not the prose below it (a few of these went stale between when a phase landed and when the heading was updated; caught and fixed as of the date below, but new drift is possible).

**What's actually still open, as of 2026-08-28:**
- **Phase 4** (not started): shared list-page composable (§11.1, High — touches every list page's TypeScript, not just templates, so it's its own dedicated pass), skeleton loaders (§14.1), dedicated list-error state (§14.3), richer empty states (§14.2).
- **Two High-priority findings never made it into any phase of §21's plan** and should get triaged into Phase 4 or their own pass: §5.2 (sticky table height's `69vh` magic number) and §8.1 (card-gap inconsistency below `mat-card`).
- Everything else marked without a status suffix in its heading (mostly Medium/Low) is real but genuinely unscheduled backlog — batch into whichever page you're already touching, per each finding's own priority.

**CSS placement rule for every fix below:** prefer `src/globals.css` (the real design-token source — Tailwind v4 `@theme` block, already wired to Material's `--mat-sys-*` tokens) or the specific Material override partial the concern belongs to (`override-component/_table.scss`, `_button.scss`, etc.). Avoid adding new rules to `src/assets/scss/custom.scss` — it's already a miscellaneous dumping ground with at least one real bug caused by that (§5.1), and the goal of this pass is to shrink it, not grow it.

---

## 1. Design system & visual consistency

The token layer is smaller and better than it looks — `src/globals.css` already defines a real Tailwind v4 `@theme` block wired to Material's system tokens. The problem isn't a missing design system; it's that a live theme-switcher lets any admin override it, and pages reach for raw Tailwind values instead of the tokens that already exist.

**Standard:** One brand, one radius scale, one shadow scale, no runtime color switching. All new UI reads color, radius, and shadow from the token groups already declared in `globals.css` (`--color-*`, `--radius-*`, `--shadow-*`) — never a hardcoded hex or an un-tokenized Tailwind class like `rounded-2xl` where `rounded-md` (already mapped to the token) exists.

### 1.1 A live 6-color theme switcher ships to every admin user — **Critical** · ✅ Fixed

- **Current:** `layouts/full/shared/customizer/customizer.component.html` — the gear icon in the bottom-right corner opens a panel with a *Theme Colors* button-toggle group: blue, aqua, purple, green, orange, cyan, plus independent light/dark toggles.
- **Issue:** This is unmodified admin-template scaffolding (Modernize). Any staff member can change the entire product's accent color at runtime, with no way to guarantee what a screenshot, a support call, or a training video will actually look like. Directly undermines "polished and consistent."
- **Standard:** One brand accent. Keep light/dark (real, useful) — remove color choice.
- **Implement:** Delete the *Theme Colors* block from `customizer.component.html` and the six `themecolors/*_theme.scss` partials from `style.scss`'s `@use` list. Delete the five now-unused partial files (keep `blue_theme.scss`, or fold its values directly into `_light-theme-variables.scss`/`_dark-theme-variables.scss` so there's no "theme name" concept left at all).

### 1.2 Radius token exists but is inconsistently used — **High** · ✅ Fixed

- **Current:** `--radius-sm: var(--mat-sys-corner-small)` (7px) is the real token, applied automatically to Material buttons/cards/menus/dialogs via the `*-overrides()` mixins. Custom Tailwind markup ignores it — `page-header`'s icon square uses `rounded-lg` (8px), various cards use `rounded-2xl`/`rounded-3xl`, badges use `rounded-sm`/`rounded-full` inconsistently for the same "status chip" concept.
- **Issue:** Material surfaces and custom Tailwind surfaces round at visibly different rates on the same page.
- **Standard:** Tight elements (chips, badges, buttons, inputs) → `--radius-sm`. Containers (cards, dialogs, image tiles) → `--radius-md`. Nothing custom-authored exceeds `--radius-md` unless it's a deliberate hero surface.
- **Implement:** No new CSS needed — `globals.css`'s `@theme` block already exposes `--radius-sm`/`--radius-md` as Tailwind's `rounded-sm`/`rounded-md` utilities automatically. This is a template-only sweep: replace `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl` in custom components with `rounded-sm`/`rounded-md`.

### 1.3 Status colors are re-derived per page instead of one status-chip pattern — **Medium** · ✅ Fixed

- **Current:** `getStatusClass()` in `utils/status-class.util.ts` is the shared source, but several tables hand-roll their own `[ngClass]` maps directly in the template (e.g. `row.is_active ? 'bg-light-success text-success' : 'bg-light-error text-error'` appears verbatim in half a dozen list pages instead of calling the shared util).
- **Issue:** Two sources of truth for the same "Active/Inactive" chip mean a future status-color change has to be hunted down page by page.
- **Standard:** Every status/boolean chip in a table goes through one function.
- **Implement:** ✅ Done — `<app-status-chip [status]="…" [label]="…" />` now backs every status badge app-wide (30 sites across 25 files: list-page tables, detail-shell hero badges, and standalone dialogs). Initially rolled out to only 5 pages (brands, categories, products, highlights, push-notification-templates); the remaining 25 were caught later when a live pixel-comparison across pages surfaced two real outliers still on the old inline pattern — `live-streams-list` and `push-notifications` were rendering `rounded-full px-2.5 py-0.5 font-medium` pill badges while every other page used `rounded-sm px-1.5 py-1 font-semibold` — plus several detail-shell hero badges at a slightly larger `px-2 py-1`. All now converge on the one component. `getStatusClass`/`statusClass` dead code (import + property, one per file) removed from every converted `.component.ts`.

### 1.4 Brand font isn't declared as a fallback stack anywhere but `globals.css` — **Low**

- **Current:** `--font-body: 'DM Sans', sans-serif` is set in `globals.css`, but `src/styles.scss`'s `body` rule separately sets `font-family: Roboto, 'Helvetica Neue', sans-serif` and never references the token.
- **Issue:** Two declarations disagree; whichever stylesheet wins the cascade decides the base font. Works today mostly by coincidence via Material's own font tokens.
- **Standard:** One `font-family` declaration, sourced from the token.
- **Implement:** Delete the `font-family` line from `styles.scss`'s `body` rule; let `globals.css` / Material's typography tokens own it exclusively.

---

## 2. Typography & text-size hierarchy

There is no written type scale anywhere in the codebase — every heading size was decided locally. Adopt five sizes for the whole app:

| Role | Size / weight | Utility class | Used for |
|---|---|---|---|
| Display | 28px / 700 | `text-2xl font-bold` | Dashboard hero numbers only |
| Page title | 19px / 600 | `text-[19px] font-semibold` | `PageHeaderComponent` title |
| Section / card title | 16–18px / 600 | `text-base sm:text-lg font-semibold` | Dialog headers, card group headers |
| Body | 14px / 400–500 | `text-sm` | Table cells, form labels, paragraph text |
| Meta / caption | 12–13px / 400 | `text-xs` | Subtitles, hints, breadcrumb, timestamps |

### 2.1 Dialog titles silently bypass the theme's own dialog-title tokens — **High** · ✅ Fixed

- **Current:** `override-component/_dialog.scss` explicitly configures `mat.dialog-overrides({ subhead-size: 18px, subhead-weight: 600, ... })` — a real, intentional token. But `DialogWrapperComponent` (used by every create/edit dialog) renders `<h3>{{ title }}</h3>` with no `mat-dialog-title` directive and no explicit size class.
- **Issue:** The 18px/600 subhead token is never actually applied. The visible dialog title size is whatever `.mat-typography h3` happens to resolve to via Material's CDK wrapper — correct today mostly by coincidence, fragile the moment global typography changes.
- **Standard:** Dialog titles use the token, explicitly.
- **Implement:** In `dialog-wrapper.component.html`, add `mat-dialog-title` to the `<h3>` (or apply `text-lg font-semibold` directly) — no new CSS file needed, `_dialog.scss` already has the mixin configured correctly.

### 2.2 Page titles used three different markup patterns before this session's migration — **Medium** · ✅ Fixed

- **Current:** All list pages now render titles through `<app-page-header>` (19px/600) — but non-list pages still use ad-hoc markup: dashboards use their own `mat-card-title`, dialogs use `DialogWrapperComponent`'s h3.
- **Standard:** `app-page-header` for every top-level routed screen (list, detail, settings — already proven on `settings/system-settings`). `mat-dialog-title` (18px/600) for dialogs. Nothing else claims to be a page heading.
- **Implement:** ✅ Done via §6.1 (dashboards adopted `app-page-header` in Phase 2) and §2.1 (dialogs wired to the real `mat-dialog-title` token in Phase 1). This finding's heading wasn't updated when those landed — caught during a later drift check.

### 2.3 Table cell text size is not declared consistently — **Medium** · ✅ Fixed

- **Current:** Most migrated tables put `class="text-sm"` on every single `<td>` individually. A few older tables (e.g. `teams.component.html`) set `text-sm` once on `<table>` and let it cascade.
- **Standard:** Set `text-sm` once, on `<table mat-table>`. Per-cell classes should only carry what varies per cell (`whitespace-nowrap`, `truncate`, `font-medium`).
- **Implement:** ✅ Done — scripted sweep (regex-based, dry-run reviewed before applying) across all 28 `mat-table` templates: `text-sm` added once to each `<table>`'s class, stripped from every `<th>`/`<td>`, and the `class` attribute dropped entirely from cells where `text-sm` was its only value. Non-table `text-sm` usage (empty-state text, dialog descriptions, KPI cards) was left untouched by scoping the strip to `<th>`/`<td>` tags only.

---

## 3. Buttons & button states

Material's button theming is centralized and good (`override-component/_button.scss` — consistent padding and corner radius across variants). The inconsistency is entirely at the call-site level.

**Standard:** Primary action → `mat-flat-button color="primary"`. Secondary/dismiss → `mat-stroked-button`, neutral border. Destructive → `mat-stroked-button` with `text-error border-error`, reserved for actions that actually delete or revoke. Row-level icon action → unstyled icon button, `size-4.5` icon, `matTooltip` for the label, `aria-label` always present.

### 3.1 "Cancel" is styled with the same red as destructive actions — **High** · ✅ Fixed

- **Current:** Every dialog footer (~30 `mat-dialog-actions` blocks) styles its Cancel button as `mat-stroked-button class="border border-error! text-error"`.
- **Issue:** Red conventionally means "this is destructive / can't be undone." Cancel is neither. Coloring it the same as Delete/Reject/Revoke inverts the visual hierarchy: the safe action looks alarming, and true destructive actions (which reuse the same red) don't stand out from routine cancels.
- **Standard:** Cancel/Close → neutral `mat-stroked-button` (default outline, no error tinting). Reserve `text-error border-error` exclusively for buttons whose click deletes, revokes, bans, or rejects.
- **Implement:** Remove `class="border border-error! text-error"` from Cancel buttons app-wide; leave it only on genuinely destructive buttons. Pure find/replace across dialog templates, no CSS file changes.

### 3.2 `SubmitButtonComponent` defaults to the generic label "Submit" — 13 of 32 dialogs never override it — **High** · ✅ Fixed

- **Current:** `submit-button.component.ts` defaults `text = 'Submit'`. 13 of 32 `app-submit-button` usages leave the default; the rest correctly pass `text="Save"`, `text="Save Template"`, `text="Go Live"`, etc.
- **Issue:** A generic "Submit" doesn't tell the admin what will happen — worse in an edit dialog, where "Submit" reads oddly for "save my changes to this Brand."
- **Standard:** Every submit button names the object and the mode: "Save Brand" / "Create Brand", etc. Remove the default so it's a required input.
- **Implement:** Change `@Input() public text = 'Submit'` → `@Input({ required: true }) public text!: string;` in `submit-button.component.ts`. The compiler flags every one of the 13 sites that needs a label.

### 3.3 Row-action icon buttons: three different hover/focus treatments — **Medium** · ✅ Fixed

- **Current:** Most tables use a bare `<button class="cursor-pointer border-0 bg-transparent p-0 align-middle">` with no hover state. A few (`tournament-teams-tab`, `tournament-team-squad-page`) add `text-black hover:opacity-70`. None declare a focus-visible ring beyond the browser default.
- **Standard:** One utility class for every row-action icon button — transparent background, no border, `opacity-70` default → `opacity-100` on hover, visible `focus-visible` ring inherited from the global rule (§19.1).
- **Implement:** Add a `.row-action` utility to `globals.css`'s base layer once; replace the repeated Tailwind class string at every icon-button call site.

### 3.4 Icon-only buttons have no visible disabled state distinct from Material's default — **Low**

- **Current:** `vendors.component.html`'s delete button on the platform vendor row: `[disabled]="row.is_platform" [class.opacity-40]="row.is_platform" [class.pointer-events-none]="row.is_platform"` — a one-off hand-rolled disabled treatment, redundant with the native `disabled` attribute.
- **Standard:** `[disabled]` alone is sufficient.
- **Implement:** Drop the two extra bindings; keep `[disabled]="row.is_platform"`.

---

## 4. Input fields, selects, textareas & form layout

Field *appearance* is already perfectly consistent — all 222 `mat-form-field` instances use `appearance="outline"`. Vertical rhythm inside forms is where it falls apart.

**Standard:** Every field lives inside the shared filter/form layout (`app-search-filter-bar` for filter rows, a plain `grid grid-cols-12 gap-4` for dialog forms) and carries the `hide-hint` class unless it has a real hint or validation message.

### 4.1 `hide-hint` is applied to 27 of 59 files that use `mat-form-field` — **High** · ✅ Fixed

- **Current:** `.hide-hint { .mat-mdc-form-field-subscript-wrapper { display: none } }` collapses Material's reserved ~16px hint/error strip. Applied selectively, not systematically.
- **Issue:** Two filter fields in the same `app-search-filter-bar` row can end up different heights depending on whether their author remembered `hide-hint`.
- **Standard:** Filter-bar fields and simple dialog fields: always `hide-hint`. Fields with a real hint or inline validation errors: never `hide-hint` — the space is load-bearing there.
- **Implement:** Bake `hide-hint` into `app-search-filter-bar`'s own stylesheet (scope it to its projected `mat-form-field` content) so new filter fields get it automatically instead of relying on every author remembering the class.

### 4.2 Dialog form grids use inconsistent column spans for the same field types — **Medium**

- **Current:** A "Name" field is `col-span-12 sm:col-span-6 lg:col-span-2` on one page and `lg:col-span-4` on another, with no relationship to actual content length.
- **Standard:** Now largely moot for filter bars (`app-search-filter-bar`'s flex-wrap sizes by content, see §11). For dialog body grids: short field (status/type/date) = `lg:col-span-3`; medium (name/email/phone) = `lg:col-span-4` or `6`; long (address/description) = `col-span-12`.
- **Implement:** Document the rule (this doc); apply opportunistically.

### 4.3 Required-field marking is inconsistent — **Medium**

- **Current:** Material auto-appends `*` to `mat-label` when the control has `Validators.required` — works automatically almost everywhere, but a few hand-built labels write a literal asterisk into the label string.
- **Standard:** Never hardcode `*` in a `mat-label`; let Material derive it from the validator.
- **Implement:** Spot-check and remove during page passes.

### 4.4 Textareas don't have a shared min/max height convention — **Low**

- **Standard:** `rows="3"` for short free-text; `rows="6"` for long-form content. Two sizes, not four.

---

## 5. Tables & data presentation

The table system is the most mature part of the app — `app-table-wrapper`, `app-paginator`, drag-to-scroll, sticky headers, and a shared sort/pagination contract are all real and working. The gaps are in the cell/column layer above that shared shell.

**Standard:** Header cells: `bg-light-secondary text-sm font-semibold`, always. Body cells: `text-sm`, set once on `<table>` (§2.3). Row-action column is always last, always labeled "Action" (singular). No zebra striping — row separation comes from Material's default row border only.

### 5.1 Two conflicting `!important` rules fight over table cell padding — **Critical** · ✅ Fixed

- **Current:** `override-component/_table.scss`: `.mdc-data-table__cell, .mdc-data-table__header-cell { padding: 16px 16px !important; }`. Loaded *later* in `style.scss`, `custom.scss`: `.table-responsive td, .mdc-data-table__cell, .mdc-data-table__header-cell { padding: 0 8px !important; }`.
- **Issue:** Both target the exact same selectors with `!important` — whichever partial happens to load last in `style.scss`'s `@use` order wins for the entire app, and it's not obvious from either file alone which one is in effect. A routine SCSS reorder silently changes every table's density.
- **Standard:** One rule, one file, no `!important` collision.
- **Implement:** Delete the `16px 16px` block from `_table.scss` entirely (dead — `custom.scss` currently wins). Move the real `0 8px` rule from `custom.scss` into `_table.scss` — table density belongs with the other Material table overrides, not in the misc file. Net effect: `custom.scss` shrinks by one rule, `_table.scss` becomes the sole source of truth.

### 5.2 Sticky table height is a fixed `69vh` magic number — **High**

- **Current:** `.sticky-header-table-container { height: 69vh; overflow: auto; }` in `custom.scss`, applied to every migrated list table.
- **Issue:** On a short viewport, `69vh` forces an internal scrollbar for a table that would otherwise fit in 3 rows; on a tall monitor it leaves dead space below a 2-row table. Also fights the page-level scroll once the merged card (§8) is taller than the viewport.
- **Standard:** Prefer `max-height` over fixed `height` so short result sets don't force an empty scroll region.
- **Implement:** Change to `max-height: calc(100vh - 260px); overflow: auto;` (260px ≈ topbar + page-header + filter row + paginator, measured against the shell). Verify against the shortest and longest tables in the app. Keep this rule in `custom.scss` for now — it's layout-specific glue, not a token or Material override, so it's a legitimate exception to the "reduce custom.scss" push; just fix the value.

### 5.3 Actions column header alternates between "Action" and "Actions" — **Medium** · ✅ Fixed

- **Current:** Singular on most migrated pages; plural on a handful (`teams.component.html`, `tournament-teams-tab`).
- **Standard:** "Action" (singular) — matches the majority.
- **Implement:** ✅ Done — renamed in `teams.component.html`, `tournament-teams-tab.component.html`, `tournament-team-squad-page.component.html`.

### 5.4 Truncated-cell tooltips use two different mechanisms — **Medium**

- **Current:** Most truncated cells use native `[title]="row.field"`. A few use `matTooltip` for the same purpose.
- **Standard:** Native `[title]` for simple text-overflow tooltips on table cells. Reserve `matTooltip` for interactive elements (buttons, icons, links) — already ~90% true after this session's row-action tooltip cleanup.

### 5.5 Numeric columns aren't consistently right-aligned or tabular — **Low** · ✅ Fixed

- **Current:** Price, stock, and count columns are left-aligned like text, with no `tabular-nums`.
- **Standard:** Numeric/currency columns: right-align, add `tabular-nums` so a column of prices reads as a column.
- **Implement:** ✅ Done — `text-right`/`tabular-nums` added to Products (Price, Sale Price, Sale %, Stock), Orders (Total), Highlights (Views, Likes), Posts (Views, Likes, Reports), Order Detail (Qty, Unit Price, Total), Vendors (Commission).

---

## 6. Headers & page titles

The one area with a finished, proven standard already in production.

**Standard:** `shared/components/page-header` — icon square, title, optional subtitle + record-count badge, breadcrumb trail, optional filters-toggle, and a `pageActions` slot. Already rolled out to all ~30 list pages, each wired via route `data: { icon, hideBreadcrumb: true, urls }`.

### 6.1 Dashboards and Settings don't use `app-page-header` yet — **Medium** · ✅ Fixed

- **Current:** `dashboard/cricket-dashboard`, `dashboard/broadcaster-dashboard`, `ecommerce/ecommerce-dashboard` render bespoke top sections. `settings/system-settings` was migrated this session and is the reference example for a non-list page.
- **Standard:** Every top-level route gets a `page-header`, dashboards included.
- **Implement:** See §21 Phase 2. Dashboards likely want `[showFiltersToggle]="false"` and no `pageActions`, same as system-settings.
- **Shipped:** All three dashboards now open with a slim `app-page-header` card (title + breadcrumb, no filters toggle, no page actions) placed above their existing hero/KPI content — the elaborate per-dashboard hero cards were left untouched, only the missing navigational header was added. Each route now carries `icon` + `hideBreadcrumb: true`.

### 6.2 Old global breadcrumb strip still exists as a fallback and can drift out of sync — **Low** · ✅ Fixed

- **Current:** `full.component.ts`'s `showBreadcrumb` getter hides the legacy strip via each route's `hideBreadcrumb: true` flag — correct today, but opt-out per route rather than the new pattern being the only path.
- **Issue:** A new list page that forgets `hideBreadcrumb: true` silently gets two breadcrumb trails stacked on top of each other.
- **Standard:** Once every routed page uses `app-page-header` (§21 Phase 2 done), invert the default: remove the legacy strip from `full.component.html` entirely instead of hiding it per-route.
- **Shipped:** Closed the five real gaps first — `tournament-detail-shell`, `campaign-detail-shell`, `live-stream-detail-shell`, and `match-controller-dashboard` each now carry a breadcrumb-only `app-page-header` (new `[showTitle]="false"` input added to the component for exactly this case — hides the icon/title/subtitle/badge row, keeps the breadcrumb, so it doesn't duplicate the page's own dynamic hero title). The nested `Matches` tab inherits its parent tournament shell's flag automatically (the existing leaf-to-root `data` walk already did this — no separate fix needed there). `player-stats` got the same treatment (it isn't nested under a shell but had the identical hero+tabs pattern). The unrelated `/sample-page` scaffolding route got `hideBreadcrumb: true` too, for total coverage.<br><br>Re-audited every `.routes.ts` file after: zero real gaps remain. Then removed `showBreadcrumb`/`routeDataFlag` and the `<app-breadcrumb>` element from `full.component.ts`/`.html`, and deleted `layouts/full/shared/breadcrumb/` entirely.<br><br>**Caught in the process:** that deleted component wasn't purely visual — its constructor also called `Title.setTitle()` on every navigation to keep the browser tab title in sync, merging `data.title` root-to-leaf. Deleting it outright would have silently stopped tab titles from updating anywhere in the app. Extracted just that behavior into a private `syncDocumentTitle()` method on `full.component.ts` itself, called from the same `NavigationEnd` subscription that already existed there for scroll-to-top — so the tab-title side effect survives independent of the now-removed visual strip.

---

## 7. Sidebar / navigation

Structurally solid: mini-mode collapse with hover-to-expand, grouped nav items, active-state highlighting. Keep this pattern as-is.

### 7.1 Nav icon set mixes Tabler stroke icons with no fixed stroke-width rule outside the topbar — **Medium** · ✅ Fixed

- **Current:** `_header.scss` sets `i-tabler { stroke-width: 1.5px }` scoped to `.topbar` only. Sidebar nav icons inherit Tabler's own default (2px).
- **Issue:** Icons in the top bar read slightly lighter than icons one column over in the sidebar, for the same icon family.
- **Standard:** 1.5px stroke width everywhere Tabler icons appear as UI chrome.
- **Implement:** Move the rule out of `.topbar` scope into `globals.css`'s base layer as a plain `i-tabler { stroke-width: 1.5px; }` — one global rule instead of a component-scoped one, removing a line from `_header.scss` in the process.

### 7.2 Section sub-headers aren't visually distinguished from clickable leaf items until expanded — **Low**

- **Standard:** Parent nav items with children should carry a subtly different weight/color at rest, not only on hover. Cosmetic; defer to a dedicated nav-polish pass.

---

## 8. Cards & content sections

The single-card-with-`mat-divider` pattern (header / filter / table, one continuous card) is this session's proven win — live on every list page and `system-settings`. The remaining inconsistency is spacing *between* cards, not within them.

**Standard:** One card per logical page section. Internal sections separate with `<mat-divider>`, never a second card. Card-to-card rhythm uses one spacing value.

### 8.1 Three different values control the gap below a card — **High**

- **Current:** `override-component/_card.scss` sets a global Material default of `margin-bottom: 24px` on every `.mat-mdc-card`. Migrated list pages override with `mb-3!` (12px) on some elements but rely on the untouched 24px default for the merged list card itself. Dashboard widget cards use `mb-0!` with a parent flex/grid `gap` instead.
- **Issue:** Three mechanisms are all "correct" in different parts of the app for the same visual decision.
- **Standard:** Prefer "zero margin, parent controls gap" everywhere — already how the newer dashboard widgets and merged list-page cards behave. `gap-6` (24px) between major sections, `gap-3` (12px) within a section.
- **Implement:** Long-tail cleanup as pages are touched: wrap sibling cards in a flex/grid parent with `gap-*`, set `mb-0!` on the cards.

### 8.2 `card-hover` and `cardBorder` utility classes exist but are unused — **Low**

- **Current:** `_card.scss` defines both, zero call sites in `pages/`.
- **Standard:** Either put them to use (e.g. `card-hover` on clickable dashboard summary cards) or delete them.

---

## 9. Dialogs / modals

`MessageService.openDialog()` and `DialogWrapperComponent` are a genuinely good shared foundation — named widths, consistent close button, consistent footer divider.

**Standard:** Every dialog opens through `MessageService.openDialog()` with an explicit `widthSize`. Every dialog body is wrapped in `<app-dialog-wrapper>`. Footer buttons follow §3's Cancel/Submit rules exactly.

### 9.1 `widthSize` choice looks arbitrary between similarly-complex dialogs — **Medium** · ✅ Fixed

- **Current:** `manage-vendor-dialog` (dense form) opens at `md` (850px), same as much simpler dialogs; `manage-product-dialog` (the densest form — pricing, stock, rich text, 3 selects) opens at `lg`.
- **Standard:**

  | Tier | Width | Use |
  |---|---|---|
  | `xs` | 400px | Confirmations only |
  | `sm` | 500px | Single-purpose, 1–3 fields |
  | `md` | 850px | Standard create/edit forms (default) |
  | `lg` | 1150px | Rich-text editor, image gallery, or 8+ fields |
  | `xl` | 1300px | Dashboard-in-a-dialog only |

- **Implement:** ✅ Done — table documented as a code comment next to `DialogWidth` in `message.service.ts`, then cross-referenced against actual `formControlName` counts per dialog to find and fix real violations: `vendors`, `tournaments`, `users`, `hero-slider` (`md` → `lg`, both create/edit calls each), `interest-campaigns-list` (same), and `players` (`ManagePlayerDialogComponent`'s two calls only — left `ImportPlayersCsvDialogComponent`'s pre-existing `lg` untouched).

### 9.2 `disableClose` defaults to `true` everywhere, including read-only detail dialogs — **Medium**

- **Current:** `openDialog()` defaults `disableClose: true`. Correct for edit/create forms; pure detail/view dialogs (`order-detail-dialog`, `submission-detail-dialog`) inherit the same default with no data-loss risk to protect.
- **Standard:** Read-only/detail dialogs: `disableClose: false`. Editable forms: keep `true`.
- **Implement:** Pass `{ disableClose: false }` explicitly at the handful of pure-detail dialog call sites.

### 9.3 Dialog close (×) and footer Cancel both always present — **Low, no action**

- Defensible, common pattern (× = quick exit, footer Cancel = deliberate exit after reading the form). Noted only so it isn't mistaken for an oversight during cleanup.

---

## 10. Dropdowns & menus

`mat-select` (form dropdowns) and `mat-menu` (topbar profile/notifications) are two different primitives with two different jobs — correct split.

### 10.1 Select-panel padding isn't reflected in option density for long lists — **Medium**

- **Current:** `_menu.scss`: `.mat-mdc-select-panel { padding: 8px !important; }` — flat override, no density adjustment.
- **Standard:** For selects with >15 options, consider the autocomplete pattern already used for player search rather than a long unfiltered scroll list.
- **Implement:** Not urgent; revisit for the specific long-list selects (Country, future large lookups) as they're touched.

### 10.2 Notification and profile dropdowns share a hardcoded `360px` min-width — **Low, no action**

- `.topbar-dd { min-width: 360px !important; }` — fine as a shared floor width.

---

## 11. Filters & search components

`app-search-filter-bar` (pure flex-wrap, no logic) is the standard, live on every migrated list page. The remaining inconsistency is in *behavior*, not layout.

**Standard:** Filter actions live in the page header's `pageActions` slot (Clear, Search, plus any create action), not inside the filter row — the specific mid-session fix that's now the pattern to defend going forward.

### 11.1 List-page filter/pagination boilerplate is copy-pasted ~25 times — **High**

- **Current:** `resetSearchForm()` (`this.searchForm.reset({...DEFAULT_FILTERS}); this.currentPage = 0; this.loadHttpData();`) is hand-copied near-verbatim across ~25 list components.
- **Issue:** Not a live bug, but a correctness risk — any one of the 25 copies drifting (e.g. forgetting `currentPage = 0`) silently breaks "clear search" only on that page.
- **Standard:** Extract the list-page filter/pagination boilerplate into a small reusable base (composable function or lightweight base class).
- **Implement:** Scope as a dedicated TypeScript refactor (§21 Phase 4, not Phase 3 — this needs its own careful pass since it touches every list page's logic, not just templates) — higher risk/reward than most items here.

### 11.2 No debounce on free-text search inputs — **Medium, no action needed now**

- Explicit search-on-submit is the standard for now — matches every current page. If live search is wanted later, it should land as one shared behavior inside the extracted base above, not per-page.

### 11.3 Filter row and page-header live in separate `mat-card-content` blocks — **Low, no action**

- Working as designed, matches the Nassaji reference pattern.

---

## 12. Tabs & pagination

Detail-shell tabs all use the same `mat-tab-nav-bar` + `router-outlet` pattern — consistent. Pagination is centralized in `app-paginator`, but its API has a piece nobody uses correctly.

### 12.1 `app-paginator`'s `loadingMessage` input is dead — every page's loading state silently renders a blank message — **High** · ✅ Fixed

- **Current:** `paginator.component.html`: `@if (loading) { <app-empty-data-message [message]="loadingMessage" /> }`. Verified precisely: all 23 pages using `<app-paginator>` correctly pass `[loading]="isLoading"` — that part of the API is not dead. None of the 23 pass `[loadingMessage]`, which defaults to an empty string.
- **Issue:** Because `[loading]` is wired but `[loadingMessage]` isn't, this branch fires correctly on every load and renders an empty `<p>` in place of the record-count area — reachable, not dead, just pointless. Meanwhile `app-table-wrapper`'s own progress bar (a good, deliberate design per that component's own code comment) is what actually communicates the loading state — two components independently tracking the same `isLoading` flag for one visual outcome.
- **Standard:** Loading state belongs to `app-table-wrapper` exclusively. The paginator only needs to know about empty results (`length === 0`), which it already handles correctly via `noRecMessage`.
- **Implement:** Remove the `loading`/`loadingMessage` inputs and the `@if (loading)` branch from `PaginatorComponent`, and drop the now-pointless `[loading]="isLoading"` binding from all 23 call sites.

### 12.2 Tab nav bar has no separate loading/skeleton state while the parent detail-shell resolves — **Low, no action**

- `tournament-detail-shell.component.html` shows `app-loader-block` for the entire shell while data resolves — reasonable, consistent with the rest of the app.

---

## 13. Alerts, notifications & confirmation messages

`MessageService` is excellent — one place for success/error/info/warning, smart 422 validation-error formatting, a shared confirm-then-act helper. The problem is entirely downstream: the styling meant to differentiate the four toast types was never written.

### 13.1 All four toast types render visually identical — **Critical** · ✅ Fixed

- **Current:** `message.service.ts`'s private `open()` sets `panelClass: [\`toast-${type}\`]` — `toast-success`, `toast-error`, `toast-info`, `toast-warning`. A full-repo search finds **zero** CSS rules anywhere targeting any of the four class names. Every toast renders with Material's default dark snackbar styling regardless of type.
- **Issue:** The single highest-impact fix in this document. An admin saving a form gets the exact same-looking toast whether the save succeeded or a validation error blocked it — the only signal is reading the message text itself, easy to miss in a corner-positioned, auto-dismissing snackbar. For a backoffice where staff take real actions (approve a vendor, delete a product, ban a broadcaster), silently-identical success/error feedback is a genuine usability risk.
- **Standard:** Each type gets a distinct left-edge accent bar, layered on top of Material's existing snackbar surface — accent, not a full repaint, so it stays legible in both themes.
- **Implement:** Add to `globals.css` (not `custom.scss` — this is pure token consumption, belongs with the other color-token utilities already in the base layer there):

  ```css
  @layer base {
    .toast-success .mdc-snackbar__surface { border-left: 4px solid var(--color-success); }
    .toast-error .mdc-snackbar__surface   { border-left: 4px solid var(--color-error); }
    .toast-warning .mdc-snackbar__surface { border-left: 4px solid var(--color-warning); }
    .toast-info .mdc-snackbar__surface    { border-left: 4px solid var(--color-info); }
  }
  ```

  Optionally also swap the snackbar action-label color to match, and consider a leading icon (check / x / triangle / info) for the sub-1s glance case where color alone isn't enough — see §19.2.

### 13.2 Confirmation dialogs use a generic "Are you sure?" message with no consequence stated — **High** · ✅ Fixed

- **Current:** Most delete confirmations follow `messageService.prompt('Delete Vendor?', 'Are you sure you want to delete "X"?', 'Delete', 'Cancel')` — names the object, doesn't state downstream effects.
- **Issue:** For destructive actions with real side effects, "are you sure" without the effect isn't enough information for an admin to make a good call.
- **Standard:** State the consequence in one clause when one exists — the Vendor-suspend flow already does this (`vendors.component.ts`'s `suspendVendor` message: *"Suspend '{name}'? Products from this vendor will be hidden from shoppers."*). Extend that pattern to every destructive confirm with a real side effect.
- **Implement:** ✅ Done — cross-referenced against the API's actual delete/cascade behavior (`laravel`'s migrations and controllers) rather than guessing:
  - **Delete User** — `shop_orders`, posts, comments, likes, and follows all `cascadeOnDelete` on `user_id`; copy now states this is permanent.
  - **Delete Tournament** — matches, interest campaigns, and submissions all `cascadeOnDelete` on `tournament_id`; copy now states this.
  - **Delete Vendor** — `shop_products.vendor_id` is `restrictOnDelete`, so a vendor with products fails at the DB layer today (surfaces as a generic "Server error." — no exception handler catches `QueryException` specifically); copy now warns of this up front instead of letting the admin hit an opaque failure.
  - **Delete Team** — already blocked server-side if the team appears on any match, with a clear message; copy now states the same guard so the admin isn't surprised by the rejection.
  - **Delete Brand / Delete Category** — `shop_products.brand_id`/`category_id` are `nullOnDelete` (non-destructive, products just lose the tag); copy now says so.
  - Left as-is: Product delete (`shop_order_items.product_snapshot` preserves order history independent of `product_id`, so there's no real consequence to state) and the confirms that already stated a consequence (interest-campaign delete, stream-replace, tournament-team detach, broadcast ban, clear command history).

### 13.3 Toast duration is fixed at 4s except for long 422 lists — **Low, no action**

- `httpError()` already scales duration for multi-field validation errors — the case that actually mattered is already handled.

---

## 14. Loading, skeleton, empty & error states

Loading is covered (top progress-bar for tables, `app-loader-block` for full-page/section loads, an inline gold ring loader for buttons). Skeleton loading doesn't exist anywhere — every wait state is a spinner.

### 14.1 No skeleton loaders — first-load tables show a bare progress bar over an empty shell — **Medium**

- **Current:** On a cold load, `app-table-wrapper` shows its indeterminate progress bar above an otherwise-empty table.
- **Issue:** A blank rectangle reads as "did this load?" more than "this is loading."
- **Standard:** Not urgent enough to block anything else here, but worth a scoped follow-up: a generic `app-table-skeleton [columns]="5" [rows]="6"`, shown only on true first-load (not on refetches, which should keep the current top-bar behavior).
- **Implement:** §21 Phase 4.

### 14.2 Empty-state message is plain text with no supporting visual — **Medium**

- **Current:** `app-empty-data-message` renders `<p class="table-not-found-msg">{{ message }}</p>` — no icon, no illustration, no "clear filters" affordance when the empty state is filter-caused rather than genuinely-no-data.
- **Standard:** Add a small muted icon above the message, and an optional filter-aware message override ("No campaigns match your filters." instead of the generic default).
- **Implement:** Extend `EmptyDataMessageComponent` with an optional `icon` input; list pages pass a filter-aware message when `searchForm` has non-default values at query time.

### 14.3 No dedicated error state for a failed (not just empty) list request — **Medium**

- **Current:** Every list page's error callback shows a toast but leaves the table showing "No Data Available" — identical to a genuinely empty result.
- **Standard:** Track a distinct `hasError` flag; show "Couldn't load {X}. **Retry**" instead of the generic empty message when true.
- **Implement:** §21 Phase 4, alongside §11.1's shared list-page base.

### 14.4 Button-inline loader and table-progress-bar loader use different visual languages — **Low, no action**

- `app-loader` (gold ring, in `SubmitButtonComponent`) vs. `mat-progress-bar` (blue bar, in `app-table-wrapper`) — both use the app's primary color, just via different components signaling different things (action-in-flight vs. view-refreshing). Deliberate, not drift.

---

## 15. Icons & icon sizing

Two icon systems coexist by design: **Tabler** for all UI chrome (buttons, nav, table actions), **Solar** (via Iconify) exclusively for `page-header`'s route icon squares. The inconsistency is entirely within Tabler's sizing.

| Context | Sizes found in codebase | Standard |
|---|---|---|
| Row-action / inline button icon | `size-4.5!` (59 uses — dominant) | `size-4.5` (18px) |
| Outliers, same context | `size-2!, size-3!, size-3.5!, size-4!, size-5!, size-6!` | → `size-4.5` |
| Dialog close / icon-button | `size-5!` | `size-5` (20px) |
| Large standalone / empty-state | `size-10!, size-11!, size-12!, size-14!` (scattered) | → `size-12` (48px) |

### 15.1 Icon sizing has no defined scale — 12 distinct pixel values in use for what functions as 3 real sizes — **High** · ✅ Fixed

- **Current:** Verified by grep across `src/app/pages` (`grep -rho 'class="size-[0-9.]*!\?"'`) — Tabler icon size classes span `size-2!` through `size-14!`, 12 distinct values for 3 real use-cases.
- **Issue:** Icons next to text render at visibly different proportions depending on the page, most noticeably in table action columns where `size-4!` and `size-4.5!` sit one pixel apart for no functional reason.
- **Standard:** Three sizes: `size-4.5` (18px, inline/row/table actions), `size-5` (20px, standalone icon-only buttons), `size-12` (48px, empty states/large decorative).
- **Implement:** ✅ Done — audit rescoped to only `<i-tabler>` tags (an initial broad grep also caught container `<div>`/`<span>` icon-wells, which were correctly left alone). Normalized outliers in `avatar-uploader`, `page-header` (filter icon), `file-upload`, dashboard empty-state icons (cricket, broadcaster, ecommerce — 8 instances), and two `size-4!` → `size-4.5!` row-icon fixes. Deliberately left several legitimate exceptions untouched: breadcrumb home/chevron icons at `size-3!`, and inline badge icons paired with small text.

### 15.2 Icon color isn't consistently inherited — some icons hardcode `text-black` — **Low** · 🟡 Fixed where touched (row-action sweep), not an exhaustive pass

- **Current:** `tournament-teams-tab.component.html`'s row actions add explicit `text-black`, breaking dark-mode icon color inheritance.
- **Standard:** Icons inherit `currentColor` from their button/link parent; never hardcode a color unless semantic (success/error/warning icon).
- **Implement:** Remove hardcoded `text-black`; verify against dark mode.

---

## 16. Spacing, padding, margins & alignment

Card interiors are consistent (`$card-spacer: 24px`, uniform via `_card.scss`). Gaps *within* a page — filter fields, button rows, grid columns — are where ad-hoc values creep in.

**Standard:** Four gap sizes cover everything: `gap-2` (8px, tight — icon+label), `gap-3` (12px, related controls — button rows), `gap-4` (16px, grid/form spacing), `gap-6` (24px, major section separation).

### 16.1 Button-row gaps alternate between `gap-2` and `gap-3` for the identical Clear/Search/Create trio — **Medium**

- **Standard:** `gap-2` (8px) for button rows — matches the majority.
- **Implement:** Normalize outliers; trivial, batch into other edits.

### 16.2 Page-level horizontal padding on full-bleed sections at mobile widths — **Low**

- Verify during the §18 responsive pass rather than treating as standalone — same root cause.

---

## 17. Border radius, borders, shadows & visual details

Covered in depth under §1 (tokens exist, aren't consistently reached for). Two additional details on elevation and hairlines.

### 17.1 Card shadow token (`--shadow-sm`) is real but `cardWithShadow` doesn't reference it — **Medium**

- **Current:** `globals.css` defines `--shadow-sm`/`--shadow-md` as real tokens, but the ubiquitous `cardWithShadow` class gets its shadow from Material's own `elevated-container-elevation: var(--mat-sys-level1)` in `_card.scss` — a parallel, Material-native elevation system.
- **Issue:** Not visually broken, but the two Tailwind shadow tokens are effectively unused for their apparent purpose. A custom (non-Material) surface reaching for "the card shadow" has to know to use Material's elevation variable instead.
- **Standard:** Keep Material's elevation for Material surfaces (correct, don't change). Reserve `--shadow-sm`/`--shadow-md` explicitly for custom, non-Material surfaces (`page-header` icon square, custom image tiles) so they have a real, distinct purpose.

### 17.2 Border color token (`--color-border`) is correct and consistent — **Low, no action**

- `$borderColor: var(--mat-sys-outline-variant)` feeds both the Tailwind token and every Material override consistently. Called out to show not everything here is a problem.

---

## 18. Responsive behavior

Filter grids collapse correctly at `sm`/`lg` breakpoints throughout. The two gaps are wide data tables on small viewports, and the sidebar's touch behavior.

### 18.1 Wide tables (10+ columns) have no responsive column-priority strategy — **High** · ✅ Fixed

- **Current:** Products (14 columns), Orders (11), and others rely purely on `app-table-wrapper`'s drag-to-scroll. No column-hiding or priority system — a tablet-width admin sees the same 14-column table as a widescreen monitor, just scrolled.
- **Issue:** This is a real backoffice used by staff who may be on a tablet or smaller laptop; horizontal scroll-hunting through 14 columns for "Status" is a meaningfully worse experience than necessary.
- **Standard:** Mark 2–3 lowest-priority columns per dense table (e.g. Products: `sale_type`, `sale_percentage`; Orders: `currency` when always the same value) as `hidden lg:table-cell`.
- **Implement:** ✅ Done — `hidden lg:table-cell` added to `sale_percentage`/`sale_type` (Products), `phone`/`currency` (Orders), and `nickname`/`location` (Campaign Submissions).

### 18.2 Sidebar mini-mode hover-to-expand has no touch-equivalent — **Medium, defer**

- `.sidebarNav-mini:hover .sidebarNav { width: $sidenav-desktop }` — pure `:hover`. On touch (iPad admin usage) there's no way to reveal labels without tap-and-hope. Acceptable to leave as-is unless tablet usage is confirmed real usage — flagged for awareness only.

### 18.3 `page-header`'s title/subtitle divider can wrap awkwardly at narrow sidebar-expanded widths — **Low, no action**

- Confirmed during live verification: with several sidebar sub-menus expanded, title/"|"/subtitle can wrap to two lines. Graceful degradation, not a bug — the component uses `flex-wrap` deliberately.

---

## 19. Accessibility & usability

`aria-label` coverage is genuinely good — every icon-only button audited carries one. The gaps are in keyboard-focus visibility and color-only signaling. **This section covers what was checked, not a full WCAG pass** — dialog focus trapping/return, `aria-sort` on sortable headers, and numeric contrast ratios were not audited.

### 19.1 No app-wide `:focus-visible` style — **High** · ✅ Fixed

- **Current:** No rule targeting `:focus-visible` found anywhere in `src/`. Material components get Material's own focus indication where built-in; plain custom elements (row-action icon buttons, sidebar collapse toggle) fall back to browser defaults, which several browsers render as a barely-visible thin outline on a transparent-background button.
- **Issue:** Keyboard-only and screen-magnifier users lose track of focus position on exactly the elements this audit asks to standardize (§3.3).
- **Standard:** One global rule, using the accent token, applied to every interactive element without an existing strong focus style.
- **Implement:** Add to `globals.css`'s base layer:

  ```css
  @layer base {
    :focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
      border-radius: 4px;
    }
  }
  ```

### 19.2 Status/state is communicated by color alone in every status chip — **High**

- **Current:** Active/Inactive, Approved/Pending/Suspended/Rejected, and every status chip differentiates purely via background/text color — same pill shape, same weight, color is the only visual signal.
- **Issue:** Fails for color-blind admins (red/green confusion is the most common form) and low-brightness/grayscale-mode screens.
- **Standard:** The current chips do include a text label (e.g. "Active", not just a colored dot), which mitigates most of the risk already. The real fix is a rule: status indicators always carry a text label, never color/icon alone.
- **Implement:** Add to the §20 component-consistency checklist rather than a code change today.

### 19.3 Form validation errors aren't announced to screen readers — **Medium** · ✅ Audited, no gap found

- **Current:** Material's `mat-error` mechanism is available but not consistently used — several forms rely purely on the Save button becoming `[disabled]`, with no visible or announced reason why.
- **Standard:** Every required/validated field that can be invalid should have a corresponding `<mat-error>` with a specific message.
- **Implement:** Audited all 28 components with `Validators.*` (script cross-referencing every `Validators.required` field against its template for a sibling `mat-error`). 11 apparent gaps surfaced across 11 dialogs, all in `mat-select` fields (`status`, `kind`, `provider`, `cta_type`, `payment_status`, `graphic_theme_id`, `group_index`, `visibility`) — every one is form-initialized to a non-empty default with no blank option in its `mat-option` list, so the required validator can never actually fire through normal use. The one non-select case (hero-slider's `image_mobile`, a custom `app-file-upload` control) already has an equivalent inline error message, just not via `mat-error`. Spot-checked a "clean" file (`manage-brand-dialog`) to confirm the script does detect real `mat-error` usage where present, ruling out a silent false-negative. No code changes made — coverage on reachable-invalid fields is already solid.

### 19.4 Snackbar/toast region isn't announced beyond Material's own default — **Low, no action**

- Material's `MatSnackBar` includes its own `aria-live="polite"` region by default — already correct. §13.1's toast-styling fix doesn't need to touch this.

---

## 20. Component consistency & reusable patterns

The shared-component library is real and, after this session's work, meaningfully more complete. Use this table as the checklist before writing new markup for something that might already exist.

| Component | Status | Note |
|---|---|---|
| `page-header` | ✅ Standard | All list pages |
| `search-filter-bar` | ✅ Standard | All list pages |
| `table-wrapper` | ✅ Standard | Sort, scroll, loading bar |
| `paginator` | ✅ Standard | Dead `loadingMessage`/`loading` removed, §12.1 |
| `dialog-wrapper` | ✅ Standard | Now uses `mat-dialog-title`, §2.1 |
| `submit-button` | ✅ Standard | `text` is required, 13 dialogs relabeled, §3.2 |
| `prompt-dialog` | ✅ Good | Confirm/reject pattern |
| `loader` / `loader-block` | ✅ Good | Consistent spinner language |
| `empty-data-message` | ⚠ Gap | No icon/filter-aware copy, §14.2 |
| `table-image` | ✅ Good | Used wherever a thumbnail appears |
| `avatar-uploader` | ✅ Good | Single, correct usage |
| `file-upload` | ✅ Good | Single, correct usage |
| `common.module` (`CommonSharedModule`) | ✅ Good | Bundles the 8 above |
| `.row-action` (utility class) | ✅ Standard | New, swept across 27 files, §3.3 |
| `status-chip` | ✅ Standard | Every status badge app-wide, §1.3 |
| `table-skeleton` | ❌ Missing | Doesn't exist, §14.1 |
| list-page base/composable | ❌ Missing | Doesn't exist — copy-pasted, §11.1 |

**Standard:** Before building anything that looks like a status pill, an icon-only action button, a filter row, a confirmation, or a create/edit form — check this table first. Extend what's marked ✅/⚠/🟡; don't build a parallel version. Two real gaps remain (`table-skeleton`, a shared list-page base) — the highest-leverage remaining additions, since each one collapses N copy-pasted implementations into one.

---

## 21. Implementation plan

The rollout strategy that already worked this session — build/prove one shared component, migrate consuming pages in small verified batches, never a big-bang rewrite — is the strategy to keep using. Nothing below requires touching business logic; every phase is additive or mechanical.

**How to not break anything:**
1. Land tokens/CSS-only fixes first — invisible to functionality by construction.
2. Change one shared component at a time; run `ng build --configuration development` after each; every consumer inherits the fix for free.
3. Roll page-level template changes in small batches (4–6 pages), verify with a build after each batch.
4. Never touch a page's TypeScript logic and its template styling in the same commit unless the finding requires it (most don't).

### Phase 0 — Foundation (~1 day) — ✅ Complete

Token & CSS-only fixes, zero functional risk. All land in `globals.css` or the relevant Material override partial — none add to `custom.scss`.

- Toast type styling — §13.1 (Critical)
- Table padding `!important` conflict — §5.1 (Critical)
- Remove the six-color theme customizer — §1.1 (Critical)
- Global `:focus-visible` rule — §19.1 (High)
- Radius token usage sweep (template-only, no CSS change needed) — §1.2 (High)
- Sidebar icon stroke-width — §7.1 (Medium)

### Phase 1 — Shared components (~2–3 days) — ✅ Complete

Fix the building blocks — every consumer inherits automatically.

- `submit-button`: required `text` input, no default — §3.2 (High)
- `dialog-wrapper`: apply the real title token — §2.1 (High)
- `paginator`: remove dead `loading`/`loadingMessage` — §12.1 (High)
- `search-filter-bar`: bake in `hide-hint` — §4.1 (High)
- Row-action button: extract `.row-action` utility — §3.3 (Medium)
- New: `<app-status-chip>` — §1.3, §20 (Medium, high leverage)

### Phase 2 — Header parity (~1 day) — ✅ Complete

- `dashboard/cricket-dashboard`, `broadcaster-dashboard`, `ecommerce-dashboard` adopt `app-page-header` — §6.1 ✅ done
- Remove legacy global breadcrumb strip once coverage is complete — §6.2 ✅ done — closed the 5 detail-shell gaps (plus `player-stats`, plus the unrelated `/sample-page` route) with a new breadcrumb-only `[showTitle]="false"` mode on `app-page-header`, re-audited for 100% coverage, then deleted the legacy strip and its component. Its hidden second job — syncing the browser tab title on navigation — was extracted into `full.component.ts` first so removing it didn't silently break tab titles app-wide.

### Phase 3 — Page-by-page sweep (~1 week, batched) — ✅ Complete

Mechanical cleanups, rolled through pages in small verified batches (4–6 at a time).

- Cancel-button color fix — §3.1 ✅ done (High, ~30 dialogs, pure find/replace)
- Icon size normalization to the 3-size scale — §15.1 ✅ done (High, mechanical)
- Destructive-confirm consequence copy — §13.2 ✅ done (High)
- Responsive column-priority on the 3 densest tables — §18.1 ✅ done (High)
- `mat-error` coverage audit — §19.3 ✅ audited, no gap found (Medium)
- Table cell text-size / numeric alignment / actions-column naming — §5, §2.3 ✅ done (Medium)
- Dialog width-tier documentation + audit — §9.1 ✅ done (Medium)

### Phase 4 — New patterns (ongoing)

Net-new components — bigger lift, biggest long-term leverage.

- Shared list-page composable (search/reset/paginate boilerplate) — §11.1, §20
- `app-table-skeleton` for first-load — §14.1
- Dedicated list-error state (vs. generic empty) — §14.3
- Empty-state icon + filter-aware copy — §14.2

---

## Appendix — token & scale reference

Copy-paste reference. All color/radius/shadow tokens already exist in `src/globals.css` today — this is a usage guide, not a new file to create.

```
/* Typography — §2 */
Display        28px / 700   .text-2xl .font-bold
Page title     19px / 600   .text-[19px] .font-semibold  (app-page-header)
Section title  16–18px / 600 .text-base sm:.text-lg .font-semibold
Body           14px / 400–500
Meta/caption   12–13px / 400

/* Icon sizes — §15 */
Inline / row action   size-4.5   18px — the existing majority
Standalone button      size-5     20px
Large / empty state    size-12    48px

/* Spacing — §16 */
gap-2   8px    icon + label, badge + text, button rows
gap-3   12px   related controls
gap-4   16px   grid / form field spacing
gap-6   24px   major section separation

/* Radius — already in globals.css @theme */
--radius-sm   7px    chips, badges, buttons, inputs
--radius-md   var(--mat-sys-corner-medium)   cards, dialogs, image tiles

/* Dialog width tiers — §9.1, message.service.ts */
xs   400px   confirmations only
sm   500px   1–3 fields
md   850px   standard create/edit (default)
lg   1150px  rich text / gallery / 8+ fields
xl   1300px  dashboard-in-a-dialog

/* Semantic color — already in globals.css @theme, keep separate from brand accent */
--color-success / --color-error / --color-warning / --color-info
```

---

*Grounded against the live codebase, Angular 21 / Material 3 / Tailwind v4. Every file path and class name above is verifiable with `grep` in `backoffice/src`. Companion visual reference (same content, browsable): see the published artifact link shared alongside this file.*
