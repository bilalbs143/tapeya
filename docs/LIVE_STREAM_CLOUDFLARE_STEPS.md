# Tapeya Live Streaming — Cloudflare Stream Implementation Steps

**Status:** Future implementation guide (do after YouTube is live)
**Prerequisite:** `LIVE_STREAM_YOUTUBE_FINAL.md` fully implemented and deployed
**Goal:** Add Cloudflare Stream as a second provider for white-label HLS, low-latency playback, and automated highlight clips. Zero changes to existing YouTube flow.

---

## What This Adds

| Capability | YouTube (existing) | Cloudflare (added here) |
|---|---|---|
| Ingest | RTMP | RTMP |
| Playback | iframe embed | HLS (native + hls.js) |
| Status updates | Polling every 60 s | Webhooks (instant) |
| Recording | YouTube VOD | Cloudflare R2 / Stream |
| Clips | ❌ | ✅ `createClip()` |
| White-label player | ❌ | ✅ |
| Latency | ~15–30 s | ~2 s (low-latency mode) |

---

## Architecture Impact

The abstraction layer from the YouTube implementation absorbs Cloudflare with purely additive changes:

- **No changes** to `MatchStreamService`, `StreamController`, API routes, `match_streams` schema, `MatchResource`, `StreamPlayer.jsx`, `IframeStreamPlayer.jsx`, or Reverb events
- `StreamProviderContract` gains 2 new methods (`handleWebhook`, `createClip`) — YouTube stubs them out
- `StreamPlayer.jsx` uncomments one line (`hls: HlsStreamPlayer`)
- Everything else is new files only

---

## Implementation Steps

> Steps are ordered by dependency. Steps within a group with no shared dependency can be done in parallel.

---

### Group A — Cloudflare Account Setup (Manual / DevOps)

#### Step A1 — Enable Cloudflare Stream on your account

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Stream** → enable it on the account
3. Note the **Account ID** (visible in the URL: `dash.cloudflare.com/{account_id}/stream`)
4. Create an **API Token** with `Stream: Edit` permission
5. In **Stream → Live Inputs**, confirm you can create inputs (quota check)

**Done when:** Account ID and API Token are available.

---

#### Step A2 — Register webhook endpoint in Cloudflare Dashboard

> Do this after Step D3 (webhook route) is deployed.

1. In Cloudflare Dashboard → **Stream → Webhooks**
2. Set URL: `https://api.yourdomain.com/webhooks/streaming/cloudflare`
3. Note the **Webhook Secret** Cloudflare provides

**Done when:** Cloudflare shows webhook as active; test event delivered successfully.

---

### Group B — Settings Layer

#### Step B1 — Add Cloudflare properties to `StreamingSettings`
**File to modify:** `app/Settings/StreamingSettings.php`

Add:

```php
/** Cloudflare Account ID — visible in the dashboard URL. */
public ?string $cloudflareAccountId;

/** Cloudflare API token with Stream: Edit permission. Encrypted at rest. */
#[ShouldBeEncrypted]
public ?string $cloudflareApiToken;

/** Custom subdomain for HLS delivery (optional — uses default if null). */
public ?string $cloudflareSubdomain;

/**
 * Webhook secret provided by Cloudflare Dashboard → Stream → Webhooks.
 * Used to verify incoming webhook signatures. Encrypted at rest.
 */
#[ShouldBeEncrypted]
public ?string $cloudflareWebhookSecret;
```

**Done when:** class has 4 new properties; Spatie encrypts the two marked `#[ShouldBeEncrypted]`.

---

#### Step B2 — Add 4 Cloudflare keys to `SystemSettingKeyEnum`
**File to modify:** `app/Enums/SystemSetting/SystemSettingKeyEnum.php`

Add:

```php
case STREAM_CLOUDFLARE_ACCOUNT_ID      = 'stream_cloudflare_account_id';
case STREAM_CLOUDFLARE_API_TOKEN       = 'stream_cloudflare_api_token';
case STREAM_CLOUDFLARE_SUBDOMAIN       = 'stream_cloudflare_subdomain';
case STREAM_CLOUDFLARE_WEBHOOK_SECRET  = 'stream_cloudflare_webhook_secret';
```

