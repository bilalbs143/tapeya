<?php

namespace Tests\Unit;

use App\Models\GraphicTheme;
use App\Models\MatchGraphicSession;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use App\Services\Overlay\MatchGraphicOverlayUrlService;
use App\Settings\OverlaySettings;
use Database\Seeders\SystemSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\TestCase;

class MatchGraphicOverlayUrlServiceTest extends TestCase
{
    use RefreshDatabase;

    private MatchGraphicOverlayUrlService $service;

    private MatchGraphicSession $session;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(SystemSettingsSeeder::class);
        $overlay = app(OverlaySettings::class);
        $overlay->frontendUrl = 'https://app.tapeya.com';
        $overlay->signingSecret = 'unit-test-overlay-secret';
        $overlay->save();

        $this->service = app(MatchGraphicOverlayUrlService::class);

        $theme = GraphicTheme::firstOrCreate(
            ['slug' => 'theme1'],
            [
                'name' => 'Test Theme',
                'is_active' => true,
                'config_schema' => ['properties' => []],
                'default_config' => [],
            ],
        );

        $organizer = User::factory()->create();
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
        $match = TournamentMatch::create([
            'tournament_id' => $tournament->id,
            'home_team_id' => $teamA->id,
            'away_team_id' => $teamB->id,
            'match_date' => now()->toDateString(),
            'match_time' => '10:00:00',
            'venue_name' => 'Test Ground',
            'status' => 'scheduled',
        ]);

        $this->session = MatchGraphicSession::create([
            'match_id' => $match->id,
            'graphic_theme_id' => $theme->id,
            'config' => [],
            'context' => [],
        ]);
    }

    public function test_refresh_always_issues_a_new_url_even_within_the_same_second(): void
    {
        $first = $this->service->resolve($this->session, refresh: true);
        $second = $this->service->resolve($this->session->fresh(), refresh: true);

        $this->assertNotSame($first['url'], $second['url']);
    }

    public function test_resolve_reuses_persisted_url_without_refresh(): void
    {
        $issued = $this->service->resolve($this->session, refresh: true);
        $reused = $this->service->resolve($this->session->fresh(), refresh: false);

        $this->assertSame($issued['url'], $reused['url']);
    }

    public function test_build_fails_when_frontend_url_is_missing(): void
    {
        $overlay = app(OverlaySettings::class);
        $overlay->frontendUrl = '';
        $overlay->save();

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Overlay frontend URL is not configured.');

        $this->service->resolve($this->session, refresh: true);
    }
}
