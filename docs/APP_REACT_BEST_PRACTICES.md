# client best practices (all files & components)

**Master checklist** for building `client/` from scratch. Apply these on every new file, every ported screen, and every PR review. Specialized docs own depth for layout, forms, and copy — this doc owns the cross-cutting rules and points you there.

| Topic | Canonical doc |
|---|---|
| Architecture / folders / API typing | [APP_REWRITE_ARCHITECTURE.md](./APP_REWRITE_ARCHITECTURE.md) |
| Page gutters, ScreenBar, sticky CTAs | [APP_REACT_PAGE_LAYOUT.md](./APP_REACT_PAGE_LAYOUT.md) |
| Form density & Field patterns | [APP_REACT_FORM_MIGRATION.md](./APP_REACT_FORM_MIGRATION.md) |
| Title Case / Sentence case | [APP_REACT_COPY_CASING.md](./APP_REACT_COPY_CASING.md) |
| Page / hook / body / lib split queue | [client/docs/APP_REACT_PAGE_SPLIT_BLUEPRINT.md](../client/docs/APP_REACT_PAGE_SPLIT_BLUEPRINT.md) |
| Agent coding standards | `.cursor/skills/client-standards/SKILL.md` |
| UI language / mockups | `tapeya-ui/` (`DESIGN_SYSTEM.md`, inventories) |

**Stack (do not reinvent):** Vite · React 19 · React Router 7 · RTK Query · Zod · RHF · Tailwind v4 · Radix · Capacitor · Vitest + MSW · Playwright.

---

## 0. Sources of truth (non-negotiable)

| Concern | Source | Never |
|---|---|---|
| **Look / UX** | `tapeya-ui/` | Legacy `app/` pages, CSS, splash, dark-only shells |
| **API / auth / business rules** | `app/` + Laravel `api/` | Invent endpoints, OTP length, wire fields |
| **What ships** | `client/` only | Runtime import of `tapeya-ui` as a package |

Port order: open **tapeya-ui screen first** → wire behaviour from **`app/` + `api/`** → if visuals disagree, **tapeya-ui wins**; if data disagrees, **`app/` + `api/` wins**.

---

## 1. Feature & file discipline

### 1.1 Feature shape

```
features/<name>/
  api/          # RTK injectEndpoints only
  model/        # Zod schemas, domain types, pure transforms
  pages/        # Route screens (default export OK)
  ui/           # Feature-private components
  lib/          # Path builders, pure helpers
  routes.ts     # Route objects + path builders
  test/         # Unit / component tests + MSW if needed
  index.ts      # ★ Public barrel — the only cross-feature import surface
```

### 1.2 Import rules

| From | Import |
|---|---|
| Outside a feature | `@/features/<name>` **barrel only** (ESLint-enforced) |
| Inside a feature | Relative `../api/…`, `../model/…` OK |
| Design system | `@/shared/ui` barrel; **icons** `@/shared/ui/icons`; **toast** `@/shared/ui/toast`; **media** `@/shared/ui/media` |
| Inside `shared/ui/*` | Prefer **subpaths** (`@/shared/ui/Field`) to avoid barrel cycles |
| Anywhere | Use `@/` — never `../../..` climbs (ESLint-enforced) |

### 1.3 Exports

- **One** feature barrel (`index.ts`). No nested barrels inside the feature.
- Named exports everywhere except **pages**, `main.tsx`, and config files (default export allowed there).
- Barrel exports only what other features need (hooks, paths, public types) — not every internal sheet.

### 1.4 Naming

| Kind | Convention | Example |
|---|---|---|
| Page | `*Page.tsx` | `EntertainmentPage.tsx` |
| Feature UI | PascalCase noun / purpose | `EpisodeComments.tsx` |
| Hook | `use*` | `useGetDramaSerialsQuery` |
| Schema | `*Schema` + inferred type | `dramaSerialSchema` → `DramaSerial` |
| Path builder | `*Paths` | `entertainmentPaths.serial(id)` |
| Test | `*.test.ts(x)` colocated under `test/` or next to unit | |
| Icon | `*Icon.tsx` in `shared/ui/icons` | `FilmIcon.tsx` |

---

## 2. TypeScript (every `.ts` / `.tsx`)

