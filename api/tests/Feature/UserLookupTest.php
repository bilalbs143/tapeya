<?php

namespace Tests\Feature;

use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserLookupTest extends TestCase
{
    use RefreshDatabase;

    public function test_empty_search_returns_no_users(): void
    {
        $viewer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);

        User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
            'name' => 'Listed User',
        ]);

        $this->actingAs($viewer, 'api')
            ->getJson('/api/v1/users/lookup')
            ->assertOk()
            ->assertJsonPath('data', []);

        $this->actingAs($viewer, 'api')
            ->getJson('/api/v1/users/lookup?search=')
            ->assertOk()
            ->assertJsonPath('data', []);
    }

    public function test_search_matches_name_among_app_users(): void
    {
        $viewer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);

        $target = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
            'name' => 'Squad Candidate',
            'nickname' => 'squad_c',
        ]);

        User::factory()->create([
            'type' => UserTypeEnum::ADMINISTRATOR,
            'status' => UserStatusEnum::ACTIVE,
            'name' => 'Squad Admin',
        ]);

        $this->actingAs($viewer, 'api')
            ->getJson('/api/v1/users/lookup?search=squad')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $target->id);
    }

    public function test_mine_returns_users_created_by_viewer(): void
    {
        $viewer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);

        $mine = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::VERIFICATION_PENDING,
            'name' => 'Walk Up Ali',
            'created_by' => $viewer->id,
            'added_via_quick_match' => true,
        ]);

        User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
            'name' => 'Someone Else',
            'created_by' => User::factory()->create(['type' => UserTypeEnum::USER])->id,
        ]);

        $this->actingAs($viewer, 'api')
            ->getJson('/api/v1/users/lookup?mine=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $mine->id)
            ->assertJsonPath('data.0.name', 'Walk Up Ali');
    }
}
