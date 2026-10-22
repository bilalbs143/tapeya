# client Codebase Blueprint

**Phase:** 2 — Documentation only (no moves / renames / refactors)  
**Status:** Authoritative implementation guide for subsequent restructuring phases  
**Scope:** `client/`  
**Grounded in:** [Phase 1 audit](../PHASE1_CODEBASE_AUDIT.md) (1,058 inventoried files)  
**Aligned with:** [`docs/APP_REWRITE_ARCHITECTURE.md`](../../../docs/APP_REWRITE_ARCHITECTURE.md), [`docs/APP_REACT_BEST_PRACTICES.md`](../../../docs/APP_REACT_BEST_PRACTICES.md), [`.cursor/skills/client-standards/SKILL.md`](../../../.cursor/skills/client-standards/SKILL.md)

---

## 0. How to use this document

| Audience                    | Use                                                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| Implementing Phase 3+ moves | Follow **mandatory** rules; treat **recommended** as defaults unless an exception criterion applies |
| PR reviewers                | Reject PRs that violate mandatory rules without an explicit exception note                          |
| New feature authors         | Copy the templates in §5; do not invent a new top-level shape                                       |

**Mandatory** = non-negotiable for `client`.  
**Recommended** = preferred default; deviate only when §11 criteria are met.

This blueprint does **not** invent files that Phase 1 did not observe. It defines the **ideal shape** for each category that Phase 1 found (and for empty optional layers already allowed by the rewrite architecture).

---

## 1. Sources of truth

| Concern                        | Source                                         | Never                                                |
| ------------------------------ | ---------------------------------------------- | ---------------------------------------------------- |
| Folder / module architecture   | This blueprint + `APP_REWRITE_ARCHITECTURE.md` | Ad-hoc `components/` or `hooks/` at repo root        |
| Look / UX                      | `tapeya-ui/`                                   | Legacy `app/` visual CSS / splash / dark-only shells |
| API / auth / business rules    | Legacy `app/` + Laravel `api/`                 | Invent endpoints, OTP length, wire fields            |
| What ships                     | `client/` only                                 | Runtime import of `tapeya-ui` as a package           |
| Inventory of what exists today | `PHASE1_CODEBASE_AUDIT.md`                     | Assumptions about missing folders                    |

**Stack (do not reinvent):** Vite · React 19 · React Router 7 · RTK Query · Zod · React Hook Form · Tailwind v4 · Radix · Capacitor · Vitest + MSW · Playwright.

---

## 2. Ideal folder structure

### 2.1 Repository top level (mandatory)

```
client/
├── src/
│   ├── app/                 # Shell only — providers, router, guards, AppShell
│   ├── features/            # ★ Domain logic — only place features live
│   ├── entities/            # Rare cross-feature domain widgets (thin)
│   ├── shared/              # Feature-agnostic kernel
│   ├── test/                # Vitest / MSW / render helpers
│   ├── main.tsx
│   ├── index.css            # Tailwind + @theme tokens
│   └── vite-env.d.ts
├── public/                  # Static assets (favicon, brand logos)
├── ios/                     # Capacitor iOS project (platform)
├── android/                 # Capacitor Android project (platform)
├── docs/                    # client-local docs (ORIENTATION, audits, this blueprint)
├── e2e/                     # Playwright
├── resources/               # Capacitor asset source (splash/icons), if used
├── mockups/                 # Design references (non-runtime)
├── capacitor.config.ts
├── vite.config.ts
├── tsconfig*.json
├── eslint.config.js
├── playwright.config.ts
├── package.json
├── index.html
└── README.md
```

**Mandatory boundaries**

| Location               | May contain                                                                             | Must not contain                         |
| ---------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------- |
| `src/app/`             | Providers, route table, `RequireAuth`/`RequireGuest`, `AppShell`, thin route re-exports | Domain UI, Zod schemas, RTK endpoints    |
| `src/features/<name>/` | Everything for one product domain                                                       | Imports from another feature’s internals |
| `src/shared/`          | Truly reusable, zero domain knowledge                                                   | Match/shop/live-specific copy or schemas |
| `src/entities/`        | Cross-feature domain primitives (e.g. user avatar)                                      | Full screens or API slices               |
| `ios/`, `android/`     | Native Capacitor projects                                                               | React feature code                       |

