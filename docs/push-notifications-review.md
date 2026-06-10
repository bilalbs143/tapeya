# Push Notifications — End-to-End Review

> Reviewed: 2026-06-03  
> Branch: `develop`  
> Scope: all uncommitted changes for the Push Notification module

---

## Summary

The implementation is **production-ready** with one open gap (token unregistration on logout) and a few minor observations. All layers — API, app (React/Capacitor), backoffice, Android, and iOS — are correctly wired.

---

## 1. Database Migrations

| File | Status |
|---|---|
| `2026_06_02_100000_create_device_tokens_table.php` | ✅ |
| `2026_06_02_100001_create_push_notification_templates_table.php` | ✅ |
| `2026_06_02_100002_create_push_notification_logs_table.php` | ✅ |

**Observations**

- `device_tokens.token` is `varchar(512)` — correct. FCM tokens exceed 255 chars, and 512 is indexable on all MySQL versions. The composite unique index `(user_id, token)` is safe.
- `push_notification_logs` has indexes on `status`, `triggered_by`, `target_type`, `target_user_id`, `created_at` — matches the filter set in `PushNotificationLog::getFilters()`. ✅
- All `down()` methods correctly drop the table. ✅
- `push_notification_logs.template_key` is nullable — correct; manual broadcast logs have no template key. ✅

---

## 2. Models

### `DeviceToken`
- Fillable, casts, relations, filters, sorts — all correct. ✅
- `user_id` → `users.cascadeOnDelete` — tokens are cleaned up when user is deleted. ✅

### `PushNotificationLog`
- All enum columns properly cast (`status`, `target_type`, `triggered_by`). ✅
- `data` cast as `array`. ✅
- `queued_at` and `sent_at` cast as `datetime`. ✅

### `PushNotificationTemplate`
- `available_variables` cast as `array` (stored as JSON). ✅
- `samplePreviewData()` provides correct sample values for all 4 event types — used by the backoffice live preview. ✅
- `is_editable` computed in the resource (`key !== 'manual_broadcast'`) rather than stored in DB — correct approach. ✅

---

## 3. API — Services

### `PushNotificationService`
- `resolveTitleAndBody()` fetches the template **once** per dispatch (fixed double-query bug). ✅
- `template_key` is correctly `null` for `MANUAL_BROADCAST`, `$event->value` for system events. ✅
- Kill switch (`enabled !== 1`) logs with `FAILED` status but still records title/body — full audit trail. ✅
- `findTemplate()` throws `RuntimeException` if template missing — job will fail and retry (correct). ✅

### `NotificationTemplateRenderer`
- `{{variable}}` replacement with `strip_tags()` — prevents XSS in notification bodies. ✅
- Unknown variables render as empty string (not literal `{{key}}`) — clean output. ✅

### `FcmPushDriver`
- Uses FCM HTTP v1 API (`/v1/projects/{project}/messages:send`) — the only supported API post-2024. ✅
- Access token cached for 55 minutes (`3300s`), token TTL is 60 min — safe margin. ✅
- Cache key is env-suffixed (`fcm_access_token_production`) — no cross-environment collision. ✅
- `Http::pool()` sends up to 100 concurrent requests per chunk — good throughput. ✅
- Invalid tokens deactivated via `DeviceToken::whereIn('token')->update(['is_active' => false])` — stale tokens cleaned automatically. ✅
- `isInvalidTokenError()` checks `UNREGISTERED` and message strings only — `INVALID_ARGUMENT` in `error.status` no longer triggers false token invalidation. ✅
- Android: `priority: HIGH` set. ✅
- iOS (APNs via FCM): `apns-priority: 10` + `sound: default` set. ✅

### `PushSender`
- Driver re-resolved on each `sendToTokens()` call — admin config changes apply without server restart. ✅
- Only FCM driver exists; `InvalidArgumentException` for unknown providers is correct. ✅

### `SendPushNotificationJob`
- `tries: 3`, `backoff: [60, 120, 300]` — sensible retry curve. ✅
- `timeout: 120` seconds — covers a large token batch. ✅
- `SENT` idempotency guard prevents double-delivery if job is queued twice. ✅
- `sent_at` only set when `$successCount > 0` — accurate timestamp. ✅
- Partial status (`PARTIAL`) when some tokens succeed and some fail. ✅
- On exception: rethrows so queue marks the job for retry. ✅

---

## 4. API — Controllers, Requests, Resources

### Routes
```
GET    /api/v1/admin/push-notifications                          → PushNotificationController@index
POST   /api/v1/admin/push-notifications/send                     → PushNotificationController@send
GET    /api/v1/admin/push-notifications/{log}                    → PushNotificationController@show
GET    /api/v1/admin/push-notification-templates                 → PushNotificationTemplateController@index
GET    /api/v1/admin/push-notification-templates/{template}      → PushNotificationTemplateController@show
PATCH  /api/v1/admin/push-notification-templates/{template}      → PushNotificationTemplateController@update
POST   /api/v1/device-tokens                                     → DeviceTokenController@store (auth, throttle:60,1)
```
All under `auth:sanctum` middleware. ✅