1. **`strict` + `exactOptionalPropertyTypes`** — optional props that callers may pass as `undefined` must be `prop?: T | undefined`, not bare `prop?: T`.
2. **No `any`.** Use `unknown` and parse at the boundary with Zod.
3. Prefer **`type` imports**: `import type { Foo }`.
4. Prefer **`unknown` + narrowing** over type assertions. If you must assert, leave a one-line why.
5. Domain types come from **`z.infer<typeof schema>`**, not hand-copied interfaces that drift from the wire.
6. Do not weaken `tsconfig` or add `@ts-expect-error` to greenwash — fix the type.

```ts
// ✅ exactOptionalPropertyTypes-friendly
type Props = { error?: string | undefined };

// ❌ Rejects error={errors.name} when name may be undefined
type Props = { error?: string };
```

---

## 3. Component API design (every component)

### 3.1 Props

- Extend native element props when wrapping (`ButtonHTMLAttributes`, …) instead of re-declaring `onClick`, `disabled`, etc.
- Use **`cva`** for visual variants; keep variant/size names aligned with tapeya-ui.
- Compose with Radix **`asChild` / Slot** when the primitive must render as a link or custom child.
- **Default `type="button"`** on buttons that are not explicit submits.
- Spread DOM props **before** forced a11y attributes so callers cannot clobber them:

```tsx
<button type="button" {...props} aria-label={label} />
```

### 3.2 Composition over configuration

- Prefer small composable pieces (`Card` + `ListRow` + `Chip`) over a mega-prop component.
- Feature UI stays in `features/<name>/ui`. Promote to `shared/ui` only when a **second** feature needs it (same API, same look).
- Pages orchestrate data + layout; they should not contain large inline markup that belongs in `ui/`.

### 3.3 State locality

| State | Home |
|---|---|
| Server cache | RTK Query |
| Auth / session | Dedicated auth session + small Redux slice |
| Dialogs / confirms | `shared/dialogs` (`confirm()`, host) — not Redux |
| Ephemeral UI (tabs, open sheet, local draft) | `useState` / `useReducer` in the nearest owner |
| Cross-route return path | `safeInternalPath` / nav state — never secrets in the URL |

Do not invent a new global store for one screen.

### 3.4 React 19 habits

- Prefer **simple render + derived values** in the render body. Do **not** add `useMemo` / `useCallback` / `React.memo` by default.
- Add memoization only when profiling shows a win, or when a dependency identity is required by an existing API (rare).
- Prefer **`useEffectEvent`** (when available in the project version) for event-like logic inside effects so you do not re-subscribe on every render of stable callbacks.
- Prefer **`startTransition`** for non-urgent UI updates (e.g. filtering a large list after typing) when the interaction feels blocked.
- Prefer **`useDeferredValue`** for expensive derived lists tied to fast input when needed.
- Effects: sync with external systems only (URL, storage, subscriptions). Do not mirror props into state “just in case.”
- Cleanup every subscription / timeout / Echo channel in the effect return.

---

## 4. Styling & design tokens (every className)

1. **Tokens only** — `bg-page`, `bg-surface`, `text-ink`, `text-muted`, `border-border`, `rounded-field`, `text-sm`, …  
   Forbidden in feature/shared UI: new hex, `rgba()`, `text-[Npx]`, `rounded-[Npx]`, one-off gutters.
2. **No per-component CSS files.** No separate `dark.css`. Theme flips via `data-theme` + CSS variables.
3. Merge classes with **`cn()`** from `@/shared/lib/cn`.
4. Breakpoints (use the right one):

| Token | ~px | Use for |
|---|---|---|
| `sm` | 640 | Shell BottomNav ↔ SideNav swap only |
| `tab` | 900 | Overlays sheet→card, ScreenBar desk chrome, content |
| `desk` | 1200 | Right rail |
| `wide` | 1440 | Labelled SideNav expansion |

Overlays (`BaseDialog` etc.) **must** use `tab:` for sheet→centred dialog — never `sm:`.

5. Page layout: follow [APP_REACT_PAGE_LAYOUT.md](./APP_REACT_PAGE_LAYOUT.md) — `DockScreen` / `PageDock` for docked pages (home feed stays document scroll), body `px-4`, `StickyActionBar` as `footer` (never nested in `px-*` form).
6. **Gutters vs density:** page body = `px-4` only. Nested cards/rows may use `px-3.5` / `px-3`. Prefer token heights (`h-10`–`h-12`); `h-[Npx]` only for media chrome, OTP digits, or documented tapeya-ui parity.

---

## 5. Icons & media

### Icons