**Done when:** all 4 cases exist; no syntax errors.

---

#### Step B3 — Add definitions and validation rules to `SystemSettingRegistry`
**File to modify:** `app/Settings/SystemSettingRegistry.php`

Add to `definitions()`:

```php
SystemSettingKeyEnum::STREAM_CLOUDFLARE_ACCOUNT_ID->value => [
    'group'          => SystemSettingGroupEnum::STREAMING,
    'type'           => SystemSettingTypeEnum::STRING,
    'label'          => 'Cloudflare Account ID',
    'description'    => 'Visible in the Cloudflare dashboard URL.',
    'settings_class' => StreamingSettings::class,
    'property'       => 'cloudflareAccountId',
    'nullable_string'=> true,
],
SystemSettingKeyEnum::STREAM_CLOUDFLARE_API_TOKEN->value => [
    'group'          => SystemSettingGroupEnum::STREAMING,
    'type'           => SystemSettingTypeEnum::TEXT,
    'label'          => 'Cloudflare API Token',
    'description'    => 'Stream: Edit permission (stored encrypted).',
    'settings_class' => StreamingSettings::class,
    'property'       => 'cloudflareApiToken',
    'nullable_string'=> true,
],
SystemSettingKeyEnum::STREAM_CLOUDFLARE_SUBDOMAIN->value => [
    'group'          => SystemSettingGroupEnum::STREAMING,
    'type'           => SystemSettingTypeEnum::STRING,
    'label'          => 'Cloudflare Stream Subdomain',
    'description'    => 'Optional. Defaults to customer.cloudflarestream.com if blank.',
    'settings_class' => StreamingSettings::class,
    'property'       => 'cloudflareSubdomain',
    'nullable_string'=> true,
],
SystemSettingKeyEnum::STREAM_CLOUDFLARE_WEBHOOK_SECRET->value => [
    'group'          => SystemSettingGroupEnum::STREAMING,
    'type'           => SystemSettingTypeEnum::TEXT,
    'label'          => 'Cloudflare Webhook Secret',
    'description'    => 'From Cloudflare Dashboard → Stream → Webhooks (stored encrypted).',
    'settings_class' => StreamingSettings::class,
    'property'       => 'cloudflareWebhookSecret',
    'nullable_string'=> true,
],
```

Add to `rules()`:

```php
SystemSettingKeyEnum::STREAM_CLOUDFLARE_ACCOUNT_ID => [
    'value' => ['nullable', 'string', 'max:64'],
],
SystemSettingKeyEnum::STREAM_CLOUDFLARE_API_TOKEN => [
    'value' => ['nullable', 'string', 'max:512'],
],
SystemSettingKeyEnum::STREAM_CLOUDFLARE_SUBDOMAIN => [
    'value' => ['nullable', 'string', 'max:253'],
],
SystemSettingKeyEnum::STREAM_CLOUDFLARE_WEBHOOK_SECRET => [
    'value' => ['nullable', 'string', 'max:512'],
],
```

**Depends on:** B1, B2

**Done when:** admin panel shows 4 new Cloudflare fields inside the Live Streaming settings group.

---

#### Step B4 — Update `STREAM_DEFAULT_PROVIDER` validation rule to allow `cloudflare`
**File to modify:** `app/Settings/SystemSettingRegistry.php`

Change:

```php
// Before
SystemSettingKeyEnum::STREAM_DEFAULT_PROVIDER => [
    'value' => ['required', 'string', 'in:youtube'],
],

// After
SystemSettingKeyEnum::STREAM_DEFAULT_PROVIDER => [
    'value' => ['required', 'string', 'in:youtube,cloudflare'],
],
```

**Done when:** admin can save `cloudflare` as the default provider without a validation error.

---

#### Step B5 — Run settings migration and seed defaults
**Command:**

```bash
php artisan settings:migrate
php artisan db:seed --class=SystemSettingsSeeder
```

Add to the seeder (if not already there):

