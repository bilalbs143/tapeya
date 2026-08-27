<?php

namespace App\Services\Tournament;

use App\Enums\Event\MatchKindEnum;
use App\Models\Tournament;
use App\Models\TournamentMatch;

/**
 * Shared rules for scheduling a tournament fixture (admin + user APIs).
 * Media (stream thumbnail) is handled separately via the generic MediaController.
 */
class TournamentMatchSchedulingService
{
    /**
     * @param  array<string, mixed>  $data  Validated schedule payload (no file keys)
     * @return array{ok: true, match: TournamentMatch}|array{ok: false, reason: 'forbidden'|'validation', message: string}
     */
    public function schedule(Tournament $tournament, array $data): array
    {
        $teamIds = [(int) $data['home_team_id'], (int) $data['away_team_id']];
        $attachedCount = $tournament->teams()
            ->whereIn('teams.id', $teamIds)
            ->count();

        if ($attachedCount !== 2) {
            return [
                'ok' => false,
                'reason' => 'forbidden',
                'message' => 'Both teams must be attached to this tournament before scheduling a match.',
            ];
        }

        $groupIndex = isset($data['group_index']) ? (int) $data['group_index'] : null;
        if ($groupIndex !== null) {
            if ($tournament->number_of_groups < 1 || $groupIndex < 1 || $groupIndex > $tournament->number_of_groups) {
                return [
                    'ok' => false,
                    'reason' => 'validation',
                    'message' => 'Group index must be between 1 and '.$tournament->number_of_groups.' for this tournament.',
                ];
            }
            $inGroup = $tournament->teams()
                ->whereIn('teams.id', $teamIds)
                ->wherePivot('group_index', $groupIndex)
                ->count();
            if ($inGroup !== 2) {
                return [
                    'ok' => false,
                    'reason' => 'validation',
                    'message' => 'Both teams must belong to group '.$groupIndex.' for this group-stage match.',
                ];
            }
        }

        $match = TournamentMatch::create([
            'kind' => MatchKindEnum::TOURNAMENT,
            'tournament_id' => $tournament->id,
            'group_index' => $groupIndex,
            'home_team_id' => $data['home_team_id'],
            'away_team_id' => $data['away_team_id'],
            'match_date' => $data['match_date'],
            'match_time' => $data['match_time'],
            'venue_name' => $data['venue_name'],
            'players_per_side' => $data['players_per_side'],
            'overs' => $data['overs'],
            'status' => 'scheduled',
        ]);

        $match->load(['homeTeam', 'awayTeam']);

        return ['ok' => true, 'match' => $match];
    }

    /**
     * @param  array<string, mixed>  $data  Validated schedule fields (no file keys)
     * @return array{ok: true, match: TournamentMatch}|array{ok: false, reason: 'forbidden'|'validation', message: string}
     */
    public function update(TournamentMatch $match, array $data): array
    {
        $tournament = $match->tournament ?? $match->loadMissing('tournament')->tournament;

        $homeTeamId = array_key_exists('home_team_id', $data)
            ? (int) $data['home_team_id']
            : (int) $match->home_team_id;
        $awayTeamId = array_key_exists('away_team_id', $data)
            ? (int) $data['away_team_id']
            : (int) $match->away_team_id;

        if ($homeTeamId === $awayTeamId) {
            return [
                'ok' => false,
                'reason' => 'validation',
                'message' => 'Home and away teams must be different.',
            ];
        }

        if (array_key_exists('home_team_id', $data) || array_key_exists('away_team_id', $data)) {
            $teamIds = [$homeTeamId, $awayTeamId];
            $attachedCount = $tournament->teams()
                ->whereIn('teams.id', $teamIds)
                ->count();

            if ($attachedCount !== 2) {
                return [
                    'ok' => false,
                    'reason' => 'forbidden',
                    'message' => 'Both teams must be attached to this tournament before updating a match.',
                ];
            }
        }

        $groupIndex = array_key_exists('group_index', $data)
            ? (isset($data['group_index']) ? (int) $data['group_index'] : null)
            : $match->group_index;

        if (array_key_exists('group_index', $data) || array_key_exists('home_team_id', $data) || array_key_exists('away_team_id', $data)) {
            if ($groupIndex !== null) {
                if ($tournament->number_of_groups < 1 || $groupIndex < 1 || $groupIndex > $tournament->number_of_groups) {
                    return [
                        'ok' => false,
                        'reason' => 'validation',
                        'message' => 'Group index must be between 1 and '.$tournament->number_of_groups.' for this tournament.',
                    ];
                }

                $teamIds = [$homeTeamId, $awayTeamId];
                $inGroup = $tournament->teams()
                    ->whereIn('teams.id', $teamIds)
                    ->wherePivot('group_index', $groupIndex)
                    ->count();

                if ($inGroup !== 2) {
                    return [
                        'ok' => false,
                        'reason' => 'validation',
                        'message' => 'Both teams must belong to group '.$groupIndex.' for this group-stage match.',
                    ];
                }
            }
        }

        $scheduleFields = [
            'group_index',
            'home_team_id',
            'away_team_id',
            'match_date',
            'match_time',
            'venue_name',
            'players_per_side',
            'overs',
        ];

        $updates = [];
        foreach ($scheduleFields as $field) {
            if (array_key_exists($field, $data)) {
                $updates[$field] = $data[$field];
            }
        }

        if ($updates !== []) {
            $match->update($updates);
        }

        $match->load(['homeTeam', 'awayTeam']);

        return ['ok' => true, 'match' => $match];
    }
}
