<?php

namespace Tests\Feature\Auth;

use App\Enums\Push\NotificationEventEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Exceptions\OtpSmsDeliveryException;
use App\Models\PushNotificationLog;
use App\Models\User;
use App\Notifications\UserReferredUserNotification;
use App\Services\Push\PushNotificationService;
use App\Utils\Services\OtpService;
use Database\Seeders\SystemSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Mockery;
use Tests\TestCase;

class ReferralRegistrationTest extends TestCase
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

    private function activeUser(array $overrides = []): User
    {
        return User::factory()->create(array_merge([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
            'nickname' => 'referrer_'.uniqid(),
            'phone' => '+92300'.random_int(1000000, 9999999),
        ], $overrides));
    }

    /**
     * @return array<string, mixed>
     */
    private function registerPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'New Player',
            'nickname' => 'newbie_'.uniqid(),
            'phone' => '+92301'.random_int(1000000, 9999999),
        ], $overrides);
    }

    /**
     * @return array{user: User, otp: string, phone: string}
     */
    private function registerAndVerify(array $payloadOverrides = []): array
    {
        $payload = $this->registerPayload($payloadOverrides);
        $response = $this->postJson('/api/v1/auth/register', $payload)->assertOk();

        $otp = $response->json('data.otp');
        $this->assertNotEmpty($otp);

        $this->postJson('/api/v1/auth/verify-otp', [
            'phone' => $payload['phone'],
            'code' => $otp,
        ])->assertOk();

        $user = User::query()->where('phone', $payload['phone'])->firstOrFail();

        return ['user' => $user, 'otp' => $otp, 'phone' => $payload['phone']];
    }

    public function test_register_sets_referred_by_but_does_not_notify_until_otp_verified(): void
    {
        Notification::fake();

        $referrer = $this->activeUser(['name' => 'Referrer', 'nickname' => 'coach_ali']);
        $payload = $this->registerPayload(['referral_nickname' => 'coach_ali']);

        $this->postJson('/api/v1/auth/register', $payload)->assertOk();

        $referred = User::query()->where('phone', $payload['phone'])->firstOrFail();
        $this->assertSame($referrer->id, $referred->referred_by);
        Notification::assertNotSentTo($referrer, UserReferredUserNotification::class);
    }

    public function test_verify_otp_notifies_referrer_once_on_first_activation(): void
    {
        Notification::fake();

        $referrer = $this->activeUser(['name' => 'Referrer', 'nickname' => 'coach_ali']);

        $result = $this->registerAndVerify(['referral_nickname' => 'coach_ali']);
        $referred = $result['user'];

        $this->assertSame($referrer->id, $referred->referred_by);

        Notification::assertSentTo($referrer, UserReferredUserNotification::class, function ($notification) use ($referred, $referrer) {
            $data = $notification->toArray($referrer);

            return $data['type'] === 'user_referred'
                && $data['actor_id'] === $referred->id
                && $data['deep_link'] === '/notification-center';
        });
    }

    public function test_subsequent_login_verify_does_not_notify_again(): void
    {
        Notification::fake();

        $referrer = $this->activeUser(['nickname' => 'coach_ali']);
        $result = $this->registerAndVerify(['referral_nickname' => 'coach_ali']);

        Notification::assertSentTo($referrer, UserReferredUserNotification::class);
        Notification::fake();

        $otpService = app(OtpService::class);
        $otpService->store($result['phone'], '1234');

        $this->postJson('/api/v1/auth/verify-otp', [
            'phone' => $result['phone'],
            'code' => '1234',
        ])->assertOk();

        Notification::assertNotSentTo($referrer, UserReferredUserNotification::class);
    }

    public function test_referral_nickname_match_is_case_insensitive(): void
    {
        Notification::fake();

        $referrer = $this->activeUser(['nickname' => 'Coach_Ali']);

        $result = $this->registerAndVerify(['referral_nickname' => 'coach_ali']);

        $this->assertSame($referrer->id, $result['user']->referred_by);
        Notification::assertSentTo($referrer, UserReferredUserNotification::class);
    }

    public function test_exact_nickname_match_wins_over_case_variant(): void
    {
        Notification::fake();

        $earlier = $this->activeUser(['nickname' => 'coach_ali']);
        $exact = $this->activeUser(['nickname' => 'Coach_Ali']);

        $result = $this->registerAndVerify(['referral_nickname' => 'Coach_Ali']);

        $this->assertSame($exact->id, $result['user']->referred_by);
        $this->assertNotSame($earlier->id, $result['user']->referred_by);
    }

    public function test_unknown_referral_nickname_is_ignored(): void
    {
        Notification::fake();

        $result = $this->registerAndVerify(['referral_nickname' => 'nobody_here']);

        $this->assertNull($result['user']->referred_by);
        Notification::assertNotSentTo($result['user'], UserReferredUserNotification::class);
    }

    public function test_register_without_referral_nickname_leaves_referred_by_null(): void
    {
        Notification::fake();

        $result = $this->registerAndVerify();

        $this->assertNull($result['user']->referred_by);
        Notification::assertNotSentTo($result['user'], UserReferredUserNotification::class);
    }

    public function test_inactive_referrer_is_not_assigned(): void
    {
        Notification::fake();

        $pending = $this->activeUser([
            'nickname' => 'pending_coach',
            'status' => UserStatusEnum::VERIFICATION_PENDING,
        ]);

        $result = $this->registerAndVerify(['referral_nickname' => 'pending_coach']);

        $this->assertNull($result['user']->referred_by);
        Notification::assertNotSentTo($pending, UserReferredUserNotification::class);
    }

    public function test_admin_nickname_is_not_used_as_referrer(): void
    {
        Notification::fake();

        $admin = $this->activeUser([
            'nickname' => 'admin_coach',
            'type' => UserTypeEnum::ADMINISTRATOR,
        ]);

        $result = $this->registerAndVerify(['referral_nickname' => 'admin_coach']);

        $this->assertNull($result['user']->referred_by);
        Notification::assertNotSentTo($admin, UserReferredUserNotification::class);
    }

    public function test_malformed_referral_nickname_returns_validation_error(): void
    {
        $this->postJson('/api/v1/auth/register', $this->registerPayload([
            'referral_nickname' => 'bad nick!',
        ]))->assertUnprocessable()
            ->assertJsonValidationErrors(['referral_nickname']);
    }

    public function test_otp_failure_after_create_keeps_referred_by_but_does_not_notify(): void
    {
        Notification::fake();
        config(['app.debug' => false]);

        $referrer = $this->activeUser(['nickname' => 'otp_fail_coach']);
        $payload = $this->registerPayload(['referral_nickname' => 'otp_fail_coach']);

        $otp = Mockery::mock(OtpService::class);
        $otp->shouldReceive('normalizePhone')->andReturnUsing(fn (string $phone) => $phone);
        $otp->shouldReceive('isTestOtpPhone')->andReturn(false);
        $otp->shouldReceive('sendToUser')->once()->andThrow(new OtpSmsDeliveryException);
        $otp->shouldReceive('getCurrentOtp')->never();
        $this->app->instance(OtpService::class, $otp);

        $this->postJson('/api/v1/auth/register', $payload)->assertStatus(503);

        $referred = User::query()->where('phone', $payload['phone'])->first();
        $this->assertNotNull($referred);
        $this->assertSame($referrer->id, $referred->referred_by);
        $this->assertTrue($referred->isVerificationPending());
        Notification::assertNotSentTo($referrer, UserReferredUserNotification::class);
    }

    public function test_referral_dispatches_push_to_referrer_after_verify(): void
    {
        Notification::fake();

        $referrer = $this->activeUser(['name' => 'Referrer', 'nickname' => 'push_coach']);

        $push = Mockery::mock(PushNotificationService::class);
        $push->shouldReceive('dispatch')
            ->once()
            ->withArgs(function (NotificationEventEnum $event, array $data, ?int $userId) use ($referrer) {
                return $event === NotificationEventEnum::USER_REFERRED
                    && $data['actor_id'] !== $referrer->id
                    && $data['deep_link'] === '/notification-center'
                    && $userId === $referrer->id;
            })
            ->andReturn(Mockery::mock(PushNotificationLog::class));
        $this->app->instance(PushNotificationService::class, $push);

        $this->registerAndVerify(['referral_nickname' => 'push_coach']);
    }
}
