# List Pages: Search & Filter Strategy

**Status:** Audit / proposal — no implementation yet. This document is step 1 of the filter/search overhaul: a page-by-page inventory of what exists today, followed by a recommendation for what every list page should look like. Nothing here should be built until this document is reviewed and approved.

**Scope:** every list/table page in the backoffice that uses `app-search-filter-bar` — **24 list pages** across 9 modules, plus **one non-list detail view (Player Stats, #10)** carried in this document for completeness since it lives in the same module and was in the original audit brief. Player Stats is **out of scope for implementation** — it has no row set to filter, and its two bucket selectors already work correctly. Do not treat it as a build target in any implementation plan drawn from this document.

## At a Glance

| # | Page | Module | Free Search Today | Biggest Finding |
|---|---|---|---|---|
| 1 | Tournaments | Tournaments Mgmt | **None** | No search box at all; backend already has unused partial filters on name/country/city |
| 2 | Teams | Tournaments Mgmt | Yes (name/code) | Country field is free-text but exact-match — typos silently return zero rows |
| 3 | Tournament Requests | Tournaments Mgmt | **None** | Only a Contact Phone field; no way to find a request by requester or tournament name |
| 4 | Tournament Matches | Tournaments Mgmt | **Client-side only** | Fetches every match via `?all=1`, filters/sorts/paginates entirely in-browser |
| 5 | Quick Matches | Tournaments Mgmt | Yes (creator/team) | Sortable-looking columns are wired to nothing — backend accepts no `sort` param |
| 6 | Interest Campaigns | Tournaments Mgmt | Yes (title) | Solid — closest page in this module to the target pattern |
| 7 | Campaign Submissions | Tournaments Mgmt | Yes (name only) | Backend already supports email/phone search server-side, unused by the UI |
| 8 | Users | Users Mgmt | **None** | The single best search implementation in the codebase (`UserBuilder::search()`) exists and sits completely unused here |
| 9 | Players | Players Mgmt | Yes (name/nickname/email/phone) | The reference implementation — but missing a Status filter/column, and has a broken sort on the Location column |
| 10 | Player Stats | Players Mgmt | **Out of scope** | Not a list page — no row set to filter; current bucket selectors already work correctly; excluded from implementation |
| 11 | Hero Slider | Content Mgmt | **None** | Small curated set; only Status filter, roughly appropriate as-is |
| 12 | Highlights | Content Mgmt | Yes (title only) | 3 of 4 backend-ready filters (active, tournament, date range) are completely unused |
| 13 | Posts | Content Mgmt | Yes (body, mislabeled) | No way to search by creator; confusing `caption`/`body` naming chain |
| 14 | Post Reports | Content Mgmt | **None** | Only Status; a backend-ready Reason filter and post/reporter search are both missing |
| 15 | Static Pages | Content Mgmt | Yes (title) | Minimal and appropriate for a small hand-curated page set |
| 16 | Products | Shop Mgmt | Yes (name only) | No SKU search despite SKU being the identifier admins actually hold; no Vendor or stock-status filter |
| 17 | Brands | Shop Mgmt | Yes (name) | Solid; an existing `slug` filter is unused |
| 18 | Categories | Shop Mgmt | Yes (name) | No Parent Category filter despite the model being explicitly hierarchical |
| 19 | Vendors | Shop Mgmt | Yes (store name) | Doesn't search the owning user's name/email/phone — support workflows usually start from the person, not the store |
| 20 | Orders | Shop Mgmt | Yes (order #, phone — split in two) | No date-range or amount-range filter; `status`/`payment_status` are accidentally partial-match, not exact |
| 21 | Live Streams | Live Streams Mgmt | Yes (title) | Best-implemented page in the whole audit; only a `provider` filter is left unused |
| 22 | Push Notifications | Engagement | **None** | No search; backend-ready `target_type`/`target_user` filters unused |
| 23 | Push Notification Templates | Engagement | **None** | Small fixed catalog; low priority |
| 24 | Support Messages | Support | **None** | Weakest page in the audit — no search of any kind, no date range, on a page whose whole job is finding one person's message |
| 25 | Notifications | Notifications | **None** | Payload lives in JSON (`data->message`), so search needs a new query shape; type/read/date filters are otherwise solid |

## How to read this document

Each page section documents, in order:

1. **Page Information** — what the page is, current search, current filters, current columns.
2. **Free Search** — which columns a single free-text box should search, as a tree.
3. **Filters** — every filter candidate, with a Keep/Add/Remove call and the reasoning.
4. **What We Have Today** — an honest account of the current implementation, warts included.
5. **What We Should Add** — genuinely useful gaps, not padding.
6. **What We Should Remove** — filters that don't earn their UI space.
7. **Recommended Final Design** — the final filter bar, in order (most-used first).

The reasoning in every page section is grounded in the same five criteria: **frequency of admin use, business importance, dataset size, common admin workflows, and whether the filter meaningfully narrows results** — not in what's easy to add.

---

# Part 1 — Architecture Requirements (App-Wide Standards)

These standards apply to every list page. Page-specific sections (Part 2) exist to decide *which* fields plug into this shape — not to reinvent it per page.

## 1. Free Search Standard

**Pattern:** one text input per list page, always the first control in the filter bar, always server-side, wired to a single `filter[search]` query param.

- **Scope, not blind full-table search.** Free search must only match columns an admin would plausibly type into a "find this record" box — names, identifiers (email, phone, SKU, order number, slug), and short titles. It must never match long free-text bodies (post content, message bodies, description fields) or numeric IDs unless the admin workflow specifically depends on pasting an ID.
- **Case-insensitive, partial match** (`LIKE '%term%'` on `LOWER(column)`, or the DB-appropriate equivalent) on every text field in scope, OR'd together in one clause.
- **Digit-normalized phone matching** where a page searches a phone column: strip non-digits from both the stored value and the query term before matching (`api/app/Builders/UserBuilder.php::search()` is the reference implementation — see below).
- **Relationships are opt-in, not default.** Only pull a related table into free search when the relationship is already eager-loaded for the list (`->with([...])` in the controller's `baseQuery()`) and the admin's real workflow needs it (e.g. finding an Order by the customer's name). Don't join a table purely to make search "more thorough" — every extra joined `LIKE` clause is a query-plan cost paid on every keystroke-triggered request.
- **Naming/placeholder convention:** the control is always a `mat-form-field` with placeholder `Search {{things}}` (e.g. "Search users", "Search products") — never a generic "Search" with no scope, since that invites admins to expect full-table search it doesn't do.
- **Debounce on input** (already standard practice in this codebase — keep it) so free search doesn't fire a request per keystroke.

**Reference implementation to copy:** `api/app/Builders/UserBuilder.php::search()` + `api/app/Models/User.php::getFilters()` (`AllowedFilter::scope('search')`). It case-insensitively OR-matches `name`, `nickname`, `email`, and digit-normalizes `phone` — exactly the shape every other page's free search should follow, substituting the page's own meaningful columns.

## 2. Filter Standard — when a field deserves its own control

A field earns a dedicated filter control only when it passes at least two of the following; a field that passes zero or one belongs in free search (if it's a lookup value) or nowhere (if it's neither):

| Criterion | Question to ask |
|---|---|
| Frequency of use | Would an admin filter by this in a typical week, not just once during an investigation? |
| Business importance | Does this field gate a real workflow (payment status, moderation status, broadcast approval)? |
| Dataset size | Is the table large enough that free search / eyeballing the page isn't good enough? |
| Common workflow | Does a real admin task start with "show me all X that are Y" for this field? |
| Meaningful narrowing | Does this field split the table into differently-sized, differently-actionable buckets (status, type, category) rather than near-unique values (a free-text title) or near-constant values (a field that's 95% one value)? |

Fields that fail this test and should be removed or never added:
- **Near-unique text fields** (titles, names) — belong in free search, not a filter.
- **Boolean toggles with a heavily skewed real-world distribution** (e.g. "is_deleted" when 99% of rows aren't) — usually not worth a control; a status filter with a dedicated value covers it better.
- **Filters redundant with another filter already covering the same partition** (e.g. both a "Status" select and a "Schedule Window" select on Tournaments overlap once schedule_window is derived from status/dates — keep the one admins actually reach for, not both).
- **Overly technical/internal fields** (internal IDs, raw enum codes, foreign keys with no human-readable label) — never surface these directly; if the underlying data matters, filter by the human-readable related field instead.

## 3. Server-Side Filtering Standard

**All meaningful filtering and searching happens server-side.** No list page should fetch a full or large dataset to the browser and filter/search it in JavaScript against a `MatTableDataSource`. This audit found pages doing exactly that (see per-page sections in Part 2) — flagged explicitly since fixing it is one of the highest-value, lowest-risk changes available (correctness — client-side filtering only ever sees the current page's rows, not the true whole-table match set — as much as performance).

- Standard plumbing already exists and should be reused, not reinvented per page:
  - Frontend: `buildListParams()` (`backoffice/src/app/shared/functions/list-params.function.ts`) composes `page`, `per_page`, `sort`, and `filter[...]` params from a page's `searchForm.value`.
  - Frontend: `bindListSortToReload` / `onListPaginationChange` / `resetListSearchForm` (`backoffice/src/app/shared/functions/list-page-paging.function.ts`) standardize sort/paginate/clear so no page can drift (e.g. forget to reset to page 0 on Clear).
  - Backend: `QueryBuilder::for($this->baseQuery())->allowedFilters($this->model->getFilters())->allowedSorts($this->model->getSorts())` (`BaseControllerTrait::index()`) is the shared entry point; the actual filter/sort surface is declared per-model in `getFilters()`/`getSorts()`, using `AllowedFilter::exact()`, `AllowedFilter::partial()`, `AllowedFilter::scope()`, or `AllowedFilter::callback()` as appropriate.
- **A backend capability gap is cheaper to close than a frontend-only one.** Several models already expose filters via `getFilters()` that the Angular UI never surfaces (e.g. `Tournament::getFilters()` already has `AllowedFilter::partial('tournament_name')`, but the Tournaments page has no search box at all today). Closing these is pure frontend work. Treat "backend-ready, frontend-missing" gaps as the first wave of implementation once this document is approved — they carry no backend risk.
- A true client-side-only table (all rows fetched once, sorted/filtered in the browser) is acceptable **only** when the underlying dataset is small and bounded by construction (e.g. a fixed list that can never grow past a few dozen rows) — not because the corresponding backend endpoint hasn't been given filters yet.

## 4. Performance Considerations

- **Index every column used in an exact-match or range filter** (`status`, `type`, foreign keys used in a filter, date columns used in range filters). Confirm via the actual migration before assuming an index exists — do not add filters against unindexed high-cardinality columns on large tables without an index migration alongside.
- **`LIKE '%term%'` (leading wildcard) cannot use a standard B-tree index** — this is acceptable for free search on small-to-medium tables (most admin tables here are in the thousands-to-low-tens-of-thousands row range), but should be flagged, not silently scaled, if a table ever grows into the millions of rows. At that scale, a full-text index (MySQL `FULLTEXT`, or a search service) replaces `LIKE`, not a redesign of the filter UI.
- **Relationship-based filters/search should only touch relations already eager-loaded for the list**, or an existing indexed foreign key — never trigger an N+1 or an unindexed join purely to support a filter.
- **Always paginate.** No admin list should offer an unbounded "load everything" filter result set to the browser; `paginateOrAll()`'s `?all` escape hatch exists for internal/export use, not for user-facing filtered views.
- **Date-range filters should default to inclusive day boundaries** (`created_after` = start of day, `created_before` = end of day) so an admin picking "today" for both ends gets today's records, not zero.

## 5. UI/UX Consistency

- **Fixed layout, every page:** `app-page-header` → `mat-divider` → `app-search-filter-bar` (Free Search first, then filters in most-used-first order) → `mat-divider` → `app-table-wrapper`. No page should reorder or omit dividers.
- **Hard rule — visual split inside the filter bar itself:** within `app-search-filter-bar`, Free Search is not just "the first control," it is visually separated from the advanced filters by a thin vertical divider, so the bar always reads as two zones:

  ```
  [ 🔍 Search ]  │  [ Status ▾ ]  [ Type ▾ ]  [ Date Range ]  [ Clear ]
       Free            └──────────── Advanced Filters ─────────────┘
       Search
  ```

  This is a layout requirement, not a suggestion left to each page: every page gets the same `[Search] │ [Advanced Filters]` shape, with the divider rendered by the shared bar component (see Shared Building Blocks below), never hand-drawn per page with a border/margin hack.
- **Free search is always the leftmost/first control**, to the left of the divider — admins should be able to reach for the same first move on every page.
- **Consistent control types per data shape:** enums/status → `mat-select`; booleans → a two/three-state `mat-select` (All / Yes / No), not a bare checkbox that can't represent "unset"; date ranges → a shared date-range control (start + end), not two independent unlabeled date pickers.
- **Clear/reset** always restores every control (including free search) to its default and reloads page 1 — use `resetListSearchForm()`, never a bespoke per-page implementation.
- **Active-filter indication:** when filters beyond defaults are applied, this should be visible (e.g. a "Clear filters" control only enabled/shown when non-default) — several current pages give no visual indication that a filter is active, which this document's per-page audits call out.
- **Search persistence:** filter/search state should survive a page-size or sort change (it already does, via the shared paging helpers) but does not need to survive navigation away and back unless a page explicitly needs it (none currently do).
- **Loading state:** the table shows its existing skeleton/spinner convention (`app-table-skeleton`) while a filtered request is in flight — do not clear rows to empty before the new response arrives, to avoid a jarring flash.
- **Empty state:** a filtered-to-zero result must say so in a way that's distinguishable from "this table has no data at all" (e.g. "No results match your filters" + a Clear-filters action, vs. a true empty-table message) — some pages currently reuse a single generic empty state for both cases.

## 6. Shared Building Blocks

The per-page work in Part 2 assumes these pieces of shared UI exist. None of them exist today in this exact form — building (or extending) them is prerequisite work, not a per-page task, and should land once, early, rather than being reinvented on whichever page happens to need it first:

| Building block | Status today | What's needed |
|---|---|---|
| `app-search-filter-bar` divider slot | Component only lays out flex children (`search-filter-bar.component.ts`/`.scss`); no concept of a "search zone" vs. "filters zone" | Add a way to mark the free-search control as visually distinct (leading slot + vertical divider) so the `[Search] │ [Filters]` split in §5 renders consistently without each page hand-styling it |
| Shared date-range control | Every page with a date range today hand-rolls two independent `mat-datepicker` inputs (From/To, Start/End — naming itself is inconsistent page to page) | One `app-date-range-filter`-style control: paired start/end pickers, consistent labeling, "after ≤ before" validation built in once instead of per page (Quick Matches already validates this ad hoc — generalize it) |
| Two/three-state boolean select | No shared pattern; booleans that exist today are ad hoc (`is_active`, `is_special_offer`, etc. all unwired) | A small shared options constant/component for "All / Yes / No" selects, so every new boolean filter (Highlights' Is Active, Products' On Sale, a future "Has Reports" on Posts) looks and behaves identically |
| Active-filter indicator | Not implemented anywhere — no page shows "N filters applied" or disables Clear when already at defaults | A small presentational helper (likely reading `searchForm.value` against `DEFAULT_FILTERS`) wired into the shared Clear button |
| Empty-state copy/component | Pages reuse one generic empty state for both "no data at all" and "no results match your filters" | Extend the existing empty-state component to accept a mode/message so a filtered-to-zero result reads differently from a genuinely empty table |
| Relationship-aware search scope helper (backend) | Each model that needs to search a related table today hand-writes its own `whereHas(...)` (Post, Support Message, Vendor, Order all need this independently) | Not a UI component, but worth a shared Laravel trait/helper mirroring `UserBuilder::search()`'s shape, so every new multi-column search scope is written the same way instead of five subtly different `whereHas` styles |

None of these are large builds individually, but every Wave 1+ page in Part 3 below depends on at least the first three, so they should be scheduled before — or, at minimum, alongside — the very first page in Wave 1, not deferred to the end.

---

# Part 2 — Per-Page Audit

*(Sections below are grouped by module, in the order they appear in the sidebar navigation.)*

## Tournaments Management

### 1. Tournaments

**Route:** `/tournaments-management/tournaments`
**Component:** `backoffice/src/app/pages/tournaments-management/tournaments/tournaments.component.ts`
**Service:** `backoffice/src/app/services/tournaments.service.ts`
**Backend:** `api/app/Http/Controllers/Admin/TournamentController.php` / `api/app/Models/Tournament.php`

#### Page Information
- **Purpose:** Create and manage tournaments, and track their schedule/status lifecycle.
- **Current search:** None. There is no free-text search box anywhere on this page — confirmed by reading the component and template. `DEFAULT_FILTERS` only defines `status`, `schedule_window`, `tournament_type`; no `search`/`q` control exists in `searchForm`, and the `.html` template's `app-search-filter-bar` contains exactly three `mat-select` fields, no `mat-input`.
- **Current filters:**
  - Status — `mat-select`, options from `enumsService.getOptions('status')`
  - Schedule (Window) — `mat-select`, options from `enumsService.getOptions('tournament_schedule_window')` (upcoming / live / completed)
  - Tournament Type — `mat-select`, options from `enumsService.getOptions('tournament_type')`
- **Current table columns:** `sr, tournament_name, tournament_type, venue_name, prize, location, start_date, end_date, schedule_phase, status, created_at, actions`

#### Free Search
```
Free Search
├── tournament_name
├── venue_name
├── city
└── organizer / creator (name, nickname, email, phone)
```
Admins hunting for a tournament almost always know its name or venue, so those two should anchor the search box (`tournament_name` already has an `AllowedFilter::partial` on the backend — free). `city` is worth including since venues are often searched by city when the exact venue name is fuzzy. The `organizer`/`creator` relation is already eager-loaded (`->with(['organizer', 'creator'])`) via `baseQuery()`, making an OR-search against the related user's `name`/`nickname`/`email`/`phone` cheap to add (mirroring the `User::search()` benchmark) — useful when a broadcast-role admin remembers "who created it" rather than the tournament's exact name. All matching should be case-insensitive partial (`LIKE %term%`), consistent with the existing `tournament_name` partial filter.

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Free search (name/venue/city/organizer) | text | Add | No (needs new `search` scope) | No free-text search exists today despite this being the single most common admin workflow ("find this tournament"); backend already has cheap building blocks (`tournament_name` partial filter, eager-loaded `organizer`/`creator`). |
| Status | select | Keep | Yes | Core lifecycle filter (draft/active/etc.), already wired end-to-end; frequently used to separate live tournaments from drafts. |
| Schedule Window (upcoming/live/completed) | select | Keep | Yes | High business value — lets ops quickly find "what's live right now" or "what's coming up"; already implemented via `AllowedFilter::callback` + `applyScheduleWindowFilter()`. |
| Tournament Type | select | Keep | Yes | Bare-string filter on the model, already exact-matched; useful for distinguishing formats (e.g. knockout vs league) but lower frequency than status/schedule. |
| Country | select/text | Add | Backend-only-today | Backend already exposes `country` as a bare (partial) filter on the model but the UI never surfaces it; cheap to add — a dropdown of distinct countries would let multi-region organizers narrow quickly. |
| City | text | Consider (fold into search) | Backend-only-today | Backend already exposes `city` as a bare filter; rather than a dedicated control, fold it into free search (see above) to avoid filter-bar clutter — city alone is rarely the primary lookup key. |
| Created date range | date-range | Add | No (model has no `OperatorFilterTrait`/date scope) | Useful for audits ("tournaments created this month") but lower priority than name search; would need the model to mix in `OperatorFilterTrait::getCreatorModifierFilters()` or an equivalent scope — not present today. |

#### What We Have Today
Three `mat-select` dropdowns (Status, Schedule Window, Tournament Type) wired through a standard `searchForm` / `buildListParams` / `bindListSortToReload` pattern — fully server-side via Spatie QueryBuilder. However, there is a real gap: the backend model already defines a partial-match filter on `tournament_name` plus bare (partial) filters on `country` and `city`, none of which the Angular UI exposes. This is a "cheap add" case — the filtering logic already exists server-side and just needs form controls and `buildListParams`/`requestParams` wiring on the frontend. There is currently no dedicated free-text search scope (no `AllowedFilter::scope('search')` comparable to `User::search()`), so even once wired up, only single-field partial matches are available, not a true multi-column OR search.

#### What We Should Add
- A free-text search box searching `tournament_name` (partial, already filterable), extended with a new backend `search` scope also covering `venue_name`, `city`, and organizer/creator name/nickname/email/phone (mirroring `UserBuilder::search()`).
- A Country filter (backend filter already exists — just needs a frontend control, ideally a select of distinct countries rather than free text to avoid typos).
- A created-date range filter for audit/reporting workflows, once the model adopts `OperatorFilterTrait::getCreatorModifierFilters()` (or a bespoke scope) for `created_after`/`created_before`.

#### What We Should Remove
None — Status, Schedule Window, and Tournament Type are all justified, low-cardinality, high-frequency filters that are already implemented correctly server-side.

#### Recommended Final Design
```
Free Search (name / venue / city / organizer)
    ↓
Status
    ↓
Schedule Window
    ↓
Tournament Type
    ↓
Country
    ↓
Created Date Range
```

---

### 2. Teams

**Route:** `/tournaments-management/teams`
**Component:** `backoffice/src/app/pages/tournaments-management/teams/teams.component.ts`
**Service:** `backoffice/src/app/services/teams.service.ts`
**Backend:** `api/app/Http/Controllers/Admin/TeamController.php` / `api/app/Models/Team.php`

#### Page Information
- **Purpose:** Manage the catalog of cricket teams that can be entered into tournaments and matches.
- **Current search:** Server-side. One free-text input labeled "Search" (placeholder "Name or code") bound to `filter[search]` via `buildListParams`, which the backend resolves through `AllowedFilter::callback('search', …)` doing a case-insensitive `LIKE` OR across `name` and `code`.
- **Current filters:**
  - Search — text input (name/code, server-side LIKE OR)
  - Country — text input, sent as `filter[country]` (exact match server-side via `AllowedFilter::exact('country')`)
- **Current table columns:** `sr, logo, name, code, location, sponsor, icons, created_at, actions`

#### Free Search
```
Free Search
├── name
├── code
└── city (optional)
```
The existing `search` scope already covers the two fields admins actually type when looking up a team (full name or short code), case-insensitively, matching the `User::search()` quality bar reasonably well. `city` could be added to the OR-search since the "Location" column combines city + country and city is not otherwise filterable, but this is a minor enhancement, not a gap. Sponsor name is a relation (`sponsor` → `User`) that is eager-loaded (`->with(['sponsor', 'creator', 'iconPlayers'])`) but is a much rarer search key (admins rarely look up a team by its sponsor) so it's not worth the added query complexity.

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Free search (name/code) | text | Keep | Yes | Already implemented to a good standard (case-insensitive LIKE OR, escaped, benchmark-quality); this is the primary team lookup path. |
| Country | text (free-type) | Keep, but change input type | Yes (exact match) | Useful for narrowing by region, but is currently a raw text `matInput` requiring an exact match server-side — a typo or casing mismatch (`AllowedFilter::exact` is case-sensitive at the DB level depending on collation) silently returns zero rows; should become a `mat-select` of distinct countries, or the backend filter should switch to partial/case-insensitive. |
| City | text | Add (fold into search or new control) | No | Location column shows city, but there's no way to filter by it today; low-medium priority given team counts are likely modest, but still a real gap versus the visible column. |

#### What We Have Today
A two-field filter bar: a genuinely server-side, well-implemented free-text search (`name`/`code`, case-insensitive LIKE OR — comparable in quality to the `User::search()` benchmark) and a Country text field that maps to an **exact** match filter server-side. This is a UX trap: the input looks like a search box (free text, no dropdown) but requires the admin to type the country's stored value precisely, with no autocomplete or select. Note: contrary to the initial brief's premise, `Team` does **not** use `OperatorFilterTrait` — its `getFilters()` is a plain array of `AllowedFilter::callback('search', …)` and `AllowedFilter::exact('country')`; there is no date-range filter support today.

#### What We Should Add
- Convert Country from free-text-exact to a `mat-select` populated from distinct countries (or switch the backend filter to `AllowedFilter::partial`) to remove the silent-zero-results trap.
- Fold `city` into the free-search OR-clause (or add a lightweight City filter) since it's a visible, unfilterable column today.

#### What We Should Remove
None — Search and Country are both justified; Country just needs a UX/matching-behavior fix rather than removal.

#### Recommended Final Design
```
Free Search (name / code / city)
    ↓
Country (select, distinct values)
```

---

### 3. Tournament Requests

**Route:** `/tournaments-management/tournament-requests`
**Component:** `backoffice/src/app/pages/tournaments-management/tournament-requests/tournament-requests-list.component.ts`
**Service:** `backoffice/src/app/services/tournament-request.service.ts`
**Backend:** `api/app/Http/Controllers/Admin/TournamentRequestController.php` / `api/app/Models/TournamentRequest.php`

#### Page Information
- **Purpose:** Review and triage tournament-hosting requests submitted by users, approving them into real Tournaments or rejecting them.
- **Current search:** None (no free-text box for the requester's name or tournament name). The only text-style input is a dedicated "Contact Phone" field, which is a specific-field filter, not a general search.
- **Current filters:**
  - Contact Phone — text input, sent as `filter[contact_phone]` (exact match server-side, since `getFilters()` lists it as a bare string → partial by QueryBuilder default — see note below)
  - Tournament Type — `mat-select`, options from `enumsService.getOptions('tournament_type')`
  - Status — `mat-select`, options from `enumsService.getOptions('tournament_request_status')`
- **Current table columns:** `sr, tournament_name, contact_person, contact_phone, tournament_type, venue, prize, location, start_date, end_date, status, created_at, actions`

#### Free Search
```
Free Search
├── tournament_name
├── contact_person_name
├── contact_phone
└── requesting user (name, nickname, email, phone — via `user` relation)
```
Reviewers triaging incoming requests typically know either the tournament's proposed name or the contact person's name/phone — none of which is currently searchable except phone (as its own field, exact-ish match). A single search box covering `tournament_name`, `contact_person_name`, and `contact_phone` (plus the linked `user` relation, already eager-loaded via `->with('user')`) would match the highest-value admin workflow: "did someone already request a tournament called X?" or "find the request from this phone number." Case-insensitive partial match throughout, digits-only normalization for phone (as `User::search()` does) since phone numbers are often typed with/without country code or dashes.

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Free search (tournament name/contact person/phone) | text | Add | No (needs new `search` scope) | No general search exists; this is the single biggest gap on this page, and the backend has all needed columns present on the base table (no joins required for name/phone). |
| Contact Phone | text | Keep, but fold into Free Search | Yes (bare filter = partial) | Currently a dedicated field; once general search exists, a standalone phone field becomes redundant unless reviewers specifically want to search phone only — recommend folding in rather than keeping both. |
| Tournament Type | select | Keep | Yes | Bare-string (partial) filter on the model; useful secondary narrowing, moderate frequency. |
| Status | select | Keep | Yes | Core triage filter — separating pending/approved/rejected requests is the primary workflow on this page and should stay prominent (arguably the most-used filter here, above Tournament Type). |
| Created date range | date-range | Add | No (no `OperatorFilterTrait` on this model either) | Useful for "requests submitted this week" during triage backlogs; would require adding `OperatorFilterTrait::getCreatorModifierFilters()` or a bespoke scope — not present today despite the brief's premise that this model already uses it. |

#### What We Have Today
Three filters: a Contact Phone text field, a Tournament Type select, and a Status select — all server-side. `TournamentRequest::getFilters()` returns a flat array of bare strings (`['id', 'user_id', 'status', 'tournament_type', 'contact_phone', 'city']`), meaning every one of these — including `contact_phone` and `city` — defaults to `AllowedFilter::partial` (case-insensitive-by-DB-collation `LIKE %value%`), not exact match. **Important correction to the task brief:** the model does **not** use `OperatorFilterTrait` — grepping the entire `app/` tree for `OperatorFilterTrait` only turns up `Team.php`'s and this file's absence; neither `Team` nor `TournamentRequest` actually mixes in the trait. There is no date-range filtering available on this model today, backend or frontend. The `city` filter is available server-side but not exposed in the UI at all.

#### What We Should Add
- A free-text search box (new backend `search` scope) covering `tournament_name`, `contact_person_name`, `contact_phone` (digits-only normalized), and the linked `user`'s name/email/phone — this is the clearest gap on the page since reviewers currently have no way to look up a request by the requester's name or the proposed tournament's name at all.
- A created-date range filter (requires adding `OperatorFilterTrait::getCreatorModifierFilters()` to the model) to help clear request backlogs by submission date.

#### What We Should Remove
- The standalone Contact Phone field, once folded into free search — keeping both would be redundant and add filter-bar clutter for no added capability.

#### Recommended Final Design
```
Free Search (tournament name / contact person / phone)
    ↓
Status
    ↓
Tournament Type
    ↓
Created Date Range
```

---

### 4. Tournament Matches

**Route:** `/tournaments-management/tournaments/:tournamentId/matches`
**Component:** `backoffice/src/app/pages/tournaments-management/tournament-matches/tournament-matches.component.ts`
**Service:** `backoffice/src/app/services/tournament-matches.service.ts`
**Backend:** `api/app/Http/Controllers/Admin/TournamentMatchController.php` / `api/app/Models/TournamentMatch.php`

#### Page Information
- **Purpose:** View and manage the fixture list (matches) scheduled within a single tournament, and jump into match scheduling/control.
- **Current search:** **Confirmed 100% client-side.** `loadMatches()` calls `matchesApi.listByTournament(this.tournamentId, true)`, which requests `v1/admin/tournaments/{id}/matches?all=1` — fetching every match for the tournament in one unpaginated response. All filtering/searching then happens in `applyFilters()` against the in-memory `allMatches` array using plain JS `.filter()` and `.includes()` on lower-cased strings. This matches — and verifies — the ground-rules' explicit call-out that this page is client-side-only. The code comment in `list-page-paging.function.ts` even explicitly excludes `tournament-matches` from the shared server-side paging helpers: *"Do not use for client-side-only tables (e.g. tournament-matches)..."*.
- **Current filters (all client-side):**
  - Search ("Teams, Venue, Result…") — text input, filters in-browser across `match_date`, `match_time`, `venue_name`, `home_team.name`, `away_team.name`, `status_label`, `status`, `result_summary`
  - From (Start Date) — `mat-datepicker`, client-side `>=` comparison on `match_date`
  - Status — `mat-select` (from `enumsService.getOptions('match_status')`), client-side equality filter
  - Live Today — `mat-slide-toggle`, client-side filter for `match_date` === today's date string
- **Current table columns:** `when, teams, venue, status, result, actions`

#### Free Search
```
Free Search (client-side today; should become server-side)
├── venue_name
├── home_team.name / away_team.name
├── status / status_label
└── result_summary
```
The current client-side search already covers a sensible set of fields (teams, venue, status, result) — the field selection itself is reasonable; the problem is purely *where* it executes. Once moved server-side, `home_team`/`away_team` are already eager-loaded relations (`->with(['homeTeam', 'awayTeam', ...])` in the controller), so a `whereHas`-based OR search against team names is cheap. `result_summary` is a computed accessor (not a DB column), so it cannot be searched directly server-side — it would need to be decomposed into its underlying columns (`is_no_result`, `status`, `winning_team_id`, `win_by_runs`/`win_by_wickets`) or dropped from search scope.

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Free search (teams/venue/status/result) | text | Keep concept, move to server | No — must be added | Tournaments can have many matches (round-robin/knockout brackets); client-side search doesn't scale and won't reflect future matches added while the page is open without a full refetch. |
| From (Start Date) | date | Keep concept, move to server | No — must be added | Legitimate workflow ("show me matches from this date forward"); trivial to convert to a `whereDate('match_date', '>=', …)` scope. |
| Status | select | Keep, move to server | No — must be added | Core fixture-state filter (scheduled/live/completed/cancelled); currently client-side despite being a plain enum column — cheap to server-side via `AllowedFilter::exact('status')` or partial. |
| Live Today | boolean toggle | Keep, move to server | No — must be added | High-value quick filter for match-day operations ("what's live right now across this tournament") — should become a scope/callback filter analogous to `Tournament::applyScheduleWindowFilter`. |
| Pagination | — | Add | No — must be added | Currently the "paginator" only paginates the client-side in-memory array (`dataSource.paginator`) after a full unpaginated fetch of `?all=1`; for tournaments with many fixtures (large round-robin groups, multi-format events) this means always downloading the entire match list up front regardless of page size selected. |

#### What We Have Today
This page is architecturally different from the other three: the backend `TournamentMatchController::index()` does **not** extend `BaseAdminController` and does **not** use Spatie `QueryBuilder` at all — it's a bespoke `Controller` + `BaseControllerTrait` action that just does `$tournament->matches()->with([...])->orderBy(...)->orderBy(...)`, then `paginateOrAll()`. There is no `getFilters()`/`getSorts()` on `TournamentMatch` for this endpoint, so the backend accepts **zero** filter query params — only the `?all=1` vs. paginated toggle. The frontend always requests `all=1` and does every bit of searching, date filtering, status filtering, "live today" filtering, sorting, and pagination in the browser against the full fetched array. This is confirmed as intentional/known: the shared pagination helper file explicitly documents tournament-matches as the excluded client-side case. For tournaments with small fixture counts this works fine today, but it does not scale and duplicates logic that already exists server-side elsewhere (e.g. `Tournament::applyScheduleWindowFilter` for a similar "live now" concept).

#### What We Should Add
- Real server-side filtering: add `getFilters()`/`getSorts()` to `TournamentMatch` (or a dedicated query-building scope) covering `status` (exact/partial), `match_date` range (`from_date`/`to_date`), a `live_today` callback filter, and a `search` scope across `venue_name` + `homeTeam.name`/`awayTeam.name` via `whereHas`.
- Rework `TournamentMatchController::index()` to accept pagination params (page/per_page/sort) the same way `BaseAdminController`-derived controllers do, rather than defaulting to `?all=1` fetch-everything.
- True server-side pagination so large tournaments (many teams/groups, long round-robins) don't require downloading the full fixture list on every page load.

#### What We Should Remove
None of the current filter *concepts* should be removed — Search, From Date, Status, and Live Today are all genuinely useful for match-day and scheduling workflows. What should be removed is the client-side-only implementation itself, once server-side equivalents exist.

#### Recommended Final Design
```
Free Search (teams / venue / status)
    ↓
Live Today (quick toggle)
    ↓
Status
    ↓
From (Start Date)
```
(All four re-implemented as server-side filters against a paginated endpoint, replacing the current `?all=1` + in-browser `MatTableDataSource` filtering.)

---

### 5. Quick Matches

**Route:** `/tournaments-management/quick-matches`
**Component:** `backoffice/src/app/pages/tournaments-management/quick-matches/quick-matches-list.component.ts`
**Service:** `backoffice/src/app/services/quick-matches.service.ts`
**Backend:** `api/app/Http/Controllers/Admin/QuickMatchController.php` / `api/app/Models/TournamentMatch.php` (aliased as `App\Models\CricketMatch`, table `matches`)

#### Page Information
- **Purpose:** Moderation list for user-created "quick matches" (ad-hoc matches created in-app, not part of a tournament), so admins can review and cancel abusive/unsafe matches.
- **Current search:** Free text box labeled "Search" (placeholder "Creator or team name"), bound to `q`. Server-side — the backend OR-searches `createdBy.name`, `createdBy.nickname`, `homeTeam.name`, and `awayTeam.name` via three separate `whereHas` sub-queries.
- **Current filters:** Status (`mat-select`, options from `EnumsService.getOptions('match_status')`), From Date (`mat-datepicker`, filters `match_date >=`), To Date (`mat-datepicker`, filters `match_date <=`, validated `after_or_equal:from_date`).
- **Current table columns:** `sr, when, teams, creator, venue, format, status, actions`.

#### Free Search
```
Free Search
├── Creator name / nickname (users.name, users.nickname)
├── Home team name (teams.name)
└── Away team name (teams.name)
```
This already matches real admin workflow: moderators typically know either who created the abusive match or one of the team names, not an internal match ID. Partial, case-insensitive LIKE matching across all three is correct (MySQL LIKE is case-insensitive by default under standard collations). Venue name is a reasonable low-cost addition since it's a plain column on `matches` (no join needed) and admins investigating a specific location's reports would search by venue. Performance caveat: each of the three relations is searched via an independent `whereHas` (i.e., three correlated `EXISTS` subqueries OR'd together) rather than a single join — fine at current data volumes but worth collapsing into one `search`-scope-style query (as `UserBuilder::search()` does) if the `matches` table grows large, to avoid three separate subquery scans per request.

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Status | select | Keep | Yes | Core moderation workflow — filtering to `pending`/`disputed`/`cancelled` etc. is the primary triage action for this page. |
| From Date / To Date | date-range | Keep | Yes | Quick matches are inherently date-scoped (ad-hoc, played on a specific day); narrowing to a day/week range is a common "what happened yesterday" moderation query. |
| Creator (user) | relationship | Add | Backend-only-today | `created_by` is already `whereHas`-filterable via `q`, and the endpoint validates `created_by` as an exact filter (`exists:users,id`) but the Angular UI never sends it — a user-picker/typeahead exposing this would let admins jump straight to "all quick matches by this user" from a user's profile, at zero backend cost. |
| Format (cricket format) | select | Add | No | `cricket_format` is a plain enum column on `matches` with no filter today; useful for narrowing large date ranges (e.g., only T20) but lower priority than status/date since format rarely correlates with moderation need. |
| Venue | text | Add | No | Plain `venue_name` column, cheap to fold into `q`'s free-search OR into its own filter if the free-search route is not preferred. |

#### What We Have Today
A fully bespoke (non-`BaseAdminController`, non-QueryBuilder) `index()` that hand-validates `status`, `created_by`, `from_date`, `to_date`, `q` and manually builds the query with `where`/`whereHas`/`whereDate`. This is a reasonably strong implementation functionally, but it's an outlier pattern versus the rest of the admin API (no `getFilters()`/`getSorts()` on the model for this endpoint — `TournamentMatch` defines neither). One concrete rough edge: the table has `matSort` wired on the `<table>` element and the component calls `bindListSortToReload()` (so clicking sort would re-trigger `loadHttpData()`), but **no column in the template declares `mat-sort-header`**, and `loadHttpData()` never sends a `sort` param to the backend at all — the backend doesn't accept one either (it always hard-orders by `match_date desc, id desc`). The sort wiring is effectively dead code today.

#### What We Should Add
- Expose `created_by` (already backend-validated) as a filter, ideally as a user-picker, to support "view this user's quick matches" jumps from a user detail page.
- Add a Format filter (`cricket_format`) — plain column, cheap backend addition (`AllowedFilter`-style exact match if migrated to QueryBuilder, or an extra `where` in the existing bespoke query).
- Either wire real column sorting (pick 2–3 useful sortable columns — When, Status — and add `sort` handling to the backend) or remove the unused `matSort`/`bindListSortToReload` wiring to stop suggesting a capability that doesn't exist.
- Consider folding `venue_name` into the existing `q` free-search rather than adding a fifth control, to keep the filter bar small.

#### What We Should Remove
- The non-functional `MatSort` wiring (`matSort` directive + `bindListSortToReload` call) should either be completed or removed — currently it's a UI affordance (sortable-looking table, via the generic `matSort` host directive) that does nothing because no column defines `mat-sort-header`.

#### Recommended Final Design
```
Free Search (creator name/nickname, home/away team name, venue)
    ↓
Status
    ↓
From Date / To Date
    ↓
Format
    ↓
Creator (user picker, deep-link only)
```

---

### 6. Interest Campaigns

**Route:** `/tournaments-management/interest-campaigns`
**Component:** `backoffice/src/app/pages/tournaments-management/interest-campaigns/interest-campaigns-list.component.ts`
**Service:** `backoffice/src/app/services/interest-campaign.service.ts`
**Backend:** `api/app/Http/Controllers/Admin/TournamentInterestCampaignController.php` / `api/app/Models/TournamentInterestCampaign.php`

#### Page Information
- **Purpose:** Manage "interest campaigns" — public sign-up forms (linked to a real tournament or a standalone custom-title campaign) that collect player interest submissions before/instead of formal tournament registration.
- **Current search:** Free text box labeled "Tournament Name" bound to `search` → sent as `filter[tournament_name]`. Server-side, via `AllowedFilter::partial('tournament_name')` (partial LIKE match). This component is also reused embedded inside a tournament's detail page (`tournamentId` `@Input()` set) — in that mode the search/type filters are hidden entirely and only `Status` remains, because the list is already scoped to `filter[tournament_id]`.
- **Current filters:** Status (`mat-select`, options from `EnumsService.getOptions('tournament_interest_campaign_status')`), Type/"Linked" (`mat-select`: All / Linked Tournament / Custom Title → `filter[linked]`, resolved by an `AllowedFilter::callback` checking `whereNotNull`/`whereNull` on `tournament_id`). Both filters plus search are hidden when embedded under a tournament (only Status remains).
- **Current table columns:** `sr, title, kind, slug, status, submissions, created_at, actions` (top-level list); `kind` column is dropped when embedded under a tournament.

#### Free Search
```
Free Search
├── Tournament / campaign title (tournament_name)
└── (recommend adding) Creator name (users.name via creator relationship)
```
Searching by `tournament_name` alone is the dominant workflow (admins recall the tournament/campaign by name), and partial/case-insensitive LIKE is correct here since titles are free text with no fixed casing. The `creator` relation (`created_by` → `users`) is already eager-loaded via `->with(['tournament', 'creator'])` in `baseQuery()`, so adding "created by admin X" to the search would be a cheap join-based addition — but this is a low-value addition since campaigns are staff-authored (small, low-cardinality set of internal creators), not end-user records; ranking it as optional.

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Status | select | Keep | Yes | Open vs closed is the primary operational state — determines whether a campaign is still accepting public submissions. |
| Type (Linked/Custom) | select | Keep | Yes | Distinguishes campaigns tied to a real `Tournament` from ad-hoc/custom ones; meaningfully different downstream behavior (linked campaigns snapshot tournament data), worth filtering when auditing standalone campaigns. |
| Tournament Name (search) | text | Keep | Yes | Already covered by Free Search above. |
| Created By (admin) | relationship | Add | No | Only useful once multiple staff create campaigns independently; low priority given typically small admin headcount, but cheap since `creator` is already eager-loaded. |
| Created Date range | date-range | Add | No | Neither the model's `getFilters()` nor `OperatorFilterTrait` is wired up for this model — would need backend work (adding `AllowedFilter::scope`/`OperatorFilterTrait::getCreatorModifierFilters()`) plus new date pickers in the UI. Useful for narrowing when auditing campaign creation activity over time, but the `created_at` column is already sortable, which covers most of this need already. |

#### What We Have Today
A clean, idiomatic implementation on top of `BaseAdminController` + `QueryBuilder`: `getFilters()` on `TournamentInterestCampaign` declares `exact` filters for `id`/`tournament_id`/`status`/`slug`, a `partial` filter for `tournament_name`, and a `callback` filter for the linked/custom split. The Angular side correctly omits `filter[status]` from `buildListParams`'s helper for the nested/embedded variant and injects a bespoke `filter[tournament_id]` when scoped to a tournament — a legitimate, well-justified bespoke param (not a gap, an intentional scope-narrowing). Sorting (`title`→`tournament_name`, `status`, `created_at`) is correctly wired via `mat-sort-header` and `buildListParams`.

#### What We Should Add
- Nothing urgent — this page is already close to the "reference" pattern (`User` model's `search` scope) in spirit, just narrower in scope since `tournament_name` is the only free-text field that matters here.
- Optional: a `created_by` (admin) filter, since the relation is already eager-loaded — cheap but low business value given the small number of staff creators.
- Optional: `created_after`/`created_before` date range if campaign-creation auditing becomes a recurring need — currently not backed by any filter mechanism on this model.

#### What We Should Remove
None — current filters are all justified.

#### Recommended Final Design
```
Free Search (tournament/campaign title)
    ↓
Status
    ↓
Type (Linked / Custom)
    ↓
Created By (admin, optional/low priority)
```

---

### 7. Campaign Submissions

**Route:** `/tournaments-management/interest-campaigns/:campaignId/submissions`
**Component:** `backoffice/src/app/pages/tournaments-management/interest-campaigns/campaign-submissions/campaign-submissions.component.ts`
**Service:** `backoffice/src/app/services/interest-submission.service.ts`
**Backend:** `api/app/Http/Controllers/Admin/TournamentInterestSubmissionController.php` / `api/app/Models/TournamentInterestSubmission.php`

#### Page Information
- **Purpose:** Within a single interest campaign's detail view, lists every player who submitted interest (sign-up form response) so admins can review/confirm/withdraw individual entrants.
- **Current search:** Free text box labeled "Player Name" bound to `search` → sent as `filter[name]`. Server-side, via `AllowedFilter::partial('name')` (partial LIKE match). Always additionally scoped by a fixed, non-editable `filter[campaign_id]` (the route's `campaignId` param) — this is not a user-facing filter, it's the page's inherent scope.
- **Current filters:** Status (`mat-select`, options from `EnumsService.getOptions('tournament_interest_submission_status')`, i.e. pending/confirmed/withdrawn).
- **Current table columns:** `sr, player, nickname, email, phone, location, dob_age, status, created_at, actions`.

#### Free Search
```
Free Search
├── Player name (name)  — currently searched
├── Nickname (nickname) — displayed, NOT currently searched
├── Email (email)       — displayed, NOT currently searched
└── Phone (phone)       — displayed, NOT currently searched
```
`TournamentInterestSubmission::getFilters()` already declares `AllowedFilter::partial('email')` and `AllowedFilter::partial('phone')` server-side, and `nickname`/`email`/`phone` are all rendered as visible table columns — but the Angular UI only ever sends `filter[name]`. This is close to the `User`/`UserBuilder::search()` reference pattern already described in this audit's conventions: admins triaging submissions realistically search by whichever detail they have on hand (a name from a screenshot, an email from a support ticket, a phone number from a call) so widening the single "Player Name" box into a combined OR-search across `name`, `nickname`, `email`, and `phone` is a low-cost, high-value change — the `email` and `phone` filters already exist on the backend today, so only a `nickname` partial filter needs to be added server-side (or wire a `search` scope mirroring `UserBuilder::search()`, including digits-only phone matching for phone numbers with punctuation/spacing). Case-insensitive partial matching is appropriate for all four fields.

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Status | select | Keep | Yes | Pending/confirmed/withdrawn triage is the core admin action on this page — deciding who to confirm into the tournament. |
| Search (name only today) | text | Keep, widen | Yes (name); Backend-only-today (email, phone) | See Free Search above — email/phone filters already exist server-side and are unused by the UI; only nickname needs a new backend filter. |
| Country / City | select or text | Add | No | Displayed as a column (`location`) but not filterable; useful when a campaign draws international interest and admins want to shortlist by region, though value scales with how international a given campaign's audience is. |
| Date of Birth / Age range | range | Add | No | Displayed as a column; relevant for age-bracketed tournaments (e.g., u19) where admins need to filter out ineligible submissions quickly — moderate business value, not currently possible even client-side. |
| Submitted Date range | date-range | Add | No | Not backed by any filter mechanism today (no `OperatorFilterTrait`/scope on this model); useful for reviewing "submissions from this week" but `created_at` is already sortable, which covers the common case of "show newest first." |

#### What We Have Today
A clean `BaseAdminController` + `QueryBuilder` implementation. `getFilters()` covers `id`, `campaign_id`, `user_id` (exact) and `name`, `email`, `phone` (partial) — more filter capability than the Angular UI exposes. The component correctly locks `filter[campaign_id]` to the route param and layers the user-editable `status`/`search` filters via `buildListParams`. Sorting (`player`→`name`, `status`, `created_at`) is correctly wired. The only real gap is under-utilization: two of the three partial-match backend filters (`email`, `phone`) are wired and tested on the model but never called from the frontend, and a fourth commonly-viewed field (`nickname`) isn't filterable on either side.

#### What We Should Add
- Widen the existing "Player Name" search box into a combined free-search across `name`, `nickname`, `email`, `phone` (backend: add `nickname` partial filter or a `search` scope like `UserBuilder::search()`; frontend: relabel the box "Search" and send it against a new `filter[search]`-style scope instead of `filter[name]` alone).
- Optionally add Country/City filtering, since the `location` column already renders this data and campaigns can be geographically diverse.
- Optionally add a Date of Birth/age-range filter for campaigns with age-eligibility rules.

#### What We Should Remove
None — current filters are all justified; the underused backend filters (`email`, `phone`) argue for widening the UI's search rather than removing anything.

#### Recommended Final Design
```
Free Search (name, nickname, email, phone)
    ↓
Status
    ↓
Country / City
    ↓
Date of Birth / Age range
```



## Users Management

### 8. Users

**Route:** `/users-management/users`
**Component:** `backoffice/src/app/pages/users-management/users/users.component.ts`
**Service:** `backoffice/src/app/services/users.service.ts`
**Backend:** `api/app/Http/Controllers/Admin/UserController.php` / `api/app/Models/User.php`

#### Page Information
- **Purpose:** Admin roster of app accounts (`type = user`, via `UserController::baseQuery()` → `User::query()->user()`) for reviewing profiles, backoffice role assignments, moderation status, and platform activity, plus create/edit/delete and broadcast-ban actions.
- **Current search:** **None.** There is no free-text search box in the UI at all. `DEFAULT_FILTERS` only defines `phone`, `status`, `created_after`, `created_before` — `loadHttpData()` never sends `filter[search]`, even though `buildListParams()` supports it and the backend's `scope('search')` (→ `UserBuilder::search()`) is fully wired and battle-tested (it's the reference implementation cited for this whole audit). This is server-side-capable but simply unused here.
- **Current filters:** Phone (text input, exact/partial digit match), Status (select, populated from `enumsService.getOptions('user_status')`), Start Date / End Date (two `mat-datepicker` inputs mapped to `created_after`/`created_before`).
- **Current table columns:** `sr, name, nickname, referral_nickname, email, phone, admin_roles, playing_role, bowling_style, batting_style, location, status, active_platform, created_at, updated_at, actions`.

#### Free Search
```
Free Search
├── Name
├── Nickname
└── Email
    (+ phone, digit-normalized — already proven in UserBuilder::search())
```
Admins hunting for a user during a support ticket or moderation review almost never have a clean single field to search by — they have a name fragment, a nickname, an email, or a phone number read off a ticket. The backend already implements exactly this via `AllowedFilter::scope('search')` → `UserBuilder::search()`: case-insensitive partial `LIKE` across `name`, `nickname`, `email`, plus digit-normalized `REGEXP_REPLACE` matching on `phone`. This is identical in shape to the Players page's search box, so wiring it up here is a pure frontend gap, not new backend work. No performance concern beyond the usual `LIKE '%…%'` caveat (can't use a plain B-tree index; acceptable at current user-table scale, revisit with full-text search if the table grows into the millions).

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Free Search (name/nickname/email/phone) | text | **Add** | Yes (backend scope exists, unused by UI) | Highest-frequency admin workflow (find a specific user) has zero support today; backend work is already done. |
| Phone | text | **Remove (fold into Free Search)** | Yes (`scope('phone')`) | `UserBuilder::search()` already digit-normalizes and matches `phone` as part of the same OR-clause as name/nickname/email — a standalone Phone box duplicates exactly what Free Search does, which is the redundant-filter case §2's own criteria rule out. Keep the underlying `scope('phone')` logic available for programmatic/deep-link use, just don't surface it as a second UI control next to Free Search. |
| Status | select | Keep | Yes (`AllowedFilter::exact('status')`) | Core moderation filter — finding blocked or verification-pending accounts is a routine admin task. |
| Created Date Range | date-range | Keep | Yes (`scope('created_after')`/`scope('created_before')`) | Useful for signup-cohort review and auditing growth/spam waves; low frequency but real business value. |
| Active Platform | select | **Add** | Yes (`scope('active_platform')`, unused by UI) | Already a visible table column and already exposed on the near-identical Players page; useful for support triage ("is this user even active on iOS?") at zero backend cost. |
| Admin Role (Backoffice Roles) | relationship | Add (low priority) | No — no scope exists today | `admin_roles` is a displayed column but has no corresponding filter; would need a new `whereHas('roles', …)` scope. Likely a small subset of users hold backoffice roles, so this is a nice-to-have, not urgent. |
| Type | select | Remove (n/a) | Backend-only-today (`AllowedFilter::exact('type')`) | Dead for this page: `baseQuery()` already hard-scopes to `type = user`, so this filter can never surface a different result set here. Not worth exposing. |

#### What We Have Today
A filter bar with four controls (Phone, Status, Start Date, End Date) that map cleanly onto `buildListParams()` and the shared `bindListSortToReload` / `onListPaginationChange` / `resetListSearchForm` helpers — this part follows the standard pattern correctly and is fully server-side. The glaring gap is the complete absence of a free-text search box: an admin who only has a user's name or email has no way to find them without knowing their exact phone number or scrolling/sorting through the full (paginated) list. This is surprising given the backend's `search` scope is the most mature search implementation in the codebase and is already live one page over (Players). All sortable columns (`name, nickname, email, phone, status, active_platform, created_at, updated_at`) match `User::getSorts()`, so no sort-related bugs here.

#### What We Should Add
- A Free Search box (name/nickname/email/phone) — the single highest-impact change, purely a frontend wiring exercise since the backend scope already exists.
- An Active Platform select filter, matching the one already on the Players page and matching the already-displayed `active_platform` column.

#### What We Should Remove
- The standalone Phone field, once Free Search covers phone matching — see the Filters table above. Status and the Created date range each remain justified by real, distinct workflows (moderation, cohort review) and should stay.

#### Recommended Final Design
```
Free Search (name / nickname / email / phone)
    ↓
Status
    ↓
Active Platform
    ↓
Created Date Range
```



## Players Management

### 9. Players

**Route:** `/players-management/players`
**Component:** `backoffice/src/app/pages/players-management/players/players.component.ts`
**Service:** `backoffice/src/app/services/players.service.ts`
**Backend:** `api/app/Http/Controllers/Admin/PlayerController.php` / `api/app/Models/User.php`

#### Page Information
- **Purpose:** Admin registry of the same `type = user` population as the Users page, but framed around playing-profile data (playing role, batting/bowling style, DOB) rather than accounts/roles — includes CSV bulk-import and a link into per-player career stats. Note: `PlayerController` does **not** extend `BaseAdminController` (unlike the documented convention) — it hand-rolls the same `QueryBuilder::for(...)->allowedFilters(User::getFilters())->allowedSorts(User::getSorts())` pattern inline, reusing the `User` model's filters/sorts directly since players ARE `User` records.
- **Current search:** Server-side. One free-text box (placeholder "Name, Email, Phone…") wired to `filter[search]` → `User::scopeSearch()` → `UserBuilder::search()` — the same reference implementation as Users. Note the placeholder text under-describes it: the underlying query also matches **nickname**, which isn't mentioned in the UI copy.
- **Current filters:** Search (text, see above), Phone (text, digit-normalized partial match via `scope('phone')`), Platform (select, `active_platform`, populated from `enumsService.getOptions('active_platform')`).
- **Current table columns:** `sr, name, nickname, referral_nickname, email, phone, date_of_birth, playing_role, bowling_style, batting_style, location, active_platform, actions`. Notably **no `status` column** — unlike Users, admins here cannot see (or filter) whether a player is blocked or still verification-pending.

#### Free Search
```
Free Search
├── Name
├── Nickname   (undocumented in the placeholder, but active)
├── Email
└── Phone (digits)
```
This page already has the correct, server-side implementation — it's the benchmark to bring the Users page up to. The only actionable note is cosmetic: update the placeholder/label to mention nickname so admins know it's covered, since it's a common lookup key for player identities (many players go by nickname on-app more than legal name).

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Search (name/nickname/email/phone) | text | Keep | Yes | Already correctly implemented; primary lookup tool. |
| Phone | text | **Remove (fold into Free Search)** | Yes (`scope('phone')`) | Same redundancy this audit flags on the Users page — Free Search's underlying `UserBuilder::search()` already digit-normalizes and matches `phone` in the same OR-clause; a separate Phone box next to a search box that already covers phone is exactly the redundant-filter case §2 rules out, on both pages. |
| Platform | select | Keep | Yes (`scope('active_platform')`) | Same value as on Users — quick triage of a player's last-seen client. |
| Status | select | **Add** | Backend-only-today (`AllowedFilter::exact('status')` exists on `User`, unused here) | Players can be `verification_pending` or `blocked` just like any user, but this page exposes neither a status column nor a status filter — an admin cannot currently find "players awaiting verification" or "blocked players" from this screen at all. Meaningful gap given CSV import likely creates a steady stream of pending-verification rows. |
| Created Date Range | date-range | Add | Yes (`scope('created_after')`/`scope('created_before')`, unused here) | Useful to review "players imported/added in the last week," especially after a CSV import batch — currently no way to narrow by signup/import date. |
| Playing Role / Bowling Style / Batting Style | select | Add (lower priority) | No — no scope exists today | All three are visible columns with a small, fixed enum of values; a coach/organizer building squads would benefit from filtering "show me all fast bowlers," but this needs new backend `AllowedFilter::exact()` entries (cheap to add, low current urgency vs. Status). |

#### What We Have Today
Search, Phone, and Platform are all correctly server-side and match the reference pattern. One implementation bug to flag: the "Location" column's header is `mat-sort-header="city"`, but `User::getSorts()` does not include `city` in its allow-list — clicking that column header sends `sort=city`/`sort=-city` to a QueryBuilder endpoint that will reject it (Spatie's `InvalidSortQuery`), so this control is currently broken. This isn't a filter per se, but it's an "awkward" interaction directly adjacent to this audit's scope and worth fixing alongside any filter-bar rework. Also worth noting: Players and Users draw from the exact same underlying `type = user` table with the exact same `getFilters()`/`getSorts()` — the two admin screens are really two different lenses (account/moderation vs. playing-profile) over one population, which is why several filters (Phone, Platform, Search) are duplicated between them and why Status/date-range parity between the two pages makes sense.

#### What We Should Add
- A Status select filter (and ideally a Status column) — currently the only way to spot blocked or pending-verification players is to open each record individually.
- A Created date range filter — cheap, backend-ready, valuable for reviewing recent additions/imports.
- Fix (not a filter add, but blocking correct filter/sort parity): remove or properly back the `city` sort on the Location column.

#### What We Should Remove
- The standalone Phone field, for the same reason as on the Users page — once Free Search is understood to cover phone, keeping a second phone-only box is redundant rather than merely "low-cost to keep."

#### Recommended Final Design
```
Free Search (name / nickname / email / phone)
    ↓
Status
    ↓
Platform
    ↓
Created Date Range
```

---

### 10. Player Stats

> **Out of scope for implementation.** This is a single-record detail view, not a list page — there is no row set to filter or search. It's documented here only for completeness (it was in the original audit's page list and sits in the same module as Players). Its two existing bucket selectors already work correctly and need no changes; skip this page entirely when scoping implementation work from this document.

**Route:** `/players-management/players/:playerId/stats`
**Component:** `backoffice/src/app/pages/players-management/players/player-stats/player-stats.component.ts`
**Service:** `backoffice/src/app/services/players.service.ts` (`getStats()`)
**Backend:** `api/app/Http/Controllers/User/PlayerStatsController.php` (path deviation — **not** `Admin/PlayerController.php`; this endpoint lives in the general/mobile-facing `User` controller namespace and is called via `GET v1/users/{user}/stats`, not an `/admin/...` route) / no single filterable Eloquent model — data is computed by `App\Services\PlayerStatsService` aggregating `PlayerMatchBatting`, `PlayerMatchBowling`, and `PlayerMatchFielding` rows for one player ID.

#### Page Information
- **Purpose:** Single-player career stats detail view (reached from the Players list's "View Stats" row action) — shows batting/bowling/fielding totals for one specific player, broken into tabs, with two bucket selectors to reshape which matches count toward the totals.
- **Current search:** **Not applicable.** This is not a list/table page — it displays one player (fixed by the `:playerId` route param) and has no rows to search across. There is no free-text field, and none should be added.
- **Current filters:** Tournament Type (select: `stats_bucket`/`tournament_type` enum, e.g. league/open_tournament/emerging/quick/all) and Cricket Format (select: hard_ball/tape_ball/tennis_ball/hard_tennis/all) — both sent as query params (`tournament_type`, `cricket_format`) to `PlayerStatsController::show()`, parsed via `StatBucketFilters::fromProfileQuery()`. These aren't filters over a row set; they're bucket selectors that change which underlying match rows are aggregated into the one player's stat totals.
- **Current table columns:** **None** — no `mat-table`. Output is stat-card tiles plus a `<dl>` definition list per active tab (Batting/Bowling/Fielding).

#### Free Search
```
Free Search
└── (Not applicable — single-player detail view; no row set exists to search)
```
No recommendation here — this page correctly has no search box because there is nothing to search across. Any change here would be scope creep beyond filtering.

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Tournament Type | select (bucket) | Keep | Yes | Core to cricket stats analysis — separates tournament career from casual/"quick" match performance, which is a meaningfully different signal for coaches/organizers. |
| Cricket Format | select (bucket) | Keep | Yes | Format (hard ball vs. tape ball vs. tennis ball, etc.) materially changes what "good" batting/bowling numbers look like; essential for apples-to-apples comparison. |

#### What We Have Today
Both bucket selectors are correctly wired server-side (via `statsTrigger$` → `PlayersService.getStats()` → `PlayerStatsController::show()`), refetching on Search/Clear exactly as expected. The implementation is sound; this page is simply a different category of screen (single-record detail with view-mode selectors) than the other two, and the audit's "table/list" assumptions don't map onto it — flagging that explicitly rather than forcing an ill-fitting write-up.

#### What We Should Add
Nothing — the two existing selectors already cover the two axes cricket stats are meaningfully sliced by. Adding more (e.g., a season/date-range selector) would only be worth considering if a real workflow demands year-over-year comparison, which isn't evidenced by the current backend (`StatBucketFilters` has no date/season parameter).

#### What We Should Remove
None — current filters are both justified.

#### Recommended Final Design
```
Tournament Type
    ↓
Cricket Format
```
(No Free Search node — not applicable to a single-record detail page.)



## Content Management

### 11. Hero Slider

**Route:** `/content-management/hero-slider`
**Component:** `backoffice/src/app/pages/content-management/hero-slider/hero-slider.component.ts`
**Service:** `backoffice/src/app/services/hero-slider.service.ts`
**Backend:** `api/app/Http/Controllers/Admin/HeroSliderController.php` / `api/app/Models/HeroSlider.php`

#### Page Information
- **Purpose:** Manage the homepage hero slider slides (mobile/desktop images, CTA behavior, status).
- **Current search:** None — there is no free-text field on this page.
- **Current filters:** Status — select dropdown (All / Active / Inactive, options from `EnumsService.getOptions('status')`, backed by `StatusEnum`). Server-side.
- **Current table columns:** `sr, image_mobile, image_desktop, cta_label, status, created_at, updated_at, actions`

#### Free Search
```
Free Search
└── CTA Label
```
Hero sliders have no "title"/"name" field — the only human-authored text is `cta_label` (e.g. "Shop Now"), and the images can't be searched. A partial, case-insensitive match on `cta_label` would help once the slide count grows past a page, but hero sliders are typically a small, hand-curated set (a handful to a couple dozen slides at most), so this is a low-priority addition rather than a core need.

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Status | select | Keep | Yes | The primary lifecycle toggle (active vs inactive) for a small, curated slide set — the one filter that matters here. |
| CTA Type | select (none/url/dialog) | Add | No (not in `getFilters()` today) | Distinguishes slides that link out vs open an in-app dialog vs do nothing; cheap to add since `cta_type` is a simple backed enum column. |

#### What We Have Today
Only a status filter, no search box. `HeroSlider::getFilters()` returns `status` as a **bare string**, which under this codebase's QueryBuilder default resolves to a **partial LIKE match**, not `AllowedFilter::exact()`. Functionally harmless today because `StatusEnum` only has two non-overlapping values (`active`/`inactive`), but it's inconsistent with how other models filter enum columns and should be tightened for correctness. `getSorts()` covers `id, status, created_at, updated_at`.

#### What We Should Add
- CTA Type filter (select) — backend addition is trivial (`AllowedFilter::exact('cta_type')`).
- Optional free-search on `cta_label`, mainly to future-proof once the slide list grows.
- Backend cleanup: change the bare `'status'` filter to `AllowedFilter::exact('status')` for correctness/consistency with the rest of the codebase.

#### What We Should Remove
None — the current status filter is justified and inexpensive.

#### Recommended Final Design
```
Free Search (cta_label)
    ↓
Status
    ↓
CTA Type
```

---

### 12. Highlights

**Route:** `/content-management/highlights`
**Component:** `backoffice/src/app/pages/content-management/highlights/highlights.component.ts`
**Service:** `backoffice/src/app/services/highlight.service.ts`
**Backend:** `api/app/Http/Controllers/Admin/HighlightController.php` / `api/app/Models/Highlight.php`

#### Page Information
- **Purpose:** Manage video highlights (YouTube or uploaded clips), each optionally tied to a tournament, surfaced to end users.
- **Current search:** Free text box labeled "Search by Title", bound to a `search` form control. `loadHttpData()` passes it through `buildListParams` → `filter[search]` → backend `AllowedFilter::partial('search', 'title')`, which searches the `title` column only. Server-side, partial match, effectively case-insensitive under default DB collation.
- **Current filters:** None beyond the search box — no select or date controls are exposed in the UI.
- **Current table columns:** `sr, thumbnail, title, duration, views_count, likes_count, is_active, created_at, actions`

#### Free Search
```
Free Search
├── Title
└── Description
```
Title is rightly the primary target and already works well. `description` likely holds identifying context (teams, players, competition context) admins would also search by, so it's a natural, low-cost addition to the same query. Tournament name is better served as its own discrete filter (see below) rather than folded into free text, since the relation is already resolved to a small, selectable list. Keep matching partial and case-insensitive, consistent with the existing title search.

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Search (title) | text | Keep | Yes | Primary lookup mechanism admins already rely on. |
| Is Active | boolean (select) | Add | Backend-only-today | Toggling active/inactive highlights is a routine content-moderation task; `AllowedFilter::exact('is_active')` already exists, just not wired into the UI. |
| Tournament | relationship (select) | Add | Backend-only-today | Highlights are commonly reviewed per-tournament; `tournament_id` is already an exact-allowed filter and the relation is already eager-loaded (`->with('tournament:id,tournament_name')`), so this is cheap. |
| Created Date Range | date-range | Add | Backend-only-today | `DateFilterTrait` already provides `created_after`/`created_before`/`created_between` scopes server-side (`AllowedFilter::scope(...)` for all three); useful for auditing recently-added highlights. |

#### What We Have Today
A search-only UI sitting on top of a materially more capable backend. `Highlight::getFilters()` already allows `is_active` (exact), `tournament_id` (exact), and full date-range filtering via `DateFilterTrait` (`created_after`, `created_before`, `created_between`) — none of these are wired into the Angular form. This is the most under-exposed page in this group: three of four backend-ready filters are entirely invisible to admins today.

#### What We Should Add
- Active/Inactive select — zero backend work, already an allowed exact filter.
- Tournament select/autocomplete — zero backend work, relation already eager-loaded.
- Created-date range pickers — zero backend work, scopes already implemented.
- Broaden free search to include `description`.

#### What We Should Remove
None — current filter set is minimal but not wrong; it's simply incomplete relative to what the backend already supports.

#### Recommended Final Design
```
Free Search (title, description)
    ↓
Tournament
    ↓
Is Active
    ↓
Created Date Range
```

---

### 13. Posts

**Route:** `/content-management/posts`
**Component:** `backoffice/src/app/pages/content-management/posts/posts.component.ts`
**Service:** `backoffice/src/app/services/post.service.ts`
**Backend:** `api/app/Http/Controllers/Admin/PostController.php` / `api/app/Models/Post.php`

#### Page Information
- **Purpose:** Moderate user-generated posts (text/image/video/repost) — review content, change status/visibility, reprocess stuck videos, remove posts.
- **Current search:** Free text field labeled "Search Body", bound to a form control named `caption`. `loadHttpData()` manually appends `'filter[caption]': value.trim()` (bespoke — bypasses the shared `buildListParams` helpers) whenever non-empty. Backend: `Post::getFilters()` defines `AllowedFilter::partial('caption', 'body')`, aliasing the query param `caption` onto the real `body` column. Notably, the API's own `caption` response field is *itself* just an alias of `body` (`PostResource`: `'caption' => $this->body`) — so three different names (`Search Body` label, `caption` form control/param, `body` DB column) all point at one field. Server-side, partial LIKE match.
- **Current filters:**
  - Type — select (text/image/video/repost); bespoke `filter[type]` param manually appended; server-side exact match.
  - Status — select (uploading/processing/ready/failed/rejected/removed); goes through `buildListParams`'s `addStatusFilter` → `filter[status]`; server-side exact match.
  - Visibility — select (public/followers/private); bespoke `filter[visibility]` param manually appended; server-side exact match.
- **Current table columns:** `sr, preview, type, caption, creator, status, visibility, views, likes, reports, created_at, actions`

#### Free Search
```
Free Search
├── Body (post text)
├── Creator name
└── Creator nickname
```
Body text is already searched and is the right primary target. Searching by creator name/nickname is a very common moderation workflow ("show me everything this user posted") — the `creator`/`user` relation is already eager-loaded via `User::socialSummaryWith()` in `baseQuery()`, and this codebase already has a reference implementation for exactly this shape of search (`App\Builders\UserBuilder::search()` — a case-insensitive, multi-column `LIKE`-OR scope). A `Post::scopeSearch()` that unions a `body` LIKE with a `whereHas('user', …)` LIKE on `name`/`nickname` would close this gap cheaply. Keep matching partial and case-insensitive; note that `posts.body` has no full-text index today, so LIKE search cost should be watched as the table grows.

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Status | select | Keep | Yes | Central to the moderation workflow (ready/failed/rejected/removed) — the highest-frequency filter on this page. |
| Type | select | Keep | Yes | Distinguishes text/image/video/repost, useful when triaging by content kind (e.g. isolating videos for the reprocess workflow). |
| Visibility | select | Keep | Yes | Useful for privacy-related audits (e.g. reviewing only public posts). |
| Creator (user) | text/relationship | Add | No | Moderators frequently need "this user's posts"; today only exact `user_id` is filterable, which requires already knowing the numeric ID — needs a name/nickname search scope. |
| Has Reports | boolean | Add | No | `reports_count` is shown as a column and is exact-filterable, but an exact-count match is not a realistic query; a "reported only" (`reports_count > 0`) toggle is what moderation actually needs and requires only a small scope. |
| Created Date Range | date-range | Add | No | `Post` has no date-scope trait mixed in today (unlike `Highlight`); useful for isolating a specific time window, e.g. during an incident review. |
| Reports count (exact) | number | Remove | Yes | `AllowedFilter::exact('reports_count')` exists but matching an exact count is not something an admin would realistically type in; superseded by the "Has Reports" boolean above. |

#### What We Have Today
Three of the four current controls are wired through ad-hoc `requestParams['filter[xxx]'] = …` assignments inside `loadHttpData()` rather than the shared `list-params.function.ts` helpers — only `status` goes through the standard `buildListParams`/`addStatusFilter` path; `type` and `visibility` are bespoke simply because no shared helper exists for them yet (reasonable given they're page-specific, but it means three slightly different code shapes doing the same kind of thing on one page). The search field carries confusing naming: UI label "Search Body" → form control `caption` → query param `filter[caption]` → backend alias → actual column `body`. There is no way to find posts by author short of already knowing a `user_id`, and no way to isolate reported content beyond eyeballing the numeric "Reports" column.

#### What We Should Add
- Creator name/nickname search (fold into free search, or add a dedicated field) — cheap, since the relation is already eager-loaded.
- "Has reports" / reported-only boolean toggle, replacing the impractical exact `reports_count` filter.
- Created-date range filter, following the `DateFilterTrait`/`OperatorFilterTrait` pattern already used on other models.
- (Naming cleanup, not a feature) Rename the `caption` form control/param to `body` to remove one layer of indirection.

#### What We Should Remove
- The exact-match `reports_count` filter (backend capability) — not worth keeping alongside a "has reports" boolean once added.

#### Recommended Final Design
```
Free Search (body, creator name/nickname)
    ↓
Status
    ↓
Type
    ↓
Visibility
    ↓
Has Reports
    ↓
Created Date Range
```

---

### 14. Post Reports

**Route:** `/content-management/post-reports`
**Component:** `backoffice/src/app/pages/content-management/post-reports/post-reports.component.ts`
**Service:** `backoffice/src/app/services/post-report.service.ts`
**Backend:** `api/app/Http/Controllers/Admin/PostReportController.php` / `api/app/Models/PostReport.php`

#### Page Information
- **Purpose:** Review and action posts that users have reported (spam, harassment, inappropriate content, violence, copyright, other).
- **Current search:** None.
- **Current filters:** Status — select (Open / Reviewed / Dismissed / Actioned). Server-side exact match.
- **Current table columns:** `sr, preview, caption, reason, reporter, status, created_at, actions`

Backend note: `PostReportController::index()` **fully overrides** the generic `BaseAdminController::index()` instead of delegating to model `getFilters()`/`getSorts()` — `PostReport` defines neither. The controller directly builds `QueryBuilder::for($this->baseQuery())->allowedFilters([exact status, exact reason, exact post_id, exact reporter_id])->allowedSorts(['id','created_at','status','reason'])`. This is a deliberate deviation from this codebase's usual model-driven pattern, worth calling out for the redesign since it means backend capability lives in the controller here, not the model.

#### Free Search
```
Free Search
├── Reported post body/caption
└── Reporter name / nickname
```
Reviewers commonly want to jump straight to "every report involving user X" (as reporter) or find a report tied to specific post content, without paging through the whole open queue. Both `post` and `reporter` are already eager-loaded in `baseQuery()` (`post` with a trimmed column list, `reporter:id,name,nickname`), so a `whereHas`-based search scope over `post.body` and `reporter.name`/`reporter.nickname` is cheap to add. Match should be partial and case-insensitive, following the same `LIKE`-OR pattern as `UserBuilder::search()`.

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Status | select | Keep | Yes | The core report-queue triage state (open vs reviewed vs actioned) — the single most important filter here. |
| Reason | select | Add | Yes (backend-ready, unused) | `reason` is already an exact-allowed filter over a fixed enum (spam/harassment/inappropriate/violence/copyright/other) and is already a sorted, displayed column — trivial to expose since the backend already allows it. |
| Reported post / Reporter search | text | Add | No | Lets moderators locate a specific report directly; needs a new search scope (see above), since no free-text search exists today. |
| Post ID / Reporter ID | exact number | Remove (as a standalone manual-entry UI control) | Yes | Already filterable via `post_id`/`reporter_id` for programmatic/deep-link use, but not a field an admin would hand-type; the recommended free search covers this workflow better. |

#### What We Have Today
A single status dropdown and nothing else. The backend is materially more capable than the UI exposes: `reason` is already an allowed exact filter and already sortable (`mat-sort-header="reason"` is wired in the table), yet has no filter control. There is no text search of any kind, which is a real gap for a moderation queue whose whole purpose is finding and acting on specific reports as report volume grows.

#### What We Should Add
- Reason filter (select) — no backend work needed, already an allowed filter.
- Free search across reported-post body and reporter name/nickname — needs a new scope, since neither relation is currently searchable.
- Consider surfacing "post has multiple reports" as a sort/indicator (the loaded `post.reports_count` is already available) to help prioritize frequently-reported content within the queue.

#### What We Should Remove
None — the one filter that exists (status) is essential to the workflow; nothing here is redundant.

#### Recommended Final Design
```
Free Search (reported post body, reporter name/nickname)
    ↓
Status
    ↓
Reason
```

---

### 15. Static Pages

**Route:** `/content-management/static-pages`
**Component:** `backoffice/src/app/pages/content-management/static-pages/static-pages.component.ts`
**Service:** `backoffice/src/app/services/static-page.service.ts`
**Backend:** `api/app/Http/Controllers/Admin/StaticPageController.php` / `api/app/Models/StaticPage.php`

#### Page Information
- **Purpose:** Manage static/legal content pages (e.g. Terms, Privacy, About, FAQ) with a title, slug, and rich-text body.
- **Current search:** Free text field labeled "Title", bound to a `title` form control. `loadHttpData()` manually appends `'filter[title]': value.trim()` (bespoke — bypasses the shared `buildListParams` filter helpers) whenever non-empty. Backend: `AllowedFilter::partial('title')`. Server-side, partial match.
- **Current filters:** None beyond the title search box.
- **Current table columns:** `sr, title, slug, created_at, updated_at, actions`

#### Free Search
```
Free Search
├── Title
└── Slug
```
Title search already covers the primary lookup case. Static pages are a small, hand-curated set (Terms, Privacy, About, FAQ, etc.), and admins reference them by slug just as often as by title since the slug is the literal URL segment — folding slug into the same search box costs little and matches how these pages are actually referenced. Rich-text `content` search is **not** recommended: it's long-form HTML/body copy, LIKE-searching it is rarely how anyone locates "the Terms page," and it would be comparatively expensive for essentially no payoff at this dataset's size.

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Title | text | Keep | Yes | Primary, already-used lookup field. |
| Slug | text/exact | Add | Backend-only-today | `AllowedFilter::exact('slug')` already exists server-side but has no UI presence; slugs are stable identifiers admins reference directly (e.g. to match a live URL). |

#### What We Have Today
A single title search box, implemented as a one-off `filter[title]` param rather than through the shared `buildListParams` helpers — the same pattern seen on Posts, where a page-specific field name isn't covered by the generic list-params helpers, so each page hand-rolls its own param assembly. The backend already supports an exact `slug` filter (`AllowedFilter::exact('slug')`) that is completely unused by the UI.

#### What We Should Add
- Fold `slug` into the same free-search box (or keep it as a lightweight exact filter for direct lookup) — trivial, backend already supports it.
- Nothing further: static pages are a low-cardinality, admin-curated content type; date-range, status, or other facets would be over-engineering for a page that will likely never exceed a few dozen rows.

#### What We Should Remove
None — the current filter is minimal and appropriate for this content type.

#### Recommended Final Design
```
Free Search (title, slug)
```
Single-field page by design — no further filters are warranted given the content type (small, hand-curated) and expected dataset size.



## Shop Management

### 16. Products

**Route:** `/shop-management/products`
**Component:** `backoffice/src/app/pages/shop-management/products/products.component.ts`
**Service:** `backoffice/src/app/services/shop/product.service.ts`
**Backend:** `api/app/Http/Controllers/Admin/Shop/ProductController.php` / `api/app/Models/Shop/Product.php`

#### Page Information
- **Purpose:** Manage the multi-vendor shop's product catalog (pricing, stock, discounts, brand/category/vendor tagging).
- **Current search:** One "Name" text field bound to `filter[name]`. `name` is a bare string in `Product::getFilters()`, so Spatie QueryBuilder treats it as a server-side partial (`LIKE %value%`) match on `name` only. There is no SKU search anywhere, client or server, despite SKU being a displayed column and the value an admin is most likely to have in hand (it's printed on packaging/labels).
- **Current filters:** Name (text, partial, server), Active (select: All/Active/Inactive → `filter[is_active]`, exact, server), Brand (select populated from `BrandService.getList({all:true})`, → `filter[brand_id]`, exact, server), Category (select populated from `CategoryService.getList({all:true, sort:'sort_order'})`, → `filter[category_id]`, exact, server).
- **Current table columns:** `sr, name, sku, price, sale_price, sale_percentage, sale_type, vendor, brand, category, stock_quantity, status, created_at, actions`.

#### Free Search
```
Free Search
├── Name
└── SKU
```
Name and SKU are the two identifiers an admin actually has on hand when looking up a product — SKU especially, since it's often copied from a physical label, a supplier sheet, or a support ticket. Both should be partial, case-insensitive matches (today's bare `name` filter relies on QueryBuilder's default partial filter, which on this app's Postgres backend is case-sensitive `LIKE`, not `ILIKE` — a real gap against the `User`/`UserBuilder::search()` benchmark, which explicitly lowercases both sides). Brand/category/vendor names are already exposed as dedicated relationship filters below, so folding them into free text would be redundant. Building this needs a new `Product::scopeSearch()` (mirroring `UserBuilder::search()`) since neither `name` (bare) nor a SKU filter currently unions across columns.

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Name | text | Remove (fold into Free Search) | Yes | Superseded by a combined Name+SKU search; keeping it as a separate labeled field while SKU has none is inconsistent and confusing. |
| Active/Status | select (boolean) | Keep | Yes | Core operational filter — hiding inactive/discontinued SKUs from the working view is a frequent task. |
| Brand | select (relationship) | Keep | Yes | `brand_id` is `AllowedFilter::exact`, relation is already eager-loaded (`with(['brand', ...])`), and brand is a primary catalog axis. |
| Category | select (relationship) | Keep | Yes | Same rationale as Brand; `category_id` exact filter already exists server-side. |
| Vendor | select (relationship) | Add | Backend-only-today | `vendor_id` is already `AllowedFilter::exact` and `vendor` is already eager-loaded and shown as a column, but there's no UI control. In a multi-vendor marketplace, "show me this vendor's catalog" is a routine admin task — this is close to free given the backend work is done. |
| Stock status (in stock / low stock / out of stock) | select | Add | No | Inventory triage (which SKUs need restocking) is a real, frequent workflow; needs a new scope comparing `stock_quantity` to `low_stock_threshold`/`0` — nothing today lets you find these without eyeballing every row. |
| On Sale / Special Offer | boolean | Add | Backend-only-today | `is_special_offer` is already `AllowedFilter::exact` server-side; exposing it lets merchandising quickly audit active promotions. |
| Featured / Popular | boolean | Add | Backend-only-today | `is_featured`/`is_popular` are already exact filters server-side; lower priority than the above but essentially free to wire up since the backend work is done. |
| Discount type | select | — | Backend-only-today | Exists (`discount_type` exact) but is a niche, low-frequency need; not worth UI real estate unless requested. |
| Price range | number range | Add (lower priority) | No | Useful for catalog audits ("find all products above $X") but less frequent than stock/status triage; needs a new min/max scope. |

#### What We Have Today
A single "Name" field that is really a partial free-text search but is presented and behaves like a specific-field filter (no SKU coverage), plus three exact-match selects (Active, Brand, Category) that are all genuinely server-side and correctly wired through `buildListParams`. The backend model already exposes several filters (`vendor_id`, `is_featured`, `is_popular`, `is_special_offer`, `discount_type`) that the Angular page never sends — real, working capability sitting unused. Brand and Category option lists are fetched in full (`all: true`) on page load, which is fine at current catalog size but won't scale indefinitely.

#### What We Should Add
- A combined case-insensitive Name + SKU free-search scope (new `Product::scopeSearch()`), replacing the current name-only field.
- Vendor filter (select) — trivial given `vendor_id` is already an exact filter and the relation is already loaded.
- Stock-status filter (in stock / low stock / out of stock) — needs a new scope; high value for inventory operations.
- On Sale / Special Offer toggle — backend filter exists, just needs a UI control.
- Optionally: Featured/Popular toggles, and a price range — lower priority, backend-cheap for the booleans.

#### What We Should Remove
- The standalone "Name" field should be absorbed into the new combined Free Search rather than living alongside a separate, uncovered SKU gap.

#### Recommended Final Design
```
Free Search (Name, SKU)
    ↓
Active / Status
    ↓
Vendor
    ↓
Brand
    ↓
Category
    ↓
Stock Status
    ↓
On Sale
```

---

### 17. Brands

**Route:** `/shop-management/brands`
**Component:** `backoffice/src/app/pages/shop-management/brands/brands.component.ts`
**Service:** `backoffice/src/app/services/shop/brand.service.ts`
**Backend:** `api/app/Http/Controllers/Admin/Shop/BrandController.php` / `api/app/Models/Shop/Brand.php`

#### Page Information
- **Purpose:** Manage the master list of product brands used to tag products.
- **Current search:** One "Name" text field → `filter[name]`, a bare partial (`LIKE`) match, server-side.
- **Current filters:** Name (text, partial, server), Status (select: All/Active/Inactive → `filter[is_active]`, exact, server).
- **Current table columns:** `sr, name, slug, logo, sort_order, status, created_at, actions`.

#### Free Search
```
Free Search
├── Name
└── Slug
```
Brands are a small, low-cardinality reference table, so search here is more about quick lookup than heavy filtering. `slug` is already an allowed (bare partial) filter server-side (`Brand::getFilters()` includes `'slug'`) but the UI never sends it — folding it into the same free-search box as Name costs nothing on the backend and helps when an admin is matching a brand to a storefront URL slug rather than its display name.

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Name | text | Keep (merge with Slug into Free Search) | Yes | Primary lookup field for a small reference table. |
| Status | select (boolean) | Keep | Yes | Active/inactive toggling is the main lifecycle action on this page; filtering to see only inactive brands (candidates for cleanup) is a real use case. |
| Slug | text | Add (as part of Free Search, not a separate control) | Backend-only-today | Already an allowed filter server-side and unused; cheap to add without a new UI field by unioning it into the Name search. |

#### What We Have Today
Both current controls are genuinely server-side and correctly wired. The dataset is small (brands rarely number more than a few dozen to a few hundred), so the filtering need here is inherently light — this page is close to "done" already.

#### What We Should Add
- Union `slug` into the existing Name search box (no new UI control, no new backend scope needed — just send the same term as `filter[name]` OR add a tiny `Brand::scopeSearch()` that ORs `name`/`slug`). Low effort, closes the one real gap.

#### What We Should Remove
None — current filters are all justified for this dataset's size and admin workflow.

#### Recommended Final Design
```
Free Search (Name, Slug)
    ↓
Status
```

---

### 18. Categories

**Route:** `/shop-management/categories`
**Component:** `backoffice/src/app/pages/shop-management/categories/categories.component.ts`
**Service:** `backoffice/src/app/services/shop/category.service.ts`
**Backend:** `api/app/Http/Controllers/Admin/Shop/CategoryController.php` / `api/app/Models/Shop/Category.php`

#### Page Information
- **Purpose:** Manage the shop's (potentially hierarchical, via `parent_id`) product category tree.
- **Current search:** One "Name" text field → `filter[name]`, bare partial match, server-side.
- **Current filters:** Name (text, partial, server), Status (select: All/Active/Inactive → `filter[is_active]`, exact, server).
- **Current table columns:** `sr, name, slug, image, parent, sort_order, status, created_at, actions`.

#### Free Search
```
Free Search
├── Name
└── Slug
```
Same reasoning as Brands: `slug` is already a bare allowed filter server-side (`Category::getFilters()`) but unused, and it's the natural second thing an admin searches by when categories are used to build storefront URLs.

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Name | text | Keep (merge with Slug into Free Search) | Yes | Primary lookup for the category tree. |
| Status | select (boolean) | Keep | Yes | Active/inactive lifecycle filtering, same rationale as Brands. |
| Parent Category | select (relationship) | Add | Backend-only-today | `parent_id` is already `AllowedFilter::exact`, and `parent` is already eager-loaded and shown as a column — this page is explicitly hierarchical (has `children()`/`parent()` relations), so "show me all subcategories under X" is a meaningful, frequent narrowing that today requires scanning the Parent column by eye. |
| Slug | text | Add (fold into Free Search) | Backend-only-today | Already allowed server-side, unused. |

#### What We Have Today
Functionally identical pattern to Brands (Name + Status, both genuinely server-side), but Categories has a parent/child hierarchy that the UI does nothing to help navigate — there's no way to filter down to one branch of the tree without reading every row's Parent column.

#### What We Should Add
- Parent Category filter (select), reusing `parent_id`'s existing exact server-side filter — the single highest-value addition here given the model is explicitly hierarchical.
- Slug folded into Free Search, same as Brands.
- Optional, lower priority: a "Top-level only" toggle (`parent_id IS NULL`) for admins managing the top of the tree, via a small new scope.

#### What We Should Remove
None — current filters are all justified.

#### Recommended Final Design
```
Free Search (Name, Slug)
    ↓
Parent Category
    ↓
Status
```

---

### 19. Vendors

**Route:** `/shop-management/vendors`
**Component:** `backoffice/src/app/pages/shop-management/vendors/vendors.component.ts`
**Service:** `backoffice/src/app/services/shop/vendor.service.ts`
**Backend:** `api/app/Http/Controllers/Admin/Shop/VendorController.php` / `api/app/Models/Shop/Vendor.php`

#### Page Information
- **Purpose:** Approve, suspend, reject, and otherwise manage marketplace sellers (vendors) in this multi-vendor shop.
- **Current search:** One "Store Name" text field → `filter[store_name]`, bare partial match, server-side.
- **Current filters:** Store Name (text, partial, server), Status (select: All/Pending/Approved/Suspended/Rejected — a hardcoded local `STATUS_FILTER_OPTIONS` array rather than `EnumsService`, unlike every other status select on this page group → `filter[status]`, exact, server).
- **Current table columns:** `sr, store_name, slug, user, phone, status, commission_rate, is_platform, actions`.

#### Free Search
```
Free Search
├── Store Name
├── Slug
├── Owner Name
├── Owner Email
└── Owner Phone
```
Store Name alone misses a very real workflow: an admin fielding a support ticket usually has the *person's* name, email, or phone, not necessarily the exact store name — and `user` (the vendor's owning account) is already eager-loaded (`with(['user'])`) and shown as a column. `slug`, `city`, and `country` are already allowed bare-partial filters server-side (`Vendor::getFilters()`) but completely unused by the UI. Building this needs a new `Vendor::scopeSearch()` that ORs `store_name`/`slug` with a join (or subquery, mirroring `Order::scopePhone`'s pattern of pulling matching `user_id`s from `User::scopeSearch()`) against the owning user's name/email/phone.

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Store Name | text | Remove (fold into Free Search) | Yes | Superseded by the combined search above. |
| Status | select | Keep | Yes | The core moderation workflow on this page (pending → approved/suspended/rejected) is literally status-driven; this is the single most important filter here. |
| City / Country | select or text | Add | Backend-only-today | Both are already bare allowed filters server-side and completely unused. Worth adding only if vendors are meaningfully regional in this business — flagged as backend-cheap but confirm real-world demand before building UI. |
| Is Platform (house vendor) | boolean | Skip | Backend-only-today | Exists (`AllowedFilter::exact('is_platform')`) but there is normally exactly one house vendor (`Vendor::ensureHouse()`), so filtering on it has near-zero practical value — not worth UI space. |

#### What We Have Today
Store Name and Status are both real server-side filters. Note the Status select's options are hardcoded in the component (`STATUS_FILTER_OPTIONS`) rather than sourced from `EnumsService` the way Products/Brands/Categories/Orders all do — a minor inconsistency worth normalizing during any redesign, though not a functional bug. There's also a bespoke param-building pattern here (manually appending `filter[store_name]`/`filter[status]` rather than using `buildListParams`'s `addStatusFilter` helper), consistent with this whole page group's ad-hoc style.

#### What We Should Add
- Combined free search across Store Name, Slug, and the owning user's name/email/phone — the biggest real gap, since support workflows usually start from the *person*, not the store name.
- City/Country filters — cheap (already allowed server-side) but only worth building if vendors are genuinely regional in practice.

#### What We Should Remove
- The standalone Store Name field, once folded into the combined Free Search.

#### Recommended Final Design
```
Free Search (Store Name, Slug, Owner Name/Email/Phone)
    ↓
Status
    ↓
City / Country (only if regional vendor base is real)
```

---

### 20. Orders

**Route:** `/shop-management/orders`
**Component:** `backoffice/src/app/pages/shop-management/orders/orders.component.ts`
**Service:** `backoffice/src/app/services/shop/order.service.ts`
**Backend:** `api/app/Http/Controllers/Admin/Shop/OrderController.php` / `api/app/Models/Shop/Order.php`

#### Page Information
- **Purpose:** Track and manage shop orders — view detail, transition order status, verify/record payment, issue refunds.
- **Current search:** Two separate text fields, both server-side: "Order Number" → `filter[order_number]` (bare partial `LIKE`), and "Phone" → `filter[phone]`, which resolves via `AllowedFilter::scope('phone')` calling `Order::scopePhone()` — a genuinely clever cross-relation scope that normalizes digits and delegates to `User::scopePhone()` to find matching `user_id`s, then filters orders by those IDs. Functionally these two fields together already behave like a compound free search, just split across two labeled boxes instead of unioned into one.
- **Current filters:** Status (select, options from `EnumsService.getOptions('order_status')`, passed through `buildListParams`'s `filters.status` → `filter[status]`), Payment Status (select, options from `EnumsService.getOptions('payment_status')`, manually appended as `filter[payment_status]` since `buildListParams` has no payment-status helper — bespoke).
- **Current table columns:** `sr, order_number, user, phone, total, currency, status, payment_status, address, created_at, actions`.

#### Free Search
```
Free Search
├── Order Number
├── Customer Name
├── Customer Email
└── Customer Phone
```
Order Number and Phone should be unified into one box, and Customer Name/Email added alongside — an admin chasing an order usually has *one* of these (a number from an email receipt, a name from a phone call, an email from a support ticket) and today has to know which specific field to type it into, with Name/Email not searchable server-side at all despite `user` already being eager-loaded (`with(['user', ...])`). The existing `Order::scopePhone()` → `User::scopePhone()` delegation is exactly the right pattern to extend: broaden it into an `Order::scopeSearch()` that also matches `order_number` (partial) and delegates name/email matching to `User::scopeSearch()`'s existing logic, the same way `phone` already delegates. This directly follows the `User`/`UserBuilder::search()` benchmark this audit is measured against.

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Order Number | text | Remove (fold into Free Search) | Yes | Superseded by combined search. |
| Phone | text | Remove (fold into Free Search) | Yes | Superseded by combined search; the underlying `scopePhone` logic should be reused, not discarded. |
| Status | select | Keep | Yes | The single most important operational filter for an orders queue — "show me all Processing orders," "show me Cancelled orders," etc. is the day-to-day workflow. Should be hardened to `AllowedFilter::exact('status')` instead of today's bare partial match (see below). |
| Payment Status | select | Keep | Yes | E-commerce orders admin needs a clear status vs. payment-status distinction, and this page correctly has both as independent axes (an order can be Delivered but Unpaid, etc.) — this is good design already in place. Should likewise be hardened to `exact`. |
| Created date range | date-range | Add | No | No date filtering exists at all today (`Order` doesn't use `OperatorFilterTrait`/`DateFilterTrait` the way `User` does), yet "today's orders" / "this week's orders" / "orders in date X–Y" is one of the most routine asks in any order admin. High business value, currently a real gap. |
| Total amount range | number-range | Add | No | No amount filter exists at all today. Finding high-value orders (fraud review, VIP handling) or auditing a specific total is a classic e-commerce admin need explicitly worth covering; needs a new `scopeTotalBetween`/min/max pair, analogous to how `OperatorFilterTrait` adds date-range scopes elsewhere in this codebase. |
| Customer (user_id) | relationship | Skip for now | Yes (bare, exists) | `user_id` is in `getFilters()` but as a **bare** filter, meaning it does a partial `LIKE` match on a numeric ID column rather than `AllowedFilter::exact('user_id')` — inconsistent with how every other model in this group (Product, Brand, Category, Vendor) treats its FK columns, and a latent correctness risk (e.g., `user_id=1` would also match 10, 11, 21, 100…). Worth fixing to `exact` regardless of whether a UI control is ever built on top of it. |

#### What We Have Today
Status and Payment Status are both real, independent, server-side filters — the status/payment-status distinction the task calls out is already correctly modeled here, which is good. The `scopePhone` cross-relation search is a genuinely well-built piece of backend logic (digit-normalizing, delegating to `User::scopePhone`) — better than the plain bare filters used elsewhere in this page group — but it's exposed as an isolated field instead of folded into a unified search experience. Two backend correctness smells worth flagging regardless of the UI redesign: `status` and `payment_status` are bare (partial-match) filters on enum-cast columns rather than `AllowedFilter::exact`, which happens to work today only because none of `OrderStatusEnum`'s values (`pending/processing/dispatched/delivered/cancelled`) or `PaymentStatusEnum`'s values (`unpaid/advance/paid/refunded`) are substrings of each other — a future status addition could silently break this. Likewise `user_id` is bare instead of exact. There is no date-range or amount-range filtering of any kind, despite both being standard, high-value e-commerce admin needs.

#### What We Should Add
- Unified free search: Order Number + Customer Name/Email/Phone, extending the existing `scopePhone` pattern into a full `Order::scopeSearch()`.
- Created-at date range filter (new scopes, or adopt the `OperatorFilterTrait` pattern already used elsewhere in the codebase).
- Total-amount range filter (new min/max scopes) — explicitly high-value for an orders page per standard e-commerce admin needs.
- Harden `status`/`payment_status`/`user_id` to `AllowedFilter::exact` for correctness, independent of any UI change.

#### What We Should Remove
- The separate "Order Number" and "Phone" fields, once merged into one Free Search box (the underlying scope logic is kept and extended, not discarded).

#### Recommended Final Design
```
Free Search (Order Number, Customer Name/Email/Phone)
    ↓
Status
    ↓
Payment Status
    ↓
Created Date Range
    ↓
Total Amount Range
```



## Live Streams Management

### 21. Live Streams

**Route:** `/live-streams-management/live-streams`
**Component:** `backoffice/src/app/pages/live-streams-management/live-streams/live-streams-list.component.ts`
**Service:** `backoffice/src/app/services/live-stream.service.ts` (`listStreams()` → `GET v1/admin/live-streams`)
**Backend:** `api/app/Http/Controllers/Admin/LiveStreamController.php` / `api/app/Models/LiveStream.php` (route is `Route::apiResource('live-streams', LiveStreamController::class)` — the sibling `StreamController` is not used by this endpoint)

#### Page Information
- **Purpose:** Manage and monitor all live streams — both admin-created (standalone or match-linked) and self-serve mobile broadcasts.
- **Current search:** Free-text "Search Title" input, mapped to `filter[search]` via `buildListParams`. This IS server-side: `LiveStream::getFilters()` defines `AllowedFilter::callback('search', ...)` which does a case-insensitive `LOWER(title) LIKE ?` against the `title` column only.
- **Current filters:** Status (`mat-select`: Idle/Starting/Live/Ended/Error), Kind (`mat-select` "self_serve": All Streams / Self-Serve (Mobile) Only / Admin-Created Only).
- **Current table columns:** `sr`, `title`, `description`, `streaming_url`, `status`, `watching`, `provider`, `match`, `started_at`, `actions`.

#### Free Search
```
Free Search
├── title
├── description
└── owner.name / owner.nickname / owner.phone (relationship, self-serve streams)
```
The existing `title`-only search already covers the main lookup case (finding a specific broadcast). `description` is a natural, cheap addition to the same `LIKE` scope. Adding the `owner` relationship (self-serve mobile broadcasts have an `owner_user_id` — the model already defines an `owner()` `BelongsTo`) would let support find "which stream is this user broadcasting" by name/phone, but that's a `whereHas` join and should stay a distinct filter/search path rather than merged into the plain title scope, since `owner` is null for most (admin-created) rows.

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Status | select | Keep | Yes (`AllowedFilter::exact('status')`) | Primary operational filter — admins need to find currently "live"/"starting" streams to monitor, or "error" streams to troubleshoot. |
| Kind (self-serve vs admin) | select | Keep | Yes (`AllowedFilter::callback('self_serve', ...)`) | Distinguishes user-generated mobile broadcasts from admin/match-linked streams, which have very different moderation and support needs. |
| Search (title) | text | Keep | Yes (`AllowedFilter::callback('search', ...)`, title-only today) | Already implemented and works; should be widened to include `description`. |
| Provider | select | Add | Backend-only-today (`AllowedFilter::exact('provider')` exists on model, unused in UI) | External URL vs YouTube RTMP streams are operationally different (YouTube has quota/setup steps); cheap UI addition since the backend filter already exists. |
| Match-linked vs standalone | boolean | Add | No (needs new scope) | Admins reviewing tournament broadcasts vs ad-hoc streams currently have no way to filter by whether `match_id` is set; the "Match" column already surfaces this per-row but can't be filtered. |
| Owner (self-serve broadcaster) | relationship | Add | No (needs `whereHas`) | Useful for support/moderation ("find this user's live stream") but only applies to self-serve rows; low priority unless moderation complaints on self-serve streams become frequent. |

#### What We Have Today
This is one of the better-implemented pages in this audit: it already has a real server-side free-text search (title-only, case-insensitive, injection-safe via `addcslashes`) plus two well-chosen dropdown filters (`status`, `self_serve`), all wired through the shared `buildListParams`/`resetListSearchForm`/`bindListSortToReload` helpers. The gap is that `provider` is filterable server-side but not exposed in the UI, and the search doesn't cover `description` or the stream owner.

#### What We Should Add
- Widen the existing `search` scope to also match `description`.
- Expose `provider` (External URL / YouTube RTMP) as a UI filter — the backend `AllowedFilter::exact('provider')` already exists.
- Add a "Linked to Match" boolean filter (`match_id` not null) for tournament-broadcast triage.

#### What We Should Remove
None — current filters are all justified.

#### Recommended Final Design
```
Free Search (title, description)
    ↓
Status
    ↓
Kind (self-serve vs admin-created)
    ↓
Provider
    ↓
Linked to Match (yes/no)
```



## Engagement

### 22. Push Notifications

**Route:** `/engagement/push-notifications`
**Component:** `backoffice/src/app/pages/engagement/push-notifications/push-notifications.component.ts`
**Service:** `backoffice/src/app/services/push-notification.service.ts`
**Backend:** `api/app/Http/Controllers/Admin/PushNotificationController.php` / `api/app/Models/PushNotificationLog.php`

#### Page Information
- **Purpose:** View the log of push notifications sent to users (system-triggered and admin-triggered) and their delivery status.
- **Current search:** None. There is no free-text search box on this page at all.
- **Current filters:** Status (`mat-select`, options from `push_notification_status` enum), Triggered By (`mat-select`, options from `push_triggered_by` enum), From Date / To Date (two `mat-datepicker` inputs mapping to `created_after`/`created_before`).
- **Current table columns:** `sr`, `title`, `target_type`, `triggered_by`, `status`, `delivery` (success/failure summary), `sent_at`, `created_at`.

#### Free Search
```
Free Search
├── title
├── body
└── target_user.name / target_user.email (relationship)
```
Admins mostly hunt for a specific broadcast by its title/body text ("did we send the Eid promo?") or need to find every notification sent to one user when investigating a complaint. `title`/`body` are plain columns on `push_notification_logs` so a case-insensitive partial `LIKE` (mirroring the `User` model's multi-column search scope) is cheap. Searching the `target_user` relationship (already eager-loaded via `with(['targetUser:id,name'])`) requires a join/whereHas, which is more expensive — acceptable given this table is a log with modest volume, but should be a separate scope rather than folded silently into the same `LIKE` chain if the table grows large.

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Status | select | Keep | Yes (`AllowedFilter::exact('status')`) | Core triage filter — queued/processing/sent/partial/failed is the first thing an admin checks after sending a broadcast. |
| Triggered By | select | Keep | Yes (`AllowedFilter::exact('triggered_by')`) | Distinguishes system-automated notifications from manual admin sends; useful when auditing who sent what. |
| Created date range | date-range | Keep | Yes (`created_after`/`created_before` scopes via `DateFilterTrait`) | Standard log-narrowing filter; logs accumulate daily and admins usually only care about a recent window. |
| Target Type / Target User | select/relationship | Add | Backend-only-today (`AllowedFilter::exact('target_type')`, `AllowedFilter::exact('target_user_id')` already exist on the model but are unused by the UI) | Backend already supports filtering to "all users" vs a specific "single user" broadcast — cheap UI addition (a user-id or user-autocomplete field) that lets support find every push a specific user received. |
| Free search (title/body) | text | Add | No (needs new scope) | No text search exists today; admins currently must scan pages of rows to find a specific broadcast by title. |

#### What We Have Today
A log page with three dropdown/date filters and zero text search. The model's `getFilters()` already exposes `target_type` and `target_user_id` as exact filters plus `created_between`/`created_after`/`created_before` scopes, but the Angular page only wires up `status`, `triggered_by`, and the date range — `target_type` and `target_user_id` are dead backend capability today. There is no way to find a notification by its title or the recipient's name without paging through results.

#### What We Should Add
- A free-text search box across `title`/`body` (new `AllowedFilter::callback('search', ...)` scope on `PushNotificationLog`, matching the `User` model's case-insensitive multi-column `LIKE` pattern).
- Expose the already-supported `target_type` filter (All / Broadcast / Single User) in the UI — zero backend work needed.
- A "Sent To" user filter/autocomplete wired to the existing `target_user_id` exact filter, for support workflows ("what did we send this user").

#### What We Should Remove
None — current filters are all justified.

#### Recommended Final Design
```
Free Search (title, body)
    ↓
Status
    ↓
Triggered By
    ↓
Target Type (all vs single user)
    ↓
Created date range
```

---

### 23. Push Notification Templates

**Route:** `/engagement/push-notification-templates`
**Component:** `backoffice/src/app/pages/engagement/push-notification-templates/push-notification-templates.component.ts`
**Service:** `backoffice/src/app/services/push-notification.service.ts` (`getTemplates()`/`getTemplateById()`/`updateTemplate()` — reuses the same service as Push Notifications, no dedicated template service file)
**Backend:** `api/app/Http/Controllers/Admin/PushNotificationTemplateController.php` / `api/app/Models/PushNotificationTemplate.php`

#### Page Information
- **Purpose:** Manage the reusable title/body templates used by system-triggered push notifications (order placed, post liked, user followed, etc.).
- **Current search:** None. No free-text search box exists.
- **Current filters:** Status (`mat-select`, bound to `is_active`, mapped client-side via `mapStatusToIsActive()` from `'active'/'inactive'` to `'1'/'0'`).
- **Current table columns:** `sr`, `name`, `title_template`, `is_active`, `updated_at`, `actions`.

#### Free Search
```
Free Search
├── name
├── key
└── title_template / body_template
```
This is effectively a small, fixed catalog of system template keys (order_placed, post_liked, user_followed, etc. — enumerated in `PushNotificationTemplate::samplePreviewData()`), likely well under 20 rows today. A search box on `name`/`key` would still help as the catalog grows with new notification events, and is a trivial partial `LIKE` addition. Given the low row count, this is a low-priority nice-to-have rather than a pressing need.

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Status (Active/Inactive) | select | Keep | Yes (`AllowedFilter::exact('is_active')`) | Lets admins isolate disabled templates, though with so few rows this mostly matters for later scale. |
| Key | text | Remove-from-consideration (Add only if catalog grows) | Backend-only-today (`AllowedFilter::exact('key')` exists on model, unused in UI) | Exact-match on a technical key isn't a typical admin search input; a free-text search box covering `key` alongside `name` is more useful than a dedicated exact filter. |

#### What We Have Today
A single status dropdown filter, no search box, sorted by `name` ascending by default. The model exposes `key` as an exact filter that the UI never uses. Given the template list is a small, curated, developer-defined set (not user-generated data), the lack of search is a minor gap rather than a functional blocker — but it will become one as more notification event types are added.

#### What We Should Add
- A lightweight free-text search over `name`/`key`/`title_template` for when the catalog grows past a page.

#### What We Should Remove
None — current filter is justified; the unused `key` exact filter can simply be left as-is (harmless backend capability, not worth removing).

#### Recommended Final Design
```
Free Search (name, key, title_template)
    ↓
Status (Active/Inactive)
```



## Support

### 24. Support Messages

**Route:** `/support`
**Component:** `backoffice/src/app/pages/support/support-messages-list.component.ts`
**Service:** `backoffice/src/app/services/support-message.service.ts`
**Backend:** `api/app/Http/Controllers/Admin/SupportMessageController.php` / `api/app/Models/SupportMessage.php`

#### Page Information
- **Purpose:** Review and resolve support/contact messages submitted by users (both guests, via `name`/`phone`, and logged-in users via the `user` relation).
- **Current search:** None. No free-text search box exists anywhere on this page.
- **Current filters:** Status (`mat-select`, options from `support_message_status` enum: open/in_progress/resolved).
- **Current table columns:** `sr`, `name` (submitter, via `submitterLabel()` which prefers `user.name` over the raw `name` field), `phone`, `message`, `attachment`, `status`, `created_at`, `actions`.

#### Free Search
```
Free Search
├── name
├── phone
├── message
└── user.name / user.nickname (relationship, for logged-in submitters)
```
Support triage is fundamentally a "find this person's message" or "find messages mentioning X" workflow — without any search, an admin handling a phone call from a user has no way to locate their message except scrolling/paging through the whole inbox filtered only by status. `name`, `phone`, and `message` are all plain columns on `support_messages`, so a case-insensitive multi-column `LIKE` scope (directly following the `User` model/`UserBuilder` reference pattern named in this audit's conventions) is straightforward and should also reach into the eager-loaded `user` relation (already loaded via `->with('user:id,name,nickname')` in `baseQuery()`) for logged-in submitters whose `name` column may differ from their account name.

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Status | select | Keep | Yes (`AllowedFilter::exact('status')`) | Core triage filter — open/in-progress/resolved is exactly how a support queue is worked. |
| User ID | relationship | Add | Backend-only-today (`AllowedFilter::exact('user_id')` already defined inline in the controller, unused in UI) | Lets support pull up every message from one account when following up; the filter already works server-side. |
| Free search (name/phone/message) | text | Add | No (needs new scope) | Currently the single biggest gap in this group — there is no way to search by name, phone, or message content at all. |
| Created date range | date-range | Add | No (model doesn't use `OperatorFilterTrait`/`DateFilterTrait`) | Useful for finding messages from a specific incident window; cheap to add since `created_at` already exists as a column. |

#### What We Have Today
This page deviates from the documented backend convention: `SupportMessage` is a plain `Illuminate\Database\Eloquent\Model` (not `BaseModel`) with no `getFilters()`/`getSorts()` methods at all — the controller defines `allowedFilters([AllowedFilter::exact('status'), AllowedFilter::exact('user_id')])` inline instead. Only `status` is exposed in the UI; `user_id` is unused. There is no search box, no date filter, and no use of `OperatorFilterTrait`. Sorting is restricted to `id`, `created_at`, `status`. This is the weakest search/filter implementation among the five pages audited in this group.

#### What We Should Add
- A free-text search scope across `name`, `phone`, `message` (and the `user` relation's `name`/`nickname` for logged-in submitters) — the single highest-value addition here.
- A created-at date range filter, following the `OperatorFilterTrait` pattern used elsewhere in the codebase.
- Move `SupportMessage` onto the standard `getFilters()`/`getSorts()` model convention (currently bypassed via inline controller filters) so future filter additions are consistent with the rest of the admin.

#### What We Should Remove
None — the one existing filter (status) is justified; nothing here is redundant, the page is simply under-built.

#### Recommended Final Design
```
Free Search (name, phone, message, user.name)
    ↓
Status
    ↓
Created date range
    ↓
User (relationship, for repeat-contact lookups)
```



## Notifications

### 25. Notifications

**Route:** `/notifications`
**Component:** `backoffice/src/app/pages/notifications/notifications-list.component.ts`
**Service:** `backoffice/src/app/services/notifications.service.ts`
**Backend:** `api/app/Http/Controllers/Admin/NotificationController.php` (Laravel's built-in polymorphic `DatabaseNotification`/`notifications` table, attached to a shared "System user" inbox — not a custom `Notification` Eloquent model)

#### Page Information
- **Purpose:** The admin team's own shared in-app notification inbox (order placed, user registered, tournament request submitted, vendor application submitted, broadcast concurrency high, YouTube quota high, support message submitted) — distinct from the outbound Push Notifications log.
- **Current search:** None. No free-text search box exists.
- **Current filters:** Type (`mat-select`, options from a fixed frontend enum `ADMIN_NOTIFICATION_TYPE_OPTIONS`, 7 hardcoded types), Read status (`mat-select`: All/Unread/Read), From Date / To Date (`mat-datepicker` pair mapping to `created_after`/`created_before`).
- **Current table columns:** `sr`, `type`, `message` (extracted from the notification's JSON `data.message`), `read_at`, `created_at`, `actions`.

#### Free Search
```
Free Search
└── data->message (JSON field)
```
This page is architecturally unusual: it's backed by Laravel's built-in polymorphic `notifications` table where all payload content lives in a `data` JSON column, not real relational columns. A search box would need a `whereJsonContains`/`JSON_EXTRACT`-plus-`LIKE` query against `data->message` (and possibly `data->user_name`/`data->customer_name`/`data->tournament_name`, which are already present in the `NotificationData` payload shape per `notifications.service.ts`). This is more expensive than a normal column `LIKE` since it can't use a standard index, but the table is a bounded admin inbox (periodically flushed via "Delete All"/`FlushNotificationsCommand`) rather than a growing historical log, so the performance risk is low in practice.

#### Filters

| Filter | Type | Keep/Add/Remove | Server-side | Reason |
|---|---|---|---|---|
| Type | select | Keep | Yes (manual `whereJsonContains('data->type', $type)` in controller) | The 7 notification types map to genuinely different admin workflows (order vs. user vs. tournament vs. system alert); this is the primary way admins triage the shared inbox. |
| Read/Unread | select | Keep | Yes (manual `whereNull`/`whereNotNull('read_at')` in controller) | Standard inbox triage — "show me what I haven't seen yet" is the single most common inbox action. |
| Created date range | date-range | Keep | Yes (manual `whereDate` checks in controller) | Useful for finding notifications from a specific incident window, especially since this inbox can be flushed/reset. |
| Free search (message content) | text | Add | No (needs new `whereJsonContains`/`LIKE` on `data`) | No way today to find, e.g., "which order notification mentioned this customer's name" without opening each row. |

#### What We Have Today
This page does not follow the shared model-driven `getFilters()`/QueryBuilder pattern used by the other four pages in this group — because it isn't backed by a normal Eloquent model at all, but by Laravel's built-in `DatabaseNotification` polymorphic table scoped to a single shared "System user." The controller (`NotificationController::index()`) hand-rolls its own filtering (`filter[read]`, `filter[type]`, `filter[created_after]`/`filter[created_before]`) and its own restricted sort-column allowlist (`created_at`, `read_at` only), bypassing `BaseAdminController`/`QueryBuilder` entirely. All three filters that exist work correctly server-side. There is no text search of any kind — the "Message" column shown in the table (pulled from `data.message`) cannot be searched.

#### What We Should Add
- A free-text search over the JSON `data` payload (at minimum `data->message`, ideally also `data->user_name`/`data->customer_name`/`data->tournament_name` depending on notification type) so admins can locate a specific past alert by content instead of paging through the type+date filtered list.

#### What We Should Remove
None — current filters (type, read status, date range) are all justified and already server-side.

#### Recommended Final Design
```
Free Search (data.message and related payload fields)
    ↓
Read/Unread
    ↓
Type
    ↓
Created date range
```



---

# Part 3 — Implementation Waves

This is the rollout order once this document is approved. It groups the 24 in-scope pages (Player Stats, #10, is excluded — see its section) into three waves by risk and dependency, not by module, so early waves ship value fast with near-zero backend risk and later waves take on the larger rebuilds.

**Sequencing rule:** the Shared Building Blocks (Part 1, §6) — specifically the search-bar divider slot, the shared date-range control, and the two/three-state boolean select — should land **before or alongside the first Wave 1 page**, not deferred to Wave 3. Every wave below assumes they exist; building them per-page instead of once will cost more total effort than building them first.

## Wave 1 — Frontend-only (backend capability already exists)

Every row here is "wire up a filter/scope that already works server-side" — no backend risk, no new Laravel code beyond a trivial addition called out explicitly. This is the highest-value, lowest-risk wave and should ship first, page by page, independently.

| # | Page | Effort | What ships |
|---|---|---|---|
| 8 | Users | FE-only | Free Search box (wires existing `scope('search')`); Active Platform select (wires existing `scope('active_platform')`); remove standalone Phone field |
| 9 | Players | FE-only | Status select (wires existing `AllowedFilter::exact('status')`); Created Date Range (wires existing scopes); remove standalone Phone field |
| 1 | Tournaments | FE-only (partial win) | Free Search box wired to the existing `tournament_name` partial filter only — ships real value immediately; widening it to venue/city/organizer is a new scope, deferred to Wave 3 |
| 12 | Highlights | FE-only | Is Active select, Tournament select, Created Date Range — all three already allowed server-side via `DateFilterTrait`/exact filters, simply unwired |
| 14 | Post Reports | FE-only | Reason select (wires existing `AllowedFilter::exact('reason')`, already sortable) |
| 16 | Products | FE-only | Vendor select, On Sale toggle — both wire existing exact filters |
| 18 | Categories | FE-only | Parent Category select (wires existing `AllowedFilter::exact('parent_id')`) |
| 21 | Live Streams | FE-only | Provider select (wires existing `AllowedFilter::exact('provider')`) |
| 22 | Push Notifications | FE-only | Target Type select (wires existing `AllowedFilter::exact('target_type')`) |
| 7 | Campaign Submissions | FE + 1-line BE | Widen "Player Name" box to also send existing `email`/`phone` partial filters; add one new `AllowedFilter::partial('nickname')` to fully match the Users/Players search shape |
| 17 | Brands | FE + 1-line BE | Fold `slug` (existing filter) into the Name search box |

## Wave 2 — Correctness fixes

These are bugs, not missing features: something in the current implementation is silently wrong, inconsistent, or dead. Each is small and independent — do them in any order, in parallel with Wave 1.

| # | Page | Effort | What ships |
|---|---|---|---|
| 2 | Teams | Small BE or FE | Country is free-text but exact-match, so typos/casing silently return zero rows — either convert the control to a `mat-select` of distinct values, or switch the backend filter to `AllowedFilter::partial` |
| 9 | Players | Small BE | Location column's `mat-sort-header="city"` sends a sort value `User::getSorts()` doesn't allow, so it errors today — either add `city` to `getSorts()` or remove the sort header |
| 20 | Orders | BE-only, no visible FE change | Harden `status`, `payment_status`, and `user_id` from bare (partial-match) filters to `AllowedFilter::exact` — works today only by coincidence of enum values not overlapping; a future status value could silently break filtering |
| 11 | Hero Slider | BE-only, no visible FE change | Harden `status` from bare (partial-match) to `AllowedFilter::exact` — harmless today only because `StatusEnum` has exactly two non-overlapping values |
| 5 | Quick Matches | FE-only | Remove the non-functional `matSort`/`bindListSortToReload` wiring (no column defines `mat-sort-header` and the backend accepts no `sort` param), or wire real sorting on 2–3 columns — currently a sortable-looking table that silently does nothing |
| 4 | Tournament Matches | BE + FE, larger | Convert from `?all=1` + in-browser `MatTableDataSource` filtering to real server-side pagination: add `getFilters()`/`getSorts()` to `TournamentMatch` (status, date range, a `live_today` callback, a team/venue search scope) and rework `TournamentMatchController::index()` to accept `page`/`per_page`/`sort` instead of defaulting to fetch-everything. Grouped here as a correctness fix (the current behavior is architecturally wrong, not merely feature-incomplete) but size it like a small Wave 3 item when scheduling — it's the single largest single-page lift in this table |

## Wave 3 — New backend scopes + multi-column free search

Everything here needs new Laravel filter/scope code (usually mirroring `UserBuilder::search()`'s shape) before a frontend control can be built on top of it. Sequence within this wave by business value: Orders, Products, and Support Messages first (highest admin-workflow impact), then the rest.

| # | Page | Effort | What ships |
|---|---|---|---|
| 20 | Orders | New BE scope | Unify Order Number + Phone into one `Order::scopeSearch()`, extended to also match customer Name/Email (already eager-loaded); add created-date range and total-amount range filters (both entirely new) |
| 16 | Products | New BE scope | Combined Name+SKU search scope (`Product::scopeSearch()`); new stock-status scope (in stock / low stock / out of stock) |
| 24 | Support Messages | New BE scope, larger | Add a `search` scope across `name`/`phone`/`message` (+ the `user` relation for logged-in submitters); add created-date range; migrate the model onto the standard `getFilters()`/`getSorts()` convention (currently bypassed via inline controller filters) |
| 19 | Vendors | New BE scope | `Vendor::scopeSearch()` extending Store Name to also match the owning user's name/email/phone (mirroring how `Order::scopePhone()` already delegates to `User::scopePhone()`) |
| 3 | Tournament Requests | New BE scope | New search scope across `tournament_name`, `contact_person_name`, `contact_phone` (digits-normalized), and the linked `user`'s name/email/phone; fold the standalone Contact Phone field into it |
| 13 | Posts | New BE scope | `Post::scopeSearch()` unioning `body` with a `whereHas('user', …)` match on creator name/nickname; add a "Has Reports" boolean scope, replacing the impractical exact `reports_count` filter |
| 1 | Tournaments | New BE scope | Widen the Wave 1 `tournament_name`-only search into a full scope also covering `venue_name`, `city`, and organizer/creator name/nickname/email/phone; add a Country filter |
| 5 | Quick Matches | New BE scope | Collapse the three independent `whereHas` subqueries into one `search`-scope-style query; expose the already-validated `created_by` filter as a user picker; add a Format filter |
| 25 | Notifications | New BE scope | Free-text search over the JSON `data` payload (`whereJsonContains`/`LIKE` on `data->message` and related fields) — this table has no relational text columns, so this is a different query shape from every other scope in this wave |
| 14 | Post Reports | New BE scope | Search across reported-post body and reporter name/nickname (both relations already eager-loaded) |
| 22 | Push Notifications | New BE scope | Search across `title`/`body`; expose the already-existing `target_user_id` filter as a user picker |
| 21 | Live Streams | Small BE scope | Widen the existing title-only search to also match `description` |
| 23 | Push Notification Templates | New BE scope, low priority | Search across `name`/`key`/`title_template` — small fixed catalog, defer to backlog unless it grows |

**Not in any wave (already solid, no action needed):** Interest Campaigns (#6), Static Pages (#15), and Player Stats (#10, out of scope — see its section above).
