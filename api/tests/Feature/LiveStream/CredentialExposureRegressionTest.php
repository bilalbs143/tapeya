<?php

namespace Tests\Feature\LiveStream;

use App\Enums\User\UserTypeEnum;
use App\Models\MatchStream;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * LiveBroadcastController's store()/show() are the only two places RTMP ingest credentials
 * are ever returned to a non-admin user — confirm no other stream response leaks them.
 */
class CredentialExposureRegressionTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_facing_live_stream_resource_never_includes_ingest_credentials(): void
    {
        $stream = MatchStream::factory()->create([
            'ingest_rtmp_url' => 'rtmp://leak.example.com/live',
            'stream_key_encrypted' => encrypt('super-secret-key'),
        ]);
        $viewer = User::factory()->create(['type' => 'user']);

        $response = $this->actingAs($viewer, 'api')
            ->getJson("/api/v1/live/streams/{$stream->id}")
            ->assertOk();

        $this->assertArrayNotHasKey('rtmp_url', $response->json('data'));
        $this->assertArrayNotHasKey('stream_key', $response->json('data'));
        $this->assertStringNotContainsString('rtmp://leak.example.com', $response->getContent());
    }

    public function test_admin_live_stream_list_never_includes_ingest_credentials(): void
    {
        MatchStream::factory()->create([
            'ingest_rtmp_url' => 'rtmp://leak.example.com/live',
            'stream_key_encrypted' => encrypt('super-secret-key'),
        ]);
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);

        $response = $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/live-streams')
            ->assertOk();

        $this->assertStringNotContainsString('rtmp://leak.example.com', $response->getContent());
        $this->assertStringNotContainsString('super-secret-key', $response->getContent());
    }
}
