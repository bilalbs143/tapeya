# App Rewrite: TypeScript Architecture & Structure

Blueprint for a from-scratch rewrite of the **user-facing app** (`app/` minus `app/src/graphics`) in strict TypeScript, with a new UI. This is the reference structure to build against — every new feature should fit into it without inventing a new pattern.

**Out of scope:** `app/src/graphics`, `shared/graphics-core`, `shared/graphics-command-manifest.json`, `shared/graphics-themes.json`. The broadcast overlay pipeline stays exactly as-is (JS + JSDoc-typechecked) and is consumed by the new app the same way it's consumed today — as an installed package, across the same `check-consumer-no-graphics` boundary that already exists. Nothing here touches it.

---



## 1. Goals

1. **Type safety end-to-end** — no `any`, no untyped API responses, no prop-drilling guesses. If the backend contract changes, TypeScript should fail the build, not surface as a runtime crash in production.
2. **One consistent module pattern** — the current app has three competing organizing principles (`pages/`, `components/`, `features/`) grown over time. Pick one (feature-based) and apply it everywhere, no exceptions.
3. **Full REST at the boundary** — resources are nouns; state changes go through `PATCH`/`PUT` on the resource (or a proper sub-resource), not RPC action endpoints like `/status`, `/approve`, `/activate`. See §7.6.
4. **API independence** — UI never knows URLs, HTTP verbs, or wire JSON shape. All of that lives in the feature `api/` layer behind typed hooks. Change the backend contract by updating schemas + API slice only. See §7.7.
5. **Fast feedback loop** — typecheck + lint + unit tests must run in well under a minute locally and in CI, so they're actually run before every commit, not skipped.
6. **New UI, same proven data/native layer** — the visual redesign is the point of this rewrite; the underlying stack (Capacitor, RTK Query, realtime via Echo/Reverb) already works in production and isn't the problem. Don't re-litigate solved problems.
7. **Every screen provably matches a real API contract** before it ships, not after QA finds the mismatch.



## 2. Non-goals

- Not migrating away from Capacitor to a different native runtime (Expo/RN). Capacitor stays; **use the latest stable Capacitor major** in `app-next/` — do not freeze on whatever the legacy `app/` ships.
- Not a backend rewrite **mandated by this doc** — but the app rewrite is **not blocked on** keeping every legacy RPC route. Normalize the API where it helps; the app stays decoupled via §7.7. New endpoints follow §7.6 REST rules.
- Not touching graphics (see above).
- **Not mirroring legacy package majors.** `app-next/` targets current stable React / Router / Vite / Capacitor. Shared patterns and Capacitor app IDs matter; version parity with old `app/` does not.

---



## 3. Tech stack

Keep what already works, formalize it in TS, replace only what's genuinely weak.


| Layer                     | Choice                                                                                                                   | Why                                                                                                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Language                  | **TypeScript,** `strict: true`                                                                                           | Non-negotiable. See §9.                                                                                                                                                                  |
| Build                     | **Vite** (latest stable)                                                                                                 | Fast for SPA + Capacitor; stay current — do not pin to the legacy `app/` majors.                                                                                                         |
| UI framework              | **React 19** (latest stable)                                                                                             | New rewrite targets current React; ecosystem (Radix, RTL, RTK) supports 19.                                                                                                              |
| Native shell              | **Capacitor** (latest stable major)                                                                                      | Keep Capacitor; upgrade majors with the rewrite rather than matching old `app/`.                                                                                                         |
| Routing                   | **React Router v7** (latest stable)                                                                                      | Data-router ready; typed path builders per feature (§7.4). Do not stay on v6 for parity with legacy `app/`.                                                                              |
| Server-cache state        | **RTK Query**                                                                                                            | Feature-owned endpoints injected into one `baseApi`. REST-shaped mutations. See §7.6–§7.7.                                                                                               |
| Client/UI state           | **Redux Toolkit slices**, kept deliberately small                                                                        | Keep for genuinely cross-app state (auth, active session). Don't let it regrow into a dumping ground — see §6.                                                                           |
| Local/feature state       | `useState`**/**`useReducer`, React Context only for scoped subtrees                                                      | Formalize the decision rule in §6 instead of ad hoc choices per file.                                                                                                                    |
| Dialogs/modals            | **Dedicated vanilla store** (`shared/dialogs`), not Redux, not per-feature Context                                       | Global, callable from anywhere including outside React, must carry non-serializable callback props. Redux's serializability check fights this; a tiny standalone store doesn't. See §13. |
| Forms                     | **React Hook Form + Zod (**`@hookform/resolvers`**)**                                                                    | Keep — already the pattern, just typed.                                                                                                                                                  |
| Schema/runtime validation | **Zod**                                                                                                                  | Already a dependency. Promote it to the **single source of truth** for both API response typing and form validation — see §7.                                                            |
| Styling                   | **Tailwind CSS v4 + Radix UI primitives**                                                                                | Keep. This is effectively a hand-rolled shadcn/ui setup already — formalize it as one in §12.                                                                                            |
| UI icons                  | **Bundled SVG → React components** (`shared/ui/icons/`, SVGR)                                                            | Theme via `currentColor` + tokens. **Not** cloud. See §12.1.                                                                                                                             |
| Raster assets             | **Cloud/CDN** (PNG/WebP/GIF)                                                                                             | Hero, products, avatars, thumbnails — not icons. Canonical aspect per content type. See §12.1–§12.2.                                                                                     |
| Realtime                  | **Laravel Echo + Pusher/Reverb**                                                                                         | Keep, type the event payloads (see §7.3).                                                                                                                                                |
| Testing (unit/component)  | **Vitest + React Testing Library**                                                                                       | Keep, add **MSW** (Mock Service Worker) for API mocking — currently missing, and hand-rolled fetch mocks are the #1 source of flaky tests.                                               |
| Testing (E2E)             | **Playwright**                                                                                                           | Keep.                                                                                                                                                                                    |
| Lint/format               | **ESLint (flat config) + Prettier**                                                                                      | Keep, add `typescript-eslint` + `import/order` enforcement, keep the existing custom `eslint-rules/` (form-layout rule) ported to TS.                                                    |
| Error tracking            | **Sentry** (or equivalent)                                                                                               | **Add** — not present today. A rewrite with strict types still needs production runtime visibility; don't ship blind.                                                                    |
| Secure token storage      | `@capacitor/preferences` (or `capacitor-secure-storage-plugin`) for the auth token, not `redux-persist` → `localStorage` | **Change** — see §8.                                                                                                                                                                     |


---



## 4. Top-level structure

```
app/
├── src/
│   ├── app/                     # App shell: providers, router, entry composition
│   │   ├── App.tsx
│   │   ├── AppProviders.tsx     # Redux, RTK Query, Theme, Toast, ErrorBoundary — composed once
│   │   └── routes.tsx           # Route table (typed, lazy-loaded)
│   │
│   ├── features/                # ★ The only place domain logic lives — see §5
│   │   ├── auth/
│   │   ├── feed/
│   │   ├── reels/
│   │   ├── scoring/
│   │   ├── organizer/
│   │   ├── tournaments/
│   │   ├── shop/
│   │   ├── profile/
│   │   ├── live/
│   │   └── notifications/
│   │
│   ├── entities/                 # Cross-feature domain models with no owning feature
│   │   ├── user/                 # User type, avatar component, nickname formatting
│   │   ├── team/
│   │   └── match/
│   │
│   ├── shared/                    # Reusable, feature-agnostic code — nothing domain-specific
│   │   ├── ui/                    # Design system: Button, Input, Sheet, StatusPill…
│   │   │   ├── icons/             # Bundled SVG → React icon components — see §12.1
│   │   │   └── media/             # MediaFrame, aspect ratio registry — see §12.2
│   │   ├── dialogs/                # Global dialog/modal system — store, host, registry. See §13.
│   │   ├── api/                   # baseApi, envelope, unwrap, errors — see §7.8
│   │   ├── lib/                    # Pure utilities: date, currency, phone, string formatting
│   │   ├── hooks/                  # Generic hooks: useDebounce, useMediaQuery, useIntersection
│   │   ├── native/                 # Capacitor wrappers: push tokens, share, orientation
│   │   ├── platform/                # Platform detection (web/ios/android), download handling
│   │   ├── config/                  # Env, realtime (Echo) setup, feature flags
│   │   └── types/                    # Global ambient types, API envelope types
│   │
│   ├── test/                    # Test setup: MSW handlers root, render-with-providers helper
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── e2e/                          # Playwright specs (mirrors features/ by name)
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── .eslintrc / eslint.config.ts
└── capacitor.config.ts
```

**Rule:** if a file only makes sense in the context of one feature, it lives inside that feature's folder — never in `shared/`. `shared/` code must be genuinely reusable with zero domain knowledge. This is the single most common way these structures rot; enforce it in review.

---



## 5. Feature module template

Every folder under `features/` follows the same internal shape. Not every feature needs every subfolder — omit what's empty, never invent a new top-level shape per feature.

```
features/tournaments/
├── api/
│   └── tournamentsApi.ts        # RTK Query endpoints, injected into shared/api/baseApi
├── model/
│   ├── types.ts                 # Domain types (often z.infer<typeof schema>)
│   ├── schemas.ts                # Zod schemas — API response + form input validation
│   └── selectors.ts              # Memoized selectors if this feature owns Redux slice state
├── ui/
│   ├── TournamentCard.tsx
│   ├── TournamentCard.test.tsx   # Co-located test
│   ├── CreateTournamentForm.tsx
│   └── CreateTournamentForm.test.tsx
├── pages/
│   ├── TournamentsListPage.tsx   # Route-level component — composes ui/ + api/
│   ├── CreateTournamentPage.tsx
│   └── TournamentDetailPage.tsx
├── hooks/
│   └── useTournamentFilters.ts   # Feature-scoped hooks (not generic enough for shared/hooks)
├── lib/
│   └── formatTournamentDates.ts  # Feature-scoped pure helpers
├── routes.ts                     # This feature's route definitions, imported into app/routes.tsx
└── index.ts                      # Public surface — only what other features are allowed to import
```

**The** `index.ts` **barrel is the feature's contract.** Other features (and `app/routes.tsx`) import *only* from `features/x/index.ts`, never reach into `features/x/ui/SomeInternalComponent.tsx` directly. This is what makes the boundary real instead of aspirational — enforce it with an ESLint `no-restricted-imports` rule scoped per feature, the same way `check-consumer-no-graphics.js` already enforces the graphics boundary today.

Cross-feature imports should be rare. When feature A genuinely needs feature B's card component, prefer promoting the shared piece to `entities/` over reaching across the boundary.

---



## 6. State: which layer owns what

The current app mixes Redux slices, feature Context, and local state without a written rule, which is how you end up with the same "is the innings state in Redux or Context?" question every time someone touches scoring. Codify it:


| State type                                                    | Owner                                                                                    | Example                                              |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Anything that came from the API                               | **RTK Query cache** (never copy into a slice)                                            | Tournament list, user profile, feed posts            |
| Global, app-wide, survives navigation                         | **Redux slice** (`shared/store` or feature `model/slice.ts`)                             | Auth session, active toast queue, global UI theme    |
| Scoped to one screen/flow, shared by a deep component subtree | **React Context**, defined in that feature, provider mounted at the feature's route root | Live scoring innings state, a multi-step form wizard |
| Local to one component                                        | `useState`**/**`useReducer`                                                              | Dialog open/close, input focus, form field-level UI  |


