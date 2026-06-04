# Push Notifications — Final Review

> Date: 2026-06-03 | Branch: `develop`  
> Sources: code inspection + two prior review passes reconciled  
> Scope: all uncommitted push-related changes across **api**, **app**, **backoffice**, **supervisor**

---

## Overall Verdict

**Safe to commit as a feature branch. Code fixes from this review are applied; iOS still requires real-device verification before production.**

- Backend architecture is solid.
- Android is correctly configured.
- iOS _may_ work with Capacitor 6 + Firebase config present, but **must be verified on a real device** — APNs→FCM token handling is done internally by the plugin and untestable on simulator.
- Critical code fixes **#1–#3** are **done** (see [Fix log](#fix-log)).
- Item **#4** remains a **manual QA step** on a physical iPhone.

---

## Fix log

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Listener race + re-post token on login | ✅ Done | `app/src/hooks/usePushNotifications.js` |
| 2 | Token validation `max:512` | ✅ Done | `RegisterDeviceTokenRequest.php` |
| 3 | Order listeners try/catch | ✅ Done | Both order push listeners |
| 4 | iOS token strategy | ⏳ Manual QA | Test on real iPhone before prod |
| 5 | Skip unchanged order status | ✅ Done | `OrderStatusUpdatedPushListener.php` |
| 6 | Job retry duplicate note | ✅ Done | Comment in `SendPushNotificationJob.php` |
| 7 | Enum `label()` methods | ✅ Verified | All push enums implement `label()` |
| 8 | Backoffice error toasts | ✅ Done | Send + template edit dialogs |
| 9 | Composite index `(user_id, is_active)` | ✅ Done | Migration `2026_06_03_100000_...` |
| 10 | Logout token unregister | ⏸ Deferred | Intentional v1 — no DELETE API |
| 11 | `name` in TS update payload | ⏸ N/A | Display name is fixed/read-only by design |

---

## Critical — Fix Before Production

### 1. Listener Race: `register()` called before `addListener('registration')`

**Status: ✅ Fixed**

**File:** `app/src/hooks/usePushNotifications.js`

The current code:
```js
await PushNotifications.register();          // ← triggers token generation
initializedRef.current = true;
listeners.push(
  await PushNotifications.addListener('registration', ...) // ← listener added after
);
```

Capacitor docs require listeners to be attached **before** calling `register()`. On fast devices (especially Android), the `registration` event fires before the listener exists — the token is never received, never stored, never posted to the API. This is an intermittent bug that is invisible in testing but causes "no device tokens" in production.

**Fix:** Move all `addListener` calls above `register()`:
```js
// 1. Attach all listeners first
listeners.push(await PushNotifications.addListener('registration', ...));
listeners.push(await PushNotifications.addListener('registrationError', ...));
listeners.push(await PushNotifications.addListener('pushNotificationActionPerformed', ...));

// 2. Then trigger registration
await PushNotifications.register();
initializedRef.current = true;
```

**Also:** On re-login (account switch), the OS does not re-fire `registration` if the token is unchanged. The stored token in `localStorage` is not re-posted to the API for the new user. Fix: after `register()` succeeds, check `getStoredPushToken()` and POST it if the listener won't fire again:
```js
await PushNotifications.register();
initializedRef.current = true;

// Re-associate stored token with the current user session
const storedToken = getStoredPushToken();
if (storedToken && !cancelled) {
  const platform = Capacitor.getPlatform();
  try {
    await registerToken({ token: storedToken, platform,
      app_version: import.meta.env.VITE_APP_VERSION || undefined }).unwrap();
  } catch { /* registration event will handle it */ }
}
```

---

### 2. Token validation exceeds DB column length

**Status: ✅ Fixed**

**Files:** `api/app/Http/Requests/User/RegisterDeviceTokenRequest.php`, `api/database/migrations/2026_06_02_100000_create_device_tokens_table.php`

- Migration: `string('token', 512)` → max 512 chars.
- Request validation: `max:4096` → accepts up to 4096 chars.

With strict SQL mode (default on MySQL 8): INSERT fails silently or throws. Without: token truncated to 512 → invalid token stored → all deliveries to that device fail.

**Fix:** Align validation to match the column:
```php
'token' => ['required', 'string', 'min:10', 'max:512'],
```
FCM registration tokens are currently ~160 chars; 512 is safe headroom.

---

### 3. Synchronous listeners can 500 order API responses

**Status: ✅ Fixed**

