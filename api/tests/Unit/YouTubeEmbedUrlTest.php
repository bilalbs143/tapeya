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

    public function test_embed_view_uses_trusted_app_origin_for_youtube_origin_param(): void
    {
        $contact = app(ContactSettings::class);
        $contact->publicWebsiteUrl = 'https://tapeya.com';
        $contact->save();

        $html = view('embed.youtube', [
            'embedSrc' => 'https://www.youtube.com/embed/test-id?autoplay=1',
            'youtubeEmbedOrigin' => YouTubeEmbedUrl::trustedAppOrigin(),
        ])->render();

        $this->assertStringContainsString('tapeya-youtube-proxy-debug', $html);
        $this->assertStringContainsString('proxyLog(\'boot\'', $html);
        $this->assertStringContainsString("new YT.Player('player'", $html);
        $this->assertStringContainsString('playerVars.origin = pageOrigin', $html);
    }
}
