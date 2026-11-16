<?php

namespace Tests\Feature;

use App\Enums\Tournament\TournamentInterestFormFieldEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\TournamentInterestCampaign;
use App\Models\TournamentInterestSubmission;
use App\Models\User;
use App\Support\Interest\InterestCustomFields;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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
            'custom_fields' => [],
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
            'custom_fields' => null,
        ]);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/interest-campaigns/legacy-cup')
            ->assertOk()
            ->assertJsonPath('data.campaign.form_fields', TournamentInterestFormFieldEnum::defaults())
            ->assertJsonPath('data.campaign.custom_fields', InterestCustomFields::defaults());
    }

    public function test_resolved_form_fields_dedupes_stored_values(): void
    {
        $campaign = $this->makeCampaign([
            'form_fields' => ['email', 'email', 'name'],
            'custom_fields' => [],
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
            'custom_fields' => [],
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
            'custom_fields' => [],
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
            'custom_fields' => [],
        ]);

        $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/interest-campaigns', [
                'tournament_name' => 'Second Cup',
                'form_fields' => ['name', 'email'],
                'custom_fields' => [],
                'show_dialog' => true,
            ])
            ->assertCreated();

        $this->assertFalse($first->fresh()->show_dialog);
    }

    public function test_resolved_form_fields_always_includes_name_for_legacy_payloads(): void
    {
        $campaign = $this->makeCampaign([
            'form_fields' => ['email'],
            'custom_fields' => [],
        ]);

        $this->assertSame(['name', 'email'], $campaign->fresh()->resolvedFormFields());
    }

    public function test_user_field_defaults_include_id_document_not_trial_venue(): void
    {
        $defaults = TournamentInterestFormFieldEnum::defaults();
        $this->assertContains('id_document', $defaults);
        $this->assertNotContains('trial_venue', $defaults);
        $this->assertSame([], InterestCustomFields::defaults());
    }

    public function test_admin_rejects_select_custom_field_without_options(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);

        $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/interest-campaigns', [
                'tournament_name' => 'Venue Cup',
                'form_fields' => ['name'],
                'custom_fields' => [
                    [
                        'type' => 'select',
                        'label' => 'Trial Venue',
                        'required' => true,
                        'options' => [],
                    ],
                ],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['custom_fields.0.options']);
    }

    public function test_cnic_label_does_not_claim_reserved_id_document_key(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);

        $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/interest-campaigns', [
                'tournament_name' => 'Cnic Cup',
                'form_fields' => ['name'],
                'custom_fields' => [
                    [
                        'type' => 'file',
                        'label' => 'CNIC / B-Form',
                        'required' => true,
                    ],
                ],
            ])
            ->assertCreated()
            ->assertJsonPath('data.custom_fields.0.id', 'cnic_b_form');

        $this->assertNotSame('id_document', InterestCustomFields::sanitizeId('id_document'));
    }

    public function test_admin_stores_custom_fields_and_derives_id_from_label(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $user = User::factory()->create(['type' => UserTypeEnum::USER]);

        $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/interest-campaigns', [
                'tournament_name' => 'Venue Cup',
                'slug' => 'venue-cup',
                'form_fields' => ['name'],
                'custom_fields' => [
                    [
                        'type' => 'select',
                        'label' => 'Trial Venue',
                        'required' => true,
                        'options' => ['Lahore', ' Islamabad ', 'Lahore'],
                    ],
                ],
            ])
            ->assertCreated()
            ->assertJsonPath('data.custom_fields.0.id', 'trial_venue')
            ->assertJsonPath('data.custom_fields.0.options', ['Lahore', 'Islamabad']);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/interest-campaigns/venue-cup')
            ->assertOk()
            ->assertJsonPath('data.campaign.form_fields', ['name'])
            ->assertJsonPath('data.campaign.custom_fields.0.options', ['Lahore', 'Islamabad']);
    }

    public function test_submission_requires_custom_select_from_options(): void
    {
        $user = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'name' => 'Player One',
        ]);

        $this->makeCampaign([
            'slug' => 'trial-venues',
            'form_fields' => ['name'],
            'custom_fields' => [
                [
                    'id' => 'trial_venue',
                    'type' => 'select',
                    'label' => 'Trial Venue',
                    'required' => true,
                    'options' => ['Lahore', 'Islamabad'],
                ],
            ],
        ]);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/interest-campaigns/trial-venues/submissions', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['custom_answers.trial_venue']);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/interest-campaigns/trial-venues/submissions', [
                'custom_answers' => ['trial_venue' => 'Karachi'],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['custom_answers.trial_venue']);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/interest-campaigns/trial-venues/submissions', [
                'custom_answers' => ['trial_venue' => 'Lahore'],
            ])
            ->assertCreated()
            ->assertJsonPath('data.custom_answers.trial_venue', 'Lahore');
    }

    public function test_new_campaign_defaults_include_id_document_form_field_and_empty_custom_fields(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);

        $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/interest-campaigns', [
                'tournament_name' => 'Default Form Cup',
            ])
            ->assertCreated()
            ->assertJsonPath('data.form_fields', TournamentInterestFormFieldEnum::defaults())
            ->assertJsonPath('data.custom_fields', []);
    }

    public function test_admin_can_export_campaign_submissions_csv(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $user = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'name' => 'Export Player',
            'email' => 'export@example.com',
        ]);

        $campaign = $this->makeCampaign([
            'slug' => 'export-cup',
            'tournament_name' => 'Export Cup',
            'form_fields' => ['name', 'email', 'phone', 'id_document'],
            'custom_fields' => [
                ['id' => 'trial_venue', 'type' => 'select', 'label' => 'Trial Venue', 'required' => true, 'options' => ['Lahore', 'Karachi']],
            ],
        ]);

        TournamentInterestSubmission::query()->create([
            'campaign_id' => $campaign->id,
            'user_id' => $user->id,
            'name' => 'Export Player',
            'email' => 'export@example.com',
            'phone' => '+923001112233',
            'id_document_path' => 'interest/id-documents/sample.pdf',
            'custom_answers' => [
                'trial_venue' => 'Lahore',
            ],
            'notes' => 'VIP applicant',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($admin, 'api')
            ->get('/api/v1/admin/interest-campaigns/'.$campaign->id.'/submissions/export')
            ->assertOk();

        $csv = $response->streamedContent();
        $this->assertStringStartsWith("\xEF\xBB\xBF", $csv);
        $this->assertStringContainsString('"Serial No.",Name,Email,Phone,"Trial Venue","CNIC / B-Form Link",Status,Notes', $csv);
        $this->assertStringNotContainsString('User ID', $csv);
        $this->assertMatchesRegularExpression('/\n1,"Export Player"/', $csv);
        $this->assertStringContainsString('Export Player', $csv);
        $this->assertStringContainsString('export@example.com', $csv);
        $this->assertStringContainsString('+923001112233', $csv);
        $this->assertStringNotContainsString("'+923001112233", $csv);
        $this->assertStringContainsString('Lahore', $csv);
        $this->assertStringContainsString('interest/id-documents/sample.pdf', $csv);
        $this->assertStringContainsString('VIP applicant', $csv);
        $this->assertStringContainsString('Pending', $csv);
    }

    public function test_user_can_upload_id_document_when_enabled_as_form_field(): void
    {
        Storage::fake(config('filesystems.media_disk', 'public'));

        $user = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'name' => 'Doc Player',
        ]);

        $this->makeCampaign([
            'slug' => 'id-doc-cup',
            'form_fields' => ['name', 'id_document'],
            'custom_fields' => [],
        ]);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/interest-campaigns/id-doc-cup')
            ->assertOk()
            ->assertJsonPath('data.campaign.form_fields', ['name', 'id_document'])
            ->assertJsonPath('data.campaign.custom_fields', []);

        $submissionId = $this->actingAs($user, 'api')
            ->postJson('/api/v1/interest-campaigns/id-doc-cup/submissions', [])
            ->assertCreated()
            ->json('data.id');

        $this->actingAs($user, 'api')
            ->post('/api/v1/media/interest-submission/'.$submissionId.'/id_document', [
                'file' => UploadedFile::fake()->create('cnic.pdf', 100, 'application/pdf'),
            ])
            ->assertOk();

        $submission = TournamentInterestSubmission::query()->findOrFail($submissionId);
        $this->assertNotNull($submission->id_document_path);
        $this->assertStringContainsString('interest/id-documents', $submission->id_document_path);
    }

    public function test_admin_can_save_and_clear_submission_notes(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $user = User::factory()->create(['type' => UserTypeEnum::USER]);

        $campaign = $this->makeCampaign([
            'slug' => 'notes-cup',
            'form_fields' => ['name', 'email'],
            'custom_fields' => [],
        ]);

        $submission = TournamentInterestSubmission::query()->create([
            'campaign_id' => $campaign->id,
            'user_id' => $user->id,
            'name' => $user->name,
            'status' => 'pending',
        ]);

        $this->actingAs($admin, 'api')
            ->patchJson('/api/v1/admin/interest-submissions/'.$submission->id, [
                'notes' => '  Called player — will bring CNIC  ',
            ])
            ->assertOk()
            ->assertJsonPath('data.notes', 'Called player — will bring CNIC');

        $this->actingAs($admin, 'api')
            ->patchJson('/api/v1/admin/interest-submissions/'.$submission->id, [
                'notes' => '   ',
            ])
            ->assertOk()
            ->assertJsonPath('data.notes', null);
    }

    public function test_admin_can_update_submission_fields_and_custom_answers(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $user = User::factory()->create(['type' => UserTypeEnum::USER, 'name' => 'Player One']);

        $campaign = $this->makeCampaign([
            'slug' => 'admin-edit-cup',
            'form_fields' => ['name', 'email', 'phone', 'city', 'country'],
            'custom_fields' => [
                ['id' => 'trial_venue', 'type' => 'select', 'label' => 'Trial Venue', 'required' => true, 'options' => ['Lahore', 'Karachi']],
            ],
        ]);

        $submission = TournamentInterestSubmission::query()->create([
            'campaign_id' => $campaign->id,
            'user_id' => $user->id,
            'name' => 'Player One',
            'email' => 'old@example.com',
            'phone' => '+921111111111',
            'country' => 'Pakistan',
            'city' => 'Islamabad',
            'custom_answers' => ['trial_venue' => 'Lahore'],
            'status' => 'pending',
        ]);

        $this->actingAs($admin, 'api')
            ->patchJson('/api/v1/admin/interest-submissions/'.$submission->id, [
                'name' => 'Player One Updated',
                'email' => 'new@example.com',
                'phone' => '+922222222222',
                'country' => 'Pakistan',
                'city' => 'Karachi',
                'custom_answers' => ['trial_venue' => 'Karachi'],
                'status' => 'confirmed',
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Player One Updated')
            ->assertJsonPath('data.email', 'new@example.com')
            ->assertJsonPath('data.phone', '+922222222222')
            ->assertJsonPath('data.city', 'Karachi')
            ->assertJsonPath('data.custom_answers.trial_venue', 'Karachi')
            ->assertJsonPath('data.status', 'confirmed');
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
            'custom_fields' => [],
        ], $overrides));
    }
}