Rule of thumb: if you're about to add a new Redux slice, first ask "is this actually API data?" (→ RTK Query) or "does this only matter inside one feature's subtree?" (→ Context). Redux slices should be countable on one hand for the whole app.

**Dialogs are the one deliberate exception** to "global state → Redux": they're global (opened from anywhere, including outside a feature's own subtree) but frequently need to carry non-serializable props (`onConfirm` callbacks, mid-flow scoring handlers) — which fights Redux Toolkit's serializability checks. They get their own dedicated store instead of living in a Redux slice or a Context — see §13.

---



## 7. Typed API layer



### 7.1 Zod as the source of truth

Every API response gets a Zod schema in the owning feature's `model/schemas.ts`. The TypeScript type is *derived*, never hand-written twice:

```ts
// features/tournaments/model/schemas.ts
import { z } from 'zod';

export const tournamentSchema = z.object({
  id: z.number(),
  tournament_name: z.string(),
  tournament_type: z.enum(['open_tournament', 'private_tournament']),
  city: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  teams_count: z.number(),
  matches_count: z.number(),
});

export type Tournament = z.infer<typeof tournamentSchema>;
```

RTK Query endpoints validate the response through the schema in `transformResponse`, so a backend contract change (a renamed field, a null where a string was expected) fails loudly in dev/CI instead of producing a silent `undefined` deep in a component. Use shared unwrap helpers (§7.8) — never ad hoc `response?.data ?? response` per endpoint.

### 7.2 One base API, per-feature endpoint injection

Keep the current pattern — one `baseApi` in `shared/api/baseApi.ts` (typed `tagTypes` as a const union, not bare strings), each feature injects its own endpoints via `baseApi.injectEndpoints`. This already works well; just type it:

```ts
// shared/api/baseApi.ts
export const TAG_TYPES = ['User', 'Tournament', 'Match', 'Post', /* … */] as const;
export type ApiTag = (typeof TAG_TYPES)[number];

export const baseApi = createApi({
  reducerPath: 'api',
  tagTypes: TAG_TYPES,
  baseQuery: typedBaseQuery, // wraps fetchBaseQuery, returns ApiError on failure — see 7.5
  endpoints: () => ({}),
});
```



### 7.3 Realtime events

Echo/Pusher/Reverb event payloads get the same Zod treatment — define the event schema once next to the feature that listens for it (e.g. `features/live/model/schemas.ts` for score-update broadcasts), parse on receipt. Untyped `data: any` in a socket handler is exactly where a backend field rename goes unnoticed until a screen silently stops updating.

### 7.4 Typed routes

Introduce a thin typed-routes helper (or a small library like `type-route`/TanStack Router if the team wants to go further) so `navigate('/organizer/tournaments/:id')` can't typo a path or drop a required param. Minimum bar: a single `routes.ts` object of path builder functions per feature, imported everywhere instead of raw string literals.

### 7.5 One API error shape

Normalize every RTK Query error into one discriminated union (`{ type: 'validation', fields }` | `{ type: 'unauthorized' }` | `{ type: 'network' }` | `{ type: 'unknown', status }`) in `shared/api/`. Every feature's error handling switches on this, not on ad hoc `error?.data?.message` string checks scattered across components.

### 7.6 REST API conventions (backend + app consumption)

**Rule:** treat the API as **resource-oriented REST**. State changes update **resources**, not bespoke action URLs.

#### Do — resource updates

| Intent | HTTP | Example |
|--------|------|---------|
| Create | `POST /resources` | `POST /tournaments` |
| Read one / list | `GET /resources/{id}`, `GET /resources` | `GET /tournaments/{id}` |
| Full replace | `PUT /resources/{id}` | `PUT /teams/{id}` |
| Partial update (status, fields) | `PATCH /resources/{id}` | `PATCH /vendor/orders/{id}` body `{ status: "shipped" }` |
| Delete | `DELETE /resources/{id}` | `DELETE /posts/{id}` |
| Nested collection item | `POST/PATCH/DELETE` on sub-resource | `POST /tournaments/{id}/teams` |

Status changes, approvals, publishes, and toggles are **`PATCH` on the resource** (or `PUT` when replacing the full representation) — never a separate “status” RPC route.

```http
✅ PATCH /api/v1/vendor/orders/42
   { "status": "shipped" }

❌ POST /api/v1/vendor/orders/42/status
   { "status": "shipped" }
```

```http
✅ PATCH /api/v1/tournaments/7
   { "status": "completed", "end_date": "2026-03-01" }

❌ POST /api/v1/tournaments/7/complete
```

#### Do — true sub-resources (when the thing *is* its own resource)

Creating/deleting a **distinct entity** attached to a parent is fine:

```http
POST   /posts/{id}/comments          → creates a Comment resource
DELETE /posts/{id}/comments/{cid}
POST   /users/{id}/follows           → or DELETE …/follows (follow relationship)
POST   /posts/{id}/reports           → creates a Report resource
```

