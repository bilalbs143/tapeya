<?php

namespace Tests\Feature;

use App\Models\GraphicTheme;
use App\Models\MatchGraphicSession;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use App\Services\Graphics\GraphicAccessSigner;
use App\Settings\GraphicsSettings;
use Database\Seeders\SystemSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SignedGraphicSessionAccessTest extends TestCase
{
    use RefreshDatabase;

    private MatchGraphicSession $session;

    protected function setUp(): void
    {
        parent::setUp();

        $organizer = User::factory()->create();
        $tournament = Tournament::create([
            'organizer_id' => $organizer->id,
            'tournament_name' => 'Graphics Test Cup',
            'tournament_type' => 'league',
            'cricket_format' => 'tape_ball',
            'venue_name' => 'Test Ground',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'number_of_teams' => 2,
            'city' => 'Test City',
            'match_timings' => 'day',
        ]);

        $teamA = Team::create([
            'name' => 'Team A',
            'code' => 'TMA'.uniqid(),
            'user_id' => $organizer->id,
            'created_by' => $organizer->id,
        ]);
        $teamB = Team::create([
            'name' => 'Team B',
            'code' => 'TMB'.uniqid(),
            'user_id' => $organizer->id,
            'created_by' => $organizer->id,
        ]);

        $match = TournamentMatch::create([
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

        $theme = GraphicTheme::firstOrCreate(
            ['slug' => 'theme1'],
            [
                'name' => 'Theme 1',
                'is_active' => true,
                'config_schema' => ['properties' => []],
                'default_config' => [],
            ],
        );

        $this->session = MatchGraphicSession::create([
            'match_id' => $match->id,
            'graphic_theme_id' => $theme->id,
            'config' => [],
            'context' => [],
        ]);

        $this->seed(SystemSettingsSeeder::class);

        $graphicsSettings = app(GraphicsSettings::class);
        $graphicsSettings->signingSecret = 'test-graphics-signing-secret';
        $graphicsSettings->save();
    }

    public function test_signed_graphics_access_returns_session_json(): void
    {
        $expires = time() + 3600;
        $token = GraphicAccessSigner::fromSettings(app(GraphicsSettings::class))
            ->buildToken((int) $this->session->id, $expires);

        $this->session->forceFill([
            'signed_overlay_url' => "https://graphics.tapeya.com/{$token}",
            'signed_overlay_expires_at' => now()->setTimestamp($expires),
        ])->save();

        $response = $this->getJson("/api/v1/graphic-sessions/access/{$token}");

        $response->assertOk()
            ->assertJsonPath('data.id', $this->session->id)
            ->assertJsonPath('data.match_id', $this->session->match_id);
    }

    public function test_signed_graphics_access_rejects_invalid_signature(): void
    {
        $expires = time() + 3600;
        $token = $this->session->id.'-'.$expires.'-'.str_repeat('a', 64);

        $response = $this->getJson("/api/v1/graphic-sessions/access/{$token}");

        $response->assertForbidden();
    }

    public function test_signed_graphics_access_allows_graphics_origin_cors(): void
    {
        config([
            'cors.allowed_origins' => ['https://graphics.tapeya.com'],
        ]);

        $expires = time() + 3600;
        $token = GraphicAccessSigner::fromSettings(app(GraphicsSettings::class))
            ->buildToken((int) $this->session->id, $expires);

        $this->session->forceFill([
            'signed_overlay_url' => "https://graphics.tapeya.com/{$token}",
            'signed_overlay_expires_at' => now()->setTimestamp($expires),
        ])->save();

        $response = $this->withHeader('Origin', 'https://graphics.tapeya.com')
            ->getJson("/api/v1/graphic-sessions/access/{$token}");

        $response->assertOk()
            ->assertHeader('Access-Control-Allow-Origin', 'https://graphics.tapeya.com');
    }
}