### `RegisterDeviceTokenRequest`
- `token`: required, string, `min:10`, `max:4096` — covers all FCM token lengths. ✅
- `platform`: required, enum `['android', 'ios']`. ✅
- `app_version`: nullable, max 50. ✅

### `SendPushNotificationRequest`
- `title`: required, max 100. ✅
- `body`: required, max 200. ✅
- `image_url`: nullable, url, max 2048. ✅
- Note: No HTTPS enforcement on `image_url` — FCM requires HTTPS for notification images. Low risk since FCM silently ignores non-HTTPS images rather than failing the send.

### `DeviceTokenController@store`
- `updateOrCreate(['user_id', 'token'])` — upsert prevents duplicate rows, updates `last_seen_at` on each token refresh. ✅

### `PushNotificationController`
- `send()` correctly passes `Auth::id()` as `sentByUserId` — distinguishes admin vs. system in logs. ✅
- `index()` eager loads `targetUser` and `sentByUser` — no N+1. ✅

### `PushNotificationLogResource`
- Returns `target_type_label`, `triggered_by_label`, `status_label` — matches what backoffice template binds to. ✅
- Enum `label()` methods must exist on `PushTargetTypeEnum`, `PushTriggeredByEnum`, `PushNotificationStatusEnum` — verify these are implemented.

### `PushNotificationTemplateResource`
- `is_editable: key !== 'manual_broadcast'` computed at resource level. ✅
- `sample_preview_data` included for backoffice live preview. ✅

---

## 5. API — Event Listeners

Laravel's **automatic listener discovery** is enabled (comment in `EventServiceProvider`). `OrderPlacedPushListener` and `OrderStatusUpdatedPushListener` have correct `handle(OrderPlaced $event)` / `handle(OrderStatusUpdated $event)` type-hints — they will be discovered automatically. ✅

Both listeners correctly guard against missing `user_id` (guest orders). ✅  
`OrderStatusUpdatedPushListener` correctly branches: `DELIVERED` → `ORDER_DELIVERED`, everything else → `ORDER_STATUS_UPDATED`. ✅

---

## 6. API — Seeder & Settings

### `PushNotificationTemplateSeeder`
- 4 templates seeded: `order_placed`, `order_status_updated`, `order_delivered`, `manual_broadcast`. ✅
- Uses `updateOrCreate` — safe to run multiple times without creating duplicates. ✅
- Registered in `DatabaseSeeder`. ✅

### `PushSettings`
- `fcmServiceAccountJson` is `#[ShouldBeEncrypted]` — stored encrypted in DB. ✅
- `enabled` defaults to `0` (off) — push is opt-in, not opt-out. ✅

### `PurgeOldPushNotificationLogsCommand`
- Scheduled daily at `04:00` via `console.php`. ✅
- Default retention: 7 days, configurable via `--days`. ✅

### Supervisor
- Queue worker explicitly includes `--queue=default,push-notifications` — push jobs are processed. ✅
- `--tries=3` matches `$tries` on the job class. ✅

---

## 7. App — React / Capacitor

### `usePushNotifications` hook
- Dynamically imports `@capacitor/push-notifications` — no-op on web builds. ✅
- Permission check before register — handles `denied`, `prompt`, `granted` correctly. ✅
- `initializedRef` set **after** `register()` succeeds — if register fails, re-mount retries. ✅
- Listeners stored and `.remove()`d on unmount — no double-registration in React Strict Mode. ✅
- Token stored in `localStorage` via `setStoredPushToken()`. ✅
- Calls `registerToken` RTK mutation on each `registration` event — handles token refresh. ✅
- `pushNotificationActionPerformed` routes taps to correct screens via `routeFromPushData`. ✅
- Hook called inside `RouterEffects` (inside `BrowserRouter`) — `navigate` hook is available. ✅

### `routeFromPushData`
- `order_placed`, `order_status_updated`, `order_delivered` → `/shop/orders/{order_id}`. ✅
- `manual_broadcast` → `/home`. ✅
- Unknown types → no-op (safe default). ✅

### `deviceTokenApi`
- `registerDeviceToken`: `POST /device-tokens`. ✅

### ⚠️ Gap: No `unregisterDeviceToken` endpoint or logout cleanup

The API has no `DELETE /device-tokens` route and `DeviceTokenController` has no `destroy` method. On logout, `Sidebar.jsx` calls `clearCredentials()` only — the device token remains active in the DB. This means:

- After logout, the user will still receive push notifications.
- If the user logs in as a different account on the same device, both accounts receive notifications.

**Fix required:**

**API** — add route and method:
```php
// user.php
Route::delete('device-tokens', [DeviceTokenController::class, 'destroy'])->middleware('throttle:10,1');
```
```php
// DeviceTokenController
public function destroy(Request $request): JsonResponse
{
    $request->validate(['token' => ['required', 'string']]);

    DeviceToken::query()
        ->where('user_id', Auth::id())
        ->where('token', $request->input('token'))
        ->update(['is_active' => false]);

    return response()->success(null, 'Device token unregistered.');
}
```