Prefer **one reaction model** over paired RPC verbs:

```http
✅ PUT /posts/{id}/reaction
   { "type": "like" }     → set reaction
   { "type": null }       → clear reaction

❌ POST /highlights/{id}/like  +  POST /highlights/{id}/dislike   (separate action endpoints)
```

**Positive precedent already in this API:** `POST` + `DELETE /posts/{post}/like` (and the same for `/save`) treat the reaction as a resource — better than paired like/dislike action verbs. Prefer that shape (or a single `PUT …/reaction`) for new work.

If the API still exposes `/like` and `/dislike` during migration, the **app** calls a single domain hook (`useSetReactionMutation`) — see §7.7.

#### Do — commands that are not CRUD (narrow exceptions)

Some domains are legitimately **commands** (scoring ball, multipart upload chunk). These are exceptions, not the default:

| Exception | Why | Shape |
|-----------|-----|--------|
| Scoring engine | Append-only match events, not a static resource | `POST /matches/{id}/balls` |
| Multipart upload | Protocol steps | `POST …/upload/init`, `…/part`, `…/complete` |
| Auth OTP | Stateless auth flow | `POST /request-otp`, `POST /verify-otp` |

Do **not** use the scoring/command pattern for simple field updates (status, flags, labels).

#### App-side RTK Query mapping

Mutations mirror REST — one endpoint per resource operation, typed body/response:

```ts
// features/shop/vendor/api/ordersApi.ts
updateOrder: builder.mutation<Order, { id: number; patch: UpdateOrderPatch }>({
  query: ({ id, patch }) => ({
    url: `/vendor/orders/${id}`,
    method: 'PATCH',
    body: patch,
  }),
  invalidatesTags: (_r, _e, { id }) => [{ type: 'Order', id }],
}),
```

UI calls `useUpdateOrderMutation()` — never constructs URLs or chooses verbs.

#### Legacy RPC (current API)

Today's API mixes REST with action routes (`/like`, `/dislike`, `/orders/{id}/status`, `/approve`). **Do not copy these patterns in new work.**

During rewrite:

1. **New backend routes** follow this section.
2. **App** consumes through feature `api/` + domain hooks (§7.7) so legacy RPC can be swapped to `PATCH` without touching pages.
3. Track normalization in `docs/adr/` when an RPC route is replaced.

---

### 7.7 API independence (change the backend without rewriting UI)

The app owns a **thin, typed boundary** between UI and HTTP. UI depends on **domain types and hooks**, not on Laravel route names or JSON keys.

#### Layering

```
Page / Dialog / Hook (feature UI)
        ↓  useUpdateTournamentMutation({ id, patch })
Feature api/ (RTK Query — only place that knows URLs + verbs)
        ↓  transformResponse: tournamentSchema.parse(raw)
Feature model/schemas.ts (Zod — wire format → domain type)
        ↓
entities/ (shared display types, optional normalization)
```

**Banned in UI layers:** string URLs, `fetch(`, HTTP method strings, snake_case field names from API responses.

#### Single entry point per operation

Each user action maps to **one hook** with a domain-shaped argument — even if the backend temporarily needs two HTTP calls:

```ts
// features/highlights/api/highlightsApi.ts

/** Domain hook — UI uses this only */
setHighlightReaction: builder.mutation<Highlight, { id: number; reaction: 'like' | 'dislike' | null }>({
  async queryFn({ id, reaction }, _api, _extra, baseQuery) {
    // Rewrite target: PUT /highlights/{id}/reaction
    // Migration shim: map to legacy POST /like or /dislike until API is normalized
    return reactionAdapter(baseQuery, id, reaction);
  },
  invalidatesTags: (_r, _e, { id }) => [{ type: 'Highlight', id }],
}),
```

When the API moves to REST, change **only** `reactionAdapter` / the `query` block — pages unchanged.

#### Wire vs domain (optional adapter)

If wire JSON differs from what UI should see, normalize in `transformResponse` or `features/x/api/normalizers.ts`:

```ts
export function toTournament(raw: unknown): Tournament {
  return tournamentSchema.parse(raw); // Zod strips/coerces once
}
```

Never map `tournament_name` → `name` in a page component.

#### Contract testing

- MSW handlers in `features/x/test/handlers.ts` implement the **same REST shapes** the app expects.
- Handlers return payloads validated by the **same Zod schemas** as production `transformResponse`.
- When API changes: update schema + handler + RTK endpoint → Vitest fails if UI contract breaks.

Optional later: OpenAPI spec generated from Laravel → diff against Zod schemas in CI. Zod remains the **runtime** source of truth.

#### Checklist when changing an API endpoint

1. Update Zod schema in `features/x/model/schemas.ts`
2. Update RTK Query endpoint in `features/x/api/`
3. Update MSW handler in `features/x/test/handlers.ts`
4. Run `tsc` + feature tests — UI files should need **zero edits** if layering was respected
5. Add ADR if the REST shape decision is non-obvious

#### What this buys you

- Rename a field, merge `/like`+`/dislike` into `PUT /reaction`, split a monolith response — **app UI stays stable**
- Backend team can evolve `api/` independently; frontend team owns the boundary schemas
- Rewrite proceeds screen-by-screen without waiting for every legacy route to be deleted — shims live in `api/` only

### 7.8 Wrap / unwrap — concrete RTK pattern (all response shapes)

Laravel today returns **several wire shapes**. The rewrite handles them in **one place** (`shared/api/unwrap.ts`) so feature endpoints never repeat `response?.data ?? response`.

**Golden rule:** RTK cache stores **domain types only** (after Zod parse). Wire JSON never leaves `transformResponse` / `baseQuery`.

#### Wire formats (backend contract)

**Success envelope** (`response()->success()` — `MacroServiceProvider`):

```json
{
  "data": { … } | [ … ],
  "message": "Optional human string",
  "type": "SUCCESS" | "CREATED"
}
```

`MacroServiceProvider` builds the payload with `array_filter(..., fn ($v) => $v !== null)` — so **`data` is omitted entirely** when the controller passes `null` (not present as `"data": null`). Same for a null `message`. Wire schemas must treat `data` as **optional**, not merely nullable.

**Failure envelope** (`response()->failure()`):

```json
{
  "message": "Validation failed.",
  "type": "VALIDATION_ERROR" | "NOT_FOUND" | "FORBIDDEN" | "BAD_REQUEST" | "…",
  "errors": { "field": ["Error message"] }
}
```

Validation failures are `type: "VALIDATION_ERROR"` (HTTP 422) per `ApiErrorCatalog` — not `BAD_REQUEST` (400).

**Paginated Laravel Resource collection** (some `index()` routes — no `type`/`message`):

```json
{
  "data": [ … ],
  "links": { "first", "last", "prev", "next" },
  "meta": { "current_page", "last_page", "per_page", "total", … }
}
```

**Paginated collection inside success** (some controllers wrap collection):

```json
{
  "data": [ … ],
  "message": null,
  "type": "SUCCESS"
}
```

**Cursor page inside `data`** (feed/reels):

```json
{
  "data": {
    "items": [ … ],
    "next_cursor": "…",
    "prev_cursor": "…",
    "has_more": true,
    "per_page": 10
  }
}
```

**Composite / stats payload inside `data`** (standings, dashboard, reaction counts):

```json
{
  "data": { "rows": [ … ], "updated_at": "…" }
}
```

**Empty success** (mark-all-read, flush, most entity deletes — `$this->success(null, '…')`):

```json
{ "message": "All notifications marked as read.", "type": "SUCCESS" }
```

No `data` key. Do not document or assert `"data": null` — that shape is never what ships.

**No content** — HTTP **204** via `$this->noContent()`, **empty body**. Used mainly by **Admin/backoffice** controllers. A few User side-effects also return 204 (e.g. media delete, live hearts) — but **consumer-app entity deletes** (`Post`, `PostComment`, `Profile`, `MatchNote`, interest withdraw, …) use `$this->success(null, '… deleted.')` → HTTP **200** + empty-success envelope above. Default delete unwrap for this app is therefore `unwrapMessage()`, not `unwrapVoid()`.