**Files:** `api/app/Listeners/OrderPlacedPushListener.php`, `api/app/Listeners/OrderStatusUpdatedPushListener.php`

Both listeners run **synchronously** within the HTTP request lifecycle. `PushNotificationService::resolveTitleAndBody()` calls `findTemplate()` which throws `RuntimeException` if the template is missing or inactive.

If the seeder hasn't run, a template is accidentally deactivated, or DB is unavailable:
- `POST /orders` → 500 (order placement fails for user)
- `PATCH /orders/{id}/status` → 500 (order update fails)

Push notifications must never break the primary business flow.

**Fix — wrap listener bodies in try/catch:**
```php
// OrderPlacedPushListener
public function handle(OrderPlaced $event): void
{
    try {
        // ... existing dispatch logic
    } catch (\Throwable $e) {
        Log::error('OrderPlacedPushListener failed', ['error' => $e->getMessage()]);
    }
}
```
Apply the same pattern to `OrderStatusUpdatedPushListener`.

---

### 4. iOS Token Strategy — Verify on Real Device

**Status: ⏳ Manual QA required (not a code change)**

The Capacitor `@capacitor/push-notifications` plugin (v6) on iOS uses Firebase Messaging SDK internally when `GoogleService-Info.plist` is present in the project. It returns an **FCM registration token** (not a raw APNs token), which is what `FcmPushDriver` expects.

`GoogleService-Info.plist` **is present** at `app/ios/App/App/GoogleService-Info.plist`. ✅  
`AppDelegate` correctly forwards the APNs device token to `NotificationCenter` for Capacitor. ✅

However, this token exchange happens via Firebase SDK internals and **cannot be verified on a simulator** — simulators don't receive real APNs tokens. The only way to confirm iOS push delivery is:

**Action required:** Test on a real iPhone with the development build. Confirm:
1. Token stored in `localStorage` after login
2. Token appears in `device_tokens` table with `platform = 'ios'`
3. Manual broadcast from backoffice delivers to the device

If the stored token starts with the FCM format (`fGH...` / `cGH...` long alphanumeric), delivery will work. If it's a hex APNs token (`a3b4c5...` 64-char hex), a separate APNs driver or Firebase Messaging SDK integration is needed.

---

## High Priority — Fix Soon

### Duplicate pushes on unchanged order status

**Status: ✅ Fixed**

**File:** `api/app/Listeners/OrderStatusUpdatedPushListener.php`

The listener ignores `$event->previousStatus`. If order status is updated to the same value (admin re-saves without changing status), a push is sent again. Users receive duplicate "Order status is now: Processing" notifications.

**Fix:**
```php
public function handle(OrderStatusUpdated $event): void
{
    if ($event->previousStatus !== null
        && $event->previousStatus === $event->order->status) {
        return; // status unchanged, skip push
    }
    // ...
}
```

---

### No token unregistration on logout

**Status: ⏸ Deferred (intentional v1)**

**Files:** `app/src/components/Sidebar.jsx`, API routes, `DeviceTokenController`

On logout, `clearCredentials()` is called but the device token remains `is_active = true` in the DB. Consequences:
- User continues receiving push notifications after logout.
- If a different user logs into the same device, the previous user's token still triggers their notifications on user-targeted sends.

This is currently documented as an intentional design decision. It is acceptable for a v1 launch if the app is single-user-per-device. However it should be implemented before multi-account support.

**Fix when ready:**

API (`user.php`):
```php
Route::delete('device-tokens', [DeviceTokenController::class, 'destroy'])
    ->middleware('throttle:10,1');
```

API (`DeviceTokenController`):
```php
public function destroy(Request $request): JsonResponse
{
    $request->validate(['token' => ['required', 'string', 'max:512']]);
    DeviceToken::query()
        ->where('user_id', Auth::id())
        ->where('token', $request->input('token'))
        ->update(['is_active' => false]);
    return response()->success(null, 'Device token unregistered.');
}
```

App (`deviceTokenApi.js`):
```js
unregisterDeviceToken: builder.mutation({
  query: (body) => ({ url: '/device-tokens', method: 'DELETE', body }),
}),
```

App (`Sidebar.jsx` inside `handleLogout`):
```js
const token = getStoredPushToken();
if (token) {
  try { await unregisterDeviceToken({ token }).unwrap(); } catch {}
  setStoredPushToken(null);
}
```

---

### Job retry can re-deliver to already-sent tokens

**Status: ✅ Documented (Phase 1 trade-off accepted)**

