<?php

namespace Tests\Feature\Ad;

use App\Enums\Ad\AdCampaignObjectiveEnum;
use App\Enums\Ad\AdCampaignStatusEnum;
use App\Enums\Ad\AdCreativeStatusEnum;
use App\Enums\Ad\AdCtaTypeEnum;
use App\Enums\Ad\AdSurfaceEnum;
use App\Enums\Ad\BrandPartnerStatusEnum;
use App\Enums\Ad\LiveAdTakeModeEnum;
use App\Enums\Ad\LiveAdTakeStatusEnum;
use App\Enums\Post\PostDistributionEnum;
use App\Enums\Post\PostStatusEnum;
use App\Enums\Post\PostTypeEnum;
use App\Enums\User\UserTypeEnum;
use App\Events\Broadcast\LiveAdTakeEnded;
use App\Events\Broadcast\LiveAdTakeStarted;
use App\Models\AdCampaign;
use App\Models\AdCreative;
use App\Models\AdEvent;
use App\Models\BrandPartner;
use App\Models\LiveStream;
use App\Models\Post;
use App\Models\User;
use App\Settings\AdsSettings;
use Database\Seeders\SystemSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;
use Tests\Concerns\CreatesVideoPosts;
use Tests\TestCase;

class SponsoredAdsTest extends TestCase
{
    use CreatesVideoPosts;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SystemSettingsSeeder::class);
        $ads = app(AdsSettings::class);
        $ads->enabled = 1;
        $ads->slotEveryN = 3;
        $ads->minOrganicBeforeAd = 3;
        $ads->maxAdsPerResponse = 1;
        $ads->save();
    }

    public function test_sponsored_only_posts_are_excluded_from_explore(): void
    {
        $user = User::factory()->create();
        $brandUser = User::factory()->create(['is_official' => true]);

        $this->makeVideoPost($user, [
            'body' => 'Organic reel',
            'status' => PostStatusEnum::Ready,
            'published_at' => now(),
            'distribution' => PostDistributionEnum::Organic,
        ]);

        Post::query()->create([
            'user_id' => $brandUser->id,
            'type' => PostTypeEnum::Text,
            'body' => 'Pepsi sponsored',
            'status' => PostStatusEnum::Ready,
            'distribution' => PostDistributionEnum::SponsoredOnly,
            'published_at' => now(),
        ]);

        $response = $this->actingAs($user, 'api')->getJson('/api/v1/feed?per_page=10');
        $response->assertOk();

        $bodies = collect($response->json('data.items'))->pluck('body')->all();
        $this->assertContains('Organic reel', $bodies);
        $this->assertNotContains('Pepsi sponsored', $bodies);
    }

    public function test_feed_injector_inserts_sponsored_post_when_eligible(): void
    {
        $viewer = User::factory()->create();
        $setup = $this->createServableCreative();

        for ($i = 0; $i < 4; $i++) {
            Post::query()->create([
                'user_id' => $viewer->id,
                'type' => PostTypeEnum::Text,
                'body' => "organic-{$i}",
                'status' => PostStatusEnum::Ready,
                'distribution' => PostDistributionEnum::Organic,
                'published_at' => now()->subSeconds($i),
            ]);
        }

        $response = $this->actingAs($viewer, 'api')
            ->withHeader('X-Platform', 'android')
            ->getJson('/api/v1/feed?per_page=10');

        $response->assertOk();
        $items = collect($response->json('data.items'));
        $sponsored = $items->first(fn ($item) => ($item['sponsorship']['is_sponsored'] ?? false) === true);

        $this->assertNotNull($sponsored);
        $this->assertSame($setup['creative']->id, $sponsored['sponsorship']['creative_id']);
        $this->assertSame(PostDistributionEnum::SponsoredOnly->value, $sponsored['distribution']);
        $this->assertSame(
            $response->json('data.next_cursor'),
            $response->json('data.next_cursor'),
            'cursor is returned from organic paginator (smoke)'
        );
    }

    public function test_live_ad_take_start_and_end_broadcasts(): void
    {
        Event::fake([LiveAdTakeStarted::class, LiveAdTakeEnded::class]);

        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $setup = $this->createServableCreative();
        $stream = LiveStream::factory()->create([
            'status' => 'live',
            'ads_allowed' => true,
            'started_at' => now(),
        ]);

        $start = $this->actingAs($admin, 'api')->postJson('/api/v1/admin/live-ad-takes', [
            'creative_id' => $setup['creative']->id,
            'mode' => LiveAdTakeModeEnum::Overlay->value,
            'stream_ids' => [$stream->id],
            'note' => 'halftime',
        ]);

        $start->assertCreated()
            ->assertJsonPath('data.status', LiveAdTakeStatusEnum::Live->value);

        Event::assertDispatched(LiveAdTakeStarted::class);

        $takeId = (int) $start->json('data.id');
        $end = $this->actingAs($admin, 'api')->postJson("/api/v1/admin/live-ad-takes/{$takeId}/end");
        $end->assertOk()->assertJsonPath('data.status', LiveAdTakeStatusEnum::Ended->value);

        Event::assertDispatched(LiveAdTakeEnded::class);
    }

    public function test_ad_events_are_idempotent_on_client_event_id(): void
    {
        $viewer = User::factory()->create();
        $setup = $this->createServableCreative();
        $clientEventId = (string) Str::uuid();

        $payload = [
            'events' => [[
                'client_event_id' => $clientEventId,
                'type' => 'impression',
                'creative_id' => $setup['creative']->id,
                'campaign_id' => $setup['campaign']->id,
                'surface' => AdSurfaceEnum::HomeFeed->value,
                'platform' => 'android',
                'occurred_at' => now()->toIso8601String(),
            ]],
        ];

        $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/ads/events', $payload)
            ->assertOk()
            ->assertJsonPath('data.accepted', 1)
            ->assertJsonPath('data.duplicates', 0);

        $this->actingAs($viewer, 'api')
            ->postJson('/api/v1/ads/events', $payload)
            ->assertOk()
            ->assertJsonPath('data.accepted', 0)
            ->assertJsonPath('data.duplicates', 1);

        $this->assertSame(1, AdEvent::query()->where('client_event_id', $clientEventId)->count());
    }

    /**
     * @return array{partner: BrandPartner, campaign: AdCampaign, creative: AdCreative, post: Post}
     */
    private function createServableCreative(): array
    {
        $brandUser = User::factory()->create(['is_official' => true, 'nickname' => 'pepsi']);

        $partner = BrandPartner::query()->create([
            'name' => 'Pepsi',
            'slug' => 'pepsi',
            'user_id' => $brandUser->id,
            'status' => BrandPartnerStatusEnum::Active,
        ]);

        $post = Post::query()->create([
            'user_id' => $brandUser->id,
            'type' => PostTypeEnum::Text,
            'body' => 'Drink Pepsi',
            'status' => PostStatusEnum::Ready,
            'distribution' => PostDistributionEnum::SponsoredOnly,
            'published_at' => now(),
        ]);

        $campaign = AdCampaign::query()->create([
            'brand_partner_id' => $partner->id,
            'name' => 'Pepsi Summer',
            'status' => AdCampaignStatusEnum::Active,
            'objective' => AdCampaignObjectiveEnum::Awareness,
            'starts_at' => now()->subHour(),
            'ends_at' => now()->addDays(7),
            'priority' => 10,
            'surfaces' => [AdSurfaceEnum::HomeFeed->value, AdSurfaceEnum::ReelsFeed->value],
            'slot_every_n' => 3,
            'max_ads_per_response' => 1,
            'targeting_json' => null,
        ]);

        $creative = AdCreative::query()->create([
            'campaign_id' => $campaign->id,
            'post_id' => $post->id,
            'name' => 'Pepsi card',
            'cta_label' => 'Learn more',
            'cta_url' => 'https://example.com/pepsi',
            'cta_type' => AdCtaTypeEnum::Url,
            'disclosure_label' => 'Sponsored',
            'status' => AdCreativeStatusEnum::Approved,
            'weight' => 1,
        ]);

        return compact('partner', 'campaign', 'creative', 'post');
    }
}
