<?php

namespace Tests\Feature;

use App\Enums\Tournament\TournamentInterestFormFieldEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\TournamentInterestCampaign;
use App\Models\TournamentInterestSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TournamentInterestFormFieldsTest extends TestCase
{
    use RefreshDatabase;

    public function test_submission_always_stores_name_even_when_name_field_is_disabled(): void
    {
        $user = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'name' => 'Ali Ahmed',
            'email' => 'ali@example.com',
        ]);

        $campaign = $this->makeCampaign([
            'slug' => 'email-only',
            'form_fields' => ['email'],
        ]);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/interest-campaigns/email-only/submissions', [
                'email' => 'ali.updated@example.com',
            ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Ali Ahmed');

        $this->assertDatabaseHas('tournament_interest_submissions', [
            'campaign_id' => $campaign->id,
            'user_id' => $user->id,
            'name' => 'Ali Ahmed',
            'email' => 'ali.updated@example.com',
        ]);
    }

    public function test_admin_rejects_form_fields_without_name(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);

        $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/interest-campaigns', [
                'tournament_name' => 'Email Only Cup',
                'form_fields' => ['email'],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['form_fields']);
    }

    public function test_admin_rejects_country_without_city(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);

        $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/interest-campaigns', [
                'tournament_name' => 'Country Only Cup',
                'form_fields' => ['name', 'country'],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['form_fields']);
    }

    public function test_admin_rejects_city_without_country(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);

        $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/interest-campaigns', [
                'tournament_name' => 'City Only Cup',
                'form_fields' => ['name', 'city'],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['form_fields']);
    }

    public function test_legacy_campaign_with_null_form_fields_exposes_all_defaults(): void
    {
        $user = User::factory()->create(['type' => UserTypeEnum::USER]);

        $this->makeCampaign([
            'slug' => 'legacy-cup',
            'form_fields' => null,
        ]);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/interest-campaigns/legacy-cup')
            ->assertOk()
            ->assertJsonPath('data.campaign.form_fields', TournamentInterestFormFieldEnum::defaults());
    }

    public function test_resolved_form_fields_dedupes_stored_values(): void
    {
        $campaign = $this->makeCampaign([
            'form_fields' => ['email', 'email', 'name'],
        ]);

        $this->assertSame(['email', 'name'], $campaign->fresh()->resolvedFormFields());
    }

    public function test_submission_only_validates_enabled_scalar_fields(): void
    {
        $user = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'name' => 'Player One',
        ]);

        $this->makeCampaign([
            'slug' => 'email-required',
            'form_fields' => ['name', 'email'],
        ]);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/interest-campaigns/email-required/submissions', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_dialog_endpoint_returns_open_show_dialog_campaign_with_submission_status(): void
    {
        $user = User::factory()->create(['type' => UserTypeEnum::USER]);

        $campaign = $this->makeCampaign([
            'slug' => 'dialog-cup',
            'show_dialog' => true,
        ]);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/interest-campaigns/dialog')
            ->assertOk()
            ->assertJsonPath('data.campaign.slug', 'dialog-cup')
            ->assertJsonPath('data.campaign.tournament_name', 'Test Cup')
            ->assertJsonMissingPath('data.campaign.my_submission_status');

        TournamentInterestSubmission::query()->create([
            'campaign_id' => $campaign->id,
            'user_id' => $user->id,
            'name' => $user->name,
            'status' => 'pending',
        ]);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/interest-campaigns/dialog')
            ->assertOk()
            ->assertJsonPath('data.campaign.my_submission_status', 'pending');
    }

    public function test_admin_show_dialog_exclusivity_clears_other_campaigns(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);

        $first = $this->makeCampaign([
            'slug' => 'first-dialog',
            'tournament_name' => 'First Cup',
            'show_dialog' => true,
        ]);

        $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/interest-campaigns', [
                'tournament_name' => 'Second Cup',
                'form_fields' => ['name', 'email'],
                'show_dialog' => true,
            ])
            ->assertCreated();

        $this->assertFalse($first->fresh()->show_dialog);
    }

    public function test_resolved_form_fields_always_includes_name_for_legacy_payloads(): void
    {
        $campaign = $this->makeCampaign([
            'form_fields' => ['email'],
        ]);

        $this->assertSame(['name', 'email'], $campaign->fresh()->resolvedFormFields());
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function makeCampaign(array $overrides = []): TournamentInterestCampaign
    {
        return TournamentInterestCampaign::query()->create(array_merge([
            'tournament_name' => 'Test Cup',
            'slug' => 'test-cup',
            'status' => 'open',
            'show_in_sidebar' => false,
            'show_dialog' => false,
        ], $overrides));
    }
}