**Rewrite target (backend):** prefer **`success()` for all JSON responses** including lists, with pagination in `meta` — one predictable envelope. Until then, unwrap helpers accept both legacy shapes.

#### Shared modules

```
shared/api/
├── baseApi.ts           # typedBaseQuery — auth, errors, 401 dialog
├── envelope.ts          # Zod wire schemas (success, failure, pagination meta)
├── unwrap.ts            # unwrapData, unwrapList, unwrapPaginated, unwrapCursor, …
├── errors.ts            # ApiError discriminated union (§7.5)
├── types.ts             # Paginated<T>, CursorPage<T>, MutationResult<T>
└── endpointHelpers.ts   # optional defineQuery / defineMutation wrappers
```

#### Wire schemas (`envelope.ts`)

```ts
import { z } from 'zod';

export const wireSuccessSchema = z.object({
  // omitted (not null) when controllers call success(null, …) — see MacroServiceProvider array_filter
  data: z.unknown().optional(),
  message: z.string().optional(),
  type: z.enum(['SUCCESS', 'CREATED']).optional(),
});

export const paginationMetaSchema = z.object({
  current_page: z.number(),
  last_page: z.number(),
  per_page: z.number(),
  total: z.number(),
  from: z.number().nullable().optional(),
  to: z.number().nullable().optional(),
});

export const wirePaginatedSchema = z.object({
  data: z.array(z.unknown()),
  meta: paginationMetaSchema,
  links: z.record(z.string()).optional(),
});

export const wireCursorPageSchema = z.object({
  items: z.array(z.unknown()),
  next_cursor: z.string().nullable(),
  prev_cursor: z.string().nullable().optional(),
  has_more: z.boolean(),
  per_page: z.number().optional(),
});

export const wireFailureSchema = z.object({
  message: z.string().optional(),
  type: z.string(),
  errors: z.record(z.array(z.string())).optional(),
});
```

#### Unwrap helpers (`unwrap.ts`)

One function per use case — feature `transformResponse` picks **exactly one**:

```ts
/** UC1, UC5, UC6, UC9 — single resource or composite object in success.data */
export function unwrapData<T>(itemSchema: z.ZodType<T>) {
  return (raw: unknown): T => {
    const body = wireSuccessSchema.parse(raw);
    return itemSchema.parse(body.data);
  };
}

/** UC2 — plain array (teams on tournament, squad list) */
export function unwrapList<T>(itemSchema: z.ZodType<T>) {
  return (raw: unknown): T[] => {
    const data = extractDataArray(raw);
    return z.array(itemSchema).parse(data);
  };
}

/** UC3 — Laravel page/per_page pagination */
export function unwrapPaginated<T>(itemSchema: z.ZodType<T>) {
  return (raw: unknown): Paginated<T> => {
    const parsed = wirePaginatedSchema.safeParse(raw);
    if (parsed.success) {
      return {
        items: z.array(itemSchema).parse(parsed.data.data),
        meta: parsed.data.meta,
      };
    }
    // Legacy: success envelope wrapping an array without meta
    const items = extractDataArray(raw);
    return { items: z.array(itemSchema).parse(items), meta: null };
  };
}

/** UC4 — cursor feed (posts, reels) */
export function unwrapCursorPage<T>(itemSchema: z.ZodType<T>, mapItem?: (raw: T) => T) {
  return (raw: unknown): CursorPage<T> => {
    const data = wireSuccessSchema.parse(raw).data;
    const page = wireCursorPageSchema.parse(data);
    let items = z.array(itemSchema).parse(page.items);
    if (mapItem) items = items.map(mapItem);
    return {
      items,
      nextCursor: page.next_cursor,
      prevCursor: page.prev_cursor ?? null,
      hasMore: page.has_more,
      perPage: page.per_page ?? items.length,
    };
  };
}

/** Rare 204 empty body (admin / a few User side-effects) — not the default for app deletes */
export function unwrapVoid() {
  return (_raw: unknown): void => undefined;
}

/** UC7, UC8 — message-only success (entity delete, mark-all-read — toast source) */
export function unwrapMessage() {
  return (raw: unknown): string | undefined => wireSuccessSchema.parse(raw).message;
}

/** UC5b — create returns envelope; expose entity + optional toast message */
export function unwrapMutation<T>(itemSchema: z.ZodType<T>) {
  return (raw: unknown): MutationResult<T> => {
    const body = wireSuccessSchema.parse(raw);
    return {
      data: body.data == null ? null : itemSchema.parse(body.data),
      message: body.message,
      created: body.type === 'CREATED',
    };
  };
}
```

`extractDataArray(raw)` internally handles `{ data: [] }` with or without `type`/`message` — **the compatibility shim for legacy routes**.

#### Use-case matrix → RTK endpoint pattern

| UC | Operation | HTTP | Wire shape | Unwrap helper | RTK cache type |
|----|-----------|------|------------|---------------|----------------|
| **1** | Get one | `GET /x/{id}` | success + object | `unwrapData(schema)` | `Tournament` |
| **2** | Get list (all) | `GET /x?all=1` | success + array | `unwrapList(schema)` | `Team[]` |
| **3** | Get list (paged) | `GET /x?page=` | paginated or success+array | `unwrapPaginated(schema)` | `Paginated<T>` |
| **4** | Get list (cursor) | `GET /reels/feed?cursor=` | success + cursor object | `unwrapCursorPage(schema, map)` | `CursorPage<Reel>` |
| **5** | Create | `POST /x` | 201 success + object | `unwrapMutation(schema)` or `unwrapData` | `T` + optional toast |
| **6** | Update | `PATCH /x/{id}` | success + object | `unwrapData(schema)` | `T` |
| **7** | Delete | `DELETE /x/{id}` | success, no `data` + message | `unwrapMessage()` | `void` + toast |
| **8** | Bulk action | `PATCH /notifications/read-all` | success, no `data` + message | `unwrapMessage()` | `void` + toast |
| **9** | Partial/composite | `GET …/standings` | success + nested object | `unwrapData(standingsSchema)` | `Standings` |
| **10** | Side-effect payload | `PUT …/reaction` | success + counts object | `unwrapData(reactionSchema)` | patch cache in `onQueryStarted` |
| **11** | File upload | `POST` FormData | success + object | `unwrapData(schema)` | same as create |
| **12** | Enum/config | `GET /enums` | success + map | `unwrapData(enumsSchema)` | `Enums` |

#### Concrete feature endpoint examples

```ts
// features/tournaments/api/tournamentsApi.ts
import { baseApi } from '@/shared/api/baseApi';
import { unwrapData, unwrapList, unwrapPaginated, unwrapMutation } from '@/shared/api/unwrap';
import { tournamentSchema } from '../model/schemas';

export const tournamentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // UC1
    getTournament: builder.query<Tournament, number>({
      query: (id) => `/tournaments/${id}`,
      transformResponse: unwrapData(tournamentSchema),
      providesTags: (_r, _e, id) => [{ type: 'Tournament', id }],
    }),

    // UC3
    getTournaments: builder.query<Paginated<Tournament>, TournamentListParams>({
      query: (params) => ({ url: '/tournaments', params: toQueryParams(params) }),
      transformResponse: unwrapPaginated(tournamentSchema),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((t) => ({ type: 'Tournament' as const, id: t.id })),
              { type: 'Tournament', id: 'LIST' },
            ]
          : [{ type: 'Tournament', id: 'LIST' }],
    }),

    // UC5
    createTournament: builder.mutation<MutationResult<Tournament>, CreateTournamentInput>({
      query: (body) => ({ url: '/tournaments', method: 'POST', body: toWireBody(body) }),
      transformResponse: unwrapMutation(tournamentSchema),
      invalidatesTags: [{ type: 'Tournament', id: 'LIST' }],
    }),

    // UC6
    updateTournament: builder.mutation<Tournament, { id: number; patch: UpdateTournamentPatch }>({
      query: ({ id, patch }) => ({ url: `/tournaments/${id}`, method: 'PATCH', body: patch }),
      transformResponse: unwrapData(tournamentSchema),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Tournament', id }, { type: 'Tournament', id: 'LIST' }],
    }),

    // UC2
    getTournamentTeams: builder.query<Team[], number>({
      query: (tournamentId) => `/tournaments/${tournamentId}/teams`,
      transformResponse: unwrapList(teamSchema),
      providesTags: (_r, _e, tournamentId) => [{ type: 'TournamentTeams', id: tournamentId }],
    }),
  }),
});
```

