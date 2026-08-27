<?php

namespace Tests\Feature;

use App\Enums\Broadcast\GraphicCommandKeyEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\GraphicTheme;
use App\Models\MatchGraphicCommand;
use App\Models\MatchGraphicSession;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use App\Settings\GraphicsSettings;
use Database\Seeders\SystemSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserOwnedGraphicOverlayTest extends TestCase
{
    use RefreshDatabase;

    private User $organizer;

    private User $stranger;

    private GraphicTheme $theme1;

    private GraphicTheme $theme2;

    private TournamentMatch $match;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(SystemSettingsSeeder::class);
        $graphics = app(GraphicsSettings::class);
        $graphics->frontendUrl = 'https://graphics.tapeya.com';
        $graphics->signingSecret = 'test-graphics-signing-secret';
        $graphics->save();

        $this->organizer = User::factory()->create(['type' => UserTypeEnum::USER]);
        $this->stranger = User::factory()->create(['type' => UserTypeEnum::USER]);

        $schema = [
            'properties' => [
                ['key' => 'homeBgColor', 'label' => 'Home Color', 'type' => 'color', 'default' => '#1e3a5f'],
                ['key' => 'awayBgColor', 'label' => 'Away Color', 'type' => 'color', 'default' => '#5c3d1e'],
                ['key' => 'enableImages', 'label' => 'Show Player Images', 'type' => 'boolean', 'default' => false],
            ],
        ];

        $this->theme1 = GraphicTheme::query()->create([
            'slug' => 'theme1-user-overlay-'.uniqid(),
            'name' => 'Alpha Theme',
            'is_active' => true,
            'config_schema' => $schema,
            'default_config' => ['homeBgColor' => '#1e3a5f', 'awayBgColor' => '#5c3d1e', 'enableImages' => false],
        ]);

        $this->theme2 = GraphicTheme::query()->create([
            'slug' => 'theme2-user-overlay-'.uniqid(),
            'name' => 'Beta Theme',
            'is_active' => true,
            'config_schema' => $schema,
            'default_config' => ['homeBgColor' => '#2e0a1a', 'awayBgColor' => '#9c0028', 'enableImages' => false],
        ]);

        GraphicTheme::query()->create([
            'slug' => 'inactive-user-overlay-'.uniqid(),
            'name' => 'Hidden Theme',
            'is_active' => false,
            'config_schema' => $schema,
            'default_config' => ['homeBgColor' => '#000000', 'awayBgColor' => '#111111', 'enableImages' => false],
        ]);

        $tournament = Tournament::create([
            'organizer_id' => $this->organizer->id,
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
        $teamA = Team::create(['name' => 'Team A', 'code' => 'TMA'.uniqid(), 'user_id' => $this->organizer->id, 'created_by' => $this->organizer->id]);
        $teamB = Team::create(['name' => 'Team B', 'code' => 'TMB'.uniqid(), 'user_id' => $this->organizer->id, 'created_by' => $this->organizer->id]);

        $this->match = TournamentMatch::create([
            'tournament_id' => $tournament->id,
            'home_team_id' => $teamA->id,
            'away_team_id' => $teamB->id,
            'match_date' => now()->toDateString(),
            'match_time' => '10:00:00',
            'venue_name' => 'Test Ground',
            'players_per_side' => 11,
            'overs' => 20,
            'status' => 'scheduled',
        ]);
    }

    public function test_lists_only_active_graphic_themes(): void
    {
        $this->actingAs($this->organizer, 'api');

        $ids = collect($this->getJson('/api/v1/graphic-themes')->assertOk()->json('data'))
            ->pluck('id')
            ->all();

        $this->assertContains($this->theme1->id, $ids);
        $this->assertContains($this->theme2->id, $ids);
        $this->assertNotContains(
            GraphicTheme::query()->where('is_active', false)->value('id'),
            $ids,
        );
    }

    public function test_organizer_upsert_creates_session_with_this_match_and_overlay_url(): void
    {
        $this->actingAs($this->organizer, 'api');

        $payload = $this->putJson("/api/v1/matches/{$this->match->id}/graphic-session", [
            'graphic_theme_id' => $this->theme1->id,
        ])->assertOk()->json('data');

        $this->assertSame($this->theme1->id, $payload['graphic_theme_id']);
        $this->assertSame('#1e3a5f', $payload['config']['homeBgColor']);
        $this->assertNotEmpty($payload['signed_overlay_url']);
        $this->assertStringStartsWith('https://graphics.tapeya.com/', $payload['signed_overlay_url']);
        $this->assertSame(GraphicCommandKeyEnum::THIS_MATCH->value, $payload['active_command']['command_key']);
    }

    public function test_second_upsert_does_not_rotate_overlay_url_or_duplicate_default_command(): void
    {
        $this->actingAs($this->organizer, 'api');

        $firstUrl = $this->putJson("/api/v1/matches/{$this->match->id}/graphic-session", [
            'graphic_theme_id' => $this->theme1->id,
        ])->assertOk()->json('data.signed_overlay_url');

        $second = $this->putJson("/api/v1/matches/{$this->match->id}/graphic-session", [
            'graphic_theme_id' => $this->theme1->id,
        ])->assertOk()->json('data');

        $this->assertSame($firstUrl, $second['signed_overlay_url']);
        $this->assertSame(1, MatchGraphicCommand::query()->count());
        $this->assertSame(1, MatchGraphicSession::query()->where('match_id', $this->match->id)->count());
    }

    public function test_changing_theme_uses_new_defaults_without_rotating_overlay_url(): void
    {
        $this->actingAs($this->organizer, 'api');

        $firstUrl = $this->putJson("/api/v1/matches/{$this->match->id}/graphic-session", [
            'graphic_theme_id' => $this->theme1->id,
        ])->assertOk()->json('data.signed_overlay_url');

        $updated = $this->putJson("/api/v1/matches/{$this->match->id}/graphic-session", [
            'graphic_theme_id' => $this->theme2->id,
        ])->assertOk()->json('data');

        $this->assertSame($this->theme2->id, $updated['graphic_theme_id']);
        $this->assertSame('#2e0a1a', $updated['config']['homeBgColor']);
        $this->assertSame($firstUrl, $updated['signed_overlay_url']);
        $this->assertSame(GraphicCommandKeyEnum::THIS_MATCH->value, $updated['active_command']['command_key']);
    }

    public function test_upsert_after_toss_activates_toss_lt(): void
    {
        $this->match->update([
            'toss_winner_team_id' => $this->match->home_team_id,
            'chose_to_bat_or_bowl' => 'bat',
            'status' => 'toss_done',
        ]);

        $this->actingAs($this->organizer, 'api');

        $payload = $this->putJson("/api/v1/matches/{$this->match->id}/graphic-session", [
            'graphic_theme_id' => $this->theme1->id,
        ])->assertOk()->json('data');

        $this->assertSame(GraphicCommandKeyEnum::TOSS_LT->value, $payload['active_command']['command_key']);
    }

    public function test_toss_advances_existing_session_to_toss_lt(): void
    {
        $this->actingAs($this->organizer, 'api');
        $this->putJson("/api/v1/matches/{$this->match->id}/graphic-session", [
            'graphic_theme_id' => $this->theme1->id,
        ])->assertOk();

        $this->patchJson("/api/v1/matches/{$this->match->id}/toss", [
            'winning_team_id' => $this->match->home_team_id,
            'chose_to_bat_or_bowl' => 'bat',
        ])->assertOk();

        $session = MatchGraphicSession::query()->where('match_id', $this->match->id)->firstOrFail();
        $session->load('activeCommand');
        $this->assertSame(GraphicCommandKeyEnum::TOSS_LT->value, (string) $session->activeCommand->command_key);
    }

    public function test_signed_url_endpoint_rotates_the_overlay_link(): void
    {
        $this->actingAs($this->organizer, 'api');

        $firstUrl = $this->putJson("/api/v1/matches/{$this->match->id}/graphic-session", [
            'graphic_theme_id' => $this->theme1->id,
        ])->assertOk()->json('data.signed_overlay_url');

        $rotated = $this->getJson("/api/v1/matches/{$this->match->id}/graphic-session/signed-url")
            ->assertOk()
            ->json('data.url');

        $this->assertNotSame($firstUrl, $rotated);
        $this->assertSame(
            $rotated,
            MatchGraphicSession::query()->where('match_id', $this->match->id)->value('signed_overlay_url'),
        );
    }

    public function test_stranger_cannot_read_or_upsert_graphic_session(): void
    {
        $this->actingAs($this->organizer, 'api');
        $this->putJson("/api/v1/matches/{$this->match->id}/graphic-session", [
            'graphic_theme_id' => $this->theme1->id,
        ])->assertOk();

        $this->actingAs($this->stranger, 'api');

        $this->getJson("/api/v1/matches/{$this->match->id}/graphic-session")
            ->assertForbidden();
        $this->putJson("/api/v1/matches/{$this->match->id}/graphic-session", [
            'graphic_theme_id' => $this->theme1->id,
        ])->assertForbidden();
        $this->getJson("/api/v1/matches/{$this->match->id}/graphic-session/signed-url")
            ->assertForbidden();
    }

    public function test_rejects_inactive_theme(): void
    {
        $this->actingAs($this->organizer, 'api');

        $inactiveId = GraphicTheme::query()->where('is_active', false)->value('id');

        $this->putJson("/api/v1/matches/{$this->match->id}/graphic-session", [
            'graphic_theme_id' => $inactiveId,
        ])->assertStatus(422);
    }

    public function test_optional_config_override_is_persisted(): void
    {
        $this->actingAs($this->organizer, 'api');

        $payload = $this->putJson("/api/v1/matches/{$this->match->id}/graphic-session", [
            'graphic_theme_id' => $this->theme1->id,
            'config' => [
                'homeBgColor' => '#ff0000',
                'awayBgColor' => '#00ff00',
                'enableImages' => true,
            ],
        ])->assertOk()->json('data');

        $this->assertSame('#ff0000', $payload['config']['homeBgColor']);
        $this->assertTrue($payload['config']['enableImages']);
    }

    public function test_show_returns_not_found_before_setup(): void
    {
        $this->actingAs($this->organizer, 'api');

        $this->getJson("/api/v1/matches/{$this->match->id}/graphic-session")
            ->assertStatus(404);
    }
}