```php
// In the StreamingSettings seeder block, these are already null by default
// from the Spatie migration — no new seed entries needed unless you want defaults.
```

**Depends on:** B1–B3

**Done when:** `php artisan settings:migrate` completes; 4 new setting rows exist in the `settings` table.

---

### Group C — Extend the Provider Contract

#### Step C1 — Add `handleWebhook` and `createClip` to `StreamProviderContract`
**File to modify:** `app/Streaming/Contracts/StreamProviderContract.php`

First, create the supporting types:

**File to create:** `app/Streaming/Data/ProviderWebhookResult.php`

```php
namespace App\Streaming\Data;

final readonly class ProviderWebhookResult
{
    public function __construct(
        public string  $streamId,    // match_streams.provider_stream_id
        public string  $newStatus,   // idle | starting | live | ended | error
        public ?string $recordingId = null,
    ) {}
}
```

**File to create:** `app/Streaming/Data/ClipWindow.php`

```php
namespace App\Streaming\Data;

use Carbon\Carbon;

final readonly class ClipWindow
{
    public function __construct(
        public Carbon $startAt,
        public Carbon $endAt,
        public string $title = '',
    ) {}
}
```

**File to create:** `app/Streaming/Data/ProviderClipResult.php`

```php
namespace App\Streaming\Data;

final readonly class ProviderClipResult
{
    public function __construct(
        public string  $clipId,
        public string  $playbackUrl,
        public ?string $thumbnailUrl = null,
    ) {}
}
```

**Add to `StreamProviderContract` interface:**

```php
use App\Streaming\Data\ClipWindow;
use App\Streaming\Data\ProviderClipResult;
use App\Streaming\Data\ProviderWebhookResult;
use Illuminate\Http\Request;

/** Verify webhook signature, parse payload, return status change result. */
public function handleWebhook(Request $request): ProviderWebhookResult;

/**
 * Create a highlight clip from a completed recording.
 * Return null if the provider does not support clipping.
 */
public function createClip(MatchStream $stream, ClipWindow $window): ?ProviderClipResult;
```

**Done when:** interface has both new methods; IDE shows all implementing classes need updating.

---

#### Step C2 — Stub the new methods on `YouTubeStreamProvider`
**File to modify:** `app/Streaming/Providers/YouTubeStreamProvider.php`

Add:

```php
public function handleWebhook(Request $request): ProviderWebhookResult
{
    // YouTube does not fire server-to-server webhooks — this should never be called.
    throw new \LogicException('YouTubeStreamProvider does not support webhooks.');
}

public function createClip(MatchStream $stream, ClipWindow $window): ?ProviderClipResult
{
    // YouTube does not support clip creation via the Data API.
    return null;
}
```

**Depends on:** C1

**Done when:** `YouTubeStreamProvider` compiles without errors; `supportsWebhooks()` still returns `false`.

---

#### Step C3 — Stub the new methods on `FakeStreamProvider`
**File to modify:** `tests/Fakes/FakeStreamProvider.php`

Add:

```php
public function handleWebhook(Request $request): ProviderWebhookResult
{
    return new ProviderWebhookResult(
        streamId:  'fake-stream-id',
        newStatus: 'live',
    );
}

public function createClip(MatchStream $stream, ClipWindow $window): ?ProviderClipResult
{
    return new ProviderClipResult(
        clipId:      'fake-clip-id',
        playbackUrl: 'https://fake-clip.test/fake-clip-id',
    );
}
```

**Depends on:** C1

**Done when:** `FakeStreamProvider` compiles; all existing tests still pass.

---

### Group D — Cloudflare Provider

#### Step D1 — Install Cloudflare HTTP client
**Files:** `composer.json`

Cloudflare Stream uses REST — no official PHP SDK. Use Laravel's HTTP client:

```bash
# No new package needed — Illuminate\Http\Client is already available.
# Optionally install cloudflare/sdk for other Cloudflare services:
# composer require cloudflare/sdk
```

**Done when:** confirmed that `Http::withToken()` is used directly (no extra package required).

---

#### Step D2 — Create `CloudflareStreamProvider`
**File to create:** `app/Streaming/Providers/CloudflareStreamProvider.php`