```ts
// features/reels/api/reelsApi.ts — UC4 with merge + infinite scroll
getReelsFeed: builder.query<CursorPage<Reel>, { cursor?: string; perPage?: number }>({
  query: ({ cursor, perPage = 10 }) => ({
    url: '/reels/feed',
    params: { cursor: cursor ?? undefined, per_page: perPage },
  }),
  transformResponse: unwrapCursorPage(reelWireSchema, toReel), // wire → domain normalizer
  serializeQueryArgs: ({ endpointName }) => endpointName,
  merge: mergeCursorPages,
  forceRefetch: ({ currentArg, previousArg }) => currentArg?.cursor !== previousArg?.cursor,
}),
```

```ts
// UC10 — reaction with optimistic cache (domain hook hides legacy RPC)
setPostReaction: builder.mutation<ReactionResult, { postId: number; reaction: ReactionType | null }>({
  query: ({ postId, reaction }) => reactionQuery(postId, reaction), // shim until REST PUT
  transformResponse: unwrapData(reactionResultSchema),
  async onQueryStarted({ postId, reaction }, { dispatch, queryFulfilled }) {
    const patch = optimisticReactionPatch(dispatch, postId, reaction);
    try {
      const { data } = await queryFulfilled;
      syncReactionPatch(dispatch, postId, data);
    } catch {
      patch.undo();
    }
  },
}),
```

#### UI consumption (mutations & errors)

Components use hooks only — **never read wire envelopes**:

```tsx
const [createTournament] = useCreateTournamentMutation();

async function onSubmit(form: CreateTournamentForm) {
  try {
    const result = await createTournament(buildPayload(form)).unwrap();
    if (result.message) toast.success(result.message);
    navigate(tournamentRoutes.detail(result.data!.id));
  } catch (err) {
    toast.error(getApiErrorMessage(err, 'Could not create tournament.'));
  }
}
```

```ts
// shared/api/errors.ts — used by typedBaseQuery + getApiErrorMessage
export function parseApiError(error: FetchBaseQueryError): ApiError {
  const data = error.data;
  const failure = wireFailureSchema.safeParse(data);
  if (failure.success && failure.data.errors) {
    return { type: 'validation', fields: failure.data.errors, message: failure.data.message };
  }
  if (error.status === 401) return { type: 'unauthorized' };
  // …
}
```

#### Domain normalizers (when wire ≠ UI shape)

Keep **Zod wire schema** faithful to API. Add **`toDomain()`** only when UI needs a flatter shape (today: `normalizePost`, `normalizeReel`):

```ts
// features/reels/model/schemas.ts
export const reelWireSchema = z.object({ /* snake_case, nested creator */ });

// features/reels/api/normalizers.ts
export function toReel(raw: z.infer<typeof reelWireSchema>): Reel {
  return {
    id: raw.id,
    posterUrl: raw.playback.poster_url ?? raw.cover_url ?? null,
    creator: toUserSummary(raw.creator),
    // …
  };
}

// transformResponse:
transformResponse: (raw) => unwrapCursorPage(reelWireSchema, toReel)(raw),
```

Rule: **wire schema** changes when API changes; **toDomain** changes when UI model changes — rarely the same edit.

#### `defineQuery` / `defineMutation` (optional sugar)

Reduce boilerplate when many endpoints share the same unwrap:

```ts
// shared/api/endpointHelpers.ts
export function defineQuery<TArg, TResult>(config: {
  query: (arg: TArg) => string | QueryArg;
  unwrap: (raw: unknown) => TResult;
  providesTags?: ProvidesTags<TResult, TArg>;
}) {
  return { query: config.query, transformResponse: config.unwrap, providesTags: config.providesTags };
}
```

Use when it helps readability — not mandatory if explicit `builder.query` is clearer for cursor merge endpoints.

#### Banned (same as §7.7)

- `transformResponse: (r) => r?.data ?? r` copy-pasted per endpoint
- Returning raw envelope to UI (`createTournament` returning full `{ data, message }` without documenting type)
- Snake_case fields in components (`tournament.tournament_name` — parse to domain in schema/normalizer)
- Skipping Zod parse “because TypeScript knows the shape”

#### Backend alignment checklist (when touching API)

1. Return `response()->success($data, $message?, $type?)` consistently
2. Put cursor pages at `data.items`, not top-level
3. Use `PATCH` + full resource in `data` on update (§7.6)
4. Validation errors always `{ message, type, errors }`
5. Update feature Zod schema + MSW handler in the same PR as the API change

---



## 8. Auth & secure storage

Current app persists the auth token via `redux-persist` into `localStorage` (via the webview) — that's fine for a websites, but on a Capacitor native shell the token should go through `@capacitor/preferences` (native keychain/keystore-backed on iOS/Android, falls back to localStorage on web) instead. Redux still holds the token in memory for the session; persistence/rehydration goes through a small `shared/native/secureStorage.ts` wrapper, not `redux-persist`'s default web storage engine.

---



## 9. TypeScript configuration

- `strict: true`, plus `noUncheckedIndexedAccess: true` and `exactOptionalPropertyTypes: true` — both catch real bugs in a codebase this data-heavy (array/object access from API responses).
- No `any` — enforce via `@typescript-eslint/no-explicit-any` as an **error**, not a warning. Use `unknown` + a Zod parse at the boundary instead.
- Path aliases carried over from the current `@/*` convention, expanded per top-level folder so imports read as `@/features/tournaments`, `@/shared/ui`, `@/entities/user` — keeps refactors (moving a file) from breaking fifty relative-import paths.
- Split `tsconfig.app.json` (browser/app code) from `tsconfig.node.json` (Vite config, scripts) the same way the graphics side already isolates its own `tsconfig.json` — one root `tsconfig.json` with `references` tying them together.

---



## 10. Testing strategy


| Level     | Tool                                     | What                                                                                               | Where                               |
| --------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Unit      | Vitest                                   | Pure functions (`lib/`), Zod schemas, selectors                                                    | Co-located `*.test.ts`              |
| Component | Vitest + React Testing Library + **MSW** | Feature UI components against a mocked API, not a mocked hook                                      | Co-located `*.test.tsx`             |
| E2E       | Playwright                               | Critical user flows only (register → verify OTP, create tournament, score a match, place an order) | `e2e/`, named per flow not per page |


MSW handlers live per-feature (`features/x/test/handlers.ts`) and compose into one root server in `src/test/`. This replaces hand-mocking `fetch`/RTK Query hooks, which is brittle and doesn't catch contract drift the way an MSW handler validated against the same Zod schema does.

**CI gate, every PR:** `tsc --noEmit` → `eslint .` → `vitest run` → `playwright test` (smoke subset) → `vite build`. Fail fast in that order — typecheck is cheapest and catches the most, so it runs first.

---



## 11. Native & platform layer

Keep the existing `native/` (Capacitor feature wrappers: push tokens, share, screen orientation) and `platform/` (platform detection, download handling) split — it's a sound abstraction already. Type it so feature code never imports `@capacitor/*` packages directly; it goes through `shared/native/*` wrappers that present a typed, platform-agnostic interface (and a web fallback where relevant). This is what makes it possible to unit-test feature code without a native runtime.

---



## 12. Design system (`shared/ui/`)

Formalize the existing Radix + Tailwind combination as an explicit design system layer rather than ad hoc per-page styling:

- One primitive per Radix component, styled with Tailwind + `class-variance-authority` (`cva`) for variants — the shadcn/ui pattern, without the extra dependency.
- Every primitive typed with `React.ComponentPropsWithoutRef<typeof RadixPrimitive>` extensions, not loose `any` prop bags.
- Design tokens (color, spacing, radius, type scale) defined once in `src/index.css` via `:root` / `[data-theme]` runtime vars + `@theme inline` (ported from `tapeya-ui`) — reconciled against graphics brand values for consistency, without a build dependency on graphics code.
- New UI work happens here first — a screen should almost never write a one-off styled `<div>` when a primitive should exist.