- **No inline `<svg>`** in features / pages / layout.
- All glyphs: `client/src/shared/ui/icons/*` → import from `@/shared/ui/icons`.
- Size via `className` / `size`; colour via `currentColor`.
- Exceptions (document in PR): `Spinner` loading arc; true data drawings (e.g. wagon wheel).

### Media

- Rasters (posters, avatars, products) via CDN helpers + **`MediaFrame`** / aspect tokens (`aspect-show-poster`, …).
- Decorative images: empty `alt` + accessible name on the control (`aria-label` on the link/button).
- Content images: meaningful `alt`.

---

## 6. Data layer (API, Zod, RTK)

1. **UI never builds URLs or raw `fetch`.** Feature `api/` owns endpoints.
2. Wire JSON → Zod schema in `transformResponse` (or shared unwrap helpers). Fail loud on contract drift.
3. One **`ApiError`** shape from `shared/api` — switch on it; no `error?.data?.message` archaeology in components.
4. Cache tags: use shared `TAG_TYPES`; invalidate precisely after mutations.
5. Lists: prefer server pagination params already used by `app/`; don’t invent client-only paging that fights the API.
6. **Enums for UI lists** come from `GET /enums` (`shared/api/enumsApi`). Never hardcode Laravel enum option tables in components.
7. Realtime: parse Echo payloads with Zod next to the feature; unsubscribe on unmount.
8. Auth: OTP length **4**; phone in **nav state only**; after `verifyOtp().unwrap()`, **`await persistAuthSession(...)` before `navigate`**.

```ts
// Endpoint sketch
transformResponse: (raw: unknown) => dramaSerialListSchema.parse(unwrapData(raw)),
```

---

## 7. Forms

1. Real forms → **React Hook Form + Zod** (`zodResolver`).
2. Submit via **`<form onSubmit>`** so Enter works; primary sticky CTA may use `form="id"`.
3. Errors: field-level + `role="alert"`; link with `aria-describedby`. Never colour alone.
4. Density, Field, FormSection: [APP_REACT_FORM_MIGRATION.md](./APP_REACT_FORM_MIGRATION.md).
5. Sticky commit bar: [APP_REACT_PAGE_LAYOUT.md](./APP_REACT_PAGE_LAYOUT.md) § StickyActionBar.

---

## 8. Async UI states (every data screen)

Handle all four explicitly:

| State | Pattern |
|---|---|
| Loading | `Skeleton` / `LoadingState` under the header — keep chrome |
| Empty | `EmptyState` with Title Case title + clear next action |
| Error | `ErrorState` + `onRetry` → `refetch()` |
| Success | Real content |

Never replace the whole `AppShell` with a spinner. Never leave a blank white screen on error.

Mutations: button `loading` / `aria-busy`; toast on success when the UI doesn’t update obviously; map validation errors onto fields.

---

## 9. Accessibility (every interactive UI)

- [ ] Icon-only controls: accessible name (`IconButton` `label` → `aria-label`)
- [ ] Toggles: `aria-pressed` or appropriate role
- [ ] `<nav>` / primary `<aside>`: `aria-label`
- [ ] Dialogs: Radix focus trap; restore focus on close
- [ ] Menus: Radix `DropdownMenu` — no mouse-only hand-rolls
- [ ] Errors: `role="alert"`; status: `role="status"`
- [ ] Hit targets: prefer ≥ 40–44px interactive height (`min-h-10` / `min-h-12` patterns)
- [ ] Don’t rely on colour alone for meaning (pair with text/icon)

---

## 10. Copy & tone

Follow [APP_REACT_COPY_CASING.md](./APP_REACT_COPY_CASING.md):

- **Title Case** — screen titles, buttons, empty/error titles, short toasts
- **ALL CAPS** — Field / section eyebrows only (CSS `uppercase`)
- **Sentence case** — descriptions, hints, placeholders, long toasts, API labels as returned

User-facing strings live near the UI (or a small feature copy map) — do not scatter magic strings across `api/` and `pages/` inconsistently.

---

## 11. Routing & navigation

1. Path builders per feature (`lib/*Paths.ts` / `routes.ts`) — no raw `'/entertainment/' + id` soup.
2. Lazy-load heavy pages at the route table when the feature is large.
3. `returnTo` / deep links through **`safeInternalPath`**.
4. Auth gates: `RequireAuth` / `RequireGuest` — don’t fork one-off redirect logic in pages.
5. Prefer `navigate(-1)` for back when history exists; otherwise path builder home.