### 2.2 Feature module shape (mandatory when the layer exists)

```
features/<name>/
├── api/           # RTK Query injectEndpoints
├── model/         # Zod schemas, domain types, pure wire→domain maps
├── lib/           # Pure helpers + feature hooks (use*)
├── ui/            # Feature-private components
├── pages/         # Route screens (*Page.tsx)
├── test/          # MSW handlers + feature tests
├── routes.ts      # RouteObject[] + path builders
└── index.ts       # ★ Public barrel — only cross-feature / app import surface
```

**Omit empty folders** — do not create `ui/` until needed.  
**Do not invent** alternate top-level names (`components/`, `hooks/`, `services/`) inside a feature. Put hooks in `lib/`; put services in `api/`.

**Phase 1 note:** Architecture doc mentions optional `hooks/` under features; **this blueprint standardizes on `lib/` for feature hooks** to match current inventory (live/matches/reels already place hooks under `lib/`).

### 2.3 Shared kernel shape (mandatory)

```
shared/
├── ui/            # Design system primitives + icons/ + media/ + toast/ + states/
├── layout/        # AppShell chrome: TopBar, BottomNav, SideNav, ScreenBar, …
├── dialogs/       # Global dialog store + host (not Redux)
├── api/           # baseApi, envelope, unwrap, errors, shared enums/location APIs
├── store/         # Redux store, authSlice, authSession
├── config/        # env, paths, theme, realtime, sentry
├── native/        # Capacitor façades (share, push, orientation, keepAwake, …)
├── platform/      # getPlatform / isNativePlatform
├── hooks/         # Generic hooks only (debounce, cursor sentinel, …)
├── lib/           # Pure utils (cn, cdn, deepLinks, …)
├── model/         # Shared Zod enums / location models
├── routing/       # Cross-cutting route helpers (e.g. terms gate)
└── types/         # Ambient / global TS helpers
```

### 2.4 When to add a new folder / module

| Situation                                         | Action                                                                              |
| ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| New product domain (e.g. “challenges”)            | New `features/<name>/` with template above                                          |
| UI used by 2+ features with **no** domain wording | Promote to `shared/ui`                                                              |
| Domain widget used by 2+ features (user chip)     | `entities/<name>/` or feature barrel export — prefer entity if truly cross-cutting  |
| Capacitor plugin wrapper                          | `shared/native/<facade>.ts` — features never import `@capacitor/*` for that concern |
| One-off page under shell with no domain           | Prefer a small feature (`support`, `stats`) over growing `app/pages`                |

---

## 3. Dependency rules (mandatory)

```
app/ ──────────► features/*/index.ts ──► (internal feature layers)
  │                      │
  └──────────► shared/*  ◄┘
entities/ ─────► shared/*
features/A ───X──► features/B/internal   (forbidden)
features/A ────► features/B (barrel only, rare)
shared/* ─────X──► features/*            (forbidden)
ios|android ──X──► src/features          (native stays outside)
```

| From                 | Allowed imports                                                |
| -------------------- | -------------------------------------------------------------- |
| Outside a feature    | `@/features/<name>` **barrel only** (ESLint)                   |
| Inside a feature     | Relative `../api`, `../model`, `../ui`, `../lib`               |
| Design system        | `@/shared/ui` (+ subpaths `icons`, `toast`, `media`, `states`) |
| Inside `shared/ui/*` | Prefer `@/shared/ui/Field` subpaths to avoid barrel cycles     |
| Anywhere             | `@/` alias — no `../../../` climbs                             |

**Exports**

- Named exports everywhere except **pages**, `main.tsx`, and tooling configs (default export OK).
- Feature `index.ts` exports only what `app/` or another feature truly needs (route objects, path builders, selected hooks/types) — not every sheet.

