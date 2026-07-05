<?php

namespace Tests\Feature;

use App\Enums\User\UserTypeEnum;
use App\Models\GraphicTheme;
use App\Models\MatchGraphicSession;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use App\Services\Graphics\MatchGraphicSignedUrlService;
use App\Settings\GraphicsSettings;
use Database\Seeders\SystemSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GraphicSignedUrlTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private TournamentMatch $match;

    private MatchGraphicSession $session;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(SystemSettingsSeeder::class);
        $graphics = app(GraphicsSettings::class);
        $graphics->frontendUrl = 'https://graphics.tapeya.com';
        $graphics->signingSecret = 'test-graphics-signing-secret';
        $graphics->save();

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

    public function test_signed_url_is_regenerated_on_each_request(): void
    {
        $first = $this->getJson("/api/v1/admin/matches/{$this->match->id}/graphic-session/signed-url")
            ->assertOk()
            ->json('data');

        $this->assertNotEmpty($first['url']);
        $this->assertStringStartsWith('https://graphics.tapeya.com/', $first['url']);

        $this->session->refresh();
        $this->assertSame($first['url'], $this->session->signed_overlay_url);

        $second = $this->getJson("/api/v1/admin/matches/{$this->match->id}/graphic-session/signed-url")
            ->assertOk()
            ->json('data');

        $this->assertNotSame($first['url'], $second['url']);

        $this->session->refresh();
        $this->assertSame($second['url'], $this->session->signed_overlay_url);
    }

    public function test_signed_url_is_rotated_when_refresh_requested(): void
    {
        $first = $this->getJson("/api/v1/admin/matches/{$this->match->id}/graphic-session/signed-url")
            ->assertOk()
            ->json('data.url');

        $second = $this->getJson("/api/v1/admin/matches/{$this->match->id}/graphic-session/signed-url")
            ->assertOk()
            ->json('data.url');

        $this->assertNotSame($first, $second);

        $this->session->refresh();
        $this->assertSame($second, $this->session->signed_overlay_url);
    }

    public function test_create_session_issues_persisted_signed_url(): void
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

        $this->assertNotSame($session->signed_overlay_url, $again);
    }

    public function test_session_payload_includes_persisted_signed_url(): void
    {
        $this->getJson("/api/v1/admin/matches/{$this->match->id}/graphic-session/signed-url")
            ->assertOk();

        $payload = $this->getJson("/api/v1/admin/matches/{$this->match->id}/graphic-session")
            ->assertOk()
            ->json('data');

        $this->assertNotEmpty($payload['signed_overlay_url']);
        $this->assertNotEmpty($payload['signed_overlay_expires_at']);
    }

    public function test_superseded_graphics_link_is_rejected(): void
    {
        $service = app(MatchGraphicSignedUrlService::class);
        $first = $service->resolve($this->session);
        $firstToken = basename(parse_url($first['url'], PHP_URL_PATH) ?: '');

        $this->getJson("/api/v1/graphic-sessions/access/{$firstToken}")
            ->assertOk();

        $second = $service->resolve($this->session->fresh());
        $secondToken = basename(parse_url($second['url'], PHP_URL_PATH) ?: '');

        $this->getJson("/api/v1/graphic-sessions/access/{$firstToken}")
            ->assertForbidden()
            ->assertJsonPath('type', 'FORBIDDEN');

        $this->getJson("/api/v1/graphic-sessions/access/{$secondToken}")
            ->assertOk();
    }
}
