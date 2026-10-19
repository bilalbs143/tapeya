<?php

namespace Tests\Unit;

use App\Settings\ContactSettings;
use App\Streaming\Support\YouTubeEmbedUrl;
use Database\Seeders\SystemSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class YouTubeEmbedUrlTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(SystemSettingsSeeder::class);
    }

    public function test_trusted_app_origin_reads_public_website_url_from_settings(): void
    {
        $contact = app(ContactSettings::class);
        $contact->publicWebsiteUrl = 'https://tapeya.com/';
        $contact->save();

        $this->assertSame('https://tapeya.com', YouTubeEmbedUrl::trustedAppOrigin());
    }

    public function test_trusted_app_origin_returns_null_when_unset(): void
    {
        $contact = app(ContactSettings::class);
        $contact->publicWebsiteUrl = null;
        $contact->save();

        $this->assertNull(YouTubeEmbedUrl::trustedAppOrigin());
    }

    public function test_embed_view_uses_youtube_iframe_api_with_page_origin(): void
    {
        $html = view('embed.youtube', [
            'embedSrc' => 'https://www.youtube.com/embed/test-id?autoplay=1',
            'allowControls' => true,
        ])->render();

        // Origin must be the proxy page host (not public website URL) — Error 153 otherwise.
        $this->assertStringContainsString('var pageOrigin = window.location.origin', $html);
        $this->assertStringContainsString("new YT.Player('player'", $html);
        $this->assertStringContainsString('playerVars.origin = pageOrigin', $html);
        $this->assertStringContainsString('player.playVideo', $html);
        $this->assertStringContainsString('playerVars.mute = 1', $html);
        $this->assertStringContainsString('!hostPlayingSent', $html);
        $this->assertStringContainsString('fitPlayerToViewport', $html);
        $this->assertStringContainsString('tapeya-youtube-ready', $html);
        $this->assertStringContainsString('tapeya-youtube-playing', $html);
        $this->assertStringContainsString('tapeya-youtube-error', $html);
        $this->assertStringContainsString('tapeyaStream', $html);
    }
}