---

## 4. State ownership (mandatory)

| State type                  | Owner                              | Examples                                  |
| --------------------------- | ---------------------------------- | ----------------------------------------- |
| API data                    | RTK Query cache                    | Lists, detail resources, mutations        |
| Global durable client state | Redux slice (`shared/store`)       | Auth session token/user id                |
| Global non-serializable UI  | Dedicated vanilla stores           | `dialogs/dialogStore`, `toast/toastStore` |
| Screen / flow subtree       | Feature Context or page `useState` | Wizards, immersive Full flag              |
| Component-local             | `useState` / `useReducer`          | Open sheet, input focus                   |

**Do not** copy RTK Query results into Redux slices.  
**Do not** add a new Redux slice without asking: “Is this API data?” or “Does only one feature need it?”

---

## 5. File-by-file category blueprints

Categories mirror Phase 1 inventory buckets.

### 5.1 Pages & screens (`features/*/pages/*Page.tsx`)

|                    |                                                                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| **Responsibility** | Route-level composition: load data, own screen chrome (`ScreenBar`), wire feature `ui/` + API hooks                     |
| **Must**           | Default export; name `*Page.tsx`; use layout tokens from page-layout docs; lazy-loaded from `routes.ts`                 |
| **Must not**       | Define Zod wire schemas; call `fetch` directly; import other features’ internals; grow past ~400 LOC without extraction |
| **Owns state**     | URL params, local UI (tabs, drafts), orchestration                                                                      |
| **Dependencies**   | Feature `api`/`ui`/`lib`/`model`; `shared/layout`; `shared/ui`                                                          |

**Template**

```tsx
import { useNavigate, useParams } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import { useGetExampleQuery } from '../api/exampleApi';
import { exampleRoutes } from '../routes';
import { ExampleCard } from '../ui/ExampleCard';

/** Example detail — ScreenBar + body. */
export default function ExampleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const numericId = Number(id);
  const query = useGetExampleQuery(numericId, { skip: !Number.isFinite(numericId) });

  if (!Number.isFinite(numericId)) {
    return (
      <div className="bg-surface flex min-h-full flex-col px-4 py-8">
        <EmptyState title="Not Found" />
      </div>
    );
  }

  if (query.isLoading) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar title="Example" onBack={() => navigate(exampleRoutes.list())} />
        <Skeleton className="mx-4 mt-4 h-24" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="bg-surface flex min-h-full flex-col px-4 py-8">
        <ErrorState title="Couldn't Load" onRetry={() => void query.refetch()} />
      </div>
    );
  }

  return (
    <div className="bg-surface flex min-h-full flex-col">
      <ScreenBar title={query.data.title} onBack={() => navigate(exampleRoutes.list())} />
      <div className="px-4 py-3">
        <ExampleCard item={query.data} />
        <Button
          className="mt-3"
          onClick={() => {
            /* … */
          }}
        >
          Primary Action
        </Button>
      </div>
    </div>
  );
}
```

**Recommended split when >400 LOC:** extract `ui/` sections + `lib/use*PageModel.ts`; keep the page as the composition root (Phase 1 Q1).

**Exception — `app/pages/*`:** Phase 1 found thin re-exports (`StatsPage`, `SupportPage`). **Recommended:** route directly to feature pages. **Allowed temporary:** one-line re-export only.

---

### 5.2 Feature UI (`features/*/ui/*.tsx`)

|                    |                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| **Responsibility** | Presentational / interactive pieces owned by one feature                                             |
| **Must**           | PascalCase; named export; tokens only; no deep feature-to-feature imports                            |
| **Must not**       | Call `baseApi` inject; know URLs; use hex / arbitrary px radii                                       |
| **Props**          | Explicit types; `prop?: T \| undefined` when callers pass `undefined` (`exactOptionalPropertyTypes`) |

**Template**

