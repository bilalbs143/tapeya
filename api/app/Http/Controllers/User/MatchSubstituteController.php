<?php

namespace App\Http\Controllers\User;

use App\Enums\Event\InningsStatusEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Events\Scoring\MatchStateUpdated;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreMatchSubstituteRequest;
use App\Models\Innings;
use App\Models\TournamentMatch;
use App\Services\Broadcast\GraphicContextOrchestrator;
use App\Services\InningsStatsService;
use App\Services\MatchStateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class MatchSubstituteController extends Controller
{
    use BaseControllerTrait;

    public function store(
        StoreMatchSubstituteRequest $request,
        TournamentMatch $match,
        GraphicContextOrchestrator $orchestrator,
        MatchStateService $matchStateService,
        InningsStatsService $inningsStats,
    ): JsonResponse {
        $authUser = $request->user();

        if (! $authUser->canScoreMatchInApp($match)) {
            return $this->forbidden('You cannot score this match.');
        }

        if ($match->status === MatchStatusEnum::COMPLETED) {
            return $this->conflict('Match is already completed.');
        }

        if ($match->status === MatchStatusEnum::CANCELLED) {
            return $this->conflict('Match is already cancelled.');
        }

        $inningsId = (int) $request->validated('innings_id');
        $replacedId = (int) $request->validated('replaced_player_id');
        $substituteId = (int) $request->validated('substitute_player_id');
        $fielderId = $request->validated('fielder_id');
        $fielderId = $fielderId !== null ? (int) $fielderId : null;

        /** @var Innings|null $innings */
        $innings = $match->innings()->where('id', $inningsId)->first();
        if ($innings === null) {
            return $this->failure('Innings not found for this match.', 'VALIDATION_ERROR');
        }

        if ($innings->status !== InningsStatusEnum::IN_PROGRESS) {
            return $this->failure('Substitutions are only allowed during a live innings.', 'VALIDATION_ERROR');
        }

        $battingTeamId = (int) $innings->batting_team_id;
        $bowlingTeamId = (int) $innings->bowling_team_id;

        if (! $this->playerInMatchSquad($match->id, $battingTeamId, $replacedId)) {
            return $this->failure('The replaced player must be in the batting squad.', 'VALIDATION_ERROR');
        }

        if (! $this->playerInMatchSquad($match->id, $battingTeamId, $substituteId)) {
            return $this->failure('The substitute must be in the batting squad.', 'VALIDATION_ERROR');
        }

        if ($fielderId !== null && ! $this->playerInMatchSquad($match->id, $bowlingTeamId, $fielderId)) {
            return $this->failure('The fielder must be in the bowling squad.', 'VALIDATION_ERROR');
        }

        $match->loadMissing('graphicSession');
        $balls = $innings->balls()->orderBy('over')->orderBy('ball_in_over')->orderBy('id')->get();
        $pending = is_array($match->graphicSession?->pending_players)
            ? $match->graphicSession->pending_players
            : [];

        $crease = InningsStatsService::resolveCreaseAfterBalls($balls);
        $strikerId = $crease['striker_id'];
        $nonStrikerId = $crease['non_striker_id'];

        if ($balls->isEmpty()) {
            if (! empty($pending['next_batter_id'])) {
                $strikerId = (int) $pending['next_batter_id'];
            }
            if (! empty($pending['next_non_striker_id'])) {
                $nonStrikerId = (int) $pending['next_non_striker_id'];
            }
        } else {
            foreach (['next_batter_id', 'next_non_striker_id'] as $key) {
                if (empty($pending[$key])) {
                    continue;
                }
                $id = (int) $pending[$key];
                if ($id <= 0 || $strikerId === $id || $nonStrikerId === $id) {
                    continue;
                }
                if ($strikerId === null) {
                    $strikerId = $id;
                } elseif ($nonStrikerId === null) {
                    $nonStrikerId = $id;
                }
            }
        }

        if ($replacedId !== $strikerId && $replacedId !== $nonStrikerId) {
            return $this->failure('The replaced player must be on the crease.', 'VALIDATION_ERROR');
        }

        if ($substituteId === $strikerId || $substituteId === $nonStrikerId) {
            return $this->failure('The substitute cannot already be on the crease.', 'VALIDATION_ERROR');
        }

        $names = InningsStatsService::namesFromRelations($balls);
        $stats = $inningsStats->compute($balls, $names);
        $dismissed = $stats['dismissed_ids'] ?? [];
        if (in_array($substituteId, $dismissed, true)) {
            $dismissal = ($stats['batting_by_id'][$substituteId] ?? [])['dismissal_type'] ?? null;
            if ($dismissal !== 'retired_hurt') {
                return $this->failure('The substitute cannot be a dismissed batter.', 'VALIDATION_ERROR');
            }
        }

        DB::transaction(function () use ($match, $innings, $replacedId, $substituteId, $fielderId, $balls, $strikerId, $orchestrator) {
            DB::table('match_substitutes')->insert([
                'match_id' => $match->id,
                'innings_id' => $innings->id,
                'replaced_player_id' => $replacedId,
                'substitute_player_id' => $substituteId,
                'fielder_id' => $fielderId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if ($balls->isEmpty()) {
                $creasePatch = $replacedId === $strikerId
                    ? ['next_batter_id' => $substituteId]
                    : ['next_non_striker_id' => $substituteId];
                $orchestrator->setPendingAndBroadcast($match, $creasePatch);
            } else {
                $orchestrator->setPendingAndBroadcast($match, [
                    'substitute_replaced_id' => $replacedId,
                    'substitute_player_id' => $substituteId,
                ]);
            }
        });

        $matchState = $matchStateService->build($match->fresh(), $innings);
        MatchStateUpdated::dispatch($match->id, $matchState);

        return $this->success(
            [
                'substitute' => [
                    'match_id' => $match->id,
                    'innings_id' => $innings->id,
                    'replaced_player_id' => $replacedId,
                    'substitute_player_id' => $substituteId,
                    'fielder_id' => $fielderId,
                ],
                'match_state' => $matchState,
            ],
            'Substitute recorded.',
        );
    }

    private function playerInMatchSquad(int $matchId, int $teamId, int $userId): bool
    {
        return DB::table('match_squads')
            ->where('match_id', $matchId)
            ->where('team_id', $teamId)
            ->where('user_id', $userId)
            ->exists();
    }
}
