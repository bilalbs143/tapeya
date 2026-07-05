# Tapeya Live Streaming — YouTube Architecture

**Status:** Authoritative implementation guide  
**Date:** May 2026  
**Current provider:** YouTube Live (free, zero CDN cost)  
**Scope:** Live streaming only — media storage tracked separately in `LIVE_STREAM_CLAUDE_FINAL_ARCHITECTURE.md`

---

## Strategy

Tapeya is in startup phase. Users expect free live streaming. **YouTube Live** gives production teams RTMP ingest, global CDN, auto-recording, and a familiar OBS/vMix workflow at zero platform cost.

All matches stream to the **single Tapeya YouTube channel**. Credentials are platform-level — managed from the admin panel, no `.env` edits needed.

The only forward-looking investment made now is a **thin provider abstraction layer** (one interface, one manager, one resolver). This costs almost nothing to build but means adding Cloudflare later is one new class — no controller, route, migration, or frontend changes. See [Future: Adding Cloudflare Stream](#future-adding-cloudflare-stream) at the bottom of this document.

---

## Architecture Principles

1. **Backend-first** — All provider credentials and stream lifecycle live in Laravel. App and fan clients receive only playback metadata, never ingest secrets.
2. **Provider is an implementation detail** — API responses use provider-agnostic shapes. The `provider` field is informational only.
3. **Frontend switches on `mode`, not `provider`** — Player components branch on `playback.mode` (`iframe` | `hls`). Adding Cloudflare in the future does not touch any existing player code.
4. **Separate video from game data** — YouTube carries video. Laravel Reverb carries scores, graphics, and stream status. They never merge.
5. **Events drive status** — Polling detects status change → Laravel updates `match_streams` → Reverb pushes to clients. No client polls YouTube directly.
6. **Overlays are always a UI concern** — Score strips are React components layered over the player. They work identically regardless of provider.
7. **Extend, don't fork** — Adding a provider means one new class. All existing code is untouched.

---

## System Context

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION (venue / remote)                           │
│  Cameras → vMix / OBS ──RTMP──┐   Browser source ← signed GraphicsView    │
│                                │              ↑ Reverb match.{id}.graphics   │
└────────────────────────────────┼──────────────┼────────────────────────────--┘
                                 │              │
              ┌──────────────────┴──────────────┴──────────────┐
              │               YouTube Live                       │
              │   RTMP ingest → transcode → iframe embed         │
              │   Auto-record → YouTube VOD archive              │
              └──────────────────────┬─────────────────────────-┘
                                     │ iframe embed
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  TAPEYA PLATFORM                                                              │
│  ┌──────────────────┐  poll every 30s  ┌──────────────────────────────────┐  │
│  │  YouTube Data    │ ───────────────► │  Laravel API (control plane)     │  │
│  │  API v3          │ ◄─────────────── │  StreamProviderResolver          │  │
│  └──────────────────┘  create / end    │  MatchStreamService              │  │
│                                         │  StreamPlaybackResource          │  │
│                                         └──────────────┬───────────────────┘  │
│                                                        │ Reverb status        │
│                                         ┌─────────────▼───────────────────┐  │
│                                         │  PostgreSQL                      │  │
│                                         │  match_streams                   │  │
│                                         │  settings (StreamingSettings)    │  │
│                                         └─────────────┬───────────────────┘  │
└─────────────────────────────────────────────────────--┼──────────────────────┘
                                                        │
                                         ┌──────────────▼──────────────────┐
                                         │  Capacitor App + Backoffice      │
                                         │  StreamPlayer (iframe)           │
                                         │  ScoreOverlay (Reverb)           │
                                         └─────────────────────────────────┘
```

---

## Streaming Configuration via System Settings

All YouTube credentials are stored in the `settings` table via the existing **Spatie Laravel Settings** layer — managed from the admin panel at `/admin/system-settings`. Zero `.env` changes needed.

### StreamingSettings Class

```php
// app/Settings/StreamingSettings.php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

/**
 * Live streaming provider configuration.
 * All credentials are platform-level — Tapeya streams exclusively on its own YouTube channel.
 */
class StreamingSettings extends Settings
{
    /** OAuth redirect for Web clients — register this exact URI in Google Cloud Console (not stored in DB). */
    public const OAUTH_REDIRECT_URI = 'http://localhost';

    /** Active provider slug: 'youtube' (cloudflare added in future) */
    public string $defaultProvider;

    /** OAuth2 Client ID from Google Cloud Console. */
    public ?string $youtubeClientId;

    /** OAuth2 Client Secret — encrypted at rest. */
    #[ShouldBeEncrypted]
    public ?string $youtubeClientSecret;

    /**
     * Platform refresh token for the Tapeya YouTube channel.
     * All matches stream here. Generated by: php artisan youtube:authorize
     * Encrypted at rest.
     */
    #[ShouldBeEncrypted]
    public ?string $youtubeRefreshToken;

    /** YouTube channel ID — UCxxxxxxxxxxxx from YouTube Studio. */
    public ?string $youtubeChannelId;

    /** Default broadcast privacy: 'public' or 'unlisted'. */
    public ?string $youtubeDefaultPrivacy;

    public static function group(): string
    {
        return 'streaming';
    }
}
```

### New Enum Cases

```php
// app/Enums/SystemSetting/SystemSettingKeyEnum.php — add these cases

case STREAM_DEFAULT_PROVIDER        = 'stream_default_provider';
case STREAM_YOUTUBE_CLIENT_ID       = 'stream_youtube_client_id';
case STREAM_YOUTUBE_CLIENT_SECRET   = 'stream_youtube_client_secret';
case STREAM_YOUTUBE_REFRESH_TOKEN   = 'stream_youtube_refresh_token';
case STREAM_YOUTUBE_CHANNEL_ID      = 'stream_youtube_channel_id';
case STREAM_YOUTUBE_DEFAULT_PRIVACY = 'stream_youtube_default_privacy';
```

> **OAuth redirect URI** is not a system setting. It is fixed in code as `StreamingSettings::OAUTH_REDIRECT_URI` (`http://localhost`) for the one-time `youtube:authorize` CLI flow and for `YouTubeStreamProvider`. Register that URI on your **Web application** OAuth client in Google Cloud Console — do not use `urn:ietf:wg:oauth:2.0:oob` (desktop-only).

### New Group

```php
// app/Enums/SystemSetting/SystemSettingGroupEnum.php

/** Live streaming provider configuration. */
case STREAMING = 'streaming';

// In label():
self::STREAMING => 'Live Streaming',
```

### Registry Definitions

```php
// app/Settings/SystemSettingRegistry.php — add to definitions()

SystemSettingKeyEnum::STREAM_DEFAULT_PROVIDER->value => [
    'group'          => SystemSettingGroupEnum::STREAMING,
    'type'           => SystemSettingTypeEnum::STRING,
    'label'          => 'Default Stream Provider',
    'description'    => 'Active streaming provider. Currently: youtube.',
    'settings_class' => StreamingSettings::class,
    'property'       => 'defaultProvider',
    'nullable_string'=> false,
],
SystemSettingKeyEnum::STREAM_YOUTUBE_CLIENT_ID->value => [
    'group'          => SystemSettingGroupEnum::STREAMING,
    'type'           => SystemSettingTypeEnum::STRING,
    'label'          => 'YouTube OAuth Client ID',
    'description'    => 'Google Cloud Console OAuth2 Client ID.',
    'settings_class' => StreamingSettings::class,
    'property'       => 'youtubeClientId',
    'nullable_string'=> true,
],
SystemSettingKeyEnum::STREAM_YOUTUBE_CLIENT_SECRET->value => [
    'group'          => SystemSettingGroupEnum::STREAMING,
    'type'           => SystemSettingTypeEnum::TEXT,
    'label'          => 'YouTube OAuth Client Secret',
    'description'    => 'Google Cloud Console OAuth2 Client Secret (stored encrypted).',
    'settings_class' => StreamingSettings::class,
    'property'       => 'youtubeClientSecret',
    'nullable_string'=> true,
],
SystemSettingKeyEnum::STREAM_YOUTUBE_REFRESH_TOKEN->value => [
    'group'          => SystemSettingGroupEnum::STREAMING,
    'type'           => SystemSettingTypeEnum::TEXT,
    'label'          => 'YouTube Platform Refresh Token',
    'description'    => 'Generated via: php artisan youtube:authorize (stored encrypted).',
    'settings_class' => StreamingSettings::class,
    'property'       => 'youtubeRefreshToken',
    'nullable_string'=> true,
],
SystemSettingKeyEnum::STREAM_YOUTUBE_CHANNEL_ID->value => [
    'group'          => SystemSettingGroupEnum::STREAMING,
    'type'           => SystemSettingTypeEnum::STRING,
    'label'          => 'YouTube Channel ID',
    'description'    => 'UCxxxxxxxxxxxx — the Tapeya platform channel.',
    'settings_class' => StreamingSettings::class,
    'property'       => 'youtubeChannelId',
    'nullable_string'=> true,
],
SystemSettingKeyEnum::STREAM_YOUTUBE_DEFAULT_PRIVACY->value => [
    'group'          => SystemSettingGroupEnum::STREAMING,
    'type'           => SystemSettingTypeEnum::STRING,
    'label'          => 'YouTube Default Broadcast Privacy',
    'description'    => 'Default for new broadcasts: public or unlisted.',
    'settings_class' => StreamingSettings::class,
    'property'       => 'youtubeDefaultPrivacy',
    'nullable_string'=> true,
],
```

### Validation Rules

```php
// app/Settings/SystemSettingRegistry.php — add to rules()

SystemSettingKeyEnum::STREAM_DEFAULT_PROVIDER => [
    'value' => ['required', 'string', 'in:youtube'],  // expand when Cloudflare is added
],
SystemSettingKeyEnum::STREAM_YOUTUBE_CLIENT_ID => [
    'value' => ['nullable', 'string', 'max:256'],
],
SystemSettingKeyEnum::STREAM_YOUTUBE_CLIENT_SECRET => [
    'value' => ['nullable', 'string', 'max:512'],
],
SystemSettingKeyEnum::STREAM_YOUTUBE_REFRESH_TOKEN => [
    'value' => ['nullable', 'string', 'max:2048'],
],
SystemSettingKeyEnum::STREAM_YOUTUBE_CHANNEL_ID => [
    'value' => ['nullable', 'string', 'max:64', 'regex:/^UC[A-Za-z0-9_-]{22}$/'],
],
SystemSettingKeyEnum::STREAM_YOUTUBE_DEFAULT_PRIVACY => [
    'value' => ['nullable', 'string', Rule::in(['public', 'unlisted'])],
],
```

### Seeder

```php
// database/seeders/SystemSettingsSeeder.php — add to existing seeder

$streamingSettings = app(StreamingSettings::class);
if (! isset($streamingSettings->defaultProvider)) {
    $streamingSettings->defaultProvider       = 'youtube';
    $streamingSettings->youtubeClientId       = null;
    $streamingSettings->youtubeClientSecret   = null;
    $streamingSettings->youtubeRefreshToken   = null;
    $streamingSettings->youtubeChannelId      = null;
    $streamingSettings->youtubeDefaultPrivacy = 'public';
    $streamingSettings->save();
}
```

### Register in Spatie Config

```php
// config/settings.php — add to the 'settings' array
\App\Settings\StreamingSettings::class,
```

### Admin UI

The existing backoffice settings page at `/settings/system-settings` automatically groups and renders the new keys under a **"Live Streaming"** section. No new UI code needed.

---

## Data Model

### `match_streams` — one row per match (1:1)

A dedicated table keeps `matches` clean. All streaming state lives here.

```php
// database/migrations/xxxx_create_match_streams_table.php

Schema::create('match_streams', function (Blueprint $table) {
    $table->id();
    $table->foreignId('match_id')->unique()->constrained('matches')->cascadeOnDelete();
    $table->foreignId('created_by')->constrained('users');

    // Which provider owns this stream
    $table->string('provider', 30);                       // 'youtube'

    // Status lifecycle: idle → starting → live → ended | error
    $table->string('status', 20)->default('idle');
    $table->timestamp('started_at')->nullable();
    $table->timestamp('ended_at')->nullable();

    // Provider-assigned IDs
    $table->string('provider_stream_id')->nullable();     // YouTube broadcastId
    $table->string('provider_ingest_id')->nullable();     // YouTube liveStream resourceId
    $table->string('provider_playback_id')->nullable();   // YouTube videoId
    $table->string('provider_recording_id')->nullable();  // Populated after stream ends

    // Ingest details — admin only, never sent to fans
    $table->text('ingest_rtmp_url')->nullable();
    $table->text('stream_key_encrypted')->nullable();     // Crypt::encryptString()

    // Playback — served to clients
    $table->text('playback_url')->nullable();             // null for YouTube (uses embed)
    $table->text('embed_url')->nullable();                // YouTube iframe src

    // Escape hatch for vendor-specific fields — never sent raw to clients
    $table->jsonb('provider_metadata')->default('{}');

    $table->timestamps();
});
```

### Provider override on tournaments and matches

Allows switching a specific tournament or match to a different provider later (e.g., Cloudflare) without any code changes.

```php
// database/migrations/xxxx_add_stream_provider_to_tournaments_and_matches.php

Schema::table('tournaments', function (Blueprint $table) {
    $table->string('stream_provider', 30)->nullable();
});

Schema::table('matches', function (Blueprint $table) {
    $table->string('stream_provider_override', 30)->nullable();
});
```

### Provider Resolution

```
match.stream_provider_override     (single match override)
    ↓ null
tournament.stream_provider         (all matches in this tournament)
    ↓ null
StreamingSettings::$defaultProvider   (platform default — 'youtube')
```

---

## Provider Abstraction

### Interface

Kept deliberately minimal for what YouTube needs today. `handleWebhook()` and `createClip()` are added when Cloudflare is implemented — see [Future section](#future-adding-cloudflare-stream).

```php
// app/Streaming/Contracts/StreamProviderContract.php

namespace App\Streaming\Contracts;

use App\Models\MatchStream;
use App\Streaming\Data\CreateStreamData;
use App\Streaming\Data\StreamIngestConfig;
use App\Streaming\Data\StreamPlayback;

interface StreamProviderContract
{
    /** Create a live broadcast on the vendor and persist IDs onto $stream. */
    public function createStream(MatchStream $stream, CreateStreamData $data): void;

    /** Poll vendor API for current status and update $stream if changed. */
    public function syncStatus(MatchStream $stream): void;

    /** Gracefully end the broadcast. */
    public function endStream(MatchStream $stream): void;

    /** Remove remote resources. */
    public function deleteStream(MatchStream $stream): void;

    /** Build the client-safe playback descriptor. No secrets. */
    public function playback(MatchStream $stream): StreamPlayback;

    /** Return RTMP ingest credentials. Admin-only. */
    public function ingestConfig(MatchStream $stream): StreamIngestConfig;

    /** Provider slug — 'youtube' */
    public function slug(): string;

    /** True when provider fires webhooks. False = will be polled by scheduler. */
    public function supportsWebhooks(): bool;
}
```

### Value Objects

```php
// app/Streaming/Data/StreamPlayback.php

final readonly class StreamPlayback
{
    public function __construct(
        public string  $mode,            // 'iframe' | 'hls'
        public ?string $url,             // HLS .m3u8 or null
        public ?string $embedId,         // YouTube videoId or null
        public ?string $embedUrl,        // Full iframe src
        public array   $playerOptions = [],
    ) {}
}

// app/Streaming/Data/StreamIngestConfig.php

final readonly class StreamIngestConfig
{
    public function __construct(
        public string  $rtmpUrl,
        public string  $streamKey,
        public ?string $backupRtmpUrl = null,
    ) {}
}

// app/Streaming/Data/CreateStreamData.php

final readonly class CreateStreamData
{
    public function __construct(
        public string  $title,
        public string  $description,
        public ?Carbon $scheduledAt = null,
        public string  $privacy = 'public',
    ) {}
}
```

### Provider Manager

```php
// app/Streaming/StreamProviderManager.php

namespace App\Streaming;

use App\Streaming\Contracts\StreamProviderContract;
use Illuminate\Support\Manager;

class StreamProviderManager extends Manager
{
    public function getDefaultDriver(): string
    {
        return app(\App\Settings\StreamingSettings::class)->defaultProvider;
    }

    public function createYoutubeDriver(): StreamProviderContract
    {
        return $this->container->make(Providers\YouTubeStreamProvider::class);
    }

    // createCloudflareDriver() added here when Cloudflare is implemented
}
```

### Provider Resolver

```php
// app/Streaming/StreamProviderResolver.php

namespace App\Streaming;

use App\Models\TournamentMatch;
use App\Streaming\Contracts\StreamProviderContract;

class StreamProviderResolver
{
    public function __construct(private StreamProviderManager $manager) {}

    public function forMatch(TournamentMatch $match): StreamProviderContract
    {
        if ($match->stream?->provider) {
            return $this->manager->driver($match->stream->provider);
        }

        $slug = $match->stream_provider_override
            ?? $match->tournament?->stream_provider
            ?? app(\App\Settings\StreamingSettings::class)->defaultProvider;

        return $this->manager->driver($slug);
    }
}
```

### Service Provider

```php
// app/Providers/StreamingServiceProvider.php

namespace App\Providers;

use App\Streaming\StreamProviderManager;
use Illuminate\Support\ServiceProvider;

class StreamingServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(StreamProviderManager::class);
        $this->app->singleton(\App\Streaming\StreamProviderResolver::class);
        $this->app->singleton(Providers\YouTubeStreamProvider::class);
    }
}
```

---

## MatchStreamService

Controllers never call provider classes directly. All stream lifecycle logic lives here.

```php
// app/Streaming/MatchStreamService.php

namespace App\Streaming;

use App\Events\MatchStreamStatusUpdated;
use App\Models\MatchStream;
use App\Models\TournamentMatch;
use App\Streaming\Data\CreateStreamData;
use App\Streaming\Data\StreamPlayback;
use Illuminate\Support\Facades\Log;

class MatchStreamService
{
    public function __construct(private StreamProviderResolver $resolver) {}

    public function create(TournamentMatch $match, CreateStreamData $data, int $createdBy): MatchStream
    {
        abort_if($match->stream?->status === 'live', 422, 'A stream is already live for this match.');

        if ($match->stream) {
            $this->resolver->forMatch($match)->deleteStream($match->stream);
            $match->stream->delete();
        }

        $stream = MatchStream::create([
            'match_id'   => $match->id,
            'provider'   => $this->resolver->forMatch($match)->slug(),
            'status'     => 'idle',
            'created_by' => $createdBy,
        ]);

        $this->resolver->forMatch($match)->createStream($stream, $data);
        $stream->refresh();

        Log::info("Stream created for match {$match->id}", [
            'provider'  => $stream->provider,
            'stream_id' => $stream->provider_stream_id,
        ]);

        return $stream;
    }

    public function end(TournamentMatch $match): void
    {
        $stream = $match->stream ?? abort(404, 'No stream found.');
        $this->resolver->forMatch($match)->endStream($stream);
        broadcast(new MatchStreamStatusUpdated($match->id, 'ended', null));
    }

    public function delete(TournamentMatch $match): void
    {
        $stream = $match->stream ?? abort(404, 'No stream found.');
        $this->resolver->forMatch($match)->deleteStream($stream);
        $stream->delete();
    }

    public function playback(TournamentMatch $match): StreamPlayback
    {
        $stream = $match->stream ?? abort(404, 'No stream found.');
        return $this->resolver->forMatch($match)->playback($stream);
    }

    public function syncStatus(TournamentMatch $match): void
    {
        $stream = $match->stream;
        if (! $stream || in_array($stream->status, ['ended', 'error'])) return;

        $before = $stream->status;
        $this->resolver->forMatch($match)->syncStatus($stream);
        $stream->refresh();

        if ($stream->status !== $before) {
            broadcast(new MatchStreamStatusUpdated(
                $match->id,
                $stream->status,
                $stream->status === 'live'
                    ? $this->resolver->forMatch($match)->playback($stream)
                    : null,
            ));

            Log::info("Stream status changed for match {$match->id}", [
                'from' => $before,
                'to'   => $stream->status,
            ]);
        }
    }
}
```

---

## YouTube Provider

### How YouTube Live Works

```
1. Create liveStream resource  → RTMP ingest URL + stream key
2. Create liveBroadcast resource → the YouTube video event (title, privacy, DVR)
3. Bind the stream to the broadcast
4. vMix / OBS pushes RTMP → YouTube ingests → transcodes → viewers watch via iframe
5. YouTube detects RTMP → broadcast transitions: created → testing → live
6. Match ends → call endStream() → broadcast transitions to complete
```

```php
// app/Streaming/Providers/YouTubeStreamProvider.php

namespace App\Streaming\Providers;

use App\Models\MatchStream;
use App\Settings\StreamingSettings;
use App\Streaming\Contracts\StreamProviderContract;
use App\Streaming\Data\CreateStreamData;
use App\Streaming\Data\StreamIngestConfig;
use App\Streaming\Data\StreamPlayback;
use Google\Client as GoogleClient;
use Google\Service\YouTube;
use Google\Service\YouTube\CdnSettings;
use Google\Service\YouTube\LiveBroadcast;
use Google\Service\YouTube\LiveBroadcastContentDetails;
use Google\Service\YouTube\LiveBroadcastSnippet;
use Google\Service\YouTube\LiveBroadcastStatus;
use Google\Service\YouTube\LiveStream;
use Google\Service\YouTube\LiveStreamSnippet;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

class YouTubeStreamProvider implements StreamProviderContract
{
    private YouTube $yt;

    public function __construct()
    {
        // All credentials from system settings — manageable from admin panel
        $settings = app(StreamingSettings::class);

        $client = new GoogleClient();
        $client->setClientId($settings->youtubeClientId);
        $client->setClientSecret($settings->youtubeClientSecret);   // Spatie decrypts automatically
        $client->setRedirectUri(StreamingSettings::OAUTH_REDIRECT_URI);
        $client->setAccessType('offline');

        // Single platform-level token — all matches stream to the Tapeya YouTube channel
        $client->fetchAccessTokenWithRefreshToken($settings->youtubeRefreshToken); // Spatie decrypts automatically

        $this->yt = new YouTube($client);
    }

    // ── Create ────────────────────────────────────────────────────────────────

    public function createStream(MatchStream $stream, CreateStreamData $data): void
    {
        // Step 1: Create the liveStream resource (RTMP ingest + key)
        $liveStream = new LiveStream(['kind' => 'youtube#liveStream']);
        $liveStream->setSnippet(new LiveStreamSnippet(['title' => $data->title]));
        $liveStream->setCdn(new CdnSettings([
            'ingestionType' => 'rtmp',
            'resolution'    => '1080p',
            'frameRate'     => '30fps',
        ]));

        $streamResponse = $this->yt->liveStreams->insert('snippet,cdn', $liveStream);
        $streamId       = $streamResponse->getId();
        $ingestion      = $streamResponse->getCdn()->getIngestionInfo();

        // Step 2: Create the liveBroadcast (the YouTube video event)
        $broadcast = new LiveBroadcast(['kind' => 'youtube#liveBroadcast']);
        $broadcast->setSnippet(new LiveBroadcastSnippet([
            'title'              => $data->title,
            'description'        => $data->description,
            'scheduledStartTime' => ($data->scheduledAt ?? now())->toAtomString(),
        ]));
        $broadcast->setStatus(new LiveBroadcastStatus([
            'privacyStatus' => $data->privacy,
        ]));
        $broadcast->setContentDetails(new LiveBroadcastContentDetails([
            'enableAutoStart' => true,  // go live when RTMP signal arrives
            'enableAutoStop'  => true,  // end when RTMP signal drops
            'enableDvr'       => true,  // viewers can rewind to match start
            'recordFromStart' => true,  // record full broadcast
            'monitorStream'   => ['enableMonitorStream' => false],
        ]));

        $broadcastResponse = $this->yt->liveBroadcasts->insert('snippet,status,contentDetails', $broadcast);
        $broadcastId       = $broadcastResponse->getId();

        // Step 3: Bind the stream to the broadcast
        $this->yt->liveBroadcasts->bind($broadcastId, 'id,contentDetails', ['streamId' => $streamId]);

        // Step 4: Persist all IDs and credentials
        $stream->update([
            'provider_stream_id'   => $broadcastId,
            'provider_ingest_id'   => $streamId,
            'provider_playback_id' => $broadcastId,
            'ingest_rtmp_url'      => $ingestion->getIngestionAddress(),
            'stream_key_encrypted' => Crypt::encryptString($ingestion->getStreamName()),
            'embed_url'            => "https://www.youtube.com/embed/{$broadcastId}?autoplay=1&rel=0&modestbranding=1",
            'playback_url'         => null,
            'status'               => 'idle',
            'provider_metadata'    => [
                'youtube_stream_id'  => $streamId,
                'youtube_channel_id' => app(StreamingSettings::class)->youtubeChannelId,
                'privacy'            => $data->privacy,
            ],
        ]);
    }

    // ── Status sync (polling — YouTube has no server-to-server webhooks) ─────

    public function syncStatus(MatchStream $stream): void
    {
        if (! $stream->provider_stream_id) return;

        try {
            $response  = $this->yt->liveBroadcasts->listLiveBroadcasts('id,status', [
                'id' => $stream->provider_stream_id,
            ]);
            $items = $response->getItems();

            if (empty($items)) {
                $stream->update(['status' => 'ended']);
                return;
            }

            $lifecycle = $items[0]->getStatus()->getLifeCycleStatus();

            $status = match ($lifecycle) {
                'live'                    => 'live',
                'complete'                => 'ended',
                'testStarting', 'testing' => 'starting',
                default                   => 'idle',
            };

            $updates = ['status' => $status];
            if ($status === 'live'  && ! $stream->started_at) $updates['started_at'] = now();
            if ($status === 'ended' && ! $stream->ended_at)   $updates['ended_at']   = now();

            $stream->update($updates);
        } catch (\Exception $e) {
            Log::error("YouTube syncStatus failed for stream {$stream->id}: " . $e->getMessage());
        }
    }

    // ── End ───────────────────────────────────────────────────────────────────

    public function endStream(MatchStream $stream): void
    {
        if (! $stream->provider_stream_id) return;

        try {
            $this->yt->liveBroadcasts->transition('complete', $stream->provider_stream_id, 'status');
        } catch (\Exception $e) {
            Log::warning("YouTube broadcast transition failed for stream {$stream->id}: " . $e->getMessage());
        }

        $stream->update(['status' => 'ended', 'ended_at' => now()]);
        // embed_url kept — YouTube video remains as VOD after broadcast ends
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    public function deleteStream(MatchStream $stream): void
    {
        if (! $stream->provider_stream_id) return;

        try {
            $this->yt->liveBroadcasts->delete($stream->provider_stream_id);
        } catch (\Exception $e) {
            Log::warning("YouTube broadcast delete failed for stream {$stream->id}: " . $e->getMessage());
        }

        $stream->update(['status' => 'ended', 'ended_at' => $stream->ended_at ?? now()]);
    }

    // ── Playback (client-safe, no secrets) ───────────────────────────────────

    public function playback(MatchStream $stream): StreamPlayback
    {
        return new StreamPlayback(
            mode:          'iframe',
            url:           null,
            embedId:       $stream->provider_playback_id,
            embedUrl:      $stream->embed_url,
            playerOptions: [
                'autoplay'       => true,
                'controls'       => true,
                'modestbranding' => true,
                'rel'            => 0,
            ],
        );
    }

    // ── Ingest config (admin only) ────────────────────────────────────────────

    public function ingestConfig(MatchStream $stream): StreamIngestConfig
    {
        return new StreamIngestConfig(
            rtmpUrl:       $stream->ingest_rtmp_url ?? 'rtmp://a.rtmp.youtube.com/live2',
            streamKey:     Crypt::decryptString($stream->stream_key_encrypted),
            backupRtmpUrl: 'rtmp://b.rtmp.youtube.com/live2?backup=1',
        );
    }

    public function slug(): string           { return 'youtube'; }
    public function supportsWebhooks(): bool { return false; }
}
```

### Status Polling Command

```php
// app/Console/Commands/SyncStreamStatuses.php

namespace App\Console\Commands;

use App\Models\MatchStream;
use App\Streaming\MatchStreamService;
use Illuminate\Console\Command;

class SyncStreamStatuses extends Command
{
    protected $signature   = 'streams:sync';
    protected $description = 'Poll providers to sync stream statuses';

    public function handle(MatchStreamService $service): void
    {
        MatchStream::whereNotIn('status', ['ended', 'error'])
            ->whereNotNull('provider_stream_id')
            ->with('match.tournament')
            ->get()
            ->each(function (MatchStream $stream) use ($service) {
                // Skip providers that use webhooks instead (e.g., Cloudflare when added)
                if (app(\App\Streaming\StreamProviderResolver::class)
                        ->forMatch($stream->match)
                        ->supportsWebhooks()) return;

                $service->syncStatus($stream->match);
            });
    }
}
```

```php
// routes/console.php
Schedule::command('streams:sync')->everyMinute()->withoutOverlapping()->runInBackground();
```

---

## API Layer

### Routes

```php
// routes/api.php

Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::post   ('matches/{match}/stream',          [StreamController::class, 'create']);
    Route::get    ('matches/{match}/stream',          [StreamController::class, 'show']);
    Route::post   ('matches/{match}/stream/end',      [StreamController::class, 'end']);
    Route::delete ('matches/{match}/stream',          [StreamController::class, 'destroy']);
    Route::post   ('matches/{match}/stream/sync',     [StreamController::class, 'sync']);
    Route::patch  ('matches/{match}/stream/provider', [StreamController::class, 'setProvider']);
});
```

### Admin Controller

```php
// app/Http/Controllers/Api/V1/StreamController.php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\StreamAdminResource;
use App\Models\TournamentMatch;
use App\Settings\StreamingSettings;
use App\Streaming\Data\CreateStreamData;
use App\Streaming\MatchStreamService;
use App\Streaming\StreamProviderManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StreamController extends Controller
{
    public function __construct(
        private MatchStreamService    $service,
        private StreamProviderManager $manager,
    ) {}

    public function create(Request $request, TournamentMatch $match): JsonResponse
    {
        $this->authorize('manageStream', $match);

        $request->validate([
            'title'        => ['sometimes', 'string', 'max:100'],
            'privacy'      => ['sometimes', 'in:public,unlisted'],
            'scheduled_at' => ['sometimes', 'date'],
        ]);

        $settings = app(StreamingSettings::class);

        $data = new CreateStreamData(
            title:       $request->input('title', "{$match->homeTeam?->name} vs {$match->awayTeam?->name}"),
            description: "Live cricket match streamed via Tapeya. Follow live scores at tapeya.com/match/{$match->id}",
            privacy:     $request->input('privacy', $settings->youtubeDefaultPrivacy ?? 'public'),
        );

        $stream = $this->service->create($match, $data, $request->user()->id);

        $ingest = $this->manager->driver($stream->provider)->ingestConfig($stream);

        return response()->json([
            'stream' => new StreamAdminResource($stream),
            'ingest' => [
                'rtmp_url'        => $ingest->rtmpUrl,
                'stream_key'      => $ingest->streamKey,
                'backup_rtmp_url' => $ingest->backupRtmpUrl,
            ],
        ], 201);
    }

    public function show(TournamentMatch $match): JsonResponse
    {
        $this->authorize('manageStream', $match);
        $stream = $match->stream ?? abort(404);
        $ingest = $this->manager->driver($stream->provider)->ingestConfig($stream);

        return response()->json([
            'stream' => new StreamAdminResource($stream),
            'ingest' => [
                'rtmp_url'        => $ingest->rtmpUrl,
                'stream_key'      => $ingest->streamKey,
                'backup_rtmp_url' => $ingest->backupRtmpUrl,
            ],
        ]);
    }

    public function end(TournamentMatch $match): JsonResponse
    {
        $this->authorize('manageStream', $match);
        $this->service->end($match);
        return response()->json(['status' => 'ended']);
    }

    public function destroy(TournamentMatch $match): JsonResponse
    {
        $this->authorize('manageStream', $match);
        $this->service->delete($match);
        return response()->json(null, 204);
    }

    public function sync(TournamentMatch $match): JsonResponse
    {
        $this->authorize('manageStream', $match);
        $this->service->syncStatus($match);
        return response()->json(['status' => $match->stream?->status ?? 'idle']);
    }

    public function setProvider(Request $request, TournamentMatch $match): JsonResponse
    {
        $this->authorize('manageStream', $match);
        $request->validate([
            'provider' => ['required', 'string', 'in:youtube'],  // expand when Cloudflare added
        ]);
        abort_if($match->stream?->status === 'live', 422, 'Cannot change provider while stream is live.');
        $match->update(['stream_provider_override' => $request->input('provider')]);
        return response()->json(['provider' => $match->stream_provider_override]);
    }
}
```

### Public Match Resource — Normalized Stream Shape

The app always receives the same shape regardless of provider. Nothing in the frontend ever needs to change when a new provider is added.

```php
// In MatchResource.php

'stream' => $this->when($this->stream, fn() => [
    'status'     => $this->stream->status,
    'provider'   => $this->stream->provider,
    'playback'   => $this->when(
        in_array($this->stream->status, ['live', 'ended']),
        fn() => $this->streamPlayback(),
    ),
    'started_at' => $this->stream->started_at,
    'ended_at'   => $this->stream->ended_at,
]),

private function streamPlayback(): array
{
    $pb = app(\App\Streaming\MatchStreamService::class)->playback($this->resource);
    return [
        'mode'           => $pb->mode,
        'url'            => $pb->url,
        'embed_id'       => $pb->embedId,
        'embed_url'      => $pb->embedUrl,
        'player_options' => $pb->playerOptions,
    ];
}
```

**Response for a live YouTube match:**

```json
{
  "stream": {
    "status": "live",
    "provider": "youtube",
    "playback": {
      "mode": "iframe",
      "url": null,
      "embed_id": "dQw4w9WgXcQ",
      "embed_url": "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1",
      "player_options": { "autoplay": true, "controls": true, "modestbranding": true, "rel": 0 }
    },
    "started_at": "2026-05-18T14:00:00Z",
    "ended_at": null
  }
}
```

---

## Frontend — StreamPlayer

The `StreamPlayer` component is the only place in the frontend that knows about providers. Everything else treats `stream` as an opaque object.

### Component Structure

```
app/src/features/stream/
  StreamPlayer.jsx           ← switches on playback.mode
  adapters/
    IframeStreamPlayer.jsx   ← YouTube iframe (current)
  StreamOfflineSlate.jsx
  hooks/
    useMatchStream.js        ← RTK Query + Reverb
```

> `HlsStreamPlayer.jsx` is added when Cloudflare is implemented — see [Future section](#future-adding-cloudflare-stream).

### StreamPlayer

```jsx
// app/src/features/stream/StreamPlayer.jsx

import { IframeStreamPlayer } from './adapters/IframeStreamPlayer';
import { StreamOfflineSlate } from './StreamOfflineSlate';

const PLAYERS = {
  iframe: IframeStreamPlayer,
  // hls: HlsStreamPlayer  ← uncomment when Cloudflare is added
};

export function StreamPlayer({ stream, className = '' }) {
  if (!stream || !['live', 'ended'].includes(stream.status) || !stream.playback) {
    return <StreamOfflineSlate status={stream?.status} />;
  }

  const Player = PLAYERS[stream.playback.mode];
  if (!Player) return <StreamOfflineSlate status="error" />;

  return <Player playback={stream.playback} className={className} />;
}
```

### IframeStreamPlayer — YouTube

```jsx
// app/src/features/stream/adapters/IframeStreamPlayer.jsx

export function IframeStreamPlayer({ playback, className = '' }) {
  return (
    <div className={`relative w-full aspect-video bg-black ${className}`}>
      <iframe
        className="absolute inset-0 h-full w-full border-0"
        src={playback.embedUrl}
        title="Live Match"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      />
    </div>
  );
}
```

### StreamOfflineSlate

```jsx
// app/src/features/stream/StreamOfflineSlate.jsx

const MESSAGES = {
  idle:     'Stream starting soon',
  starting: 'Connecting to stream…',
  ended:    'Stream has ended',
  error:    'Stream unavailable',
};

export function StreamOfflineSlate({ status = 'idle' }) {
  return (
    <div className="flex aspect-video w-full items-center justify-center bg-black text-white/50">
      <div className="text-center">
        <div className="text-4xl">{status === 'ended' ? '🏏' : '📺'}</div>
        <div className="mt-2 text-sm">{MESSAGES[status] ?? 'Stream unavailable'}</div>
      </div>
    </div>
  );
}
```

---

## Score Overlay

The overlay is a React layer over the player container — identical for all providers. It reads from the existing RTK Query match_state cache fed by Reverb.

```jsx
// Match watch page

import { StreamPlayer }      from '@/features/stream/StreamPlayer';
import { LiveScoreStrip }    from '@/features/scoring/LiveScoreStrip';
import { useGetMatchQuery }  from '@/store/api/matchApi';
import { useMatchStreamChannel } from '@/features/stream/hooks/useMatchStream';

export function MatchWatchPage({ matchId }) {
  const { data: match } = useGetMatchQuery(matchId, { pollingInterval: 10_000 });
  useMatchStreamChannel(matchId);

  if (!match?.stream) return null;

  return (
    <div className="relative w-full">
      <StreamPlayer stream={match.stream} />

      {match.stream.status === 'live' && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
          <LiveScoreStrip matchId={matchId} />
        </div>
      )}
    </div>
  );
}
```

> The overlay sits above the YouTube iframe with `pointer-events: none` so touches pass through to the YouTube player controls inside the iframe.

---

## Reverb — Stream Status Events

```php
// app/Events/MatchStreamStatusUpdated.php

class MatchStreamStatusUpdated implements ShouldBroadcast
{
    public function __construct(
        public readonly int             $matchId,
        public readonly string          $status,
        public readonly ?StreamPlayback $playback,
    ) {}

    public function broadcastOn(): array
    {
        return [new Channel("match.{$this->matchId}.stream")];
    }

    public function broadcastWith(): array
    {
        return [
            'status'   => $this->status,
            'playback' => $this->playback ? [
                'mode'           => $this->playback->mode,
                'url'            => $this->playback->url,
                'embed_id'       => $this->playback->embedId,
                'embed_url'      => $this->playback->embedUrl,
                'player_options' => $this->playback->playerOptions,
            ] : null,
        ];
    }
}
```

```js
// app/src/features/stream/hooks/useMatchStream.js

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { matchApi } from '@/store/api/matchApi';

export function useMatchStreamChannel(matchId) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!matchId) return;
    const channel = window.Echo.channel(`match.${matchId}.stream`);

    channel.listen('MatchStreamStatusUpdated', ({ status, playback }) => {
      dispatch(
        matchApi.util.updateQueryData('getMatch', String(matchId), (draft) => {
          if (draft.stream) {
            draft.stream.status   = status;
            draft.stream.playback = playback ?? draft.stream.playback;
          }
        })
      );
    });

    return () => window.Echo.leave(`match.${matchId}.stream`);
  }, [matchId, dispatch]);
}
```

---

## YouTube OAuth Setup

```bash
# 1. Create Google Cloud project
# 2. Enable YouTube Data API v3
# 3. Create OAuth2 credentials → Web Application type (not Desktop)
# 4. Authorized redirect URIs → add exactly: http://localhost
# 5. OAuth consent screen → Testing → add your Google account as a test user
# 6. Admin → System Settings → Live Streaming → set Client ID + Client Secret
# 7. Run the one-time authorization:

php artisan youtube:authorize
# → open printed URL in browser (use the test-user Google account)
# → after sign-in, browser goes to http://localhost/?code=... (blank page is normal)
# → copy the `code` query param from the address bar → paste into terminal
# → refresh token saved to System Settings
# 8. Set YouTube Channel ID (UC…) in Live Streaming settings
```

Uses `StreamingSettings::OAUTH_REDIRECT_URI` (`http://localhost`) in code — **not** an admin setting. Runtime API calls (`YouTubeStreamProvider`) use the same constant when refreshing tokens.

```php
// app/Console/Commands/YouTubeAuthorize.php (excerpt)

$redirectUri = StreamingSettings::OAUTH_REDIRECT_URI;
$client->setRedirectUri($redirectUri);
// … createAuthUrl(), then paste `code` from http://localhost/?code=…
```

**Common OAuth errors**

| Error | Fix |
|-------|-----|
| `redirect_uri_mismatch` | Web client must list `http://localhost`; do not use `urn:ietf:wg:oauth:2.0:oob` (desktop-only) |
| App not verified / access blocked | Stay in **Testing**; add your Gmail under **Test users** |
| `liveStreamingNotEnabled` | Enable live streaming on the YouTube channel in YouTube Studio (verify channel, wait up to 24h if required) |

---

## Security

| Asset | Handling |
|-------|----------|
| RTMP stream key | `Crypt::encryptString()` in DB; shown only on `POST /admin/matches/{id}/stream` |
| YouTube OAuth tokens | Stored encrypted via Spatie `#[ShouldBeEncrypted]`; never logged |
| Playback config | Requires `authorize('viewStream', $match)` before serving |
| Private tournaments | `privacy: 'unlisted'` at broadcast creation + API gate |
| Fan app | Receives embed config only — never ingest URL or stream key |

---

## Testing

```php
// tests/Fakes/FakeStreamProvider.php — use in all tests, no YouTube API calls in CI

class FakeStreamProvider implements StreamProviderContract
{
    public function createStream(MatchStream $stream, CreateStreamData $data): void
    {
        $stream->update([
            'provider'             => 'fake',
            'provider_stream_id'   => 'fake-broadcast-' . $stream->id,
            'provider_playback_id' => 'fake-video-' . $stream->id,
            'embed_url'            => 'https://fake-embed.test/' . $stream->id,
            'ingest_rtmp_url'      => 'rtmp://fake.test/live',
            'stream_key_encrypted' => \Crypt::encryptString('fake-key'),
            'status'               => 'idle',
        ]);
    }

    public function syncStatus(MatchStream $stream): void {}
    public function endStream(MatchStream $stream): void   { $stream->update(['status' => 'ended']); }
    public function deleteStream(MatchStream $stream): void {}

    public function playback(MatchStream $stream): StreamPlayback
    {
        return new StreamPlayback(mode: 'iframe', url: null, embedId: 'fake-id', embedUrl: 'https://fake-embed.test');
    }

    public function ingestConfig(MatchStream $stream): StreamIngestConfig
    {
        return new StreamIngestConfig('rtmp://fake.test/live', 'fake-key');
    }

    public function slug(): string           { return 'fake'; }
    public function supportsWebhooks(): bool { return false; }
}
```

| Layer | What to test |
|-------|-------------|
| `StreamProviderResolver` | Unit: match / tournament / platform default precedence |
| `YouTubeStreamProvider` | Contract tests with mocked Google API HTTP responses |
| `MatchStreamService` | Feature tests using `FakeStreamProvider` |
| Admin API | `POST` → 201 with ingest config; `show`; `end`; `delete` |
| Match resource | `stream.playback.mode === 'iframe'`; no secrets in fan response |
| Reverb event | Dispatched on status change; payload matches contract |
| Polling command | Status change triggers `MatchStreamStatusUpdated` broadcast |
| `StreamPlayer.jsx` | Renders iframe for `mode: iframe`; renders offline slate when no stream |

---

## Environment Configuration

Zero new `.env` variables for streaming. Everything is set from the admin panel.

```env
# api/.env — no streaming additions needed

# Storage (unchanged)
MEDIA_DISK=s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=ap-south-1
AWS_BUCKET=tapeya
AWS_URL=https://d1nmw2vhka3zp0.cloudfront.net
```

**All streaming settings managed from Admin → System Settings → Live Streaming:**

| Setting | Set by |
|---------|--------|
| Default provider | Admin panel |
| YouTube Client ID / Secret | Admin panel |
| YouTube Refresh Token | `php artisan youtube:authorize` (auto-saves) |
| YouTube Channel ID | Admin panel |
| Default broadcast privacy | Admin panel |
| OAuth redirect URI | Code constant `StreamingSettings::OAUTH_REDIRECT_URI` = `http://localhost` — register in Google Cloud Console only |

---

## Implementation Steps

> Steps are ordered by dependency. Each step is a single, reviewable unit of work. Steps within a group that share no dependency on each other can be done in parallel.

---

### Group A — Settings Layer

#### Step A1 — Install Google API Client
**Files:** `composer.json`

```bash
composer require google/apiclient
```

**Done when:** `vendor/google/apiclient` exists; `composer.json` lists the dependency.

---

#### Step A2 — Create `StreamingSettings` class
**File to create:** `app/Settings/StreamingSettings.php`

Copy the full class from [Streaming Configuration → StreamingSettings Class](#streaming-configuration-via-system-settings).

**Done when:** file exists; `php artisan tinker --execute="app(\App\Settings\StreamingSettings::class)"` resolves without errors.

---

#### Step A3 — Add `STREAMING` group to enum
**File to modify:** `app/Enums/SystemSetting/SystemSettingGroupEnum.php`

Add:
```php
/** Live streaming provider configuration. */
case STREAMING = 'streaming';
```

And in the `label()` match expression add:
```php
self::STREAMING => 'Live Streaming',
```

**Done when:** `SystemSettingGroupEnum::STREAMING->value === 'streaming'`.

---

#### Step A4 — Add 6 streaming keys to `SystemSettingKeyEnum`
**File to modify:** `app/Enums/SystemSetting/SystemSettingKeyEnum.php`

Add all 6 cases from [New Enum Cases](#new-enum-cases) (redirect URI is not a setting key).

**Done when:** all 6 `STREAM_*` cases exist; no syntax errors.

---

#### Step A5 — Add definitions and validation rules to `SystemSettingRegistry`
**File to modify:** `app/Settings/SystemSettingRegistry.php`

- Add 6 definitions to `definitions()` from [Registry Definitions](#registry-definitions)
- Add 6 rule sets to `rules()` from [Validation Rules](#validation-rules)

**Depends on:** A2, A3, A4

**Done when:** admin panel at `/settings/system-settings` renders the **"Live Streaming"** group with all 6 fields.

---

#### Step A6 — Register settings class, seed defaults, run migration
**Files to modify:**
- `config/settings.php` — add `\App\Settings\StreamingSettings::class` to the `settings` array
- `database/seeders/SystemSettingsSeeder.php` — add the `StreamingSettings` block from [Seeder](#seeder)

```bash
php artisan settings:migrate
php artisan db:seed --class=SystemSettingsSeeder
```

**Depends on:** A2–A5

**Done when:** seeder runs without errors; `StreamingSettings::$defaultProvider` is `'youtube'` in the database.

---

### Group B — Database

#### Step B1 — Create `match_streams` migration
**File to create:** `database/migrations/xxxx_create_match_streams_table.php`

Copy the full schema from [Data Model → match_streams](#match_streams--one-row-per-match-11).

```bash
php artisan migrate
```

**Done when:** `match_streams` table exists with all columns.

---

#### Step B2 — Add `stream_provider` columns to tournaments and matches
**File to create:** `database/migrations/xxxx_add_stream_provider_to_tournaments_and_matches.php`

Copy from [Provider override on tournaments and matches](#provider-override-on-tournaments-and-matches).

```bash
php artisan migrate
```

**Done when:** `tournaments.stream_provider` and `matches.stream_provider_override` columns exist.

---

### Group C — Provider Abstraction

#### Step C1 — Create value objects and contract interface
**Files to create:**
- `app/Streaming/Contracts/StreamProviderContract.php`
- `app/Streaming/Data/StreamPlayback.php`
- `app/Streaming/Data/StreamIngestConfig.php`
- `app/Streaming/Data/CreateStreamData.php`

Copy all four from [Provider Abstraction](#provider-abstraction).

**Done when:** all 4 files exist; `php artisan route:list` completes without errors.

---

#### Step C2 — Create `MatchStream` model and wire relation on `TournamentMatch`
**File to create:** `app/Models/MatchStream.php`

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchStream extends Model
{
    protected $fillable = [
        'match_id', 'provider', 'status', 'created_by',
        'provider_stream_id', 'provider_ingest_id', 'provider_playback_id', 'provider_recording_id',
        'ingest_rtmp_url', 'stream_key_encrypted', 'playback_url', 'embed_url',
        'provider_metadata', 'started_at', 'ended_at',
    ];

    protected $casts = [
        'provider_metadata' => 'array',
        'started_at'        => 'datetime',
        'ended_at'          => 'datetime',
    ];

    public function match(): BelongsTo
    {
        return $this->belongsTo(TournamentMatch::class, 'match_id');
    }
}
```

**File to modify:** `app/Models/TournamentMatch.php` — add:

```php
use Illuminate\Database\Eloquent\Relations\HasOne;

public function stream(): HasOne
{
    return $this->hasOne(MatchStream::class, 'match_id');
}
```

**Depends on:** B1

**Done when:** `TournamentMatch::find($id)->stream` does not throw; returns `null` when no stream exists.

---

#### Step C3 — Create `StreamProviderManager` and `StreamProviderResolver`
**Files to create:**
- `app/Streaming/StreamProviderManager.php`
- `app/Streaming/StreamProviderResolver.php`

Copy both from [Provider Manager](#provider-manager) and [Provider Resolver](#provider-resolver).

**Depends on:** A2, C1

**Done when:** both classes exist; no syntax errors.

---

#### Step C4 — Create `FakeStreamProvider` for tests
**File to create:** `tests/Fakes/FakeStreamProvider.php`

Copy from [Testing](#testing).

**Depends on:** C1

**Done when:** PHPStan / IDE confirms it satisfies `StreamProviderContract`.

---

#### Step C5 — Create `StreamingServiceProvider` and register it
**File to create:** `app/Providers/StreamingServiceProvider.php`

Copy from [Service Provider](#service-provider).

**File to modify:** `bootstrap/providers.php` — add:
```php
App\Providers\StreamingServiceProvider::class,
```

**Depends on:** C1, C3

**Done when:** `php artisan route:list` completes without any container binding errors.

---

#### Step C6 — Create `YouTubeStreamProvider`
**File to create:** `app/Streaming/Providers/YouTubeStreamProvider.php`

Copy the full class from [YouTube Provider](#youtube-provider).

**Depends on:** A1, A2, C1

**Done when:** class exists; IDE sees it implementing `StreamProviderContract`; no syntax errors.

---

### Group D — Service and Events Layer

#### Step D1 — Create `MatchStreamStatusUpdated` broadcast event
**File to create:** `app/Events/MatchStreamStatusUpdated.php`

Copy from [Reverb — Stream Status Events](#reverb--stream-status-events).

**Depends on:** C1

**Done when:** class exists; implements `ShouldBroadcast`; `broadcastWith()` returns the correct shape.

---

#### Step D2 — Create `MatchStreamService`
**File to create:** `app/Streaming/MatchStreamService.php`

Copy from [MatchStreamService](#matchstreamservice).

**Depends on:** C1, C2, C3, D1

**Done when:** `app(\App\Streaming\MatchStreamService::class)` resolves from the container.

---

#### Step D3 — Create `SyncStreamStatuses` artisan command and schedule it
**File to create:** `app/Console/Commands/SyncStreamStatuses.php`

Copy from [Status Polling Command](#status-polling-command).

**File to modify:** `routes/console.php` — add:
```php
Schedule::command('streams:sync')->everyMinute()->withoutOverlapping()->runInBackground();
```

**Depends on:** C2, C3, D2

**Done when:** `php artisan streams:sync` runs without errors (no active streams is fine; zero rows processed is the expected output).

---

#### Step D4 — Create `YouTubeAuthorize` artisan command
**File to create:** `app/Console/Commands/YouTubeAuthorize.php`

Copy from [YouTube OAuth Setup](#youtube-oauth-setup).

**Depends on:** A1, A2

**Done when:** `php artisan youtube:authorize` runs, prints the OAuth URL, and waits for input.

---

### Group E — API Layer

#### Step E1 — Create `StreamAdminResource`
**File to create:** `app/Http/Resources/StreamAdminResource.php`

```php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class StreamAdminResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                   => $this->id,
            'match_id'             => $this->match_id,
            'provider'             => $this->provider,
            'status'               => $this->status,
            'provider_stream_id'   => $this->provider_stream_id,
            'provider_playback_id' => $this->provider_playback_id,
            'embed_url'            => $this->embed_url,
            'started_at'           => $this->started_at,
            'ended_at'             => $this->ended_at,
            'created_at'           => $this->created_at,
        ];
    }
}
```

**Done when:** resource class exists with the correct shape (no secrets in output).

---

#### Step E2 — Create `StreamController` and API routes
**File to create:** `app/Http/Controllers/Api/V1/StreamController.php`

Copy from [Admin Controller](#admin-controller).

**File to modify:** `routes/api.php` — add the 6 admin routes from [Routes](#routes).

**Depends on:** D2, E1

**Done when:** `php artisan route:list` shows all 6 stream routes; `POST /api/admin/matches/{match}/stream` returns 201.

---

#### Step E3 — Extend `MatchResource` with normalized stream shape
**File to modify:** `app/Http/Resources/MatchResource.php`

Add the `stream` block and `streamPlayback()` helper from [Public Match Resource](#public-match-resource--normalized-stream-shape).

**Depends on:** C2, D2

**Done when:** `GET /api/matches/{id}` for a match that has a stream row includes `stream.status` and `stream.playback`.

---

### Group F — One-Time OAuth Setup

#### Step F1 — Complete YouTube OAuth and save refresh token
Run after Steps A2–A6 and D4 are done, and after the Google Cloud project is configured.

1. Create a Google Cloud project (or use existing)
2. Enable **YouTube Data API v3**
3. Create **OAuth 2.0 credentials** → **Web Application** type (not Desktop)
4. **Authorized redirect URIs** → add exactly `http://localhost` (matches `StreamingSettings::OAUTH_REDIRECT_URI` in code)
5. OAuth consent screen → **Testing** → add the channel owner Gmail as a **test user**
6. In Admin → System Settings → Live Streaming, set:
   - YouTube Client ID
   - YouTube Client Secret
   - YouTube Channel ID (`UCxxxx...`)
7. Run the one-time authorization:

```bash
php artisan youtube:authorize
# → prints auth URL → open in browser → sign in as Tapeya channel owner
# → paste the authorization code back into the terminal
# → refresh token saved automatically to System Settings
```

**Done when:** `StreamingSettings::$youtubeRefreshToken` is non-null in the database; `php artisan streams:sync` completes without auth errors.

---

### Group G — Frontend

#### Step G1 — Create `StreamOfflineSlate` component
**File to create:** `app/src/features/stream/StreamOfflineSlate.jsx`

Copy from [StreamOfflineSlate](#streamofflineslate).

**Done when:** component renders the correct message for each status string (`idle`, `starting`, `ended`, `error`).

---

#### Step G2 — Create `IframeStreamPlayer` adapter
**File to create:** `app/src/features/stream/adapters/IframeStreamPlayer.jsx`

Copy from [IframeStreamPlayer — YouTube](#iframe-stream-player--youtube).

**Done when:** renders a YouTube iframe from `playback.embedUrl`; correct `allow` attributes set for autoplay.

---

#### Step G3 — Create `StreamPlayer` root component
**File to create:** `app/src/features/stream/StreamPlayer.jsx`

Copy from [StreamPlayer](#streamplayer).

**Depends on:** G1, G2

**Done when:** renders `IframeStreamPlayer` when `playback.mode === 'iframe'`; renders `StreamOfflineSlate` for all other states.

---

#### Step G4 — Create `useMatchStreamChannel` Reverb hook
**File to create:** `app/src/features/stream/hooks/useMatchStreamChannel.js`

Copy from [Reverb — Stream Status Events → JS hook](#reverb--stream-status-events).

**Done when:** hook subscribes to `match.{id}.stream` channel on mount; a status update patches the RTK Query `getMatch` cache entry; hook unsubscribes on unmount.

---

#### Step G5 — Integrate `StreamPlayer` and score overlay into match watch page
**File to modify:** the existing match watch/detail page component

Add `StreamPlayer` + `LiveScoreStrip` overlay from [Score Overlay](#score-overlay). Use the `useMatchStreamChannel` hook to keep stream status live.

**Depends on:** G3, G4

**Done when:** a live match shows the YouTube iframe with the score strip overlaid at the bottom; status changes update the player without a page reload.

---

#### Step G6 — Add "LIVE" badge to match list
**File to modify:** match list / match card component

Show a red "LIVE" badge when `match.stream?.status === 'live'`.

**Depends on:** E3

**Done when:** active matches show the badge; completed or idle matches do not.

---

#### Step G7 — Admin stream management UI (backoffice)
**File to modify:** backoffice match detail page

Add:
- **"Start Stream"** button → `POST /api/admin/matches/{id}/stream`; display RTMP URL and stream key with copy-to-clipboard
- Stream **status badge** (idle / starting / live / ended / error)
- **"End Stream"** button (shown only when status is `live`) → `POST /api/admin/matches/{id}/stream/end`
- **"Delete Stream"** button → `DELETE /api/admin/matches/{id}/stream`
- **"Sync Status"** button → `POST /api/admin/matches/{id}/stream/sync`

**Depends on:** E2

**Done when:** admin can create, monitor, and end a stream entirely from the backoffice without touching the database.

---

### Group H — Verification

#### Step H1 — End-to-end smoke test on staging

Run after all preceding steps are complete.

1. `php artisan youtube:authorize` — verify token saved (Step F1)
2. Open backoffice → navigate to a test match → click **"Start Stream"** (Step G7)
3. Copy RTMP URL and stream key → enter into OBS
4. Click **"Start Streaming"** in OBS
5. Wait up to 60 s → `streams:sync` runs → status badge changes to **live**
6. Open the match watch page in the app → YouTube iframe plays; score overlay visible (Step G5)
7. Stop streaming in OBS → status transitions to **ended** within ~60 s

**Done when:** all 7 checklist items pass on a real device (iOS + Android).

---

## Future: Adding Cloudflare Stream

When a tournament requires white-label HLS, low-latency playback, or automated highlight clips, Cloudflare Stream is added as a second driver. The changes are **purely additive** — nothing in the current implementation is modified.

### What changes

| What | Change |
|------|--------|
| `StreamProviderContract` | Add `handleWebhook()` and `createClip()` methods |
| `StreamingSettings` | Add `cloudflareAccountId`, `cloudflareApiToken`, `cloudflareSubdomain`, `cloudflareWebhookSecret` (encrypted) |
| `SystemSettingKeyEnum` | Add 4 new `STREAM_CLOUDFLARE_*` cases |
| `StreamProviderManager` | Add `createCloudflareDriver()` method |
| `StreamingServiceProvider` | Register `CloudflareStreamProvider::class` singleton |
| `STREAM_DEFAULT_PROVIDER` validation | Change `'in:youtube'` → `'in:youtube,cloudflare'` |
| `setProvider` controller | Change `'in:youtube'` → `'in:youtube,cloudflare'` |

### What does NOT change

- `MatchStreamService` — zero changes
- `StreamController` — zero changes
- API routes — zero changes
- `match_streams` schema — zero changes
- `MatchResource` stream shape — zero changes
- `StreamPlayer.jsx` — zero changes (just uncomment `hls: HlsStreamPlayer`)
- `IframeStreamPlayer.jsx` — zero changes
- Reverb events — zero changes
- Polling command — automatically skips Cloudflare (`supportsWebhooks(): true`)

### Interface additions

```php
// Add to StreamProviderContract when implementing Cloudflare:

/** Verify and parse vendor webhook; return status change events. */
public function handleWebhook(Request $request): ProviderWebhookResult;

/** Create a clip from a recording (Cloudflare only). Returns null on YouTube. */
public function createClip(MatchStream $stream, ClipWindow $window): ?ProviderClipResult;
```

### Frontend additions

```jsx
// Install: npm install hls.js

// app/src/features/stream/adapters/HlsStreamPlayer.jsx
// Handles Android WebView (hls.js) + iOS WKWebView (native HLS)

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export function HlsStreamPlayer({ playback, className = '' }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!playback.url || !videoRef.current) return;
    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls({ lowLatencyMode: true, liveSyncDurationCount: 3 });
      hls.loadSource(playback.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      return () => hls.destroy();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playback.url;
      video.play().catch(() => {});
    }
  }, [playback.url]);

  return (
    <video
      ref={videoRef}
      className={`w-full aspect-video bg-black ${className}`}
      playsInline
      muted
      controls
    />
  );
}

// Then in StreamPlayer.jsx — uncomment one line:
// hls: HlsStreamPlayer,
```

### Activate for a tournament

```sql
-- No migration needed. Set via admin panel or directly:
UPDATE tournaments SET stream_provider = 'cloudflare' WHERE id = 42;
```

### Additional future capabilities with Cloudflare

- **Webhook handler** — `POST /webhooks/streaming/cloudflare` → instant status updates (no polling)
- **Auto-recording** — stored in Cloudflare R2, available as VOD after match ends
- **Highlight clips** — `createClip()` called after ball events (wicket, six, four); near-instant, no re-encoding
- **Low-latency HLS** — `lowLatency: true` on channel creation; drops delay from ~15s to ~2s
- **Mobile RTMP ingest** — same `CloudflareStreamProvider`, different RTMP source

Full Cloudflare implementation details: `LIVE_STREAM_CLAUDE_FINAL_ARCHITECTURE.md`

---

## Decision Record

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Phase 1 provider | YouTube Live | Zero CDN cost; familiar OBS/vMix workflow |
| YouTube channel | Single Tapeya platform channel | Simple; no per-organizer credential complexity |
| Credentials storage | `StreamingSettings` via Spatie | Admin panel management; no `.env` changes to rotate keys |
| Stream data location | Separate `match_streams` table | Keeps `matches` clean; clean 1:1 relation |
| Provider selection | Match → tournament → platform default | Correct for current data model; no org model yet |
| Provider abstraction | `StreamProviderContract` + Manager + Resolver | Minimal cost now; Cloudflare is one new class later |
| Interface scope | No `handleWebhook` / `createClip` yet | YouTube doesn't need them; adding them now creates dead stubs |
| Frontend branching | `playback.mode` not `provider` | Future-proof; `HlsStreamPlayer` dropped in without touching `StreamPlayer` |
| YouTube status sync | Polling via `streams:sync` scheduler | YouTube has no server-to-server webhooks |
| Cloudflare | Documented in Future section only | Not needed yet; architecture is ready when it is |