```tsx
import { cn } from '@/shared/lib/cn';

import type { Example } from '../model/schemas';

type ExampleCardProps = {
  item: Example;
  className?: string | undefined;
  onSelect?: (() => void) | undefined;
};

/** Compact example row for lists. */
export function ExampleCard({ item, className, onSelect }: ExampleCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn('border-border-subtle bg-surface rounded-panel border p-3 text-left', className)}
    >
      <span className="text-body-sm font-extrabold text-ink">{item.title}</span>
    </button>
  );
}
```

**Reusable vs feature-specific**

| Signal                                        | Put it in            |
| --------------------------------------------- | -------------------- |
| Uses domain types (`Highlight`, `LiveStream`) | `features/<name>/ui` |
| Pure chrome (Button, Field, Chip)             | `shared/ui`          |
| User identity used in many features           | `entities/user`      |

---

### 5.3 Shared UI primitives (`shared/ui/*`)

|                    |                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| **Responsibility** | Design-system building blocks from `tapeya-ui` language                                                                        |
| **Must**           | `cva` variants where multi-style; semantic tokens; a11y (`aria-*`, focus rings); export from barrel **or** intentional subpath |
| **Must not**       | Feature imports; business rules; raw Capacitor                                                                                 |

Icons: **only** under `shared/ui/icons/` — no inline `<svg>` in features (mandatory per standards skill).

---

### 5.4 API layer (`features/*/api/*Api.ts` + `shared/api/*`)

|                    |                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| **Responsibility** | HTTP boundary: URLs, methods, tags, `transformResponse` via Zod parsers                                       |
| **Must**           | `baseApi.injectEndpoints`; parse with feature `model` parsers; provide/invalidate typed tags from `TAG_TYPES` |
| **Must not**       | Render UI; store results in Redux slices; skip Zod at the boundary                                            |

**Template**

```ts
import { baseApi } from '@/shared/api/baseApi';

import { type Example, parseExample, parseExampleList } from '../model/schemas';

export const exampleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExamples: builder.query<Example[], void>({
      query: () => ({ url: '/examples' }),
      transformResponse: (raw: unknown) => parseExampleList(raw),
      providesTags: (result) =>
        result
          ? [...result.map((e) => ({ type: 'Example' as const, id: e.id })), { type: 'Example', id: 'LIST' }]
          : [{ type: 'Example', id: 'LIST' }],
    }),
    getExample: builder.query<Example, number>({
      query: (id) => ({ url: `/examples/${id}` }),
      transformResponse: (raw: unknown) => parseExample(raw),
      providesTags: (_r, _e, id) => [{ type: 'Example', id }],
    }),
  }),
});

export const { useGetExamplesQuery, useGetExampleQuery } = exampleApi;
```

**Error / loading conventions**

- Pages consume `isLoading` / `isError` / `isFetching` from the hook.
- Use `EmptyState` / `ErrorState` / `Skeleton` from `shared/ui/states`.
- 401 on protected calls → session dialog via `baseApi` (do not reinvent).
- Public auth paths remain exempt (OTP 401 is a form error).

**Caching:** rely on RTK Query tags; do not hand-roll caches in `lib/`.

**When to split (Phase 1 Q2):** if `*Api.ts` or `schemas.ts` exceeds ~400–500 LOC, split by resource (`productSchemas.ts`, `orderSchemas.ts`) and re-export from a barrel inside `model/` **within the same feature** (not a new top-level folder).

---

### 5.5 Model / types / schemas (`features/*/model/*`)

|                    |                                                                                |
| ------------------ | ------------------------------------------------------------------------------ |
| **Responsibility** | Wire Zod schemas, domain types, `parse*` helpers (`unwrapData` / `unwrapList`) |
| **Must**           | CamelCase domain fields; snake_case only inside wire schemas; no React imports |
| **Must not**       | UI components; Capacitor; path builders (those stay in `routes.ts` / `lib`)    |

**Template**