---

## 12. Performance & mobile

1. Lists: stable `key`s (ids, not index) unless the list is static skeletons.
2. Images: correct aspect, lazy loading where the primitive supports it, avoid huge uncropped bitmaps in grids.
3. Avoid layout thrash: prefer CSS (`aspect-*`, flex/grid) over measuring in JS.
4. Debounce search URL sync (~250ms) when writing `?q=` (see Entertainment hub).
5. Capacitor: use `shared/native` façades (`secureStorage`, `share`, …) — never call Plugins ad hoc from a random page.
6. Don’t ship `console.log` noise; use the Sentry façade for real errors (`shared/config/sentry.ts`).

---

## 13. Security & privacy

1. Tokens only in **secure storage** / auth session helpers — not `localStorage` free-for-all.
2. No PII in URLs (phone, OTP, tokens).
3. DEV-only debug UI behind `import.meta.env.DEV` (e.g. OTP debug banner).
4. Sanitize / trust boundaries: never call `dangerouslySetInnerHTML` directly — use `SafeHtml` + `sanitizeHtml` (`cms` | `product` profiles). CMS/static pages and product descriptions are the only approved rich-text sinks.
5. Report / block / delete flows go through existing API contracts — don’t invent client-only “soft delete.”

---

## 14. Testing

| Layer | Tool | Expectation |
|---|---|---|
| Unit / component | Vitest + RTL | Schemas, pure lib, critical UI states |
| API contract | MSW handlers matching Laravel shapes | No hand-rolled `fetch` mocks |
| E2E | Playwright under `e2e/` | Smoke critical flows when you touch them |

- Prefer testing behaviour (`getByRole`, user events) over class names / implementation details.
- Cover: loading → success, empty, error+retry, validation failure for forms you own.
- Before handoff:

```bash
cd client && npm run typecheck && npm run test && npm run lint
```

---

## 15. Anti-patterns (reject in review)

| Don’t | Do instead |
|---|---|
| Copy styles from legacy `app/` | Port from `tapeya-ui` |
| Deep import `@/features/foo/ui/Bar` | Export via feature barrel |
| Inline SVG in a page | Add `shared/ui/icons` |
| Hardcoded enum dropdown options | `useGetEnumsQuery` / helpers |
| `useMemo` on every derived string | Compute in render |
| Hand-rolled modal with `div` + click-outside | Radix / `shared/dialogs` |
| Page-level `px-3` / `px-[15px]` | Canonical `px-4` |
| Sticky CTA inside padded form | `StickyActionBar` via `DockScreen`/`PageDock` `footer` |
| Toast-only error with no field link | Field error + `aria-describedby` |
| `any` in `transformResponse` | Zod parse |
| Second design-system Button | Extend / variant on `shared/ui/Button` |

---

## 16. PR checklist (paste into description)

```text
### Source of truth
- [ ] UX matched to tapeya-ui (not legacy app/)
- [ ] API/auth matched to app/ + api/

### Structure
- [ ] Code lives in the correct feature folder
- [ ] Cross-feature imports use the barrel only
- [ ] No deep relative climbs; @/ alias used

### UI
- [ ] Tokens only (no new hex / arbitrary px radii)
- [ ] Page layout doc followed (DockScreen/PageDock / gutters / footer CTA)
- [ ] Icons from @/shared/ui/icons
- [ ] Copy casing doc followed
- [ ] Loading / empty / error states present

### Data
- [ ] Zod at the wire boundary
- [ ] Enums from /enums when applicable
- [ ] Errors use shared ApiError handling

### A11y
- [ ] Icon buttons named; forms submittable; alerts announced

### Quality
- [ ] npm run typecheck && npm run test && npm run lint
```

---

## 17. How to use this doc day to day

1. **New screen** — read §0–1, then PAGE_LAYOUT + COPY_CASING; scaffold page → api → model → ui.
2. **New shared primitive** — port from tapeya-ui with `cva` + tokens; export from `shared/ui`; add a short usage note in the PR.
3. **Bugfix** — keep the change local; don’t “improve” unrelated styling while you’re there.
4. **Review** — walk §15–16; request changes for source-of-truth violations first (they’re the expensive ones).

When this doc and a specialized doc disagree on a narrow topic (layout, form density, copy), **the specialized doc wins**. When they disagree on architecture or API typing, **APP_REWRITE_ARCHITECTURE wins**.
