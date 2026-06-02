# Tapeya — Centralized Push Notification System
### Technical Design Document
**Date:** June 2026 · **Revision:** 2.1 (implementation-ready)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Goals and Non-Goals](#2-goals-and-non-goals)
3. [Tapeya Conventions](#3-tapeya-conventions)
4. [High-Level Architecture](#4-high-level-architecture)
5. [Database Schema](#5-database-schema)
6. [System Settings — Full Wiring](#6-system-settings--full-wiring)
7. [Push Payload Contract](#7-push-payload-contract)
8. [Core Components](#8-core-components)
9. [API Endpoints](#9-api-endpoints)
10. [System Event Integration](#10-system-event-integration)
11. [Backoffice UI](#11-backoffice-ui)
12. [Security Considerations](#12-security-considerations)
13. [Mobile App (Capacitor)](#13-mobile-app-capacitor)
14. [Operations Checklist](#14-operations-checklist)
15. [Implementation Phases](#15-implementation-phases)
16. [File Structure](#16-file-structure)
17. [Open Questions and Decisions](#17-open-questions-and-decisions)

---

## 1. Executive Summary

This document outlines the architecture and implementation plan for a centralized push notification system for the Tapeya platform. Both manual (admin-triggered) and system-triggered (automated) notifications flow through a single unified pipeline — ensuring consistent delivery, logging, templating, and configuration management.

**Revision 2 changes:** System Settings full wiring, OrderDelivered double-notify fix, listener auto-discovery, token/DELETE fixes, mobile Capacitor plan, payload contract, ops checklist.

**Revision 2.1 changes:** Idempotency goal vs Phase 1 scope, `push_enabled` audit log behaviour, supervisor `database` queue alignment, FCM string casting, sync listeners + null-user guards, Engagement routes module, Phase 2 stale-token command.

---

## 2. Goals and Non-Goals

### 2.1 Goals

- Single pipeline for all notification types (manual and system)
- Template-based notifications with dynamic variable substitution
- Full delivery history and status tracking
- Provider credentials managed via System Settings — no hardcoded keys, no `.env` credentials
- Minimal developer effort to add new notification events
- Async delivery via queue workers (non-blocking HTTP requests)
- Backoffice UI for manual broadcasts and delivery logs
- Per-device token management (register and unregister)
- Immutable delivery audit logs (including when push is disabled via kill switch)
- Per-token idempotent retries — **Phase 2** (Phase 1 may duplicate on full job retry; see §8.6)

### 2.2 Non-Goals

- **In-app notification feed** — already handled by the existing Laravel `notifications` table + Reverb (see `BroadcastUserDatabaseNotification`, `NotificationCenter`)
- **Email or SMS notifications** — handled by separate drivers (`OrderPlacedUserMailSmsNotification`, `SmsSender`)
- **Real-time delivery receipts or read receipts**
- **User segmentation and targeting** — planned for Phase 2
- **Manual broadcast appearing in in-app Notification Center** — push-only in Phase 1 (see §17 for decision)

---

## 3. Tapeya Conventions

This section documents the existing patterns that push notifications must follow for consistency.

### 3.1 Settings pattern

All infrastructure credentials live in Spatie `Settings` classes — not `.env`. Examples: `StreamingSettings`, `WhatsAppSettings`, `VeevoTechSmsSettings`, `SmsSettings`. The full wiring requires:

| Step | What to do |
|---|---|
| 1. `PushSettings.php` | New Spatie settings class in `app/Settings/` |
| 2. `config/settings.php` | Register `PushSettings::class` in the `settings` array |
| 3. `SystemSettingGroupEnum` | Add `PUSH_NOTIFICATIONS = 'push_notifications'` case |
| 4. `SystemSettingKeyEnum` | Add one case per setting key |
| 5. `SystemSettingRegistry` | Add metadata, label, description, rules, and `settings_class` for each key |
| 6. `SystemSettingsSeeder` (optional) | Seed defaults (e.g. `push_enabled = 0`, `push_provider = 'fcm'`) |

### 3.2 Boolean settings

There is **no `BOOLEAN` setting type** in the codebase. Booleans are stored as `INTEGER 0/1` — see `LIVE_CHAT_ENABLED` pattern. `push_enabled` must follow this: stored as `integer`, cast to `bool` in PHP via the settings class property type.

### 3.3 Encrypted settings

Sensitive string fields use Spatie's `#[ShouldBeEncrypted]` attribute on the property — see `VeevoTechSmsSettings::$veevotechApiKey` and YouTube refresh token in `StreamingSettings`. `push_fcm_service_account_json` must use this attribute.

### 3.4 Listener auto-discovery

The codebase uses **auto-discovery** for event listeners. Listeners in `app/Listeners/` with a typed `handle(OrderPlaced $event)` method are discovered automatically — no manual `$listen` entries in `EventServiceProvider` are needed (except for `NotificationSent`). New listeners should follow this pattern.

### 3.5 Driver resolution pattern

Follow the `SmsSender` → `SmsDriverInterface` pattern: a `PushSender` class reads `push_provider` from settings and resolves the appropriate `PushDriverInterface` implementation. `PushNotificationService` depends on `PushSender`, not directly on `FcmPushDriver`.

### 3.6 Queue setup

Default queue driver is `database` in this codebase (see `supervisor/tapeya.conf`). A dedicated `push-notifications` queue requires either a second Supervisor program or extending the existing worker with `--queue=default,push-notifications`. Jobs must call `->onQueue('push-notifications')` when dispatched.

---

## 4. High-Level Architecture

Two notification sources feed into a single unified pipeline:

- **Source 1 — Admin Backoffice:** Manual free-form broadcast via backoffice dialog
- **Source 2 — System Events:** `OrderPlaced`, `OrderStatusUpdated` (handles all status transitions including delivered)

Both sources call `PushNotificationService` (the single source of truth), which resolves via `PushSender` to the active driver:

```
┌─────────────────────────────────────────────────────────────────┐
│                     NOTIFICATION SOURCES                        │
│                                                                 │
│   [Admin Backoffice]            [System Events]                 │
│   Manual free-form broadcast    OrderPlaced, OrderStatusUpdated │
└──────────────┬──────────────────────────┬───────────────────────┘
               │                          │
               ▼                          ▼
┌─────────────────────────────────────────────────────────────────┐
│          PushNotificationService  (Single Source of Truth)      │
│                                                                 │
│  dispatch(event, data, userId?)                                 │
│    1. Resolve template + substitute variables                   │
│    2. Create push_notification_logs record (status: queued)     │
│    3. Dispatch SendPushNotificationJob to queue                 │
└──────────────────────────────┬──────────────────────────────────┘
                               │ queue: push-notifications
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SendPushNotificationJob                       │
│                                                                 │
│  1. Abort if log status already `sent`; else load tokens (chunked) │
│  2. Call PushSender → PushDriverInterface in batches            │
│  3. Update log: status, success_count, failure_count            │
│  4. Mark invalid tokens is_active = false                       │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                PushSender → PushDriverInterface                 │
│                                                                 │
│   FcmPushDriver (FCM HTTP v1)  ← Phase 1                       │
│   Future: APNs direct, OneSignal, etc.                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Database Schema

### 5.1 `device_tokens`

Stores FCM/APNs device tokens per user. One user may have multiple active devices.

> **Token column:** FCM tokens regularly exceed 255 characters. Use `text` (or at minimum `varchar(512)`).

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | Auto-increment |
| user_id | bigint FK → users | CASCADE DELETE |
| token | text | FCM registration token (can exceed 255 chars) |
| platform | varchar(20) | `android` / `ios` (Phase 1); `web` reserved for future |
| app_version | varchar(50) | Nullable |
| is_active | boolean | Default `true` |
| last_seen_at | timestamp | Updated on each app launch |
| created_at | timestamp | |
| updated_at | timestamp | |

**Constraints:** `UNIQUE (user_id, token)`
**Indexes:** `user_id`, `is_active`

---

### 5.2 `push_notification_templates`

Reusable templates with variable placeholders. Pre-seeded with defaults; editable via admin API (Phase 2 UI).

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | Auto-increment |
| key | varchar(100) UNIQUE | e.g. `order_placed` |
| name | varchar(255) | Human-readable label |
| title_template | varchar(255) | Supports `{{variable}}` syntax |
| body_template | text | Supports `{{variable}}` syntax |
| available_variables | json | e.g. `["order_number", "status"]` |
| is_active | boolean | Default `true` |
| created_at | timestamp | |
| updated_at | timestamp | |

> **`json` not `jsonb`:** Standardized to `$table->json(...)` for portability with the rest of the codebase.

**Default seeded templates:**

| Key | Title Template | Body Template |
|---|---|---|
| `order_placed` | Order Placed | Your order #{{order_number}} has been placed. Total: {{currency}} {{total}} |
| `order_status_updated` | Order Updated | Your order #{{order_number}} status is now: {{status}} |
| `order_delivered` | Order Delivered | Your order #{{order_number}} has been delivered! |
| `manual_broadcast` | *(Admin provided at send time)* | *(Admin provided at send time)* |

> **Note on `order_delivered`:** There is no separate `OrderDelivered` event in the codebase. The `order_delivered` template is fired from `OrderStatusUpdatedPushListener` **only when `status === 'delivered'`**, and in that case the generic `order_status_updated` template is **skipped**. This prevents double-notification on delivery. See §10.

---

### 5.3 `push_notification_logs`

Complete immutable delivery history for every notification dispatched.

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | Auto-increment |
| template_key | varchar(100) | Nullable — null for free-form manual sends |
| title | varchar(255) | Resolved title after variable substitution |
| body | text | Resolved body |
| data | json | FCM data payload sent to device |
| image_url | varchar(2048) | Nullable |
| target_type | varchar(50) | `all` / `user` |
| target_user_id | bigint FK → users | Nullable — null = broadcast to all |
| triggered_by | varchar(50) | `system` / `admin` |
| sent_by_user_id | bigint FK → users | Nullable — the admin who sent it |
| status | varchar(50) | `queued` / `processing` / `sent` / `partial` / `failed` |
| total_tokens | integer | Default 0 |
| success_count | integer | Default 0 |
| failure_count | integer | Default 0 |
| provider | varchar(50) | `fcm` (default) |
| error_message | text | Nullable |
| queued_at | timestamp | Nullable |
| sent_at | timestamp | Nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

**Indexes:** `status`, `triggered_by`, `target_type`, `target_user_id`, `created_at`

---

## 6. System Settings — Full Wiring

A new group **Push Notifications** is added to the existing System Settings module following the exact same wiring pattern as SMS and Streaming settings.

### 6.1 New setting keys

| Setting Key | Enum Case | Spatie Type | Description |
|---|---|---|---|
| `push_enabled` | `PUSH_ENABLED` | `integer` (0/1) | Master on/off kill switch |
| `push_provider` | `PUSH_PROVIDER` | `string` | Active provider — `fcm` default |
| `push_fcm_project_id` | `PUSH_FCM_PROJECT_ID` | `string` | Firebase project ID |
| `push_fcm_service_account_json` | `PUSH_FCM_SERVICE_ACCOUNT_JSON` | `string` + `#[ShouldBeEncrypted]` | Full service account JSON — encrypted at rest |

### 6.2 `PushSettings.php`

```php
class PushSettings extends Settings
{
    public int $enabled;          // 0 or 1 — no native bool type in settings
    public string $provider;
    public ?string $fcmProjectId;

    #[ShouldBeEncrypted]
    public ?string $fcmServiceAccountJson;

    public static function group(): string
    {
        return 'push_notifications';
    }
}
```

### 6.3 Registry entries (in `SystemSettingRegistry::definitions()`)

Each key needs: `group`, `type`, `label`, `description`, `settings_class`, `property`, `nullable_string`. The `push_fcm_service_account_json` key also needs a validation rule checking valid JSON structure.

### 6.4 `config/settings.php`

Add `PushSettings::class` to the `settings` array — required for Spatie auto-discovery and migration generation.

---

## 7. Push Payload Contract

All FCM `data` payloads must mirror the shape already used by Laravel database notifications so that the Capacitor app can reuse the same tap-routing logic for both channels.

### 7.1 Shared payload shape

```json
{
  "type": "order_placed",
  "order_id": "123",
  "order_number": "ORD-0042",
  "deep_link": "/shop/orders/123"
}
```

| Field | Required | Description |
|---|---|---|
| `type` | Yes | Matches `NotificationEventEnum` value — used for client-side routing |
| Entity ID field | Conditional | `order_id`, `match_id`, etc. — whichever entity the notification is about |
| `deep_link` | Optional | Server-generated convenience route (e.g. `/shop/orders/123`). Not present on database notifications today — client may build routes from `type` + entity ID instead |

### 7.2 FCM data values must be strings

FCM requires every key and value in the `data` map to be a **string** (Android enforces this strictly). `FcmPushDriver` must normalize before send:

```php
// Cast IDs and numbers to strings — do not pass raw integers from Order models
$data = array_map(fn ($v) => (string) $v, $data);
```

Laravel database notifications may store integers in PHP arrays; push delivery must stringify them.

### 7.3 Existing database notification shapes (reference)

```php
// OrderPlacedUserNotification.php
return [
    'type'         => 'order_placed',
    'order_id'     => $this->order->id,
    'order_number' => $orderNumber,
    ...
];
```

FCM push data payloads for the same events **must use the same `type` and entity ID fields** (as strings). The Capacitor tap handler can route from `type` + `order_id` without requiring `deep_link`.

### 7.4 Manual broadcast payload

Free-form admin broadcasts have no entity context. Their data payload contains only:

```json
{ "type": "manual_broadcast" }
```

The title and body are displayed as-is. No deep link is generated.

---

## 8. Core Components

### 8.1 `NotificationEventEnum`

All notification event types in a single enum. Adding a new event requires only adding one case here and a matching template — no pipeline changes.

```php
enum NotificationEventEnum: string
{
    case ORDER_PLACED          = 'order_placed';
    case ORDER_STATUS_UPDATED  = 'order_status_updated';
    case ORDER_DELIVERED       = 'order_delivered';  // fired via OrderStatusUpdated listener
    case MANUAL_BROADCAST      = 'manual_broadcast';
    // Future events added here
}
```

---

### 8.2 `PushDriverInterface`

Provider-agnostic contract. Any push provider is swappable without changing service, job, or business logic.

```php
interface PushDriverInterface
{
    /**
     * @return array{ success_count: int, failure_count: int, invalid_tokens: string[] }
     */
    public function sendToTokens(
        array $tokens,
        string $title,
        string $body,
        array $data = [],
        ?string $imageUrl = null,
    ): array;
}
```

---

### 8.3 `PushSender`

Mirrors `SmsSender`. Resolves `push_provider` from `PushSettings` to the correct driver. `PushNotificationService` depends on `PushSender`, never on `FcmPushDriver` directly.

```php
class PushSender
{
    public function driver(): PushDriverInterface
    {
        return match (app(PushSettings::class)->provider) {
            'fcm'   => app(FcmPushDriver::class),
            default => throw new \InvalidArgumentException("Unknown push provider"),
        };
    }

    public function sendToTokens(array $tokens, string $title, string $body, array $data, ?string $imageUrl): array
    {
        return $this->driver()->sendToTokens($tokens, $title, $body, $data, $imageUrl);
    }
}
```

---

### 8.4 `PushNotificationService`

The single entry point for the entire notification pipeline.

```php
public function dispatch(
    NotificationEventEnum $event,
    array $data = [],
    ?int $userId = null,        // null = broadcast to all users
    ?string $imageUrl = null,
    ?int $sentByUserId = null,  // admin user ID for manual sends
): PushNotificationLog
```

**Internal flow:**

1. If `PushSettings::$enabled !== 1`: create `PushNotificationLog` with `status = failed`, `error_message = 'Push notifications are disabled'`, `triggered_by` set appropriately — **do not dispatch the job** — return the log (audit trail for admins). See §14.4.
2. For `MANUAL_BROADCAST`: use `$data['title']` and `$data['body']` directly (no template)
3. For all other events: load template by key, render via `NotificationTemplateRenderer`
4. Build FCM `data` payload (stringify values per §7.2; include `type`, entity IDs, optional `deep_link`)
5. Create `PushNotificationLog` record with `status = queued`
6. Dispatch `SendPushNotificationJob::dispatch($log->id)->onQueue('push-notifications')`
7. Return the log record

---

### 8.5 `NotificationTemplateRenderer`

Lightweight `{{variable}}` substitution. Unknown variables → empty string. HTML stripped from body.

```php
// Template: "Order #{{order_number}} placed. Total: {{currency}} {{total}}"
// Data:     ['order_number' => '1234', 'currency' => 'PKR', 'total' => '1500']
// Output:   "Order #1234 placed. Total: PKR 1500"
```

---

### 8.6 `SendPushNotificationJob`

**Configuration:**
- Queue: `push-notifications` (set via `->onQueue('push-notifications')` on dispatch and `$this->onQueue()` in the job class)
- Max attempts: `3`
- Backoff: `60s, 120s, 300s`
- Timeout: `120 seconds`

**Idempotency and partial failure:**
- On start: if log `status` is already `sent` → abort (prevents duplicate delivery on retry)
- Tokens are processed in chunks of 500; counts accumulate per chunk
- If job fails mid-way and is retried, already-delivered tokens may receive duplicates — acceptable trade-off in Phase 1
- Phase 2: track per-token delivery status to enable true idempotent retry of only failed tokens

**Execution flow:**

1. Load `PushNotificationLog` by ID — abort if `status === sent`
2. Update `status = processing`
3. Load device tokens:
   - `target_type = user` → load active tokens for that `user_id`
   - `target_type = all` → chunk all active tokens in batches of 500 via `lazy()`
4. For each chunk: call `PushSender::sendToTokens()`, accumulate counts, mark `invalid_tokens` as `is_active = false`
5. Determine final status: `sent` (0 failures), `partial` (some failures), `failed` (all failures)
6. Update log: `status`, `total_tokens`, `success_count`, `failure_count`, `sent_at`

---

### 8.7 `FcmPushDriver`

Implements `PushDriverInterface` using Firebase Cloud Messaging HTTP v1 API.

- **Auth:** OAuth 2.0 via service account JSON from `PushSettings::$fcmServiceAccountJson` (decrypted). Short-lived access token cached in Redis (or `cache()` fallback) for its TTL (~60 min).
- **Endpoint:** `POST https://fcm.googleapis.com/v1/projects/{PROJECT_ID}/messages:send`
- **Batch strategy:** FCM v1 has no multicast endpoint. Parallel HTTP requests via Laravel `Http::pool()`, max 100 concurrent. Phase 2: migrate to FCM topics for large-scale broadcast.
- **Token cleanup:** FCM errors `UNREGISTERED` and `INVALID_ARGUMENT` → `DeviceToken::where('token', $token)->update(['is_active' => false])`
- **Data payload:** Normalize all `data` values to strings before building the FCM message (§7.2)

---

## 9. API Endpoints

### 9.1 App Endpoints *(requires `auth:api`)*

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/device-tokens` | Register or refresh a device token on app launch or after login |
| `DELETE` | `/api/v1/device-tokens` | Unregister a token on logout (token passed in request body) |

> **Rate limiting:** Apply `throttle` middleware on `POST /device-tokens` (e.g. `60,1` per user) to limit token registration spam.

> **Why body, not URL param?** FCM tokens are long (often >200 chars), URL-unsafe, and appear in server logs. Pass `token` in the request body for the DELETE endpoint.

> **Platform (Phase 1):** Accept `android` and `ios` only. Reject or ignore `web` until a web push strategy exists.

**Register token request body:**
```json
{
  "token": "fcm_registration_token_here",
  "platform": "android",
  "app_version": "1.2.0"
}
```

**Unregister token request body:**
```json
{
  "token": "fcm_registration_token_here"
}
```

---

### 9.2 Admin Endpoints *(requires `auth:api` + `admin.only`)*

| Method | Endpoint | Phase | Description |
|---|---|---|---|
| `GET` | `/api/v1/admin/push-notifications` | 1 | Paginated list of notification logs with filters |
| `POST` | `/api/v1/admin/push-notifications/send` | 1 | Send a manual broadcast to all users |
| `GET` | `/api/v1/admin/push-notifications/{id}` | 1 | View full detail of a single log entry |
| `GET` | `/api/v1/admin/push-notification-templates` | 2 | List all notification templates |
| `PATCH` | `/api/v1/admin/push-notification-templates/{id}` | 2 | Update a template title or body |

> Template read/edit endpoints are **Phase 2** — template content is seeded in Phase 1, not yet editable via UI.

---

## 10. System Event Integration

Listeners live in `app/Listeners/` and are **auto-discovered** by Laravel — no manual `$listen` registration in `EventServiceProvider` is needed. Create a listener with a typed `handle(OrderPlaced $event)` method and it is picked up automatically.

### 10.1 Event → Listener mapping

| Event | Listener | Behaviour |
|---|---|---|
| `OrderPlaced` | `OrderPlacedPushListener` | Fires `order_placed` when `user_id` is present |
| `OrderStatusUpdated` | `OrderStatusUpdatedPushListener` | See §10.2 |

### 10.1.1 Listener execution model

Push listeners are **synchronous** (no `ShouldQueue`) — same pattern as `SendOrderPlacedCustomerDatabaseNotification`. They only call `PushNotificationService::dispatch()`, which creates a log row and queues `SendPushNotificationJob`. Heavy work stays in the job.

**Null user guard:** Skip dispatch when `$order->user_id` is null (guest checkout edge cases), matching other order listeners.

### 10.2 Single-notification rule for `OrderStatusUpdated`

**Problem:** `OrderStatusUpdated` fires on every status change, including `delivered`. A separate `order_delivered` push would double-notify the user on delivery.

**Decision:** `OrderStatusUpdatedPushListener` applies the following rule:

```php
public function handle(OrderStatusUpdated $event): void
{
    $order = $event->order;
    if ($order->user_id === null) {
        return;
    }

    $status = $order->status->value;

    if ($status === 'delivered') {
        // Use the delivered-specific template; skip generic status template
        $this->pushService->dispatch(
            NotificationEventEnum::ORDER_DELIVERED,
            ['order_number' => $order->order_number],
            $order->user_id,
        );
        return;
    }

    // All other status changes use the generic template
    $this->pushService->dispatch(
        NotificationEventEnum::ORDER_STATUS_UPDATED,
        ['order_number' => $order->order_number, 'status' => $order->status->label()],
        $order->user_id,
    );
}
```

This ensures exactly **one push per status change**, with a dedicated message on delivery.

**Other statuses (e.g. `cancelled`, `dispatched`, `processing`):** Use the generic `order_status_updated` template — no special-case unless product adds one later.

### 10.3 Adding a new notification event

1. Add a case to `NotificationEventEnum`
2. Insert a template row into `push_notification_templates` (via seeder or migration)
3. Create a listener in `app/Listeners/` with a typed `handle()` method
4. Auto-discovery handles registration — no `EventServiceProvider` changes needed

> No changes are required to the pipeline, driver, or job.

---

## 11. Backoffice UI

### 11.1 Navigation

> **Naming clarity:** The existing top-level "Notifications" sidebar item links to the admin shared inbox (`/notifications`). The new push item is distinct:

- Existing: **Notifications** (Admin Inbox) → `/notifications`
- New: **Engagement → Push Notifications** → `/engagement/push-notifications`

**Routing (new module):** Add lazy-loaded routes under `backoffice/src/app/pages/engagement/` (mirror `content-management`):

- `engagement.routes.ts` — child route `push-notifications`
- Register in `app.routes.ts`: `path: 'engagement', loadChildren: ...`
- Add Engagement group + Push Notifications child in `sidebar-data.ts`

### 11.2 Push Notifications List Page

- Table columns: Title, Target, Triggered By, Status *(badge)*, Success / Failure counts, Sent At
- Filter bar: `status`, `triggered_by` (manual / system), date range
- Primary action: **"Send Notification"** → opens send dialog

### 11.3 Send Notification Dialog

Form fields:
- **Title** — required, max 100 characters
- **Body** — required, max 200 characters
- **Image URL** — optional
- **Target** — All Users *(Phase 1 only)*

> **Manual broadcast scope:** Free-form title/body bypasses template rendering entirely. The `manual_broadcast` template row exists for logging/categorization only. No variable substitution is performed on admin-composed messages.

### 11.4 Notification Templates Page *(Phase 2)*

- Table: key, name, last updated
- Inline edit for `title_template` and `body_template`
- Live preview with sample variable data

---

## 12. Security Considerations

- FCM service account JSON stored **encrypted** via `#[ShouldBeEncrypted]` on `PushSettings`
- Device tokens are strictly **user-scoped** — no cross-user token access possible
- Manual send endpoint protected by `auth:api` + `admin.only` middleware
- Token registration requires `auth:api` (logged-in app users only)
- Tokens passed in request body for unregister (not URL) to avoid log exposure
- Log entries have **no delete endpoint** — permanent audit trail
- `push_enabled = 0` stops new FCM delivery without code deploy (failed audit log, no job enqueue — §8.4, §14.4)

---

## 13. Mobile App (Capacitor)

> **Biggest implementation gap identified in review.** The Capacitor app (`app/`) has no push/Firebase dependencies today. Phase 1 backend is untestable end-to-end without this work.

### 13.1 Required dependencies

```bash
npm install @capacitor/push-notifications
npx cap sync
```

For iOS: also add Firebase iOS SDK via CocoaPods or Swift Package Manager.

### 13.2 Token lifecycle

| App event | Action |
|---|---|
| App launch (logged in) | Request permission → get FCM token → `POST /api/v1/device-tokens` |
| Token refresh (FCM rotates) | Re-register new token automatically |
| Logout | `DELETE /api/v1/device-tokens` with current token |
| Account delete | Backend cascades delete via `user_id` FK |

### 13.3 Permission prompts

- **Android:** No explicit prompt needed (Android 12 and below). Android 13+ requires `POST_NOTIFICATIONS` permission.
- **iOS:** Required — `UNUserNotificationCenter.requestAuthorization()` must be called on first launch. User can deny; handle gracefully (no token = no push, not an error).

### 13.4 Notification tap handling

On tap, the app receives a payload. The handler routes using `type` (see §7):

```typescript
PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
  const data = action.notification.data;
  switch (data.type) {
    case 'order_placed':
    case 'order_status_updated':
    case 'order_delivered':
      router.navigate(['/shop/orders', data.order_id]);
      break;
    case 'manual_broadcast':
      // No deep link — open app home
      break;
  }
});
```

Use the same `type` + entity ID convention as database notifications (`order_placed`, `order_id`, etc.). **Phase 1:** implement tap routing for push only. `NotificationCenter` does not navigate on card tap today — optional in-app tap navigation can follow the same switch later.

### 13.5 iOS APNs setup (one-time)

1. Apple Developer portal → Certificates, IDs & Profiles → Keys → create APNs Auth Key (`.p8`)
2. Firebase Console → Project Settings → iOS app → upload the `.p8` file with Team ID and Key ID
3. FCM handles APNs routing transparently from that point — no server-side changes

---

## 14. Operations Checklist

Before deploying Phase 1, all of the following must be completed:

### 14.1 Firebase / FCM

- [ ] Create Firebase project (or use existing)
- [ ] Register Android and iOS apps in Firebase Console
- [ ] Generate service account JSON key (Project Settings → Service Accounts)
- [ ] For iOS: upload APNs Auth Key (`.p8`) in Firebase Console
- [ ] Enter `push_fcm_project_id` and `push_fcm_service_account_json` in System Settings (backoffice)

### 14.2 Server

- [ ] Run migrations: `device_tokens`, `push_notification_templates`, `push_notification_logs`
- [ ] Seed default templates via seeder
- [ ] Add `push-notifications` queue worker to `supervisor/tapeya.conf` (use **`database`** driver to match existing worker):
  ```ini
  [program:artisan-queue-push]
  command=/bin/bash -c "cd /var/www/tapeya/api && /usr/bin/php artisan queue:work database --queue=push-notifications --sleep=3 --tries=3 --max-time=3600"
  ```
  Alternative: extend existing `artisan-queue` with `--queue=default,push-notifications`.
- [ ] Register `PushSettings::class` in `config/settings.php`
- [ ] Set `push_enabled = 1` in System Settings when ready to go live (default `0`)
- [ ] Redis recommended for FCM OAuth token cache; falls back to default `cache()` store if unavailable (§17 #7)

### 14.3 Mobile app

- [ ] `@capacitor/push-notifications` installed and synced
- [ ] Permission prompt wired on first login
- [ ] Token registration on app launch
- [ ] Token unregister on logout
- [ ] Notification tap handler implemented

### 14.4 Kill switch

When `push_enabled = 0`, `PushNotificationService::dispatch()` still creates an audit log entry with `status = failed` and `error_message = 'Push notifications are disabled'`, but **does not enqueue** `SendPushNotificationJob` — no tokens loaded, no FCM calls. Matches §8.4 step 1.

In-flight jobs started before the toggle may complete their current run (§17 #8).

---

## 15. Implementation Phases

### Phase 1 — Core Pipeline (MVP)

**Backend:**
- [ ] Migrations: `device_tokens`, `push_notification_templates`, `push_notification_logs`
- [ ] Models, Enums, `PushSender`, `PushNotificationService`, `FcmPushDriver`, `SendPushNotificationJob`
- [ ] System Settings: `PushSettings`, `config/settings.php`, `SystemSettingGroupEnum`, `SystemSettingKeyEnum`, `SystemSettingRegistry`, seeder defaults
- [ ] Seed default templates (`PushNotificationTemplateSeeder`)
- [ ] App API: `POST /device-tokens` (throttled), `DELETE /device-tokens` (body); `android` / `ios` only
- [ ] Admin API: send manual broadcast, list logs, view log detail
- [ ] Auto-discovered **sync** listeners: `OrderPlacedPushListener`, `OrderStatusUpdatedPushListener` (delivered rule + null `user_id` guard)
- [ ] `SendPushNotificationJob` uses `onQueue('push-notifications')`
- [ ] Supervisor: `artisan-queue-push` program or extended default worker (§14.2)

**Backoffice:**
- [ ] `engagement.routes.ts` + lazy load in `app.routes.ts` + sidebar Engagement group
- [ ] Push Notifications list page + send dialog at `/engagement/push-notifications`

**Mobile (Capacitor):**
- [ ] `@capacitor/push-notifications` integration
- [ ] Permission prompt, token registration on login, unregister on logout
- [ ] Notification tap handler with `type`-based routing

### Phase 2 — Templates, Targeting, and Scale

- [ ] Backoffice template editor with live preview
- [ ] User segment targeting (by type, country, etc.)
- [ ] FCM topic subscriptions for efficient large-scale broadcast
- [ ] Scheduled notifications (send at a future time)
- [ ] Admin API: `GET /push-notification-templates`, `PATCH /push-notification-templates/{id}`
- [ ] Per-token delivery tracking for idempotent job retries (retry only failed tokens)
- [ ] Retry failed notification action on log detail view
- [ ] `DeactivateStaleDeviceTokensCommand` + daily schedule (90-day `last_seen_at` inactivity → `is_active = false`)

### Phase 3 — Analytics

- [ ] Open rate tracking via deep link + tracking param
- [ ] Delivery rate dashboards per event type
- [ ] Per-platform breakdown (iOS vs Android vs Web)

---

## 16. File Structure

**Backend (Laravel API):**
```
app/
├── Enums/Push/
│   ├── NotificationEventEnum.php
│   ├── PushNotificationStatusEnum.php
│   └── PushTargetTypeEnum.php
├── Contracts/Push/
│   └── PushDriverInterface.php
├── Services/Push/
│   ├── PushSender.php                  ← new: mirrors SmsSender
│   ├── PushNotificationService.php
│   ├── NotificationTemplateRenderer.php
│   └── Drivers/
│       └── FcmPushDriver.php
├── Jobs/
│   └── SendPushNotificationJob.php
├── Models/
│   ├── DeviceToken.php
│   ├── PushNotificationTemplate.php
│   └── PushNotificationLog.php
├── Settings/
│   └── PushSettings.php
├── Listeners/
│   ├── OrderPlacedPushListener.php
│   └── OrderStatusUpdatedPushListener.php
└── Http/
    ├── Controllers/
    │   ├── Admin/PushNotificationController.php
    │   └── User/DeviceTokenController.php
    ├── Resources/Admin/
    │   ├── PushNotificationLogResource.php
    │   └── PushNotificationTemplateResource.php
    └── Requests/
        ├── Admin/Push/SendPushNotificationRequest.php
        └── User/
            ├── RegisterDeviceTokenRequest.php
            └── UnregisterDeviceTokenRequest.php

database/
├── migrations/
│   ├── ..._create_device_tokens_table.php
│   ├── ..._create_push_notification_templates_table.php
│   └── ..._create_push_notification_logs_table.php
└── seeders/
    └── PushNotificationTemplateSeeder.php
```

**Backoffice (Angular):**
```
app.routes.ts                          ← lazy load engagement module

pages/engagement/
├── engagement.routes.ts
└── push-notifications/
    ├── push-notifications.component.ts
    ├── push-notifications.component.html
    └── send-notification-dialog/
        ├── send-notification-dialog.component.ts
        └── send-notification-dialog.component.html

services/
└── push-notification.service.ts
```

---

## 17. Open Questions and Decisions

| # | Question | Decision |
|---|---|---|
| 1 | FCM topics vs per-token batch for all-user broadcasts? | **Per-token batch in Phase 1** (simpler); migrate to topics in Phase 2 for scale |
| 2 | Should manual broadcast also appear in the in-app Notification Center? | **Push-only in Phase 1.** Manual broadcasts do not write to the `notifications` table. Revisit in Phase 2 if product needs it. |
| 3 | Should log entries be deletable by admins? | **No** — treat as immutable audit trail |
| 4 | Should admins be able to re-send a failed notification? | **Yes (Phase 2)** — Retry action on log detail; retry only failed tokens once per-token tracking is available |
| 5 | Should notification sound and badge count be customizable? | **Use FCM defaults in Phase 1**; make configurable in Phase 2 |
| 6 | Should device tokens auto-expire after inactivity? | **Yes** — scheduled Artisan command: `is_active = false` after 90 days without `last_seen_at` update |
| 7 | FCM OAuth token cache — what if Redis is unavailable? | **Fall back to `cache()` default store** (file cache). Document Redis as recommended for performance. |
| 8 | What happens if `push_enabled` is toggled off mid-job? | **Job checks at start only.** In-flight chunks complete. Acceptable for Phase 1. |
| 9 | Web push / `platform = web`? | **Out of scope Phase 1.** Schema allows `web`; API accepts `android` / `ios` only until a web strategy is defined. |