**File:** `api/app/Jobs/SendPushNotificationJob.php`

On partial failure + exception + retry (up to 3 tries), tokens that were already successfully sent in earlier chunks receive the notification again. The `SENT` guard only prevents re-runs when the log is already fully complete.

This is a Phase 1 trade-off. Add a code comment to document it and consider for Phase 2:
```php
// Phase 1 note: chunk-level idempotency is not implemented.
// On retry after partial success + exception, already-delivered tokens
// receive a duplicate send. Acceptable for MVP; revisit for Phase 2.
```

---

### `name` missing from `UpdatePushNotificationTemplatePayload` TypeScript type

**Status: ⏸ N/A — display name is fixed/read-only**

**File:** `backoffice/src/app/services/push-notification.service.ts`

Display name is no longer sent on PATCH; only `title_template`, `body_template`, and `is_active` are editable.

### Verify enum `label()` methods exist

**Status: ✅ Verified**

**Files:** `api/app/Enums/Push/PushTargetTypeEnum.php`, `PushTriggeredByEnum.php`, `PushNotificationStatusEnum.php`

All three enums implement `label(): string` via `BaseEnumTrait` pattern.

### Backoffice dialogs swallow errors silently

**Status: ✅ Fixed**

**Files:** send dialog, template edit dialog

Both dialogs now call `MessageService.error(...)` on API failure.

## Accepted / Intentional Design Decisions

| Decision | Rationale |
|---|---|
| No `DELETE /device-tokens` in v1 | Simpler logout flow; FCM deactivates stale tokens eventually |
| `push_enabled` defaults to `0` | Safe default — push is opt-in via System Settings |
| Log purge at 7 days | Short audit trail is sufficient for ops; configurable via `--days` |
| Template `key` is immutable | Prevents breaking system-event dispatch |
| Immutable push logs | No admin delete; scheduled purge only |
| Partial delivery on chunk failure | Phase 1 trade-off; acceptable for MVP scale |

---

## What's Solid ✅

**API:**
- Layered pipeline: `PushNotificationService` → `SendPushNotificationJob` → `PushSender` → `FcmPushDriver`
- FCM HTTP v1 API (only supported post-2024)
- Access token cached 55 min (3300s) with env-scoped cache key
- 100-concurrent pool per chunk via `Http::pool()`
- Stale token deactivation on `UNREGISTERED` error
- `INVALID_ARGUMENT` narrowed — no more false token invalidation
- Encrypted service account JSON in settings
- `sent_at` only set when at least one token succeeded
- Template renderer with `strip_tags()` XSS protection
- Kill switch with full audit log even when disabled
- `template_key = null` for manual broadcast (correct)
- Laravel auto-discovery picks up both order listeners
- `updateOrCreate` on token store — handles token refresh correctly
- No N+1 on log list (eager loads `targetUser`, `sentByUser`)
- `PushNotificationTemplateSeeder` uses `updateOrCreate` — idempotent

**Android:**
- `POST_NOTIFICATIONS` permission in manifest ✅
- `google-services.json` present in repo ✅
- `apply plugin: 'com.google.gms.google-services'` in `build.gradle` ✅
- Android priority `HIGH` set in FCM message ✅

**iOS:**
- `UIBackgroundModes: remote-notification` in `Info.plist` ✅
- Separate entitlements: `development` / `production` APNs environments ✅
- `AppDelegate` forwards APNs token to Capacitor correctly ✅
- `GoogleService-Info.plist` present ✅
- `CapacitorPushNotifications` pod wired in `Podfile` ✅

**App:**
- Dynamic import of push plugin — zero-cost on web ✅
- `initializedRef` prevents double-init across re-mounts ✅
- Listeners cleaned up on unmount ✅
- `routeFromPushData` handles all 4 event types ✅
- Hook inside `RouterEffects` — `navigate` available ✅

**Backoffice:**
- All API response types match resource shapes ✅
- Empty status filter skipped (`|| undefined`) — no `filter[status]=` bug ✅
- Template subscription added to `sub` — no memory leak ✅
- Live preview with sample data from API ✅
- `MatDivider` imported in both dialogs ✅

**Ops:**
- `--queue=default,push-notifications` in supervisor ✅
- `--tries=3` matches job class ✅
- Log purge scheduled daily at 04:00 ✅

---

## End-to-End Workflow Status