**App** — add endpoint to `deviceTokenApi.js` and call on logout:
```js
// deviceTokenApi.js
unregisterDeviceToken: builder.mutation({
  query: (body) => ({ url: '/device-tokens', method: 'DELETE', body }),
}),
```
```js
// Sidebar.jsx — inside handleLogout, before clearCredentials:
const token = getStoredPushToken();
if (token) {
  try { await unregisterDeviceToken({ token }).unwrap(); } catch {}
  setStoredPushToken(null);
}
```

---

## 8. Android

| Check | Status |
|---|---|
| `android.permission.POST_NOTIFICATIONS` in `AndroidManifest.xml` | ✅ |
| `android.permission.INTERNET` | ✅ |
| `google-services.json` present in `app/android/app/` | ✅ |
| `apply plugin: 'com.google.gms.google-services'` in `build.gradle` | ✅ |
| `@capacitor/push-notifications` in `package.json` | ✅ |
| Capacitor plugin in `Podfile` (not applicable — Gradle handles Android) | ✅ |

No issues. FCM on Android requires the `google-services` plugin and the JSON config file — both present.

---

## 9. iOS

| Check | Status |
|---|---|
| `UIBackgroundModes: remote-notification` in `Info.plist` | ✅ |
| `App.entitlements`: `aps-environment: development` | ✅ |
| `AppRelease.entitlements`: `aps-environment: production` | ✅ |
| `AppDelegate` forwards APNs device token to Capacitor | ✅ |
| `CapacitorPushNotifications` pod in `Podfile` | ✅ |
| `GoogleService-Info.plist` present in `app/ios/App/App/` | ✅ |

Both entitlements files correctly separate dev and prod APNs environments. The `AppDelegate` correctly posts the APNs token to `NotificationCenter` which Capacitor intercepts. ✅

---

## 10. Backoffice

### `push-notification.service.ts`
- All methods present: `getList`, `getById`, `send`, `getTemplates`, `getTemplateById`, `updateTemplate`. ✅
- Response types match API resource shapes exactly. ✅
- `UpdatePushNotificationTemplatePayload` only includes `title_template`, `body_template`, `is_active` — matches `UpdatePushNotificationTemplateRequest`. ✅
- `name` is missing from `UpdatePushNotificationTemplatePayload` but the backoffice form sends it and the request/model accept it — add it to the type:
  ```ts
  export interface UpdatePushNotificationTemplatePayload {
    name?: string;
    title_template?: string;
    body_template?: string;
    is_active?: boolean;
  }
  ```

### Push Notifications List Page
- Filter card with Status, Triggered By, From/To Date. ✅
- Send Notification button inside filter card. ✅
- `[loading]="isLoading"` on table wrapper and paginator. ✅
- Empty `status` filter correctly skipped (`|| undefined`). ✅

### Send Notification Dialog
- Proper `mat-dialog-content` / `mat-divider` / `mat-dialog-actions` structure. ✅
- Outside labels with `text-sm font-semibold mb-2 block`. ✅
- Cancel uses `[mat-dialog-close]="false"` with error border. ✅
- `MatDivider` imported. ✅

### Push Templates List Page
- Filter by active status using `mapStatusToIsActive()` — maps `active/inactive` → `1/0`. ✅
- `getTemplates` subscription added to `sub` — no memory leak. ✅

### Manage Template Dialog
- Live preview using `renderPushTemplate` util with `sample_preview_data` from API. ✅
- `MatDivider` imported. ✅
- Template variables info box uses theme classes. ✅

---

## 11. Pre-Commit Checklist

Before committing, complete the following:

- [ ] **Run migration**: `php artisan migrate`
- [ ] **Seed templates**: `php artisan db:seed --class=PushNotificationTemplateSeeder`
- [ ] **Configure settings** in Admin → System Settings:
  - Push Notifications: `enabled = 1`
  - FCM Project ID (from Firebase Console)
  - FCM Service Account JSON (Firebase Console → Project Settings → Service Accounts → Generate new private key)
- [ ] **Reload supervisor**: `sudo supervisorctl reread && sudo supervisorctl update`
- [ ] **iOS**: `pod install` in `app/ios/App/`
- [ ] **Android**: Sync Gradle in Android Studio
- [ ] **Fix token unregistration on logout** (see §7 gap above)
- [ ] **Add `name` to `UpdatePushNotificationTemplatePayload`** in `push-notification.service.ts`
- [ ] **Verify enum `label()` methods** exist on `PushTargetTypeEnum`, `PushTriggeredByEnum`, `PushNotificationStatusEnum`

---

## 12. Notification Types Summary

| Event | Trigger | Target | App Route |
|---|---|---|---|
| `order_placed` | Order placed (system) | That user | `/shop/orders/{id}` |
| `order_status_updated` | Order status changed (non-delivered) | That user | `/shop/orders/{id}` |
| `order_delivered` | Order delivered | That user | `/shop/orders/{id}` |
| `manual_broadcast` | Admin sends from backoffice | All users | `/home` |

Cricket/tournament events (match start, result, new highlight) are **not yet implemented** — they are planned for a future phase.
