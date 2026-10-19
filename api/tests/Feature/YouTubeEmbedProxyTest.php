<?php

namespace Tests\Feature;

use App\Http\Controllers\YouTubeEmbedProxyController;
use Tests\TestCase;

class YouTubeEmbedProxyTest extends TestCase
{
    public function test_embed_proxy_allows_capacitor_frame_ancestors(): void
    {
        $response = $this->get('/embed/youtube?src='.urlencode('https://www.youtube.com/embed/c_9z5bRRDrg?autoplay=1').'&controls=1');

        $response->assertOk();
        $csp = (string) $response->headers->get('Content-Security-Policy');
        $this->assertSame(YouTubeEmbedProxyController::FRAME_ANCESTORS_CSP, $csp);
        $this->assertStringContainsString('capacitor:', $csp);
        $this->assertStringContainsString('ionic:', $csp);
        $this->assertStringContainsString('https://localhost', $csp);
        $this->assertNull($response->headers->get('X-Frame-Options'));
    }

    public function test_embed_proxy_rejects_non_youtube_src(): void
    {
        $this->get('/embed/youtube?src='.urlencode('https://example.com/embed/x'))
            ->assertNotFound();
    }
}
