# Tapeya deep links (open in app)

Generic deep linking for shareable screens. Reels and feed posts are primary
consumers; add more routes in the registry as you ship them.

## Architecture

| Piece | Role |
|-------|------|
| [`deepLinkRegistry.js`](../app/src/lib/deepLinks/deepLinkRegistry.js) | Allowed path patterns + `buildDeepLinkPath(id, params)` |
| [`deepLinkUtils.js`](../app/src/lib/deepLinks/deepLinkUtils.js) | HTTPS / `tapeya://` builders + URL → path parser |
| [`useAppDeepLink`](../app/src/hooks/useAppDeepLink.js) | Capacitor `appUrlOpen` + cold-start launch URL |
| [`OpenInAppBanner`](../app/src/components/deepLinks/OpenInAppBanner.jsx) | Soft open-in-app on mobile web |

**Public URL shape:** `https://<domain><path>`  
**Fallback scheme:** `tapeya://<path without leading slash>`

Examples:

```text
https://tapeya.com/reels/12
tapeya://reels/12

https://tapeya.com/feed/8
tapeya://feed/8

https://tapeya.com/live/go-live/31
tapeya://live/go-live/31

https://tapeya.com/scorecard/match/901
tapeya://scorecard/match/901
```

## Adding a new deep link

1. Register the path in `DEEP_LINK_ROUTES` (`deepLinkRegistry.js`)
2. Add the React route if needed
3. Share with `buildHttpsDeepLink(path)` (or a thin feature wrapper)
4. Optionally show `<OpenInAppBanner path={path} />` on that screen
5. Extend Android HTTPS `pathPrefix` / iOS Associated Domains paths in well-known files
6. Rebuild native apps after OS association changes

## Behaviour

| Client | What happens |
|--------|----------------|
| App installed + Universal / App Links verified | OS opens the app on that path |
| App installed, links not verified yet | Soft **Open in Tapeya** tries `tapeya://…`, then store |
| No app | Browser loads the HTTPS path |

## Ops checklist (TikTok-style auto-open)

### Android App Links

1. [x] Put **Play App Signing** SHA-256 in [`assetlinks.json`](../app/public/.well-known/assetlinks.json)  
   - See [`PLAY_APP_SIGNING_SHA256.md`](./PLAY_APP_SIGNING_SHA256.md)
2. Host at `https://tapeya.com/.well-known/assetlinks.json` (nginx `app.conf` serves JSON)
3. [x] `AndroidManifest` HTTPS `pathPrefix`: `/reels`, `/feed`, `/live/go-live`, `/scorecard` on `tapeya.com` only  
   - Custom scheme: `tapeya://reels…`, `tapeya://feed…`, `tapeya://live…`, `tapeya://scorecard…`
4. Verify after deploy + install: `adb shell pm get-app-links com.tapbytapeya.app`
5. Rebuild + ship native Android (versionCode **17** / `1.1.6` bumped for this change)

### iOS Universal Links

1. [x] Team ID `M7P9P5UTTZ` in [`apple-app-site-association`](../app/public/.well-known/apple-app-site-association) (`appID` = `M7P9P5UTTZ.com.tapbytapeya.app`)
2. [x] Paths cover `/reels/*`, `/feed/*`, `/live/go-live/*`, `/scorecard/*`
3. [x] Associated Domains in `App.entitlements` + `AppRelease.entitlements`: `applinks:tapeya.com` (apex only — `www` 301s and cannot host AASA)
4. Host AASA after mobile web deploy: `https://tapeya.com/.well-known/apple-app-site-association`  
   - nginx `location = /.well-known/apple-app-site-association` → `application/json`, no SPA fallback  
   - Must **not** redirect (use apex `tapeya.com`; `www` redirects to apex)
5. Rebuild + ship a native iOS build that includes the updated entitlements (Archive → TestFlight / App Store)

**Verify after deploy:**

```bash
curl -sI https://tapeya.com/.well-known/apple-app-site-association | head
curl -s https://tapeya.com/.well-known/apple-app-site-association
# Optional: https://search.developer.apple.com/appsearch-validation-tool/
```

Until AASA is live on the domain **and** a build with Associated Domains is installed, the banner + `tapeya://` scheme still provide an open-in-app path.
