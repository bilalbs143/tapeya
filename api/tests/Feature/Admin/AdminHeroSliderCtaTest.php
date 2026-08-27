<?php

namespace Tests\Feature\Admin;

use App\Enums\User\UserTypeEnum;
use App\Models\HeroSlider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminHeroSliderCtaTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
    }

    public function test_admin_can_create_image_only_slide(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/hero-sliders', ['status' => 'active'])
            ->assertCreated()
            ->assertJsonPath('data.cta_type', 'none')
            ->assertJsonPath('data.cta_label', null)
            ->assertJsonPath('data.cta_url', null)
            ->assertJsonPath('data.cta_dialog_key', null);
    }

    public function test_admin_can_create_slide_with_external_url(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/hero-sliders', [
                'status' => 'active',
                'cta_type' => 'url',
                'cta_label' => 'Shop Now',
                'cta_url' => 'https://example.com/promo',
            ])
            ->assertCreated()
            ->assertJsonPath('data.cta_type', 'url')
            ->assertJsonPath('data.cta_label', 'Shop Now')
            ->assertJsonPath('data.cta_url', 'https://example.com/promo')
            ->assertJsonPath('data.cta_target_blank', true);
    }

    public function test_admin_can_create_slide_with_internal_app_link(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/hero-sliders', [
                'status' => 'active',
                'cta_type' => 'url',
                'cta_label' => 'View Tournaments',
                'cta_url' => '/upcoming-tournaments',
                'cta_target_blank' => false,
            ])
            ->assertCreated()
            ->assertJsonPath('data.cta_url', '/upcoming-tournaments')
            ->assertJsonPath('data.cta_target_blank', false);
    }

    public function test_admin_can_create_slide_that_opens_a_dialog(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/hero-sliders', [
                'status' => 'active',
                'cta_type' => 'dialog',
                'cta_label' => 'Get the App',
                'cta_dialog_key' => 'downloadApp',
            ])
            ->assertCreated()
            ->assertJsonPath('data.cta_type', 'dialog')
            ->assertJsonPath('data.cta_dialog_key', 'downloadApp')
            ->assertJsonPath('data.cta_url', null);
    }

    public function test_dialog_interest_campaign_requires_param(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/hero-sliders', [
                'status' => 'active',
                'cta_type' => 'dialog',
                'cta_dialog_key' => 'interestCampaign',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['cta_dialog_param']);

        $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/hero-sliders', [
                'status' => 'active',
                'cta_type' => 'dialog',
                'cta_dialog_key' => 'interestCampaign',
                'cta_dialog_param' => 'summer-league',
            ])
            ->assertCreated()
            ->assertJsonPath('data.cta_dialog_param', 'summer-league');
    }

    public function test_url_type_requires_url(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/hero-sliders', [
                'status' => 'active',
                'cta_type' => 'url',
                'cta_label' => 'Shop Now',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['cta_url']);
    }

    public function test_create_rejects_javascript_url(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/hero-sliders', [
                'status' => 'active',
                'cta_type' => 'url',
                'cta_url' => 'javascript:alert(1)',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['cta_url']);
    }

    public function test_update_preserves_cta_target_blank_when_omitted(): void
    {
        $admin = $this->admin();
        $slide = HeroSlider::create([
            'status' => 'active',
            'cta_type' => 'url',
            'cta_label' => 'View Tournaments',
            'cta_url' => '/upcoming-tournaments',
            'cta_target_blank' => false,
        ]);

        $this->actingAs($admin, 'api')
            ->putJson("/api/v1/admin/hero-sliders/{$slide->id}", [
                'status' => 'active',
                'cta_type' => 'url',
                'cta_label' => 'View Tournaments',
                'cta_url' => '/upcoming-tournaments',
            ])
            ->assertOk()
            ->assertJsonPath('data.cta_target_blank', false);
    }

    public function test_admin_can_update_slide_to_add_and_then_clear_cta(): void
    {
        $admin = $this->admin();
        $slide = HeroSlider::create(['status' => 'active']);

        $this->actingAs($admin, 'api')
            ->putJson("/api/v1/admin/hero-sliders/{$slide->id}", [
                'status' => 'active',
                'cta_type' => 'url',
                'cta_label' => 'Learn More',
                'cta_url' => 'https://example.com/learn',
            ])
            ->assertOk()
            ->assertJsonPath('data.cta_type', 'url');

        $this->actingAs($admin, 'api')
            ->putJson("/api/v1/admin/hero-sliders/{$slide->id}", ['status' => 'active', 'cta_type' => 'none'])
            ->assertOk()
            ->assertJsonPath('data.cta_type', 'none')
            ->assertJsonPath('data.cta_url', null)
            ->assertJsonPath('data.cta_dialog_key', null);
    }

    public function test_public_hero_sliders_endpoint_exposes_cta(): void
    {
        HeroSlider::create([
            'status' => 'active',
            'image_mobile' => 'hero-sliders/hero-slider/test.jpg',
            'cta_type' => 'dialog',
            'cta_label' => 'Get the App',
            'cta_dialog_key' => 'downloadApp',
        ]);

        $this->getJson('/api/v1/hero-sliders')
            ->assertOk()
            ->assertJsonPath('data.0.cta_type', 'dialog')
            ->assertJsonPath('data.0.cta_label', 'Get the App')
            ->assertJsonPath('data.0.cta_dialog_key', 'downloadApp');
    }
}