```ts
import { z } from 'zod';

import { unwrapData, unwrapList } from '@/shared/api/unwrap';

export const exampleWireSchema = z
  .object({
    id: z.number(),
    title: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
  })
  .passthrough();

export type Example = {
  id: number;
  title: string;
  createdAt: string | null;
};

export function mapExample(wire: z.infer<typeof exampleWireSchema>): Example {
  return {
    id: wire.id,
    title: wire.title?.trim() || 'Untitled',
    createdAt: wire.created_at ?? null,
  };
}

export function parseExample(raw: unknown): Example {
  return mapExample(exampleWireSchema.parse(unwrapData(raw)));
}

export function parseExampleList(raw: unknown): Example[] {
  return unwrapList(raw).map((row) => mapExample(exampleWireSchema.parse(row)));
}
```

---

### 5.6 Lib & feature hooks (`features/*/lib/*`)

|                    |                                                                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **Responsibility** | Pure helpers, formatters, feature-local `use*` hooks, playback helpers, etc.                                                 |
| **Must**           | No JSX in pure helper files; hooks named `use*`; colocate unit tests `*.test.ts`                                             |
| **Must not**       | Become a dumping ground for pages — if it needs half the page’s props, keep logic in the page or a dedicated `use*PageModel` |

**Shared hooks** (`shared/hooks`): only generics with **zero** domain types (`useDebounce`, `useCursorSentinel`, `useCountryCity`).

**Native hooks** (`shared/native/use*.ts`): Capacitor-facing behaviour (orientation, keyboard inset, keep-awake).

---

### 5.7 Routes (`features/*/routes.ts` + `app/routes.tsx`)

|                    |                                                                                  |
| ------------------ | -------------------------------------------------------------------------------- |
| **Responsibility** | Path builders + `RouteObject[]` (lazy pages); app aggregates feature tables      |
| **Must**           | Paths from `shared/config/paths` or feature builders; lazy `import('./pages/…')` |
| **Must not**       | Inline page implementations in `routes.ts`                                       |

---

### 5.8 Feature barrel (`features/*/index.ts`)

Export route objects, path helpers, and selected hooks/types required outside the feature. Prefer explicit named exports over `export *` when the surface is large.

---

### 5.9 Configuration (`shared/config/*`, root tooling)

| File area                                                                     | Responsibility                                |
| ----------------------------------------------------------------------------- | --------------------------------------------- |
| `shared/config/env.ts`                                                        | Typed `import.meta.env` access                |
| `shared/config/paths.ts`                                                      | App-wide path constants / builders            |
| `shared/config/theme.tsx` + `themeBoot.js`                                    | Theme preference (`system` default + persist) |
| `shared/config/realtime.ts`                                                   | Echo façade                                   |
| `shared/config/sentry.ts`                                                     | Error tracking façade                         |
| Root `vite.config.ts`, `tsconfig*`, `eslint.config.js`, `capacitor.config.ts` | Tooling — change deliberately                 |

---

### 5.10 State / store (`shared/store/*`)

| File             | Responsibility                                  |
| ---------------- | ----------------------------------------------- |
| `store.ts`       | Configure store + middleware                    |
| `authSlice.ts`   | Auth client state                               |
| `authSession.ts` | secureStorage persist/hydrate (Keychain native) |
| `hooks.ts`       | Typed `useAppDispatch` / `useAppSelector`       |

---

### 5.11 Dialogs (`shared/dialogs/*`)

Global confirm / session-expired — **not** Redux. Open via helpers; host mounted once in `AppProviders`.

---

### 5.12 Layout (`shared/layout/*`)

Shell chrome only (`ScreenBar`, nav, drawer, scrollport). Pages compose `ScreenBar`; they do not fork TopBar.

---

### 5.13 Platform & native (`shared/platform`, `shared/native`, `ios/`, `android/`)

