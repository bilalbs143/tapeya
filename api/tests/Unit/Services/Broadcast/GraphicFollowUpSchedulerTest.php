<?php

namespace Tests\Unit\Services\Broadcast;

use App\Enums\Broadcast\GraphicCommandKeyEnum;
use App\Enums\Broadcast\GraphicCommandTypeEnum;
use App\Enums\User\UserTypeEnum;
use App\Jobs\ActivateGraphicCommandFollowUpJob;
use App\Models\GraphicTheme;
use App\Models\MatchGraphicCommand;
use App\Models\MatchGraphicSession;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use App\Services\Broadcast\GraphicFollowUpScheduler;
use App\Support\Broadcast\GraphicFollowUpEvent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class GraphicFollowUpSchedulerTest extends TestCase
{
    use RefreshDatabase;

    public function test_command_activated_schedules_fst_follow_up(): void
    {
        Queue::fake();

        [$match, $fst] = $this->createMatchWithActiveCommand('theme1', GraphicCommandKeyEnum::FST_OUT);

        app(GraphicFollowUpScheduler::class)->onCommandActivated($match, $fst, 7);

        Queue::assertPushed(ActivateGraphicCommandFollowUpJob::class, function (ActivateGraphicCommandFollowUpJob $job) use ($match, $fst) {
            return $job->matchId === $match->id
                && $job->ruleId === 'fst_restore_default_lt'
                && $job->expectedActiveCommandId === $fst->id
                && ($job->payload['innings_number'] ?? null) === 1
                && $job->updatedByUserId === 7;
        });
    }

    public function test_activate_follow_up_when_guard_passes(): void
    {
        [$match, $fst] = $this->createMatchWithActiveCommand('theme2', GraphicCommandKeyEnum::FST_OUT);

        $ok = app(GraphicFollowUpScheduler::class)->activateFollowUp(
            $match,
            GraphicCommandKeyEnum::LT_DEFAULT->value,
            $fst->id,
            true,
            ['innings_number' => 1],
            null,
        );

        $this->assertTrue($ok);
        $match->graphicSession->refresh();
        $active = $match->graphicSession->activeCommand;
        $this->assertNotNull($active);
        $this->assertSame(GraphicCommandKeyEnum::LT_DEFAULT->value, (string) $active->command_key);
        $this->assertSame(1, $active->payload['innings_number'] ?? null);
    }

    public function test_activate_follow_up_skips_when_active_command_changed(): void
    {
        [$match, $fst] = $this->createMatchWithActiveCommand('theme2', GraphicCommandKeyEnum::FST_OUT);

        $other = MatchGraphicCommand::query()->create([
            'match_graphic_session_id' => $match->graphicSession->id,
            'command_type' => GraphicCommandTypeEnum::LOWER_THIRD->value,
            'command_key' => GraphicCommandKeyEnum::MINI_SCORECARD->value,
            'payload' => null,
            'display_mode' => 'LT',
            'created_by' => null,
        ]);
        $match->graphicSession->update(['active_command_id' => $other->id]);

        $ok = app(GraphicFollowUpScheduler::class)->activateFollowUp(
            $match,
            GraphicCommandKeyEnum::LT_DEFAULT->value,
            $fst->id,
            true,
            null,
            null,
        );

        $this->assertFalse($ok);
        $match->graphicSession->refresh();
        $this->assertSame($other->id, (int) $match->graphicSession->active_command_id);
    }

    public function test_dispatch_accepts_domain_events_without_command_context(): void
    {
        Queue::fake();

        config([
            'graphics_follow_ups' => [
                [
                    'id' => 'example_toss_to_toss_lt',
                    'on' => GraphicFollowUpEvent::TOSS_COMPLETED,
                    'then' => [
                        'activate' => GraphicCommandKeyEnum::TOSS_LT->value,
                        'delay_ms' => 0,
                        'only_if_still_active' => false,
                    ],
                ],
            ],
        ]);

        [$match] = $this->createMatchWithActiveCommand('theme2', GraphicCommandKeyEnum::LT_DEFAULT);

        app(GraphicFollowUpScheduler::class)->dispatch(
            GraphicFollowUpEvent::TOSS_COMPLETED,
            $match,
            ['payload' => ['innings_number' => 1]],
            null,
        );

        Queue::assertPushed(ActivateGraphicCommandFollowUpJob::class, function (ActivateGraphicCommandFollowUpJob $job) use ($match) {
            return $job->matchId === $match->id
                && $job->ruleId === 'example_toss_to_toss_lt'
                && $job->expectedActiveCommandId === null
                && ($job->payload['innings_number'] ?? null) === 1;
        });
    }

    /**
     * @return array{0: TournamentMatch, 1: MatchGraphicCommand}
     */
    private function createMatchWithActiveCommand(string $themeSlug, GraphicCommandKeyEnum $key): array
    {
        $theme = GraphicTheme::query()->create([
            'slug' => $themeSlug,
            'name' => $themeSlug,
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
        ]);

        $session = MatchGraphicSession::query()->create([
            'match_id' => $match->id,
            'graphic_theme_id' => $theme->id,
            'config' => [],
        ]);

        $command = MatchGraphicCommand::query()->create([
            'match_graphic_session_id' => $session->id,
            'command_type' => $key->commandType()->value,
            'command_key' => $key->value,
            'payload' => ['innings_number' => 1],
            'display_mode' => $key->displayMode()->value,
            'created_by' => null,
        ]);

        $session->update(['active_command_id' => $command->id]);
        $match->unsetRelation('graphicSession');

        return [$match->fresh(), $command];
    }
}