```php
namespace App\Streaming\Providers;

use App\Models\MatchStream;
use App\Settings\StreamingSettings;
use App\Streaming\Contracts\StreamProviderContract;
use App\Streaming\Data\ClipWindow;
use App\Streaming\Data\CreateStreamData;
use App\Streaming\Data\ProviderClipResult;
use App\Streaming\Data\ProviderWebhookResult;
use App\Streaming\Data\StreamIngestConfig;
use App\Streaming\Data\StreamPlayback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CloudflareStreamProvider implements StreamProviderContract
{
    private string $accountId;
    private string $apiToken;
    private string $baseUrl;

    public function __construct()
    {
        $settings        = app(StreamingSettings::class);
        $this->accountId = $settings->cloudflareAccountId;
        $this->apiToken  = $settings->cloudflareApiToken;  // Spatie decrypts automatically
        $subdomain       = $settings->cloudflareSubdomain ?? 'customer.cloudflarestream.com';
        $this->baseUrl   = "https://api.cloudflare.com/client/v4/accounts/{$this->accountId}/stream";
    }

    // ── Create ────────────────────────────────────────────────────────────────

    public function createStream(MatchStream $stream, CreateStreamData $data): void
    {
        // Create a live input (RTMP ingest)
        $response = Http::withToken($this->apiToken)
            ->post("{$this->baseUrl}/live_inputs", [
                'meta'             => ['name' => $data->title],
                'recording'        => ['mode' => 'automatic'],
                'defaultCreator'   => 'tapeya',
                'lowLatency'       => true,
                'playbackPolicy'   => ['type' => 'open'],  // or 'signed' for private
            ])
            ->throw()
            ->json('result');

        $inputId   = $response['uid'];
        $rtmpUrl   = $response['rtmps']['url'];
        $streamKey = $response['rtmps']['streamKey'];
        $hlsUrl    = "https://customer.cloudflarestream.com/{$inputId}/manifest/video.m3u8";

        $stream->update([
            'provider_stream_id'   => $inputId,
            'provider_ingest_id'   => $inputId,
            'provider_playback_id' => $inputId,
            'ingest_rtmp_url'      => $rtmpUrl,
            'stream_key_encrypted' => Crypt::encryptString($streamKey),
            'playback_url'         => $hlsUrl,
            'embed_url'            => null,               // HLS mode — no iframe
            'status'               => 'idle',
            'provider_metadata'    => [
                'cloudflare_input_id' => $inputId,
                'hls_url'             => $hlsUrl,
            ],
        ]);
    }

    // ── Status sync (fallback only — normally driven by webhooks) ────────────

    public function syncStatus(MatchStream $stream): void
    {
        if (! $stream->provider_stream_id) return;

        try {
            $response  = Http::withToken($this->apiToken)
                ->get("{$this->baseUrl}/live_inputs/{$stream->provider_stream_id}")
                ->throw()
                ->json('result');

            $isLive = $response['status']['current']['state'] ?? 'disconnected';

            $status = match ($isLive) {
                'connected'    => 'live',
                'disconnected' => $stream->status === 'live' ? 'ended' : $stream->status,
                default        => $stream->status,
            };

            $updates = ['status' => $status];
            if ($status === 'live'  && ! $stream->started_at) $updates['started_at'] = now();
            if ($status === 'ended' && ! $stream->ended_at)   $updates['ended_at']   = now();

            $stream->update($updates);
        } catch (\Exception $e) {
            Log::error("Cloudflare syncStatus failed for stream {$stream->id}: " . $e->getMessage());
        }
    }

    // ── Webhook handler ───────────────────────────────────────────────────────

    public function handleWebhook(Request $request): ProviderWebhookResult
    {
        // Verify Cloudflare signature
        $secret    = app(StreamingSettings::class)->cloudflareWebhookSecret;
        $signature = $request->header('Webhook-Signature');
        $body      = $request->getContent();

        $expected = hash_hmac('sha256', $body, $secret);
        abort_unless(hash_equals($expected, $signature ?? ''), 401, 'Invalid webhook signature.');

        $payload  = $request->json()->all();
        $inputId  = $payload['uid'] ?? null;
        $state    = $payload['status'] ?? null;

        $status = match ($state) {
            'live'         => 'live',
            'ended'        => 'ended',
            'connected'    => 'starting',
            'disconnected' => 'idle',
            default        => 'idle',
        };

        $recordingId = $payload['recordingId'] ?? null;

        return new ProviderWebhookResult(
            streamId:    $inputId,
            newStatus:   $status,
            recordingId: $recordingId,
        );
    }

    // ── End ───────────────────────────────────────────────────────────────────

    public function endStream(MatchStream $stream): void
    {
        // Cloudflare ends automatically when RTMP disconnects — nothing to call.
        // Optionally disable the live input to prevent reconnects:
        if ($stream->provider_stream_id) {
            try {
                Http::withToken($this->apiToken)
                    ->put("{$this->baseUrl}/live_inputs/{$stream->provider_stream_id}", [
                        'recording' => ['mode' => 'off'],
                    ]);
            } catch (\Exception $e) {
                Log::warning("Cloudflare endStream failed for stream {$stream->id}: " . $e->getMessage());
            }
        }

        $stream->update(['status' => 'ended', 'ended_at' => now()]);
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    public function deleteStream(MatchStream $stream): void
    {
        if (! $stream->provider_stream_id) return;

        try {
            Http::withToken($this->apiToken)
                ->delete("{$this->baseUrl}/live_inputs/{$stream->provider_stream_id}")
                ->throw();
        } catch (\Exception $e) {
            Log::warning("Cloudflare deleteStream failed for stream {$stream->id}: " . $e->getMessage());
        }

        $stream->update(['status' => 'ended', 'ended_at' => $stream->ended_at ?? now()]);
    }

    // ── Playback (client-safe, no secrets) ───────────────────────────────────

    public function playback(MatchStream $stream): StreamPlayback
    {
        return new StreamPlayback(
            mode:          'hls',
            url:           $stream->playback_url,
            embedId:       null,
            embedUrl:      null,
            playerOptions: [
                'lowLatencyMode'      => true,
                'liveSyncDurationCount' => 3,
                'autoplay'            => true,
                'muted'               => true,   // required for autoplay on mobile
            ],
        );
    }

    // ── Ingest config (admin only) ────────────────────────────────────────────

    public function ingestConfig(MatchStream $stream): StreamIngestConfig
    {
        return new StreamIngestConfig(
            rtmpUrl:   $stream->ingest_rtmp_url ?? 'rtmps://live.cloudflare.com:443/live',
            streamKey: Crypt::decryptString($stream->stream_key_encrypted),
        );
    }

    // ── Highlight clip creation ───────────────────────────────────────────────

    public function createClip(MatchStream $stream, ClipWindow $window): ?ProviderClipResult
    {
        if (! $stream->provider_stream_id) return null;

        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->baseUrl}/{$stream->provider_stream_id}/clip", [
                    'startTimeSeconds' => $window->startAt->diffInSeconds($stream->started_at),
                    'endTimeSeconds'   => $window->endAt->diffInSeconds($stream->started_at),
                    'meta'             => ['name' => $window->title ?: 'Highlight Clip'],
                ])
                ->throw()
                ->json('result');

            return new ProviderClipResult(
                clipId:       $response['uid'],
                playbackUrl:  $response['playback']['hls'],
                thumbnailUrl: $response['thumbnail'] ?? null,
            );
        } catch (\Exception $e) {
            Log::error("Cloudflare createClip failed for stream {$stream->id}: " . $e->getMessage());
            return null;
        }
    }

    public function slug(): string           { return 'cloudflare'; }
    public function supportsWebhooks(): bool { return true; }
}
```

