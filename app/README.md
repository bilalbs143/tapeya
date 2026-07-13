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

| Command               | Description                     |
| --------------------- | ------------------------------- |
| `npm run dev`         | Start dev server (Web)          |
| `npm run build`       | Web production build            |
| `npm run cap:sync`    | Sync existing `dist/` to native |
| `npm run cap:ios`     | iOS build + sync + open Xcode   |
| `npm run cap:android` | Android build + sync + open IDE |

## Native Setup

1. Add platforms (first time): `npx cap add ios` and/or `npx cap add android`
2. iOS: `npm run cap:ios` (build with iOS native config, sync, open Xcode)
3. Android: `npm run cap:android`
4. Re-sync only (after a platform build): `npm run cap:sync`

## Path Aliases

Use `@/` for `src/`:

- `@/ui/Button` → `src/ui/Button`
- `@/hooks/usePlatform` → `src/hooks/usePlatform`
- etc.

## Broadcast graphics overlay

OBS graphics URL: `https://graphics.tapeya.com/{sessionId}-{expires}-{signature}` (theme from session). Architecture: [`src/graphics/ARCHITECTURE.md`](src/graphics/ARCHITECTURE.md).