| Workflow | Status | Blocker |
|---|---|---|
| Permission → token → `POST /device-tokens` | ✅ Fixed | Re-test on device after listener fix |
| Re-login token re-association | ✅ Fixed | Stored token re-posted after `register()` |
| Token max length | ✅ Fixed | Validation aligned to 512 |
| Order placed → push | ✅ Safe | Listener errors logged, not thrown |
| Order status updated → push | ✅ Fixed | Unchanged status skipped |
| Admin manual broadcast (Android) | ✅ Works | — |
| Admin manual broadcast (iOS) | ❓ Unverified | Real iPhone test required |
| Push disabled → failed log | ✅ Correct | — |
| Missing template → listener crash | ✅ Fixed | try/catch on listeners |
| Invalid FCM token | ✅ Deactivated | — |
| Logout token cleanup | ⏸ Deferred | Intentional v1 |
| Log purge | ✅ Scheduled | — |
| Backoffice send error feedback | ✅ Fixed | Error toasts added |

---

## Pre-Commit Checklist

### Code fixes (before merging to main)
- [x] Fix listener race — add listeners before `register()` + re-POST stored token on login
- [x] Fix token validation — change `max:4096` to `max:512`
- [x] Wrap order listeners in try/catch — prevent push bugs from breaking order APIs
- [x] ~~Add `name` to `UpdatePushNotificationTemplatePayload`~~ — N/A (display name fixed)
- [x] Verify `label()` method on `PushTargetTypeEnum`, `PushTriggeredByEnum`, `PushNotificationStatusEnum`
- [x] Add error toasts to send dialog and template edit dialog on API failure
- [x] Add skip-on-unchanged-status guard to `OrderStatusUpdatedPushListener`
- [x] Document job retry duplicate-send trade-off in `SendPushNotificationJob`
- [x] Add composite index `(user_id, is_active)` on `device_tokens`

### Ops (on deployment)
- [ ] `php artisan migrate`
- [ ] `php artisan db:seed --class=PushNotificationTemplateSeeder`
- [ ] Admin → System Settings: `push_enabled = 1`, FCM Project ID, FCM Service Account JSON
- [ ] Firebase Console: APNs `.p8` key uploaded for iOS app (Production APN certificate)
- [ ] Reload supervisor: `sudo supervisorctl reread && sudo supervisorctl update`
- [ ] iOS: `pod install` in `app/ios/App/`
- [ ] Android: Gradle sync in Android Studio
- [ ] **Real device test** — Android: confirm token in DB + receive notification
- [ ] **Real device test** — iOS: confirm FCM token format in DB + receive notification

---

## Notification Types

| Event | Trigger | Target | App Route |
|---|---|---|---|
| `order_placed` | Order placed | That user | `/shop/orders/{id}` |
| `order_status_updated` | Status changed (non-delivered) | That user | `/shop/orders/{id}` |
| `order_delivered` | Status → delivered | That user | `/shop/orders/{id}` |
| `manual_broadcast` | Admin sends from backoffice | All users | `/home` |

Cricket/tournament events (match start, result, highlights) not yet implemented — planned for Phase 2.

---

## Schema Reference

| Table | Key columns | Indexes |
|---|---|---|
| `device_tokens` | `user_id`, `token varchar(512)`, `platform`, `is_active` | `UNIQUE(user_id, token)`, `is_active`, `user_id` |
| `push_notification_templates` | `key varchar(100)`, `title_template`, `body_template`, `available_variables json`, `is_active` | `UNIQUE(key)` |
| `push_notification_logs` | `template_key`, `title`, `body`, `target_type`, `triggered_by`, `status`, `success_count`, `failure_count`, `sent_at` | `status`, `triggered_by`, `target_type`, `target_user_id`, `created_at` |

**Recommended addition:** composite index `(user_id, is_active)` on `device_tokens` for user-targeted sends at scale:

**Status: ✅ Done** — migration `2026_06_03_100000_add_user_active_index_to_device_tokens_table.php`

```php
$table->index(['user_id', 'is_active']);
```

---

## Security

| Concern | Status |
|---|---|
| Device token register: authenticated + throttled 60/min | ✅ |
| FCM service account JSON: encrypted in settings | ✅ |
| Users can only register tokens for their own account | ✅ |
| Admin broadcast: all active tokens, no extra permission | ⚠️ Acceptable for trusted admins; add confirmation step for large sends in future |
| `image_url`: no HTTPS enforcement (FCM silently ignores HTTP images, no delivery failure) | ℹ️ Low risk |

---

*Related: [push-notifications-design.md](./push-notifications-design.md)*
