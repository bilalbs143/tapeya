<?php

namespace Tests\Feature\Safety;

use App\Enums\User\UserTypeEnum;
use App\Models\User;
use App\Models\UserBlock;
use App\Models\UserReport;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserSafetyTest extends TestCase
{
    use RefreshDatabase;

    public function test_accept_terms_sets_timestamp(): void
    {
        $user = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'terms_accepted_at' => null,
        ]);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/me/accept-terms')
            ->assertOk()
            ->assertJsonPath('data.terms_accepted_at', fn ($v) => is_string($v) && $v !== '');

        $this->assertNotNull($user->fresh()->terms_accepted_at);
    }

    public function test_block_user_creates_block_and_moderation_report(): void
    {
        $blocker = User::factory()->create(['type' => UserTypeEnum::USER]);
        $target = User::factory()->create(['type' => UserTypeEnum::USER]);

        $this->actingAs($blocker, 'api')
            ->postJson("/api/v1/users/{$target->id}/block", ['reason' => 'harassment'])
            ->assertOk()
            ->assertJsonPath('data.blocked', true);

        $this->assertTrue(
            UserBlock::query()
                ->where('blocker_id', $blocker->id)
                ->where('blocked_user_id', $target->id)
                ->exists()
        );

        $this->assertTrue(
            UserReport::query()
                ->where('reporter_id', $blocker->id)
                ->where('reported_user_id', $target->id)
                ->where('source', 'block')
                ->where('status', 'open')
                ->exists()
        );
    }

    public function test_report_user_creates_open_report(): void
    {
        $reporter = User::factory()->create(['type' => UserTypeEnum::USER]);
        $target = User::factory()->create(['type' => UserTypeEnum::USER]);

        $this->actingAs($reporter, 'api')
            ->postJson("/api/v1/users/{$target->id}/report", [
                'reason' => 'inappropriate',
                'details' => 'Offensive content',
            ])
            ->assertOk()
            ->assertJsonPath('data.reported', true);

        $this->assertDatabaseHas('user_reports', [
            'reporter_id' => $reporter->id,
            'reported_user_id' => $target->id,
            'reason' => 'inappropriate',
            'source' => 'report',
            'status' => 'open',
        ]);
    }

    public function test_admin_can_list_and_update_user_reports(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $reporter = User::factory()->create(['type' => UserTypeEnum::USER]);
        $target = User::factory()->create(['type' => UserTypeEnum::USER]);

        $report = UserReport::query()->create([
            'reporter_id' => $reporter->id,
            'reported_user_id' => $target->id,
            'reason' => 'spam',
            'details' => null,
            'source' => 'report',
            'status' => 'open',
        ]);

        $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/user-reports')
            ->assertOk()
            ->assertJsonPath('data.0.id', $report->id);

        $this->actingAs($admin, 'api')
            ->patchJson("/api/v1/admin/user-reports/{$report->id}", ['status' => 'actioned'])
            ->assertOk()
            ->assertJsonPath('data.status', 'actioned');

        $this->assertSame('actioned', $report->fresh()->status);
    }

    public function test_register_requires_accept_terms(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'nickname' => 'Tester',
            'phone' => '+923001119999',
        ])->assertStatus(422);

        $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'nickname' => 'Tester',
            'phone' => '+923001119998',
            'accept_terms' => true,
        ])->assertOk();

        $this->assertNotNull(
            User::query()->where('phone', '+923001119998')->value('terms_accepted_at')
        );
    }
}
