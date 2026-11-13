# App-react screen orientation

**Status:** Portrait-locked app; media Full is manual only (tilt deferred)  
**Date:** November 2026  
**Related:** [LIVE_STREAM_ORIENTATION.md](../../docs/LIVE_STREAM_ORIENTATION.md), [APP_REWRITE_ARCHITECTURE.md](../../docs/APP_REWRITE_ARCHITECTURE.md) §11

## Goals

- Portrait-first shell on native (feed, tabs, reels, shop, profile, media).
- Media **Full** uses CSS 90° rotate + 16:9 contain for React chrome (loader / Exit on web).
- Go Live hard-locks to stream encode orientation via `orientationSession`.

## App Tracking Transparency (iOS)

Facebook advertiser-ID collection requires ATT. Prompt runs from `AttPrompt` ~1.2s after the scene becomes active (iPadOS drops early requests), and `AppEvents.activateApp` / advertiser ID stay off until the user answers. For App Review: fresh install → record the ATT sheet → attach the screen recording in App Review Information notes.

## Native splash brand (iOS + Android)

Cold start keeps light/dark page backgrounds (no Cap `backgroundColor`). Branding:

1. Platform launch surface — iOS `LaunchScreen` (full logo + tagline); Android `@drawable/splash` (full logo). On Android 12+, Cap keeps the system splash until hide — only `windowSplashScreenBackground` + circular `splash_mark` are visible (layer-list / overlay sit underneath).
2. `SplashBrandOverlay` — full logo + one-line tagline for pre-12 Cap splash and the handoff after the system splash exits
3. JS `hideNativeSplash()` — Cap `SplashScreen.hide` then `TapeyaAppearance.hideSplashBrand`

## Non-goals (current)

- Tilt-to-open immersive (deviceorientation) — removed; revisit later
- Unlocking OS landscape on media pages

## iOS YouTube overlay

Capacitor’s in-DOM YouTube iframe often never reaches PLAYING on iOS. Watch / highlights / entertainment use `YoutubeStreamOverlayPlugin` → `/embed/youtube`.

| Mode        | When                              | Behaviour                                            |
| ----------- | --------------------------------- | ---------------------------------------------------- |
| Interactive | Highlights / episode (`controls`) | Native above Cap — YouTube scrubber tappable         |
| Underlay    | Watch / live (portrait + Full)    | Native below Cap — LIVE badge / chat / Exit tappable |

**Full on iOS native**

1. `immersiveFullscreen` — native WKWebView fills the host
2. Embed `rotate=1&cover=1` — video orients inside that WKWebView
3. React stage CSS-rotates so loader + LIVE badge sit on the landscape top edge
4. Exit is native (Cap HTML cannot sit above the overlay); web/Android keep Cap Exit
5. `html.ios-youtube-underlay` punches shell canvas + player hole only (TopNav/chat keep `bg-surface`)

Web / Android Full uses CSS-rotate only (iframe / HLS). Shared player API: `YoutubeProxyPlayer` (`controls`, `landscape`).

## Policy

| Surface                        | Native lock                      | UI                                   |
| ------------------------------ | -------------------------------- | ------------------------------------ |
| Boot + shell + media           | `portrait`                       | Normal chrome                        |
| Go Live on-air                 | Stream `portrait` \| `landscape` | Coach mark if lock fails             |
| Watch / Highlights / Episode   | Stay `portrait`                  | **Full** → immersive UI; Exit leaves |
| Watch portrait self-serve live | Stay `portrait`; no Full         | 16:9 watch chrome                    |
| Reels                          | Stay `portrait`                  | No Full                              |

## Architecture

```
Boot → orientationSession.ensurePortraitBase()  // portrait lock

Media Full → useImmersiveLandscape + ImmersiveLandscapeStage
Media Exit → leave immersive

Go Live → session.push(streamOrientation) → pop on leave
```
