<?php

namespace Tests\Feature\Admin;

use App\Enums\User\UserTypeEnum;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPlayersLastActiveFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_players_index_includes_last_active_at(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $player = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'last_active_at' => now()->subHours(2),
        ]);

        $row = collect(
            $this->actingAs($admin, 'api')
                ->getJson('/api/v1/admin/players')
                ->assertOk()
                ->json('data')
        )->firstWhere('id', $player->id);

        $this->assertNotNull($row);
        $this->assertNotNull($row['last_active_at']);
    }

    public function test_inactive_days_filter_includes_null_and_stale(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $never = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'last_active_at' => null,
        ]);
        $stale = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'last_active_at' => now()->subDays(10),
        ]);
        $recent = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'last_active_at' => now()->subDay(),
        ]);

        $ids = collect(
            $this->actingAs($admin, 'api')
                ->getJson('/api/v1/admin/players?filter[inactive_days]=7')
                ->assertOk()
                ->json('data')
        )->pluck('id')->all();

        $this->assertContains($never->id, $ids);
        $this->assertContains($stale->id, $ids);
        $this->assertNotContains($recent->id, $ids);
    }
}