| Layer                | Rule                                                                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Features             | Call `shared/native/*` and `shared/platform/platform.ts` — **not** `@capacitor/*` directly for wrapped concerns                                            |
| New Capacitor API    | Add a thin façade in `shared/native` first                                                                                                                 |
| `ios/`, `android/`   | Capacitor-generated projects; do not relocate into `src/`; custom native plugins stay documented and minimal                                               |
| iOS package managers | CapApp-SPM for Capacitor plugins; CocoaPods (`ios/App/Podfile`) for HaishinKit 2.0.9 only. Open `App.xcworkspace` — see `client/README.md` Native section. |

**Permissions:** request behind user gestures; document platform differences in feature docs when behaviour diverges (e.g. orientation).

**Orientation (current product rule):** app portrait-locked; media **Full** is manual CSS-rotate via `useImmersiveLandscape` + `ImmersiveLandscapeStage` — see [ORIENTATION.md](../ORIENTATION.md). Do not reintroduce tilt without a dedicated design pass.

---

### 5.14 Styles & assets

| Kind                     | Location                   | Rules                                                                |
| ------------------------ | -------------------------- | -------------------------------------------------------------------- |
| Design tokens / Tailwind | `src/index.css` (`@theme`) | Semantic classes only (`bg-surface`, `text-ink`, `rounded-field`, …) |
| Per-component CSS        | **Forbidden**              | No `Component.css`, no second `dark.css`                             |
| Icons                    | `shared/ui/icons`          | SVG React components, `currentColor`                                 |
| Brand / favicon          | `public/`                  | Static URLs                                                          |
| Raster content images    | CDN                        | Via `shared/lib/cdn` helpers where applicable                        |

---

### 5.15 Entities (`src/entities/*`)

Thin cross-feature domain UI/types (Phase 1: `entities/user` only). Grow slowly. Prefer promoting from a feature barrel over premature entities.

---

### 5.16 Tests

| Kind          | Location                                             | Rules                          |
| ------------- | ---------------------------------------------------- | ------------------------------ |
| Unit          | `*.test.ts(x)` colocated or under `features/*/test/` | Vitest                         |
| MSW           | `features/*/test/handlers.ts`                        | Register in central test setup |
| Render helper | `src/test/renderWithProviders.tsx`                   | Use for component tests        |
| E2E           | `e2e/`                                               | Playwright                     |

**Mandatory:** schema/parser tests for non-trivial Zod maps.  
**Recommended:** lib pure-function tests (matches feature already strong here).  
**Recommended:** avoid brittle full-page tests until flows stabilize; prefer ui + lib.

---

### 5.17 Docs & other

| Path                                      | Role                                                                |
| ----------------------------------------- | ------------------------------------------------------------------- |
| `docs/PHASE1_CODEBASE_AUDIT.md`           | Inventory + migration candidates                                    |
| `docs/architecture/codebase-blueprint.md` | **This file**                                                       |
| `docs/ORIENTATION.md`                     | Orientation product/tech policy                                     |
| `README.md`                               | Runbook — keep path names accurate (`client`, not stale `app-next`) |
| `mockups/`                                | Non-runtime design refs                                             |

---

## 6. Component architecture

### 6.1 Composition & data flow

```
Page (route)
  ├─ ScreenBar (shared/layout)
  ├─ Feature ui/ (cards, docks, sheets)
  │    └─ shared/ui primitives
  └─ RTK hooks from feature api/
```

- **State ownership flows down; events flow up** via callbacks (`onSelect`, `onSubmit`).
- Prefer **controlled** inputs in forms (RHF).
- Avoid prop-drilling more than ~2 levels — extract a feature hook or local Context.

### 6.2 Parent–child rules

| Parent     | Child may                                              |
| ---------- | ------------------------------------------------------ |
| Page       | Own fetching; pass domain objects to ui                |
| Feature ui | Render; call optional callbacks; use shared primitives |
| Shared ui  | Be dumb to domain; variants via props/`cva`            |

### 6.3 Avoid