**Depends on:** B1, C1

**Done when:** class compiles; implements all methods of `StreamProviderContract`.

---

#### Step D3 — Register `CloudflareStreamProvider` in the service container
**File to modify:** `app/Providers/StreamingServiceProvider.php`

Add:

```php
$this->app->singleton(Providers\CloudflareStreamProvider::class);
```

**File to modify:** `app/Streaming/StreamProviderManager.php`

Add:

```php
public function createCloudflareDriver(): StreamProviderContract
{
    return $this->container->make(Providers\CloudflareStreamProvider::class);
}
```

**Depends on:** D2

**Done when:** `app(\App\Streaming\StreamProviderManager::class)->driver('cloudflare')` resolves without errors.

---

### Group E — Webhook Handler

#### Step E1 — Create `StreamWebhookController`
**File to create:** `app/Http/Controllers/Api/V1/StreamWebhookController.php`

```php
namespace App\Http\Controllers\Api\V1;

use App\Models\MatchStream;
use App\Streaming\MatchStreamService;
use App\Streaming\StreamProviderManager;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class StreamWebhookController extends Controller
{
    public function __construct(
        private MatchStreamService    $service,
        private StreamProviderManager $manager,
    ) {}

    /**
     * Handle Cloudflare Stream webhook.
     * Route: POST /webhooks/streaming/cloudflare
     * Must be exempt from CSRF and auth middleware.
     */
    public function cloudflare(Request $request): Response
    {
        $provider = $this->manager->driver('cloudflare');

        // handleWebhook() verifies the signature and throws 401 on failure
        $result = $provider->handleWebhook($request);

        $stream = MatchStream::where('provider_stream_id', $result->streamId)
            ->with('match.tournament')
            ->first();

        if (! $stream) {
            Log::warning('Cloudflare webhook: no matching stream for uid ' . $result->streamId);
            return response('', 204);
        }

        $before = $stream->status;
        $updates = ['status' => $result->newStatus];

        if ($result->newStatus === 'live'  && ! $stream->started_at) $updates['started_at'] = now();
        if ($result->newStatus === 'ended' && ! $stream->ended_at)   $updates['ended_at']   = now();
        if ($result->recordingId)                                     $updates['provider_recording_id'] = $result->recordingId;

        $stream->update($updates);

        if ($result->newStatus !== $before) {
            $this->service->syncStatus($stream->match);
        }

        return response('', 204);
    }
}
```