### 12.1 Icons (SVG, bundled — not cloud)

**Rule:** all **UI icons** ship as bundled React components. **PNG/JPG/WebP raster assets** (hero images, marketing, product photos, user uploads) use **cloud/CDN URLs** — never mix the two.

| Asset type | Storage | Examples |
|------------|---------|----------|
| **UI icons** (monochrome, theme-aware) | Bundled in app — `shared/ui/icons/` | Nav, tabs, buttons, scoring actions, form controls, dismissals |
| **Raster images** (fixed pixels, photos) | Cloud/CDN or API URL | Hero slider, shop products, avatars, reel thumbnails, success GIFs |
| **Brand logo** (exception) | Bundled SVG with light/dark variants if needed | App logo in auth chrome, splash |

**Do not** host app chrome icons on CloudFront. The current app's CDN nav icons + `<img>` pattern breaks light/dark theming — do not carry it forward.

#### Folder layout

```
shared/ui/icons/
├── Icon.tsx              # Shared wrapper: size variants, className, a11y
├── Icon.types.ts         # IconProps — size, className, aria-label
├── svg/                  # Design handoff — source SVG files (stroke/fill = currentColor)
│   ├── home.svg
│   ├── reels.svg
│   ├── scoring-bat.svg
│   └── dismissal-run-out.svg
├── HomeIcon.tsx          # One component per icon (SVGR or hand-written)
├── ReelsIcon.tsx
└── index.ts              # Public exports only — import icons from here
```

- **Source SVGs** live in `svg/` — one file per icon, paths use `stroke="currentColor"` and/or `fill="currentColor"`.
- **React components** live alongside — generated via `vite-plugin-svgr` (`import Raw from './svg/home.svg?react'`) or maintained manually.
- **No single mega-file** exporting every icon inline — doesn't tree-shake, causes merge conflicts at scale (~80+ cricket/scoring icons).
- **No raw `<img src="*.svg">`** for UI icons — cannot recolor for light/dark.

#### Light / dark mode (icons)

One SVG per icon. Theme comes from Tailwind semantic tokens, not duplicate `-light` / `-dark` files:

```tsx
<HomeIcon className="text-icon-muted group-data-[state=active]:text-icon-brand" />
```

Define icon color tokens in `src/index.css` `@theme inline` (not a separate `tokens.ts` file in the scaffold):

| Token | Use |
|-------|-----|
| `text-icon-default` | Primary icon color — follows `ink` |
| `text-icon-muted` | Inactive nav, secondary actions |
| `text-icon-brand` | Active tab, primary CTA icon |
| `text-icon-danger` | Destructive actions |

**Exceptions (bundled, not cloud):**

- **App logo** with fixed brand colors → `LogoLight` / `LogoDark` components, or one SVG using CSS variables (`fill="var(--logo-primary)"`).
- Do **not** create light/dark pairs for every UI icon — `currentColor` handles 95% of cases.

### 12.3 Theme system (app light / dark / system)

Visual theme is **not** a React context tree of colour props. It is:

1. **Runtime CSS variables** — `:root` / `[data-theme='dark']` and `[data-theme='light']` hold `--c-*` values in `app-next/src/index.css` (ported from `tapeya-ui`).
2. **`@theme inline`** — maps Tailwind utilities (`bg-surface`, `text-ink`, …) onto those vars so flipping `data-theme` on `<html>` reskins without a rebuild.
3. **`ThemeProvider` / `useTheme`** (`shared/config/theme.tsx`) — preference `'system' | 'dark' | 'light'`, persists to `localStorage` key `tapeya:theme`, resolves OS preference when `'system'`.
4. **Boot script** — `THEME_BOOT_SNIPPET` in `shared/config/themeBoot.js` is the **only** source of the pre-bundle script; Vite `transformIndexHtml` injects it into `index.html` (placeholder `<!--THEME_BOOT-->`). Do not hand-copy the script into HTML.
5. **`ThemeToggle`** — icon control in chrome; `variant="segment"` for Settings (System / Light / Dark).
6. **Media opt-out** — `data-surface="media"` keeps video/photo surfaces on the dark palette in both themes.

Text on page surfaces uses `text-ink` / `text-body` / `text-muted` / `text-dim` — never raw `text-white` (except on filled brand / positive / danger / photo overlays).

#### Icon component contract

```tsx
// shared/ui/icons/Icon.types.ts
export type IconProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg';  // maps to fixed w/h — 16, 18, 20, 24
  className?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
};
```

- Decorative (paired with visible text): `aria-hidden`
- Standalone meaning (icon-only button): required `aria-label`
- Color always via `className` / parent — never hardcoded fills inside icon components (except brand logo)

#### Optional: generic UI icon library

Standard primitives (chevron, close, check, search) may use **Lucide** (or similar) to avoid reinventing — still imported through `shared/ui/icons/` so the app has one import path. **Custom cricket/scoring/brand icons** stay as local SVG components in `svg/`.

#### What stays on cloud (not icons)

Raster assets only — loaded via `<img>` or `srcSet`, not the icon system:

- Hero slider / marketing banners (PNG/WebP)
- Shop product images, category art
- User avatars, reel video posters (API URLs)
- Highlight thumbnails, tournament cover images
- Animated GIFs (e.g. order success)

Use `shared/platform/assets.ts` for CDN base URL helpers — same pattern as today's `CLOUDFRONT_APP_BASE`, typed:

```ts
export function cdnAsset(path: string): string {
  return `${import.meta.env.VITE_CDN_BASE}${path}`;
}
```

Features use `cdnAsset('/images/hero/slide-1.webp')` for rasters; they use `import { HomeIcon } from '@/shared/ui/icons'` for icons.

#### Banned in rewrite

- CDN URLs for nav, scoring, or form icons
- `CdnIcon` CSS-mask workaround as the primary icon strategy (OK temporarily during migration only)
- Inline `<svg>` copy-pasted in page components — add to `shared/ui/icons/` instead
- Separate light/dark SVG files for standard monochrome icons

#### Migration from current app

| Today | Rewrite |
|-------|---------|
| `CLOUDFRONT_APP_BASE/images/icons/home-navigation.svg` + `<img>` | `HomeIcon` component |
| `assets/images/icons/action-*.svg` imports | `features/scoring/ui/icons/` or `shared/ui/icons/` |
| `CdnIcon` + mask | React component with `currentColor` |
| Cloud PNG/GIF (hero, products) | Keep on CDN — unchanged |

### 12.2 Media aspect ratios (same crop on every surface)

**Problem today:** the same highlight thumbnail uses a different box on every screen — fixed `h-[148px]` on cards, `aspect-4/3` in the feed widget, `56×88px` on detail "more" rows, `aspect-video` on the detail player. The image is cropped differently everywhere, so the app feels inconsistent.

**Rule:** one **content type** → one **canonical aspect ratio** → one **`MediaFrame`** component used on **every surface** that displays that content (home slider, feed widget, list grid, detail hero, compact row, search result). Only the **width** changes — never the ratio.

#### Principle

```
Same thumbnail URL + same aspect token = identical visible crop on every page
```

Achieved by:

1. **Frontend:** shared `MediaFrame` with a typed aspect registry — no ad hoc `h-[148px]` or per-page ratios.
2. **Backend/CDN:** thumbnails generated (center-cropped) to the canonical ratio at upload time. Optional width variants (`_400.webp`, `_800.webp`) for performance — **same crop, different resolution**.

#### Folder layout

```
shared/ui/media/
├── aspectRatios.ts       # Canonical ratio per MediaKind — single source of truth
├── MediaFrame.tsx        # AspectRatio box + img + fallback + loading
├── MediaFrame.types.ts
├── mediaUrl.ts           # Optional: append width param, never change crop
└── index.ts
```

#### Aspect registry

Define once in `aspectRatios.ts`. Tailwind theme maps tokens to numeric ratios:

```ts
// shared/ui/media/aspectRatios.ts
export const MEDIA_ASPECT = {
  highlight: 16 / 9,       // video thumbnails — matches detail player
  tournamentCover: 16 / 9,
  shopProduct: 1,
  reelPoster: 9 / 16,
  postImage: 4 / 3,        // feed photo posts — max landscape; portrait uses contain policy below
  heroBanner: 21 / 9,      // marketing slider — wide only
  avatar: 1,
} as const;

export type MediaKind = keyof typeof MEDIA_ASPECT;
```

Register in Tailwind v4 `@theme` so utilities stay consistent:

```css
@theme {
  --aspect-highlight: 16 / 9;
  --aspect-shop-product: 1 / 1;
  --aspect-reel-poster: 9 / 16;
  /* … */
}
```

#### MediaFrame component

All raster display surfaces use this — never raw `<img>` with manual height:

```tsx
// shared/ui/media/MediaFrame.tsx
type MediaFrameProps = {
  kind: MediaKind;
  src: string | null | undefined;
  alt: string;
  fallbackSrc?: string;
  fit?: 'cover' | 'contain';  // default cover when backend crop matches kind
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'none';
};

export function MediaFrame({ kind, src, alt, fit = 'cover', ... }: MediaFrameProps) {
  const ratio = MEDIA_ASPECT[kind];
  return (
    <AspectRatio ratio={ratio} className={cn('bg-surface-deep overflow-hidden', roundedClass)}>
      <img
        src={src ?? fallbackSrc}
        alt={alt}
        className={cn('h-full w-full', fit === 'cover' ? 'object-cover object-center' : 'object-contain')}
        loading="lazy"
        decoding="async"
      />
    </AspectRatio>
  );
}
```

**Size variants** are layout concerns (parent grid/slider controls width), not separate components:

| Surface | Layout | MediaFrame |
|---------|--------|------------|
| Home highlight slider | Swiper slide, ~45% viewport width | `<MediaFrame kind="highlight" … />` |
| Feed highlight widget | 2-up swiper | same `kind="highlight"` |
| Highlights list grid | 2-col / 3-col grid | same |
| Highlight detail hero (pre-play) | Full container width | same |
| Detail "more highlights" row | Fixed width column (~88px) | same — **not** a custom `56×88` box |
| Search autocomplete row | Full width, compact | same |

#### Example: highlights (end-to-end)

| Surface | Current (broken) | Rewrite |
|---------|------------------|---------|
| `HighlightSlider` / `HighlightCard` | `h-[148px]` | `MediaFrame kind="highlight"` |
| `FeedHighlightWidget` | `aspect-4/3` | `MediaFrame kind="highlight"` |
| `HighlightsSection` grid | `HighlightCard` fixed height | shared card uses `MediaFrame` |
| `HighlightDetails` poster | `aspect-video` inside player | `MediaFrame kind="highlight"` until play |
| `MoreHighlightRow` | `h-[56px] w-[88px]` | narrow wrapper + `MediaFrame kind="highlight"` |
| Search popover | untyped thumb | `MediaFrame kind="highlight"` |

Feature composes layout; media crop stays identical:

```tsx
// features/highlights/ui/HighlightCard.tsx
export function HighlightCard({ highlight, onClick }: Props) {
  return (
    <button type="button" onClick={() => onClick(highlight)} className="…">
      <MediaFrame kind="highlight" src={highlight.thumbnailUrl} alt={highlight.title} rounded="lg" />
      <HighlightCardMeta title={highlight.title} date={highlight.publishedAt} />
    </button>
  );
}
```

Detail page video player stays **`16/9`** — same token as thumbnail. When video plays, player fills the same aspect box (already `aspect-video` today).

#### Backend / CDN contract

For each `MediaKind`, API stores or generates thumbnails at the canonical ratio:

| Kind | Upload rule | Stored fields |
|------|-------------|---------------|
| `highlight` | Center-crop thumbnail to **16:9** from video frame | `thumbnail_url` (+ optional `thumbnail_url@400w`) |
| `shopProduct` | Square **1:1** crop | `image_url` |
| `reelPoster` | **9:16** frame from video | `thumbnail_url` |
| `tournamentCover` | **16:9** | `cover_image` |

If legacy assets exist at mixed ratios, re-process on upload or run a one-time backfill during `migrate:fresh` content seed — don't patch per-page with different CSS crops.

Optional CDN helper (width only, never aspect):

```ts
// shared/ui/media/mediaUrl.ts
export function mediaUrl(src: string, width?: number): string {
  if (!width) return src;
  // e.g. CloudFront/Lambda@Edge or imgproxy — same center crop, scaled width
  return `${src}?w=${width}`;
}
```

Use in `srcSet` for responsive images; **`MediaFrame` aspect token stays constant**.

#### When to use `contain` instead of `cover`

Default **`cover`** when backend delivers canonical ratio (preferred — no letterboxing).

Use **`contain`** only for user-uploaded post images with unknown aspect — still wrap in `MediaFrame kind="postImage"` so max bounds are consistent; optional blurred `background-image` fill for empty bands.

#### Full content-type registry (rewrite)

| MediaKind | Ratio | Used by |
|-----------|-------|---------|
| `highlight` | 16:9 | Home slider, feed widget, list, detail, more row, search |
| `tournamentCover` | 16:9 | Upcoming list, tournament detail header |
| `shopProduct` | 1:1 | Shop grid, cart line, product detail gallery |
| `reelPoster` | 9:16 | Reels player poster, profile reel grid |
| `postImage` | 4:3 | Feed photo posts (contain if portrait) |
| `heroBanner` | 21:9 | Home hero slider only |
| `avatar` | 1:1 | Profile, nav, comments — `entities/user/UserAvatar` |

Adding a new content type **starts with** registering `MediaKind` + backend crop spec — not with a one-off `<div className="h-[…]">`.

#### Banned in rewrite

- Fixed-height image boxes (`h-[148px]`, `h-[56px]`) for content thumbnails
- Different aspect ratios for the same content type on different pages
- Raw `<img className="object-cover">` without `MediaFrame` / `MediaKind`
- Separate card components per surface that duplicate image markup (`HighlightCard` vs `FeedHighlightCard` → one card + layout wrappers)

#### Testing

- Unit: `MEDIA_ASPECT` values match Tailwind `@theme` tokens
- Visual/regression: same fixture URL in slider, list, and detail Storybook/chromatic stories — crop must match pixel-for-pixel at proportional scale

---



## 13. Dialog & modal system

The current app already has the right idea, proven at real scale (~55 dialogs, from global app dialogs like `deleteAccount`/`appUpdate` down to per-ball scoring pickers): one Context (`DialogContext` + `DialogManager`), a string-keyed registry mapping a key to a component, and a single shared `BaseDialog` chrome. Any component calls `openDialog('scoringOutReason', props)` with zero prop drilling — that part isn't broken and shouldn't be reinvented.

Two real gaps to close in the rewrite, both solvable without abandoning the pattern:

1. **No type safety.** `DIALOG_COMPONENTS[key]` is dynamically indexed and `dialogProps` is `props = {}` — nothing stops `openDialog('scoringOutReason', { wrongProp: 1 })` from compiling and blowing up at runtime.
2. **Context can't be called from outside a component.** `useDialog()` requires being inside the React tree — there's no clean way to trigger a dialog from an API error interceptor, an RTK Query `onQueryStarted` handler, or a native push-notification callback (all real needs once §7.5's normalized API error shape and Sentry are in place — e.g. a global "session expired, log in again" dialog triggered from the 401 handler).



### 13.1 The mechanism

Replace the Context with a **tiny vanilla store** (plain module-level state + subscribers — Zustand's core, or a ~30-line hand-rolled equivalent; either is fine, the point is it lives outside React). A `useSyncExternalStore` hook binds it to React only where needed (the host). Everything else — the registry, the single shared chrome, the per-key sizing overrides — carries over unchanged in spirit.

```ts
// shared/dialogs/registry.ts
export const DIALOG_COMPONENTS = {
  confirm: ConfirmDialog,
  deleteAccount: DeleteAccountDialog,
  manageTeam: ManageTeamDialog,
  scoringOutReason: OutReasonDialog,
  scoringRunOut: RunOutDialog,
  // …every dialog, imported from the feature that owns it
} as const;

type DialogRegistry = typeof DIALOG_COMPONENTS;
export type DialogKey = keyof DialogRegistry;
export type DialogProps<K extends DialogKey> = React.ComponentProps<DialogRegistry[K]>;
```

```ts
// shared/dialogs/dialogStore.ts
type OpenDialog = { key: DialogKey; props: unknown; id: string };

let stack: OpenDialog[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const dialogStore = {
  getSnapshot: () => stack,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  open<K extends DialogKey>(key: K, props: DialogProps<K>) {
    const id = crypto.randomUUID();
    stack = [...stack, { key, props, id }];
    emit();
    return id; // callers that need to close *this specific* dialog can keep the id
  },
  close(id?: string) {
    stack = id ? stack.filter((d) => d.id !== id) : stack.slice(0, -1);
    emit();
  },
  closeAll() {
    stack = [];
    emit();
  },
};
```

```ts
// shared/dialogs/useDialog.ts — the call-site API, identical ergonomics to today
import { useSyncExternalStore } from 'react';

export function useDialogStack() {
  return useSyncExternalStore(dialogStore.subscribe, dialogStore.getSnapshot);
}

// Component call sites:
dialogStore.open('scoringOutReason', { dismissalOptions, onSelectOption }); // ✅ typed, autocompletes
dialogStore.open('scoringOutReason', { wrong: true }); // ❌ compile error
```

```tsx
// shared/dialogs/DialogHost.tsx — mounted once in AppProviders, no prop drilling anywhere else
export function DialogHost() {
  const stack = useDialogStack();
  const top = stack.at(-1);
  if (!top) return null;

  const DialogBody = DIALOG_COMPONENTS[top.key];
  return (
    <BaseDialog
      open
      onOpenChange={(open) => !open && dialogStore.close(top.id)}
      contentClassName={DIALOG_CONTENT_CLASS_BY_KEY[top.key] ?? ''}
    >
      <DialogBody {...(top.props as DialogProps<typeof top.key>)} />
    </BaseDialog>
  );
}
```

Because `dialogStore.open`/`close` are plain functions, not hooks, they're callable from **anywhere** — a component, a thunk, an RTK Query base-query error handler, an axios/fetch interceptor, a Capacitor push-notification listener. That closes gap #2 without adding a second system.

### 13.2 Stack vs. single-slot

The store above is a stack internally, but nothing requires the UI to render more than the top item — `DialogHost` above only ever shows `stack.at(-1)`, which reproduces today's single-slot behavior (opening a dialog while one is open replaces it) with zero UX change. The stack exists so that a genuine "confirm on top of a dialog" need (e.g. a destructive action confirmation launched from inside `ManageTeamDialog`) works later by rendering `stack.length` levels instead of just the top one — a config flip, not a rewrite, when the need actually shows up. Don't build the multi-level renderer until a real screen needs it.

### 13.3 Promise-based convenience helpers

`confirm`/`alert` show up constantly and today require the caller to wire an `onConfirm` callback by hand each time. Wrap them once:

```ts
// shared/dialogs/helpers.ts
export function confirm(props: Omit<DialogProps<'confirm'>, 'onConfirm' | 'onCancel'>): Promise<boolean> {
  return new Promise((resolve) => {
    const id = dialogStore.open('confirm', {
      ...props,
      onConfirm: () => { dialogStore.close(id); resolve(true); },
      onCancel: () => { dialogStore.close(id); resolve(false); },
    });
  });
}
```

```ts
// Call site — no local state, no dialog key to remember, no prop drilling:
if (await confirm({ title: 'Delete team?', message: 'This cannot be undone.' })) {
  await deleteTeam(teamId);
}
```



### 13.4 Where dialogs live

Registry aggregation (`shared/dialogs/registry.ts`) is a deliberate, documented exception to "features only export via `index.ts`" — the same category as `app/routes.tsx`: one file whose entire job is to know about every feature. The dialog *components themselves* are not exceptions — they live inside the feature that owns them (`features/scoring/ui/dialogs/OutReasonDialog.tsx`, `features/teams/ui/dialogs/ManageTeamDialog.tsx`), not in one flat 55-file folder the way they do today. Only truly global, no-owning-feature dialogs (`AppUpdateDialog`, `ConfirmDialog`, `DownloadAppDialog`) live in `shared/dialogs/`.

### 13.5 Toast system

Toasts follow the same “callable outside React” rule as dialogs (§13.1), without a second modal stack:

- **`toastStore` / `toast()`** — `shared/ui/toast/toastStore.ts`. Imperative `toast({ title, description?, tone? })` from forms, mutations, or API helpers.
- **`ToastHost`** — mounted once in `AppProviders` beside `DialogHost`; `useSyncExternalStore` subscriber.
- **Tones** — `success` | `error` | `info` | `neutral`. Error toasts do **not** auto-dismiss; others clear after ~4s (matches tapeya-ui Toast behaviour).
- **Visual language** — ported from `tapeya-ui` Toast chrome (`bg-surface`, tone borders, `shadow-[var(--shadow-card)]`). Scaffold uses a lightweight host rather than `@radix-ui/react-toast` until swipe/queue UX is needed.

Do not put ephemeral toast state in Redux (§6).

### 13.6 What NOT to do

- Don't reach for a full library (`@ebay/nice-modal-react` or similar) — the in-house version above is ~80 lines total, has zero new runtime dependency, and matches the exact ergonomics already validated in production. Revisit only if the team wants promise-based *every* dialog (not just confirm/alert) and finds hand-rolling that tedious.
- Don't put dialog state in Redux — see §6.
- Don't let a dialog component reach into Redux/RTK Query for data it needs *and* also expect it via props — pick one per dialog. Simple/global dialogs (confirm, delete account) should be fully self-contained and fetch their own data; dialogs deep in a stateful flow (scoring) should keep receiving data via props from the flow that opened them, exactly as today.

---



## 14. Conventions

- **Components:** `PascalCase.tsx`, one component per file, co-located test as `PascalCase.test.tsx`.
- **Hooks:** `useCamelCase.ts`, always co-located with the feature that owns them unless truly generic (→ `shared/hooks`).
- **Non-component modules:** `camelCase.ts` (`formatMatchDate.ts`, `tournamentsApi.ts`).
- **No default exports** for anything except route-level page components (keeps refactor-safe imports and better IDE auto-import).
- **No barrel re-exports inside a feature** except the one top-level `index.ts` described in §5 — nested barrels are how circular-import bugs and unused-export drift creep in.
- **Absolute imports only** (`@/features/...`), no `../../../` chains — enforced via `eslint-plugin-import`'s `no-relative-parent-imports`.
- Import order enforced by `simple-import-sort` (already in use) — keep it, extend groups to separate `react` / external / `@/app` / `@/features` / `@/entities` / `@/shared` / relative.

---



## 15. Documentation

- Each feature folder gets a short `README.md` only if its domain logic is non-obvious (e.g. `features/scoring/README.md` explaining the innings state machine) — not a mandatory boilerplate file for every feature.
- Architecture decisions that deviate from this doc (a new library, a new cross-cutting pattern) get a short ADR in `docs/adr/NNNN-title.md` — one page, decision + why, not a design essay.
- This document itself is the living reference — update it when the structure evolves, don't let the code silently drift from it the way the current `pages/`+`components/`+`features/` split did.

---



## 16. Rollout approach

Don't attempt a big-bang cutover:

1. **Scaffold** the new app as its own Vite project (new repo folder, e.g. `app-next/`) against this structure, wired to the same API and Capacitor app IDs in a staging config.
2. **Port screen-by-screen**, ordered by usage frequency (auth → feed/scorecard → organizer flows → shop → settings), each screen shipped behind a route once its feature module + tests are complete — not ported wholesale then debugged at the end.
3. **Keep the old app buildable and deployed** until parity is reached; the graphics module keeps working unmodified throughout since it's untouched by this effort.
4. **Cut over per-platform** when a full parity checklist passes (every route in the old app has an equivalent, E2E smoke suite green, real-device test pass on iOS + Android) — web first, then native store submissions.
5. Retire the old `app/` (JS) tree only after the new one has been in production with no regressions for one full release cycle.