| Smell                                     | Fix                                                  |
| ----------------------------------------- | ---------------------------------------------------- |
| 800+ LOC page                             | Split ui sections + `usePageModel`                   |
| Feature ui importing another feature’s ui | Promote shared piece or pass render props / navigate |
| Copy-pasted Button styles                 | Use `shared/ui/Button`                               |
| Deep trees of wrappers with no purpose    | Flatten                                              |
| Inline SVG                                | Add icon under `shared/ui/icons`                     |

---

## 7. Cross-platform architecture

```
React UI (src/)
   ↓
shared/platform + shared/native façades
   ↓
Capacitor plugins
   ↓
ios/  |  android/  |  web no-ops
```

| Concern                                 | Pattern                                                              |
| --------------------------------------- | -------------------------------------------------------------------- |
| Detect platform                         | `getPlatform()` / `isNativePlatform()`                               |
| Share / push / orientation / keep-awake | `shared/native/*`                                                    |
| Web fallback                            | Façade returns safe no-op or web API (`navigator.share` → clipboard) |
| Permissions                             | User-gesture gated; never block app boot on deny                     |
| Keyboard                                | `KeyboardInsetProvider` + `useKeyboardInset`                         |

**Mandatory:** features do not branch on `Capacitor.getPlatform()` directly when a façade exists.

---

## 8. Code quality standards

### 8.1 TypeScript (mandatory)

- `strict` + `exactOptionalPropertyTypes`
- No `any` — use `unknown` + Zod at boundaries
- Prefer `import type { … }`

### 8.2 Naming (mandatory)

| Kind         | Convention                |
| ------------ | ------------------------- |
| Page         | `*Page.tsx`               |
| Component    | PascalCase                |
| Hook         | `use*`                    |
| Schema       | `*Schema` / `*WireSchema` |
| Domain type  | PascalCase noun           |
| Path builder | `*Routes` / `*Paths`      |
| RTK file     | `*Api.ts`                 |
| Test         | `*.test.ts(x)`            |
| Icon         | `*Icon.tsx`               |

### 8.3 File size (recommended thresholds)

| LOC     | Action                                                 |
| ------- | ------------------------------------------------------ |
| < 200   | Ideal for ui/lib units                                 |
| 200–400 | OK for pages                                           |
| 400–600 | Plan extraction                                        |
| > 600   | **Should** split before adding features (Phase 1 list) |

### 8.4 Accessibility (mandatory for interactive UI)

- Icon-only buttons: `aria-label`
- Errors: `role="alert"` + text
- Focus rings via tokens (`focus-visible:outline-brand`)
- Do not rely on colour alone

### 8.5 Copy casing

Follow `APP_REACT_COPY_CASING.md` (Title Case for chrome labels as established).

### 8.6 Imports / formatting

ESLint flat config + Prettier. Run `npm run fix` before PR.

### 8.7 Avoid over-engineering

- Do not add abstractions for a single call site
- Do not create `BaseAbstractFactory` layers
- Do not add Context until prop-drilling hurts
- Prefer deleting dead code (Phase 1 Q5) over “keeping for later” without a ticket

---

## 9. Practical templates (quick reference)

### 9.1 New feature checklist

1. Create `features/<name>/{api,model,pages,routes.ts,index.ts}` (+ `ui`/`lib`/`test` as needed).
2. Add paths to `shared/config/paths.ts` if app-wide.
3. Register route tables in `app/routes.tsx`.
4. Add RTK tags to `TAG_TYPES` if new.
5. Add MSW handlers under `test/handlers.ts`.
6. Export public surface from `index.ts` only.

### 9.2 Shared UI primitive checklist

1. Port pattern from `tapeya-ui` if visual.
2. Tokens only; `cva` for variants.
3. Export via `shared/ui/index.ts` **or** document subpath-only export.
4. No feature imports.

### 9.3 Native façade checklist

1. Wrap plugin in `shared/native/<name>.ts`.
2. Web no-op / fallback.
3. Feature imports façade only.
4. Unit-test pure helpers; device-QA native paths.

---

## 10. Rules for future implementation phases

### 10.1 Reviewing an existing file

