# Tapeya App

React + Tailwind + Capacitor — cross-platform (iOS, Android, Web).

## Structure

```
src/
├── ui/           # Reusable Tailwind components (Button, Container, etc.)
├── pages/        # Route-level pages
├── layouts/      # MainLayout, BlankLayout
├── store/        # Zustand stores (useAppStore, etc.)
├── hooks/        # Custom hooks (usePlatform, useIsNative)
├── platform/     # Capacitor helpers (getPlatform, isNative)
└── lib/          # Constants, utils
```

## Commands

| Command                | Description                     |
| ---------------------- | ------------------------------- |
| `npm run dev`          | Start dev server (Web)          |
| `npm run build`        | Production build                |
| `npm run preview`      | Preview production build        |
| `npm run lint`         | Run ESLint                      |
| `npm run lint:fix`     | Run ESLint with auto-fix        |
| `npm run format`       | Format code with Prettier       |
| `npm run format:check` | Check Prettier formatting       |
| `npm run fix`          | Lint fix + format (all-in-one)  |
| `npm run cap:sync`     | Build + sync to native projects |
| `npm run cap:ios`      | Open Xcode (iOS)                |
| `npm run cap:android`  | Open Android Studio             |

## Native Setup

1. Build: `npm run build`
2. Add platforms (first time): `npx cap add ios` and/or `npx cap add android`
3. Sync: `npm run cap:sync`
4. Open: `npm run cap:ios` or `npm run cap:android`

## Path Aliases

Use `@/` for `src/`:

- `@/ui/Button` → `src/ui/Button`
- `@/hooks/usePlatform` → `src/hooks/usePlatform`
- etc.
