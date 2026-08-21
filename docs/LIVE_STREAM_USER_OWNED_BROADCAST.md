# User-owned broadcast graphics overlay

**Status:** Organizer overlay only (theme + signed OBS URL + lifecycle commands). Destination / YouTube / Facebook user OAuth removed from this slice.  
**Date:** August 2026  
**Audience:** Product, engineering  
**Related:** [GRAPHICS_OVERLAY_ISOLATION_PLAN.md](./GRAPHICS_OVERLAY_ISOLATION_PLAN.md)

---

## What this is

Organizers score in the **Tapeya app** and show **Tapeya graphics** in OBS/vMix/PRISM via a signed overlay URL. They publish video to **their own** destination outside Tapeya (manual RTMP setup in the encoder).

Tapeya supplies:

- Theme + config (organizer dialog on scoring)
- Graphic session + signed overlay URL
- Lifecycle commands: **THIS_MATCH → TOSS_LT → LT_DEFAULT**, plus existing scoring flashes (4 / 6 / out / …)

Tapeya does **not** (in this slice):

- Connect YouTube / Facebook OAuth for the organizer
- Store or provision match RTMP destinations
- Mark live on the Tapeya hub for user-owned destinations

---

## App UX

- Scoring header → **Broadcast graphics** dialog (`scoringBroadcastGraphics`)
- Theme + schema colors/toggles → Save → copy overlay URL into OBS Browser Source (1920×1080, transparent)

## API (user, scorer-gated)

- `GET graphic-themes`
- `GET/PUT matches/{match}/graphic-session`
- `GET matches/{match}/graphic-session/signed-url`

## Ops

- Graphics frontend URL + signing secret in System Settings (graphics group)
- Overlay host must be reachable from OBS (e.g. `graphics.tapeya.com` or local graphics build)

---

## Definition of done (this slice)

- [x] Organizer can create/update graphic session and copy signed overlay URL
- [x] Toss / first ball advance overlay lifecycle when a session exists
- [x] Scoring flashes continue to work once session exists
- [x] Fan APIs never expose overlay signing secrets
