<?php

namespace Tests\Feature;

use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_user_search_is_case_insensitive_for_name_and_nickname(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);

        $target = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
            'name' => 'Taimoor Mirza',
            'nickname' => 'TM Rocket',
            'phone' => '+92-300-1112233',
        ]);

        User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
            'name' => 'Other Player',
            'nickname' => 'Other',
            'phone' => '+92-300-9998877',
        ]);

        $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/users/search?search=taimoor')
            ->assertOk()
            ->assertJsonPath('data.0.id', $target->id);

        $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/users/search?search=rocket')
            ->assertOk()
            ->assertJsonPath('data.0.id', $target->id);
    }

    public function test_admin_user_search_matches_phone_by_digits_only(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);

        $target = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
            'name' => 'Phone Match User',
            'nickname' => 'PMU',
            'phone' => '+92-300-5556677',
        ]);

        $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/users/search?search=300-555')
            ->assertOk()
            ->assertJsonPath('data.0.id', $target->id);
    }

    public function test_broadcaster_context_uses_same_case_insensitive_search(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);

        $target = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
            'name' => 'Broadcaster Pick',
            'nickname' => 'BCAST',
            'phone' => '+92-321-4445566',
        ]);

        $tournamentId = Tournament::create([
            'organizer_id' => $admin->id,
            'tournament_name' => 'Search Test Cup',
            'tournament_type' => 'league',
            'cricket_format' => 'tape_ball',
            'venue_name' => 'Test Ground',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'number_of_teams' => 2,
            'city' => 'Test City',
            'match_timings' => 'day',
        ])->id;

        $this->actingAs($admin, 'api')
            ->getJson("/api/v1/admin/users/search?context=broadcaster&tournament_id={$tournamentId}&search=bcast")
            ->assertOk()
            ->assertJsonPath('data.0.id', $target->id);
    }
}
