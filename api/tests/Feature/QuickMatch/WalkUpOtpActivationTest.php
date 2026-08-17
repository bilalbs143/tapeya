<?php

namespace Tests\Feature\QuickMatch;

use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\PushNotificationLog;
use App\Models\User;
use App\Services\Push\PushNotificationService;
use Database\Seeders\SystemSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

/**
 * Walk-ups are verification_pending users with a phone. They activate via the normal
 * login OTP flow (request-otp → verify-otp) — no special register-resume path.
 */
class WalkUpOtpActivationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SystemSettingsSeeder::class);
        config(['app.debug' => true]);

        $push = Mockery::mock(PushNotificationService::class);
        $push->shouldReceive('dispatch')->andReturn(Mockery::mock(PushNotificationLog::class))->byDefault();
        $this->app->instance(PushNotificationService::class, $push);
    }

    public function test_walk_up_activates_via_login_otp(): void
    {
        $owner = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
            'phone' => '+92300'.random_int(1000000, 9999999),
        ]);

        $walkUp = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::VERIFICATION_PENDING,
            'password' => null,
            'phone' => '+923011111001',
            'name' => 'Ali Khan',
            'nickname' => 'ali_khan_walk',
            'added_via_quick_match' => true,
            'created_by' => $owner->id,
        ]);

        $otpResponse = $this->postJson('/api/v1/auth/request-otp', [
            'phone' => $walkUp->phone,
        ])->assertOk();

        $otp = $otpResponse->json('data.otp');
        $this->assertNotEmpty($otp);

        $this->postJson('/api/v1/auth/verify-otp', [
            'phone' => $walkUp->phone,
            'code' => $otp,
        ])
            ->assertOk()
            ->assertJsonPath('data.user.id', $walkUp->id);

        $this->assertSame(UserStatusEnum::ACTIVE, $walkUp->fresh()->status);
        $this->assertSame(1, User::query()->where('phone', $walkUp->phone)->count());
    }

    public function test_register_with_walk_up_phone_tells_user_to_log_in(): void
    {
        $owner = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
            'phone' => '+92300'.random_int(1000000, 9999999),
        ]);

        $walkUp = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::VERIFICATION_PENDING,
            'password' => null,
            'phone' => '+923011111002',
            'added_via_quick_match' => true,
            'created_by' => $owner->id,
        ]);

        $this->postJson('/api/v1/auth/register', [
            'name' => 'Hamza Iqbal',
            'nickname' => 'hamza_real_'.uniqid(),
            'phone' => $walkUp->phone,
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);

        $this->assertSame(1, User::query()->where('phone', $walkUp->phone)->count());
        $this->assertSame(UserStatusEnum::VERIFICATION_PENDING, $walkUp->fresh()->status);
    }
}
