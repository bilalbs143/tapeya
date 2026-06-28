<?php

namespace Tests\Feature;

use App\Enums\User\UserTypeEnum;
use App\Models\GraphicTheme;
use App\Models\MatchGraphicSession;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

/**
 * Verifies that the graphic session API accepts flat camelCase config,
 * validates it against the theme's config_schema, and strips unknown keys.
 */
class GraphicSessionConfigTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private GraphicTheme $theme;

    private TournamentMatch $match;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $this->actingAs($this->admin, 'api');

        $schema = [
            'properties' => [
                ['key' => 'homeBgColor',  'label' => 'Home Color',         'type' => 'color',   'default' => '#1e3a5f'],
                ['key' => 'awayBgColor',  'label' => 'Away Color',         'type' => 'color',   'default' => '#5c3d1e'],
                ['key' => 'enableImages', 'label' => 'Show Player Images', 'type' => 'boolean', 'default' => false],
            ],
        ];

        $this->theme = GraphicTheme::firstOrCreate(
            ['slug' => 'theme1'],
            [
                'name' => 'Test Theme',
                'is_active' => true,
                'config_schema' => $schema,
                'default_config' => ['homeBgColor' => '#1e3a5f', 'awayBgColor' => '#5c3d1e', 'enableImages' => false],
            ],
        );

        // Ensure the schema is always the test schema (seeder may have pre-populated it)
        $this->theme->update(['config_schema' => $schema, 'is_active' => true]);

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
            'players_per_side' => 11,
            'overs' => 20,
            'status' => 'in_progress',
        ]);
    }

    private function postSession(array $payload): TestResponse
    {
        return $this->postJson(
            "/api/v1/admin/matches/{$this->match->id}/graphic-session",
            $payload,
        );
    }

    // -------------------------------------------------------------------------
    // Happy path
    // -------------------------------------------------------------------------

    public function test_creates_session_with_valid_flat_config(): void
    {
        $response = $this->postSession([
            'graphic_theme_id' => $this->theme->id,
            'config' => [
                'homeBgColor' => '#ff0000',
                'awayBgColor' => '#0000ff',
                'enableImages' => true,
            ],
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('match_graphic_sessions', [
            'match_id' => $this->match->id,
            'graphic_theme_id' => $this->theme->id,
        ]);

        $saved = MatchGraphicSession::where('match_id', $this->match->id)->firstOrFail();
        $this->assertSame('#ff0000', $saved->config['homeBgColor']);
        $this->assertSame('#0000ff', $saved->config['awayBgColor']);
        $this->assertTrue($saved->config['enableImages']);
    }

    // -------------------------------------------------------------------------
    // Validation failures
    // -------------------------------------------------------------------------

    public function test_rejects_invalid_hex_color(): void
    {
        $response = $this->postSession([
            'graphic_theme_id' => $this->theme->id,
            'config' => [
                'homeBgColor' => 'not-a-color',
                'awayBgColor' => '#0000ff',
                'enableImages' => false,
            ],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['config.homeBgColor']);
    }

    public function test_rejects_missing_required_color(): void
    {
        $response = $this->postSession([
            'graphic_theme_id' => $this->theme->id,
            'config' => [
                // homeBgColor intentionally omitted
                'awayBgColor' => '#0000ff',
                'enableImages' => false,
            ],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['config.homeBgColor']);
    }

    public function test_rejects_missing_boolean_field(): void
    {
        $response = $this->postSession([
            'graphic_theme_id' => $this->theme->id,
            'config' => [
                'homeBgColor' => '#ff0000',
                'awayBgColor' => '#0000ff',
                // enableImages intentionally omitted
            ],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['config.enableImages']);
    }

    public function test_rejects_inactive_theme(): void
    {
        $inactiveTheme = GraphicTheme::create([
            'slug' => 'theme-inactive',
            'name' => 'Inactive',
            'is_active' => false,
            'config_schema' => null,
            'default_config' => null,
        ]);

        $response = $this->postSession([
            'graphic_theme_id' => $inactiveTheme->id,
            'config' => ['homeBgColor' => '#ff0000', 'awayBgColor' => '#0000ff', 'enableImages' => false],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['graphic_theme_id']);
    }

    // -------------------------------------------------------------------------
    // Key stripping
    // -------------------------------------------------------------------------

    public function test_unknown_config_keys_are_stripped_on_store(): void
    {
        $response = $this->postSession([
            'graphic_theme_id' => $this->theme->id,
            'config' => [
                'homeBgColor' => '#ff0000',
                'awayBgColor' => '#0000ff',
                'enableImages' => false,
                'maliciousKey' => 'injected',
                'teams' => ['home' => ['bg_color' => '#bad']],
                'enable_images' => true,
            ],
        ]);

        $response->assertOk();

        $saved = MatchGraphicSession::where('match_id', $this->match->id)->firstOrFail();
        $this->assertArrayNotHasKey('maliciousKey', $saved->config);
        $this->assertArrayNotHasKey('teams', $saved->config);
        $this->assertArrayNotHasKey('enable_images', $saved->config);
        $this->assertArrayHasKey('homeBgColor', $saved->config);
    }

    // -------------------------------------------------------------------------
    // PATCH update
    // -------------------------------------------------------------------------

    public function test_update_accepts_partial_flat_config(): void
    {
        // Seed an existing session
        $this->postSession([
            'graphic_theme_id' => $this->theme->id,
            'config' => ['homeBgColor' => '#ff0000', 'awayBgColor' => '#0000ff', 'enableImages' => false],
        ])->assertOk();

        $response = $this->patchJson(
            "/api/v1/admin/matches/{$this->match->id}/graphic-session",
            ['config' => ['homeBgColor' => '#abcdef']],
        );

        $response->assertOk();
    }

    public function test_update_strips_unknown_keys(): void
    {
        $this->postSession([
            'graphic_theme_id' => $this->theme->id,
            'config' => ['homeBgColor' => '#ff0000', 'awayBgColor' => '#0000ff', 'enableImages' => false],
        ])->assertOk();

        $response = $this->patchJson(
            "/api/v1/admin/matches/{$this->match->id}/graphic-session",
            ['config' => ['homeBgColor' => '#abcdef', 'teams' => ['home' => ['bg_color' => '#bad']]]],
        );

        $response->assertOk();

        $saved = MatchGraphicSession::where('match_id', $this->match->id)->firstOrFail();
        $this->assertArrayNotHasKey('teams', $saved->config);
        $this->assertSame('#abcdef', $saved->config['homeBgColor']);
    }
}