**Depends on:** C1, D2

**Done when:** class exists; controller compiles.

---

#### Step E2 — Register the webhook route (no auth middleware)
**File to modify:** `routes/api.php`

Add **outside** the `auth:sanctum` middleware group:

```php
// Cloudflare Stream webhooks — signature verified inside the controller
Route::post('webhooks/streaming/cloudflare', [StreamWebhookController::class, 'cloudflare'])
    ->name('webhooks.streaming.cloudflare');
```

**File to modify:** `bootstrap/app.php` (or `app/Http/Middleware/VerifyCsrfToken.php`) — exempt the route from CSRF:

```php
// In withMiddleware() callback:
$middleware->validateCsrfTokens(except: [
    'webhooks/streaming/*',
]);
```

**Depends on:** E1

**Done when:** `php artisan route:list` shows the webhook route; it is accessible without a token.

---

#### Step E3 — Update `setProvider` controller validation to allow `cloudflare`
**File to modify:** `app/Http/Controllers/Api/V1/StreamController.php`

Change in `setProvider()`:

```php
// Before
'provider' => ['required', 'string', 'in:youtube'],

// After
'provider' => ['required', 'string', 'in:youtube,cloudflare'],
```

**Done when:** `PATCH /api/admin/matches/{id}/stream/provider` accepts `cloudflare` as a valid value.

---

### Group F — Frontend

#### Step F1 — Create `HlsStreamPlayer` adapter
**File to create:** `app/src/features/stream/adapters/HlsStreamPlayer.jsx`

```bash
npm install hls.js
```

