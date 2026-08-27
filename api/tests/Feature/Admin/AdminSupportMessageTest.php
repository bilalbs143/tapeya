<?php

namespace Tests\Feature\Admin;

use App\Enums\User\UserTypeEnum;
use App\Models\SupportMessage;
use App\Models\User;
use App\Notifications\SupportMessageSubmittedAdminNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AdminSupportMessageTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
    }

    public function test_admin_can_list_and_filter_support_messages(): void
    {
        $admin = $this->admin();
        SupportMessage::create(['name' => 'Ali Khan', 'phone' => '+923001111111', 'message' => 'App keeps crashing on match start.', 'status' => 'open']);
        SupportMessage::create(['name' => 'Sara Ahmed', 'phone' => '+923002222222', 'message' => 'Please refund my order.', 'status' => 'resolved']);

        $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/support-messages')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/support-messages?filter[status]=resolved')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Sara Ahmed');
    }

    public function test_admin_can_view_and_update_support_message_status(): void
    {
        $admin = $this->admin();
        $message = SupportMessage::create(['name' => 'Ali Khan', 'phone' => '+923001111111', 'message' => 'App keeps crashing on match start.']);

        $this->actingAs($admin, 'api')
            ->getJson("/api/v1/admin/support-messages/{$message->id}")
            ->assertOk()
            ->assertJsonPath('data.status', 'open');

        $this->actingAs($admin, 'api')
            ->patchJson("/api/v1/admin/support-messages/{$message->id}", ['status' => 'resolved'])
            ->assertOk()
            ->assertJsonPath('data.status', 'resolved');

        $this->assertSame('resolved', $message->fresh()->status?->value);
    }

    public function test_update_rejects_invalid_status(): void
    {
        $admin = $this->admin();
        $message = SupportMessage::create(['name' => 'Ali Khan', 'message' => 'Question about tournaments.']);

        $this->actingAs($admin, 'api')
            ->patchJson("/api/v1/admin/support-messages/{$message->id}", ['status' => 'closed'])
            ->assertStatus(422);
    }

    public function test_non_admin_cannot_access_support_message_routes(): void
    {
        $user = User::factory()->create(['type' => UserTypeEnum::USER, 'status' => 'active']);
        $message = SupportMessage::create(['name' => 'Ali Khan', 'message' => 'Question about tournaments.']);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/admin/support-messages')
            ->assertForbidden();

        $this->actingAs($user, 'api')
            ->patchJson("/api/v1/admin/support-messages/{$message->id}", ['status' => 'resolved'])
            ->assertForbidden();
    }

    public function test_submitting_a_support_message_notifies_the_system_user(): void
    {
        Notification::fake();

        $system = User::factory()->create(['type' => UserTypeEnum::SYSTEM]);
        $user = User::factory()->create(['type' => UserTypeEnum::USER, 'status' => 'active']);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/support/messages', [
                'name' => 'Ali Khan',
                'phone' => '+923001111111',
                'message' => 'App keeps crashing whenever I start a match.',
            ])
            ->assertCreated();

        Notification::assertSentTo($system, SupportMessageSubmittedAdminNotification::class, function ($notification) {
            $data = $notification->toArray($notification);

            return $data['name'] === 'Ali Khan' && str_contains($data['message'], 'Ali Khan');
        });
    }
}
