# App-react screen orientation

**Status:** Portrait-locked app; media Full is manual CSS-rotate only (tilt deferred)  
**Date:** October 2026  
**Related:** [LIVE_STREAM_ORIENTATION.md](../../docs/LIVE_STREAM_ORIENTATION.md), [APP_REWRITE_ARCHITECTURE.md](../../docs/APP_REWRITE_ARCHITECTURE.md) §11

## Goals

- Portrait-first shell on native (feed, tabs, reels, shop, profile, media).
- Media **Full** uses CSS 90° rotate + 16:9 contain (same player fiber — no remount).
- Go Live hard-locks to stream encode orientation via `orientationSession`.

## Non-goals (current)

- Tilt-to-open immersive (deviceorientation) — removed; revisit later
- Unlocking OS landscape on media pages
- YouTube embed `rotate=1` / `cover=1`
- Porting iOS `YoutubeStreamOverlay`

## Policy

| Surface                        | Native lock                      | UI                                           |
| ------------------------------ | -------------------------------- | -------------------------------------------- |
| Boot + shell + media           | `portrait`                       | Normal chrome                                |
| Go Live on-air                 | Stream `portrait` \| `landscape` | Coach mark if lock fails                     |
| Watch / Highlights / Episode   | Stay `portrait`                  | **Full** → CSS-rotate immersive; Exit leaves |
| Watch portrait self-serve live | Stay `portrait`; no Full         | 16:9 watch chrome                            |
| Reels                          | Stay `portrait`                  | No Full                                      |

## Architecture

```
Boot → orientationSession.ensurePortraitBase()  // portrait lock

Media Full → useImmersiveLandscape forced + ImmersiveLandscapeStage CSS-rotate
Media Exit → leave immersive

Go Live → session.push(streamOrientation) → pop on leave
```

## API

| Symbol                        | Module                                   |
| ----------------------------- | ---------------------------------------- |
| `lockOrientation` / …         | `shared/native/orientation.ts`           |
| `orientationSession`          | `shared/native/orientationSession.ts`    |
| `useOrientationLock`          | `shared/native/useOrientationLock.ts`    |
| `useImmersiveLandscape`       | `shared/native/useImmersiveLandscape.ts` |
| `ImmersiveLandscapeStage`     | `shared/ui/ImmersiveLandscapeStage.tsx`  |
| `useBroadcastOrientationLock` | `features/live/lib/…`                    |
