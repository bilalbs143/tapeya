<?php

namespace Tests\Feature;

use App\Enums\User\UserTypeEnum;
use App\Models\GraphicTheme;
use App\Models\MatchGraphicSession;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use App\Settings\OverlaySettings;
use Database\Seeders\SystemSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GraphicOverlaySignedUrlTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private TournamentMatch $match;

    private MatchGraphicSession $session;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(SystemSettingsSeeder::class);
        $overlay = app(OverlaySettings::class);
        $overlay->frontendUrl = 'https://app.tapeya.com';
        $overlay->signingSecret = 'test-overlay-signing-secret';
        $overlay->save();

        $this->admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $this->actingAs($this->admin, 'api');

        $theme = GraphicTheme::firstOrCreate(
            ['slug' => 'theme1'],
            [
                'name' => 'Test Theme',
                'is_active' => true,
                'config_schema' => [
                    'properties' => [
                        ['key' => 'homeBgColor', 'label' => 'Home Color', 'type' => 'color', 'default' => '#1e3a5f'],
                        ['key' => 'awayBgColor', 'label' => 'Away Color', 'type' => 'color', 'default' => '#5c3d1e'],
                        ['key' => 'enableImages', 'label' => 'Show Player Images', 'type' => 'boolean', 'default' => false],
                    ],
                ],
                'default_config' => ['homeBgColor' => '#1e3a5f', 'awayBgColor' => '#5c3d1e', 'enableImages' => false],
            ],
        );

        $organizer = User::factory()->create(['type' => UserTypeEnum::USER]);
        $tournament = Tournament::create([
            'organizer_id' => $organizer->id,
            'tournament_name' => 'Test Cup',
            'tournament_type' => 'league',
            'cricket_format' => 'tape_ball',
            'venue_name' => 'Test Ground',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'number_of_teams' => 2,
            'city' => 'Test City',
            'match_timings' => 'day',
        ]);
        $teamA = Team::create(['name' => 'Team A', 'code' => 'TMA'.uniqid(), 'user_id' => $organizer->id, 'created_by' => $organizer->id]);
        $teamB = Team::create(['name' => 'Team B', 'code' => 'TMB'.uniqid(), 'user_id' => $organizer->id, 'created_by' => $organizer->id]);

        $this->match = TournamentMatch::create([
            'tournament_id' => $tournament->id,
            'home_team_id' => $teamA->id,
            'away_team_id' => $teamB->id,
            'match_date' => now()->toDateString(),
            'match_time' => '10:00:00',
            'venue_name' => 'Test Ground',
            'status' => 'scheduled',
        ]);

        $this->session = MatchGraphicSession::create([
            'match_id' => $this->match->id,
            'graphic_theme_id' => $theme->id,
            'config' => [],
            'context' => [],
            'created_by' => $this->admin->id,
            'updated_by' => $this->admin->id,
        ]);
    }

    public function test_signed_url_is_persisted_and_reused_until_refresh(): void
    {
        $first = $this->getJson("/api/v1/admin/matches/{$this->match->id}/graphic-session/signed-url")
            ->assertOk()
            ->json('data');

        $this->assertNotEmpty($first['url']);
        $this->assertStringContainsString('/overlay/'.$this->match->id, $first['url']);

        $this->session->refresh();
        $this->assertSame($first['url'], $this->session->signed_overlay_url);

        $second = $this->getJson("/api/v1/admin/matches/{$this->match->id}/graphic-session/signed-url")
            ->assertOk()
            ->json('data');

        $this->assertSame($first['url'], $second['url']);

        $refreshed = $this->getJson("/api/v1/admin/matches/{$this->match->id}/graphic-session/signed-url?refresh=1")
            ->assertOk()
            ->json('data');

        $this->assertNotSame($first['url'], $refreshed['url']);

        $this->session->refresh();
        $this->assertSame($refreshed['url'], $this->session->signed_overlay_url);
    }

    public function test_create_session_issues_persisted_overlay_url(): void
    {
        $themeId = $this->session->graphic_theme_id;
        $this->session->delete();

        $this->postJson("/api/v1/admin/matches/{$this->match->id}/graphic-session", [
            'graphic_theme_id' => $themeId,
            'config' => [
                'homeBgColor' => '#1e3a5f',
                'awayBgColor' => '#5c3d1e',
                'enableImages' => false,
            ],
        ])->assertOk();

        $session = MatchGraphicSession::where('match_id', $this->match->id)->firstOrFail();
        $this->assertNotEmpty($session->signed_overlay_url);
        $this->assertNotNull($session->signed_overlay_expires_at);

        $again = $this->getJson("/api/v1/admin/matches/{$this->match->id}/graphic-session/signed-url")
            ->assertOk()
            ->json('data.url');

        $this->assertSame($session->signed_overlay_url, $again);
    }

    public function test_session_payload_includes_persisted_overlay_url(): void
    {
        $this->getJson("/api/v1/admin/matches/{$this->match->id}/graphic-session/signed-url")
            ->assertOk();

        $payload = $this->getJson("/api/v1/admin/matches/{$this->match->id}/graphic-session")
            ->assertOk()
            ->json('data');

        $this->assertNotEmpty($payload['signed_overlay_url']);
        $this->assertNotEmpty($payload['signed_overlay_expires_at']);
    }
}