Copy the full component from [Future: Adding Cloudflare Stream → Frontend additions](LIVE_STREAM_YOUTUBE_FINAL.md#future-adding-cloudflare-stream).

**Done when:** component plays an HLS `.m3u8` URL via hls.js on Android and native HLS on iOS.

---

#### Step F2 — Register `HlsStreamPlayer` in `StreamPlayer`
**File to modify:** `app/src/features/stream/StreamPlayer.jsx`

Change:

```jsx
// Before
const PLAYERS = {
  iframe: IframeStreamPlayer,
  // hls: HlsStreamPlayer,
};

// After
import { HlsStreamPlayer } from './adapters/HlsStreamPlayer';

const PLAYERS = {
  iframe: IframeStreamPlayer,
  hls:    HlsStreamPlayer,
};
```

**Depends on:** F1

**Done when:** `playback.mode === 'hls'` renders the HLS player; `playback.mode === 'iframe'` still renders YouTube; offline slate for everything else.

---

### Group G — Activation

#### Step G1 — Set Cloudflare credentials in admin panel

In Admin → System Settings → Live Streaming, set:
- Cloudflare Account ID
- Cloudflare API Token
- Cloudflare Webhook Secret (from Step A2)
- Cloudflare Stream Subdomain (optional)

**Done when:** all 4 settings saved without validation errors.

---

#### Step G2 — Activate Cloudflare for a specific tournament

```sql
-- No migration needed — column already exists from YouTube implementation
UPDATE tournaments SET stream_provider = 'cloudflare' WHERE id = <tournament_id>;
```

Or via the admin panel provider selector (Step G7 of YouTube steps).

**Done when:** `StreamProviderResolver::forMatch($match)` returns `CloudflareStreamProvider` for matches in this tournament.

---

#### Step G3 — End-to-end smoke test on staging

1. Set Cloudflare credentials in admin panel (Step G1)
2. Activate Cloudflare for a test tournament (Step G2)
3. Register webhook in Cloudflare Dashboard → Stream → Webhooks pointing to staging URL (Step A2)
4. Create stream via backoffice → `POST /api/admin/matches/{id}/stream`
5. Copy RTMP URL + stream key → enter into OBS
6. Start streaming in OBS
7. Cloudflare fires `live` webhook → status updates instantly (no polling delay)
8. Open match watch page → HLS player plays with ~2 s latency; score overlay visible
9. Stop OBS → Cloudflare fires `ended` webhook → status updates
10. Verify recording ID is saved to `match_streams.provider_recording_id`

**Done when:** all 10 items pass on a real device (iOS + Android).

---

## What Does NOT Change When Cloudflare Is Added

| Component | Change needed |
|---|---|
| `MatchStreamService` | ❌ None |
| `StreamController` | ❌ None (except validation `in:` string — Step E3) |
| API routes | ❌ None |
| `match_streams` schema | ❌ None |
| `MatchResource` stream shape | ❌ None |
| `IframeStreamPlayer.jsx` | ❌ None |
| Reverb events | ❌ None |
| `streams:sync` command | ❌ None (auto-skips Cloudflare via `supportsWebhooks()`) |
| `StreamPlayer.jsx` | One line uncommented (Step F2) |

---

## Clip Creation (Post-Match Highlights)

Once Cloudflare is live, clips can be created after any ball event (wicket, six, four):

```php
// Example: create a clip after a wicket is stored
$window = new ClipWindow(
    startAt: $ball->created_at->subSeconds(8),   // 8 s before the wicket
    endAt:   $ball->created_at->addSeconds(5),   // 5 s after
    title:   "{$batsmanName} — Wicket",
);

$clip = $matchStreamService->createClip($match, $window);
// $clip->playbackUrl → store in match_highlights or broadcast via Reverb
```

Add a `CreateClipJob` to run this async after significant ball events.

---

## Decision Record

| Decision | Choice | Rationale |
|---|---|---|
| No Cloudflare PHP SDK | Raw `Http::withToken()` | Official SDK adds 20+ Cloudflare services we don't need; REST surface for Stream is small |
| Webhook verification | HMAC SHA-256 inside `handleWebhook()` | Cloudflare signs with webhook secret; verified before any DB writes |
| HLS autoplay | `muted: true` by default | Browser + iOS require muted for autoplay; user can unmute |
| Clip timing | Ball `created_at` ± seconds | Simple and accurate — ball row is written at impact time |
| RTMPS | `rtmps://` (TLS) | Cloudflare requires RTMPS for live inputs; no plain RTMP |
