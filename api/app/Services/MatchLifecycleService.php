<?php

namespace App\Services;

use App\Enums\Event\DeclareResultTypeEnum;
use App\Enums\Event\InningsEndedByEnum;
use App\Enums\Event\InningsEndReasonEnum;
use App\Enums\Event\InningsStatusEnum;
use App\Enums\Event\MatchEndReasonEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Enums\Event\TargetRevisionActionEnum;
use App\Models\Innings;
use App\Models\TournamentMatch;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Manual match lifecycle actions (cancel / end match with reason, etc.).
 */
class MatchLifecycleService
{
    public function __construct(
        private readonly InningsLifecycleService $inningsLifecycle,
        private readonly MatchCompletionService $completionService,
    ) {}

    /**
     * End or cancel a match manually (organizer action).
     *
     * @param  array{cancel_reason: string, cancel_comments?: string|null, cancel_points_awarded_each?: bool}  $data
     */
    public function endMatch(TournamentMatch $match, array $data): TournamentMatch
    {
        if ($match->status === MatchStatusEnum::COMPLETED) {
            throw ValidationException::withMessages([
                'match' => ['Match is already completed.'],
            ]);
        }

        if ($match->status === MatchStatusEnum::CANCELLED) {
            throw ValidationException::withMessages([
                'match' => ['Match is already cancelled.'],
            ]);
        }

        MatchEndReasonEnum::from($data['cancel_reason']);

        return DB::transaction(function () use ($match, $data) {
            $match->loadMissing(['innings']);

            // S7: complete open innings with a documented reason so end_reason is
            // never silently null. The match cancel_reason explains why at the match level;
            // 'referee' is the closest InningsEndReasonEnum value for an administrative end.
            foreach ($match->innings as $innings) {
                if ($innings->status !== InningsStatusEnum::COMPLETED) {
                    $innings->update([
                        'status' => InningsStatusEnum::COMPLETED,
                        'end_reason' => InningsEndReasonEnum::REFEREE,
                        'ended_by' => InningsEndedByEnum::REFEREE,
                    ]);
                }
            }

            $match->update([
                'status' => MatchStatusEnum::CANCELLED,
                'cancel_reason' => $data['cancel_reason'],
                'cancel_comments' => $data['cancel_comments'] ?? null,
                'cancel_points_awarded_each' => (bool) ($data['cancel_points_awarded_each'] ?? false),
                'winning_team_id' => null,
                'win_by_runs' => null,
                'win_by_wickets' => null,
            ]);

            return $match->fresh();
        });
    }

    /**
     * Declare match result (award to a team or draw).
     *
     * @param  array{declare_result_type: string, winner_team_id?: int|null, declare_result_note?: string|null}  $data
     */
    public function declareResult(TournamentMatch $match, array $data): TournamentMatch
    {
        if ($match->status === MatchStatusEnum::COMPLETED) {
            throw ValidationException::withMessages([
                'match' => ['Match is already completed.'],
            ]);
        }

        if ($match->status === MatchStatusEnum::CANCELLED) {
            throw ValidationException::withMessages([
                'match' => ['Match is cancelled.'],
            ]);
        }

        $type = DeclareResultTypeEnum::from($data['declare_result_type']);

        return DB::transaction(function () use ($match, $data, $type) {
            $match->loadMissing(['innings']);

            // S8: complete open innings with an explicit end_reason so the column is
            // never silently null after a declare-result action.
            foreach ($match->innings as $innings) {
                if ($innings->status !== InningsStatusEnum::COMPLETED) {
                    $innings->update([
                        'status' => InningsStatusEnum::COMPLETED,
                        'end_reason' => InningsEndReasonEnum::REFEREE,
                        'ended_by' => InningsEndedByEnum::REFEREE,
                    ]);
                }
            }

            $winnerId = null;
            if ($type === DeclareResultTypeEnum::AWARD) {
                if (empty($data['winner_team_id'])) {
                    throw ValidationException::withMessages([
                        'winner_team_id' => ['A winner team is required when declaring an award result.'],
                    ]);
                }
                $winnerId = (int) $data['winner_team_id'];
                $homeId = (int) $match->home_team_id;
                $awayId = (int) $match->away_team_id;
                if ($winnerId !== $homeId && $winnerId !== $awayId) {
                    throw ValidationException::withMessages([
                        'winner_team_id' => ['Winner must be one of the teams in this match.'],
                    ]);
                }
            }

            $match->update([
                'status' => MatchStatusEnum::COMPLETED,
                'declare_result_type' => $type->value,
                'declare_winner_team_id' => $winnerId,
                'declare_result_note' => $data['declare_result_note'] ?? null,
                'winning_team_id' => $winnerId,
                'win_by_runs' => null,
                'win_by_wickets' => null,
                'is_no_result' => false,
            ]);

            return $match->fresh();
        });
    }

    /**
     * Revise the second-innings chase target (e.g. DLS).
     *
     * @param  array{revised_target: int, action: string}  $data
     */
    public function reviseTarget(TournamentMatch $match, array $data): TournamentMatch
    {
        if ($match->status === MatchStatusEnum::COMPLETED) {
            throw ValidationException::withMessages([
                'match' => ['Match is already completed.'],
            ]);
        }

        if ($match->status === MatchStatusEnum::CANCELLED) {
            throw ValidationException::withMessages([
                'match' => ['Match is cancelled.'],
            ]);
        }

        $action = TargetRevisionActionEnum::from($data['action']);

        return DB::transaction(function () use ($match, $data, $action) {
            $match->loadMissing(['innings' => fn ($q) => $q->orderBy('innings_number')]);

            /** @var Innings|null $inn1 */
            $inn1 = $match->innings->firstWhere('innings_number', 1);
            /** @var Innings|null $inn2 */
            $inn2 = $match->innings->firstWhere('innings_number', 2);

            if (! $inn1 || $inn1->status !== InningsStatusEnum::COMPLETED) {
                throw ValidationException::withMessages([
                    'match' => ['First innings must be completed before revising the target.'],
                ]);
            }

            if (! $inn2) {
                throw ValidationException::withMessages([
                    'match' => ['Second innings is not available for this match.'],
                ]);
            }

            if ($inn2->status === InningsStatusEnum::COMPLETED) {
                throw ValidationException::withMessages([
                    'innings' => ['Second innings is already completed.'],
                ]);
            }

            $match->update([
                'revised_target' => (int) $data['revised_target'],
                'revised_target_at' => now(),
            ]);

            $match = $match->fresh();

            if ($action === TargetRevisionActionEnum::END_INNINGS) {
                $this->inningsLifecycle->endInnings($match, $inn2, [
                    'end_reason' => InningsEndReasonEnum::TARGET_REVISION->value,
                    'end_comments' => null,
                    'points_awarded_each' => false,
                ]);
                $match = $match->fresh();
            } else {
                $this->completionService->evaluate($match);
                $match = $match->fresh();
            }

            return $match;
        });
    }
}
