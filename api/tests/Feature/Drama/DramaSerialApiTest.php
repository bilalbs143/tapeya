<?php

namespace Tests\Feature\Drama;

use App\Enums\Drama\DramaVideoSourceEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\DramaEpisode;
use App\Models\DramaSerial;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DramaSerialApiTest extends TestCase
{
    use RefreshDatabase;

    private function user(): User
    {
        return User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => 'active',
        ]);
    }

    private function admin(): User
    {
        return User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
    }

    private function seedSerialWithEpisode(): array
    {
        $serial = DramaSerial::query()->create([
            'title' => 'Street Cricket Diaries',
            'description' => 'A neighbourhood series.',
            'is_active' => true,
            'episodes_count' => 0,
        ]);

        $episode = DramaEpisode::query()->create([
            'drama_serial_id' => $serial->id,
            'episode_number' => 1,
            'title' => 'Episode 1',
            'video_source' => DramaVideoSourceEnum::YOUTUBE,
            'video' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            'is_active' => true,
        ]);

        $serial->refreshEpisodesCount();

        return [$serial->fresh(), $episode->fresh()];
    }

    public function test_public_can_list_serials_and_show_with_episodes(): void
    {
        [$serial] = $this->seedSerialWithEpisode();

        $this->getJson('/api/v1/drama-serials')
            ->assertOk()
            ->assertJsonPath('data.0.id', $serial->id)
            ->assertJsonPath('data.0.title', 'Street Cricket Diaries')
            ->assertJsonPath('data.0.first_episode_id', $serial->episodes()->orderBy('episode_number')->value('id'));

        $this->getJson("/api/v1/drama-serials/{$serial->id}")
            ->assertOk()
            ->assertJsonPath('data.episodes.0.episode_number', 1)
            ->assertJsonPath('data.episodes_count', 1);
    }

    public function test_user_can_react_share_and_comment_on_episode(): void
    {
        [, $episode] = $this->seedSerialWithEpisode();
        $user = $this->user();

        $this->actingAs($user, 'api')
            ->postJson("/api/v1/drama-episodes/{$episode->id}/like")
            ->assertOk()
            ->assertJsonPath('data.my_reaction', 'like')
            ->assertJsonPath('data.likes_count', 1)
            ->assertJsonPath('data.dislikes_count', 0);

        $this->actingAs($user, 'api')
            ->postJson("/api/v1/drama-episodes/{$episode->id}/dislike")
            ->assertOk()
            ->assertJsonPath('data.my_reaction', 'dislike')
            ->assertJsonPath('data.likes_count', 0)
            ->assertJsonPath('data.dislikes_count', 1);

        $this->actingAs($user, 'api')
            ->postJson("/api/v1/drama-episodes/{$episode->id}/share")
            ->assertOk()
            ->assertJsonPath('data.shares_count', 1);

        $this->actingAs($user, 'api')
            ->postJson("/api/v1/drama-episodes/{$episode->id}/comments", ['body' => 'Great episode'])
            ->assertCreated()
            ->assertJsonPath('data.body', 'Great episode');

        $this->actingAs($user, 'api')
            ->getJson("/api/v1/drama-episodes/{$episode->id}/comments")
            ->assertOk()
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.items.0.body', 'Great episode');
    }

    public function test_admin_can_create_serial_and_episode(): void
    {
        $admin = $this->admin();

        $serialId = $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/drama-serials', [
                'title' => 'Admin Serial',
                'is_active' => true,
            ])
            ->assertCreated()
            ->json('data.id');

        $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/drama-episodes', [
                'drama_serial_id' => $serialId,
                'episode_number' => 1,
                'title' => 'Pilot 1',
                'video_source' => 'youtube',
                'video' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                'is_active' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('data.episode_number', 1);

        $this->assertDatabaseHas('drama_serials', [
            'id' => $serialId,
            'episodes_count' => 1,
        ]);
    }
}
