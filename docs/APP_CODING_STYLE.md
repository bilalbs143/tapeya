# App (React) — Coding Style & Conventions

Short reference for the `app/` folder (Vite + React, Redux Toolkit, Tailwind, Radix).

---

## Formatting & tooling

- **Prettier**: 2 spaces, single quotes, trailing commas, LF. Tailwind plugin for class sorting.
- **ESLint**: React + hooks + jsx-a11y + simple-import-sort. Run `npm run fix` before commit.
- **Imports**: Use `@/` alias for `src/` (e.g. `@/ui/Button`, `@/store/hooks`). Sort: external → blank → internal; one newline after last import.

---

## File & folder structure

| Path | Purpose |
|------|--------|
| `src/components/` | Shared, reusable UI (e.g. SplashScreen). |
| `src/ui/` | Primitive / design-system pieces (Button, Input, FormField, Radix wrappers). |
| `src/layouts/` | Route wrappers with `<Outlet />` (AuthLayout, MainLayout). |
| `src/pages/` | Route-level screens; `pages/auth/` for auth flows. |
| `src/hooks/` | Custom hooks (e.g. `usePlatform`). |
| `src/lib/` | Constants, validations (Zod schemas in `lib/validations/`). |
| `src/platform/` | Platform detection (web / Capacitor). |
| `src/providers/` | App-level providers (StoreProvider). |
| `src/store/` | Redux: `api/`, `slices/`, `store.js`, `rootReducer.js`, `hooks.js`, `selectors.js`. |

- **Naming**: PascalCase for components/layouts (`Login.jsx`, `AuthLayout.jsx`). camelCase for hooks, utils, slices (`usePlatform.js`, `authSlice.js`). One main component per file.

---

## Components

- **UI primitives**: Prefer named exports (`export function Button(...)`). Add a short JSDoc when behavior is non-obvious (e.g. `asChild` with Radix).
- **Props**: Use defaults for optional props (`className = ''`, `variant = 'primary'`). Spread rest props onto the root element where appropriate.
- **Styling**: Tailwind only. Prefer utilities; use `className` for overrides. No inline styles except when necessary (e.g. dynamic values or design tokens).
- **Forms**: Use `react-hook-form` + `@hookform/resolvers/zod`. One Zod schema per form (or shared in `lib/validations/`). Use `FormField` + `Input` (or other UI) with `register()` and `formState.errors`. Layout spacing: import `FormStack`, `FormSection`, `FormActions` from `@/ui/form/*` — see [FORM_LAYOUT_STANDARDS.md](./FORM_LAYOUT_STANDARDS.md). ESLint enforces no raw `space-y-*` / `gap-*` on `<form>` (`tapeya-form-layout/no-raw-form-field-spacing`).

---

## State (Redux)

- **Slices**: `createSlice`; export `actions` and default `reducer`. Keep state minimal; use RTK Query for server state.
- **API**: `baseApi` (createApi + fetchBaseQuery) in `store/api/baseApi.js`; inject endpoints in feature files (e.g. `authApi.js`). Export generated hooks (`useLoginMutation`, `useGetMeQuery`).
- **Selectors**: Centralize in `store/selectors.js` with `createSelector`; use `useAppSelector(selectUser)` etc.
- **Dispatch**: Use `useAppDispatch` from `@/store/hooks` (not raw `useDispatch`).
- **Persistence**: Only `auth` slice in persist whitelist; configure in `store.js`.

---

## Routing & entry

- **Router**: React Router v6; `<BrowserRouter>`, `<Routes>`, nested routes with layout components.
- **Entry**: `main.jsx` wraps app in `StrictMode` and `StoreProvider`. Global styles: `@/assets/css/style.scss` and `./index.css` (Tailwind + theme).

---

## Misc

- **Accessibility**: Use semantic HTML and ARIA where needed (e.g. `aria-invalid`, `role="alert"` for errors). Prefer Radix primitives for complex widgets.
- **Exports**: Pages/layouts: default export for the screen/layout component. UI/store: named exports.
- **Unused vars**: Prefix with `_` if intentionally unused; ESLint ignores them.
