# Push Notification Module — Pre-Commit Review

Review date: June 2026  
Scope: all uncommitted push-related work across **api**, **app**, **backoffice**, and **supervisor**.

---

## Verdict

**Not ready for production sign-off as-is.**

- **Android** can work after ops checklist + critical code fixes.
- **iOS delivery via FCM is likely broken** until the client sends an **FCM registration token** (not a raw APNs token).
- **Backend architecture is solid for v1**, but several reliability bugs should be fixed before high-traffic production.

**Recommendation:** Safe to commit as a feature branch / WIP. Do **not** ship to production until at least critical items **1–4** in [Recommended fixes](#recommended-fixes-before-commit) are addressed and verified on real devices.

---

## Changeset overview

| Area | Scope |
|------|--------|
| **API** | Migrations, models, enums, `PushNotificationService`, job, FCM driver, listeners, admin/user routes, settings, seeders, log purge command |
| **App** | Capacitor push hook, device token API, iOS/Android native config |
| **Backoffice** | Push logs, send dialog, template editor |
| **Ops** | `push-notifications` queue in supervisor, daily log purge schedule |

### Key file paths

| Area | Paths |
|------|--------|
| Migrations | `api/database/migrations/2026_06_02_100000_create_device_tokens_table.php`, `100001_..._templates`, `100002_..._logs` |
| Core flow | `api/app/Services/Push/PushNotificationService.php`, `api/app/Jobs/SendPushNotificationJob.php`, `api/app/Services/Push/Drivers/FcmPushDriver.php` |
| Listeners | `api/app/Listeners/OrderPlacedPushListener.php`, `OrderStatusUpdatedPushListener.php` |
| Routes | `api/routes/api/v1/admin.php`, `api/routes/api/v1/user.php`, `api/routes/console.php` |
| Settings | `api/app/Settings/PushSettings.php`, `SystemSettingRegistry`, `SystemSettingsSeeder` |
| App | `app/src/hooks/usePushNotifications.js`, `app/src/store/api/deviceTokenApi.js` |
| Backoffice | `backoffice/src/app/pages/engagement/` |
| Ops | `supervisor/tapeya.conf`, `PurgeOldPushNotificationLogsCommand` |

---

## Critical — fix before production

### 1. iOS: APNs token vs FCM token (delivery blocker)

**Problem**

- **App:** Capacitor `@capacitor/push-notifications` on iOS returns an **APNs device token** (no Firebase Messaging pod in `Podfile`).
- **Server:** `FcmPushDriver` sends to **FCM HTTP v1** using `message.token`, which expects an **FCM registration token**.

**Impact:** Android tokens may work; **iOS tokens will fail at send time** (invalid token errors in logs).

**Fix options**

- Add **Firebase Messaging** on iOS and register/send **FCM tokens**, or
- Add a separate **APNs driver** for iOS tokens (more work).

**Action:** Must test on a **real iPhone** before calling iOS done.

---

### 2. App: registration listener order (token often never saved)

**Problem**

In `usePushNotifications.js`, `PushNotifications.register()` runs **before** the `registration` listener is attached. Capacitor docs require **listeners before `register()`**. The token event can fire before the listener exists → no `POST /device-tokens`.

**Also:** Token is stored in `localStorage` (`tapeya_fcm_token`) but **never re-posted on login** if the OS does not fire `registration` again (common on re-login / account switch).

**Impact:** Intermittent “no device tokens” in production; matches simulator testing showing 0 tokens in DB.

**Fix**

1. Add all listeners first, then call `register()`.
2. On successful auth, `POST` the token from `localStorage` if present (re-associate token with current user).

---

### 3. API: token validation vs DB column length

**Problem**

- `RegisterDeviceTokenRequest` allows `token` up to **4096** characters.
- Migration defines `token` as **`string(512)`**.

**Impact:** With strict SQL mode → insert failures. Without → silent truncation and broken delivery/lookup.

**Fix:** Align validation to `max:512` (or widen the column deliberately with migration).

---

### 4. API: order listeners can break HTTP responses

**Problem**

`PushNotificationService::resolveTitleAndBody()` calls `findTemplate()` **before** the `push_enabled` check. Missing/inactive template → `RuntimeException`.

`OrderPlacedPushListener` and `OrderStatusUpdatedPushListener` are **synchronous** (not queued). A template/seed mistake can cause **500 responses on order place/update** even when push is disabled.

**Fix (pick one or combine)**

- Check `enabled` before template resolution.
- Catch/log template errors in listeners; never bubble to HTTP.
- Queue push listeners.

---

### 5. Job retries can duplicate push deliveries

**Problem**

`SendPushNotificationJob` only skips work when `status === SENT`. On partial success + exception + retry (up to 3 tries), tokens already successfully sent in earlier chunks may receive the notification again.

**Also:** Logs can remain stuck in `processing` if the worker is killed mid-job.

**Fix**

- Treat `PARTIAL` / `PROCESSING` with idempotency rules.
- Track sent token batches or use `ShouldBeUnique` on `log_id`.
- Optional: scheduled sweep for stale `processing` logs.

---

## High priority — fix soon

| Issue | Detail |
|--------|--------|
| **Duplicate status pushes** | `OrderStatusUpdatedPushListener` ignores `$event->previousStatus` → re-submitting the same order status sends duplicate pushes |
| **No logout unregister** | `DELETE /device-tokens` removed by design — tokens stay active; logged-out users on same device may still receive user-targeted pushes until FCM invalidates the token |
| **Android `google-services.json`** | Not in repo — release/CI builds need it at `app/android/app/google-services.json` |
| **iOS rich notification images** | `FcmPushDriver` lacks `apns.fcm_options.image` and `mutable-content: 1` — image URL may not display on iOS |
| **Silent failures in app** | `registration`, `registrationError`, and API errors are swallowed — hard to debug in production |
| **Backoffice dialog errors** | Send/template save dialogs use `error: () => undefined` — no toast on failure |
| **Send dialog client validation** | `image_url` has no URL validator on client (backend validates) |
| **Zero automated tests** | No API or app tests for push flow |
| **Broadcast scale** | FCM sends one HTTP request per token (pools of 100) — large broadcasts may hit job `timeout = 120` or block the queue worker |
| **Admin broadcast scope** | Any admin can send to **all** active tokens — no extra permission, confirmation step, or send throttle (device register is throttled 60/min) |
| **FCM credential cache** | Access token cached 3300s — revoked service account may fail until cache expires |
| **Purge command** | Single bulk `delete()` — large tables may cause long locks; consider chunking |
| **Service account JSON size** | Admin validation `max:8192` may be tight for pretty-printed Firebase JSON |

---

## Accepted / intentional design decisions

| Decision | Tradeoff |
|----------|----------|
| **No DELETE `/device-tokens`** | Simpler logout; stale tokens until FCM deactivates or user re-registers on login |
| **No admin-editable template `name` / `key`** | System identifiers stay internal; admins edit title/body templates only |
| **Log purge (7 days)** | Good ops hygiene; audit trail is short |
| **`push_enabled` default 0** | Safe default; must enable in System Settings for live sends |
| **Immutable push logs** | No admin delete API; scheduled purge only |

---

## What looks good

- Layered pipeline: `PushNotificationService` → queued `SendPushNotificationJob` → `PushSender` → `FcmPushDriver`
- Immutable audit trail in `push_notification_logs` with status, counts, `triggered_by`, timestamps
- Template renderer; kill switch when `push_enabled !== 1`
- FCM: HTTP pooling (100), invalid-token detection, deactivate stale tokens, encrypted service account in settings
- Admin routes behind `auth:api` + `admin.only`
- Manual broadcast template blocked from PATCH in backoffice
- Android `POST_NOTIFICATIONS`; iOS entitlements (`development` / `production`); `AppDelegate` APNs hooks
- Backoffice filter enums from API; template live preview
- Supervisor: `--queue=default,push-notifications`
- Scheduled log purge daily at 04:00 (`push-notifications:purge-old-logs --days=7`)

---

## End-to-end workflow validation

| Workflow | Status |
|----------|--------|
| User grants permission → token → `POST /device-tokens` | **Broken/unreliable** (listener race + no re-post on login) |
| User logout → token cleanup | **Removed** (by design) |
| Order placed → push | **Works if** templates seeded, push enabled, queue running, token exists |
| Order status updated → push | **Works** but may duplicate on unchanged status |
| Admin manual broadcast | **Works for Android FCM tokens**; iOS likely fails until token strategy fixed |
| Template edit in backoffice | **OK** |
| Push disabled in settings | Creates failed log, no job — **OK** |
| Missing/inactive template | **Can 500 order APIs** — bad |
| FCM invalid token on send | Token deactivated — **OK** |
| Queue worker not running | Logs stuck `queued` — ops must monitor |
| Log retention | Daily purge — **OK** |

---

## Token registration flow (current vs expected)

### Current (problematic)

```
Login → checkPermissions → register() → [token event may fire here] → addListener('registration') → POST /device-tokens (often missed)
```

### Expected

```
Login → checkPermissions → addListener('registration') → register() → POST /device-tokens
       → also POST stored token from localStorage if listener already fired
```

### When API is called

| Condition | Required |
|-----------|----------|
| Native app (not web) | Yes |
| User logged in (`accessToken`) | Yes |
| Notification permission granted | Yes |
| FCM/APNs returns token | Yes |

Logout does **not** call the API (unregister removed).

---

## Pre-production ops checklist

1. Run migrations + `PushNotificationTemplateSeeder` + `SystemSettingsSeeder`
2. System Settings: `push_enabled = 1`, FCM project ID + service account JSON
3. Firebase Console: APNs `.p8` key uploaded for iOS app
4. Place **`google-services.json`** in `app/android/app/` (CI/build pipeline)
5. Ensure **`GoogleService-Info.plist`** matches production Firebase project
6. Queue worker running with `push-notifications` queue (`supervisor/tapeya.conf`)
7. Cron / `schedule:work` running (log purge + other scheduled tasks)
8. E2E test on **real Android device** and **real iPhone** (simulator alone is insufficient for iOS FCM)

---

## Recommended fixes before commit

Priority order:

1. **Fix `usePushNotifications`:** listeners before `register()` + re-POST stored token on login
2. **Fix token validation:** `max:512` to match DB column
3. **Harden listeners:** do not throw on missing template; check `enabled` before template lookup
4. **iOS FCM token strategy:** Firebase Messaging SDK on client or APNs driver on server
5. **Skip push when `previousStatus === new status`** in `OrderStatusUpdatedPushListener`
6. **Job idempotency:** avoid duplicate sends on retry after partial success
7. **Backoffice:** error toasts on send/save failure
8. **Tests:** service, job, device token controller, listener smoke tests

---

## Test gaps (none implemented)

| Priority | Scenario |
|----------|----------|
| High | `PushNotificationService`: disabled vs enabled; missing/inactive template; manual broadcast |
| High | `SendPushNotificationJob`: no tokens, all success, partial, exception + retry (duplicate sends) |
| High | `FcmPushDriver`: mock HTTP — success, UNREGISTERED, invalid token deactivation |
| High | `DeviceTokenController::store` — validation, `updateOrCreate`, auth |
| Medium | Order push listeners — must not break order HTTP; delivered vs other statuses |
| Medium | Admin `send` — auth, validation, creates `ALL` + `ADMIN` log |
| Medium | `PurgeOldPushNotificationLogsCommand` retention |
| Low | Template PATCH rules (`manual_broadcast` blocked) |

---

## Commit readiness matrix

| Criterion | Ready? |
|-----------|--------|
| Architecture | Yes |
| Backoffice UI | Yes (minor UX gaps) |
| Android E2E (with config + fixes) | After critical fixes |
| iOS E2E | **No** until FCM token issue resolved |
| Production reliability | **No** until critical items addressed |
| Test coverage | **No** |
| Ops (queue, scheduler, settings) | Documented; verify on target env |

---

## Schema / index notes

| Item | Note |
|------|------|
| `device_tokens (user_id, token)` unique | Good |
| `device_tokens.token` length 512 | Align API validation |
| Composite index `(user_id, is_active)` | Recommended for user-targeted sends at scale |
| `push_notification_logs` indexes | Reasonable for admin list filters |

---

## Security notes

- Device token register: authenticated, throttled 60/min — OK
- Admin broadcast: fan-out to all active tokens — acceptable for trusted admins; consider confirmation for large sends
- Service account JSON: encrypted in settings — OK
- Users can register tokens for their account only — OK

---

## Related docs

- [push-notifications-design.md](./push-notifications-design.md) — original design (Phase 1 MVP + Phase 2 templates)
