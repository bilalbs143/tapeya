<?php

namespace Tests\Unit\Services\Broadcast;

use App\Enums\Broadcast\GraphicCommandKeyEnum;
use App\Enums\Broadcast\GraphicCommandTypeEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Ball;
use App\Models\GraphicTheme;
use App\Models\Innings;
use App\Models\MatchGraphicCommand;
use App\Models\MatchGraphicSession;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use App\Services\Broadcast\SyncUserOwnedOverlayCommand;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SyncUserOwnedOverlayCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_scheduled_match_activates_this_match(): void
    {
        [$session, $match, $organizer] = $this->makeSession();

        $changed = app(SyncUserOwnedOverlayCommand::class)->ensure($session, $match, $organizer->id);

        $this->assertTrue($changed);
        $session->refresh()->load('activeCommand');
        $this->assertSame(GraphicCommandKeyEnum::THIS_MATCH->value, (string) $session->activeCommand->command_key);
        $this->assertSame(GraphicCommandTypeEnum::FULL_SCREEN, $session->activeCommand->command_type);
    }

    public function test_toss_done_activates_toss_lt(): void
    {
        [$session, $match, $organizer] = $this->makeSession();
        $match->update([
            'toss_winner_team_id' => $match->home_team_id,
            'status' => MatchStatusEnum::TOSS_DONE->value,
        ]);

        app(SyncUserOwnedOverlayCommand::class)->ensure($session, $match->fresh(), $organizer->id);

        $session->refresh()->load('activeCommand');
        $this->assertSame(GraphicCommandKeyEnum::TOSS_LT->value, (string) $session->activeCommand->command_key);
        $this->assertSame(GraphicCommandTypeEnum::LOWER_THIRD, $session->activeCommand->command_type);
    }

    public function test_first_ball_activates_lt_default(): void
    {
        [$session, $match, $organizer] = $this->makeSession();
        $match->update([
            'toss_winner_team_id' => $match->home_team_id,
            'status' => MatchStatusEnum::TOSS_DONE->value,
        ]);
        $innings = Innings::query()->create([
            'match_id' => $match->id,
            'innings_number' => 1,
            'batting_team_id' => $match->home_team_id,
            'bowling_team_id' => $match->away_team_id,
            'status' => 'in_progress',
        ]);
        Ball::query()->create([
            'innings_id' => $innings->id,
            'over' => 0,
            'ball_in_over' => 1,
            'striker_id' => $organizer->id,
            'non_striker_id' => $organizer->id,
            'bowler_id' => $organizer->id,
            'runs' => 0,
            'runs_off_bat' => 0,
        ]);

        app(SyncUserOwnedOverlayCommand::class)->ensure($session, $match->fresh(), $organizer->id);

        $session->refresh()->load('activeCommand');
        $this->assertSame(GraphicCommandKeyEnum::LT_DEFAULT->value, (string) $session->activeCommand->command_key);
    }

    public function test_ensure_is_idempotent_for_same_phase(): void
    {
        [$session, $match, $organizer] = $this->makeSession();
        $service = app(SyncUserOwnedOverlayCommand::class);
        $service->ensure($session, $match, $organizer->id);

        $this->assertFalse($service->ensure($session->fresh(), $match, $organizer->id));
        $this->assertSame(1, MatchGraphicCommand::query()->count());
    }

    public function test_advance_skips_non_lifecycle_commands(): void
    {
        [$session, $match, $organizer] = $this->makeSession();
        $manual = MatchGraphicCommand::query()->create([
            'match_graphic_session_id' => $session->id,
            'command_type' => GraphicCommandTypeEnum::FULL_SCREEN->value,
            'command_key' => GraphicCommandKeyEnum::PLAYING_11->value,
            'payload' => null,
            'display_mode' => GraphicCommandKeyEnum::PLAYING_11->displayMode()->value,
            'created_by' => $organizer->id,
        ]);
        $session->update(['active_command_id' => $manual->id]);

        $match->update([
            'toss_winner_team_id' => $match->home_team_id,
            'status' => MatchStatusEnum::TOSS_DONE->value,
        ]);

        $changed = app(SyncUserOwnedOverlayCommand::class)->advanceIfPresent($match->fresh(), $organizer->id);

        $this->assertFalse($changed);
        $session->refresh()->load('activeCommand');
        $this->assertSame(GraphicCommandKeyEnum::PLAYING_11->value, (string) $session->activeCommand->command_key);
    }

    /**
     * @return array{0: MatchGraphicSession, 1: TournamentMatch, 2: User}
     */
    private function makeSession(): array
    {
        $theme = GraphicTheme::query()->create([
            'slug' => 'sync-overlay-'.uniqid(),
            'name' => 'Test',
            'is_active' => true,
            'config_schema' => ['properties' => []],
            'default_config' => [],
        ]);

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

        $match = TournamentMatch::create([
            'tournament_id' => $tournament->id,
            'home_team_id' => $teamA->id,
            'away_team_id' => $teamB->id,
            'match_date' => now()->toDateString(),
            'match_time' => '10:00:00',
            'venue_name' => 'Test Ground',
            'status' => MatchStatusEnum::SCHEDULED->value,
        ]);

        return [
            MatchGraphicSession::query()->create([
                'match_id' => $match->id,
                'graphic_theme_id' => $theme->id,
                'config' => [],
            ]),
            $match,
            $organizer,
        ];
    }
}