1. Identify category (§5).
2. Compare location to §2 — **keep** unless Phase 1 §6.2 change candidate or new violation.
3. Compare structure to the category template.
4. Check dependencies against §3.
5. Check size against §8.3.

### 10.2 Decide: move / split / merge / redesign

| Decision     | When                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| **Keep**     | Matches blueprint; no Phase 1 flag                                                  |
| **Move**     | Wrong layer (e.g. domain schema in `shared/`)                                       |
| **Split**    | Exceeds size thresholds or mixed responsibilities (page + schema + API in one file) |
| **Merge**    | Near-duplicate steppers / duplicated parsers with one clear owner                   |
| **Delete**   | Confirmed unused (rg + typecheck)                                                   |
| **Redesign** | Correct folder but fights UX source of truth (`tapeya-ui`) or API contracts         |

### 10.3 PR expectations for structural work

- One concern per PR (delete dead code ≠ split MatchScorePage).
- Update barrels and lazy routes in the same PR.
- `npm run typecheck && npm test` green.
- Note exceptions explicitly in the PR body (§11).

---

## 11. Exceptions & decision criteria

A single rule may not fit every case. **Allowed exceptions** when documented:

| Criterion                    | Example                                                          |
| ---------------------------- | ---------------------------------------------------------------- |
| Performance boundary         | Colocate a hot path helper next to the only consumer temporarily |
| Generated / Capacitor output | Leave `ios/`/`android/` file layout alone                        |
| Incremental migration        | Thin `app/pages` re-export until routes updated                  |
| Third-party constraint       | Library forces a default export                                  |
| Safety                       | Do not split MatchScore mid-release without QA plan              |

**Disallowed “exceptions”**

- “Faster to import deep feature paths”
- “I’ll put this domain helper in `shared/lib` for convenience”
- “Just one `any`”
- New top-level `src/components/`

---

## 12. Common mistakes to avoid

1. Creating `features/foo/components/` instead of `ui/`.
2. Calling Laravel URLs from a page.
3. Duplicating `NumberStepper` behaviour in shop without wrapping shared.
4. Re-adding tilt/`deviceOrientationPermission` without product sign-off.
5. Growing `MatchScorePage` further instead of extracting.
6. Importing `@capacitor/core` in a feature page.
7. Adding hex colours “just for this screen”.
8. Exporting entire feature internals from `index.ts`.

---

## 13. Relationship to other docs

| Doc                           | Role vs this blueprint            |
| ----------------------------- | --------------------------------- |
| `PHASE1_CODEBASE_AUDIT.md`    | What exists + what to change      |
| **This blueprint**            | How every file type _should_ look |
| `APP_REWRITE_ARCHITECTURE.md` | Org-wide rewrite constitution     |
| `APP_REACT_BEST_PRACTICES.md` | Day-to-day checklist              |
| `APP_REACT_PAGE_LAYOUT.md`    | ScreenBar / gutters / sticky CTAs |
| `APP_REACT_FORM_MIGRATION.md` | Form density                      |
| `ORIENTATION.md`              | Orientation policy                |
| `client-standards` skill      | Agent-enforced UI/TS rules        |

If this blueprint and a specialized doc disagree on a **narrow** topic (forms, copy), the specialized doc wins for that topic. If they disagree on **folder ownership**, this blueprint + Phase 1 win.

---

## 14. Phase 2 completion checklist

- [x] Ideal directory structure defined from Phase 1 reality
- [x] Category blueprints for pages, feature ui, shared ui, api, model, lib/hooks, routes, config, store, dialogs, layout, native/platform, styles/assets, entities, tests, docs
- [x] Component architecture & data-flow rules
- [x] Business logic / API / state boundaries
- [x] Cross-platform façade rules
- [x] Quality standards + size thresholds
- [x] Templates and anti-patterns
- [x] Rules for future moves + exception criteria
- [x] **No application source files moved or refactored in this phase**

**Next:** Phase 3 implementation should execute Phase 1 §6.2 / §8 candidates **against this blueprint**, one PR stream at a time.
