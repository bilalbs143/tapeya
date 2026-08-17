<?php

namespace App\Services\QuickMatch;

use App\Enums\Event\MatchKindEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Enums\Event\TossChoiceEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\CricketMatch;
use App\Models\Team;
use App\Models\User;
use App\Support\MatchSquadRules;
use App\Support\NicknameFromName;
use App\Utils\Services\OtpService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class QuickMatchService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function create(User $creator, array $data): CricketMatch
    {
        return DB::transaction(function () use ($creator, $data) {
            $home = $this->resolveTeam($creator, $data['home'], 'home');
            $away = $this->resolveTeam($creator, $data['away'], 'away');

            if ((int) $home->id === (int) $away->id) {
                throw ValidationException::withMessages([
                    'away.team_id' => 'Home and away must be different teams.',
                ]);
            }

            $homePlayerIds = $this->resolvePlayers($creator, $data['home']['players'], 'home');
            $awayPlayerIds = $this->resolvePlayers($creator, $data['away']['players'], 'away');

            $overlap = array_intersect($homePlayerIds, $awayPlayerIds);
            if ($overlap !== []) {
                throw ValidationException::withMessages([
                    'players' => 'A player cannot appear on both sides of the same match.',
                ]);
            }

            $hasToss = isset($data['toss']);
            $playersPerSide = (int) $data['players_per_side'];
            if ($hasToss) {
                // Squad = XI on toss: enforce the same exact-count rule as PlayingElevenController.
                foreach (['home' => $homePlayerIds, 'away' => $awayPlayerIds] as $side => $ids) {
                    if (count($ids) !== $playersPerSide) {
                        throw ValidationException::withMessages([
                            "{$side}.players" => "Each side must have exactly {$playersPerSide} players to start.",
                        ]);
                    }
                }
            }

            $match = CricketMatch::create([
                'kind' => MatchKindEnum::QUICK,
                'tournament_id' => null,
                'created_by' => $creator->id,
                'cricket_format' => $data['cricket_format'],
                'home_team_id' => $home->id,
                'away_team_id' => $away->id,
                'match_date' => now()->toDateString(),
                'match_time' => now()->format('H:i:s'),
                'venue_name' => null,
                'players_per_side' => $playersPerSide,
                'overs' => $data['overs'],
                'status' => MatchStatusEnum::SCHEDULED->value,
            ]);

            $this->attachRosterAndSquad($match, $home, $homePlayerIds, $hasToss);
            $this->attachRosterAndSquad($match, $away, $awayPlayerIds, $hasToss);

            if ($hasToss) {
                $this->applyToss($match, $data['toss']);
            }

            return $this->loadForResource($match->fresh());
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateScheduled(CricketMatch $match, User $actor, array $data): CricketMatch
    {
        return DB::transaction(function () use ($match, $actor, $data) {
            $updates = [];
            foreach (['overs', 'cricket_format', 'players_per_side'] as $field) {
                if (array_key_exists($field, $data)) {
                    $updates[$field] = $data[$field];
                }
            }

            // Reassigning a side's team before toss: resolve the new team the same way
            // create() does, wipe that side's existing squad (it belonged to the old team),
            // then point the match at the new team. Only touched when the client sends it.
            $newHomeTeam = array_key_exists('home', $data) ? $this->resolveTeam($actor, $data['home'], 'home') : null;
            $newAwayTeam = array_key_exists('away', $data) ? $this->resolveTeam($actor, $data['away'], 'away') : null;

            $finalHomeId = $newHomeTeam?->id ?? $match->home_team_id;
            $finalAwayId = $newAwayTeam?->id ?? $match->away_team_id;
            if ((int) $finalHomeId === (int) $finalAwayId) {
                throw ValidationException::withMessages([
                    'away.team_id' => 'Home and away must be different teams.',
                ]);
            }

            if ($newHomeTeam !== null && (int) $newHomeTeam->id !== (int) $match->home_team_id) {
                $this->clearSideSquad($match, (int) $match->home_team_id);
                $updates['home_team_id'] = $newHomeTeam->id;
            }
            if ($newAwayTeam !== null && (int) $newAwayTeam->id !== (int) $match->away_team_id) {
                $this->clearSideSquad($match, (int) $match->away_team_id);
                $updates['away_team_id'] = $newAwayTeam->id;
            }

            if ($updates !== []) {
                $match->update($updates);
            }

            return $this->loadForResource($match->fresh());
        });
    }

    /**
     * Remove a match's squad/XI rows for one (now-replaced) side team.
     * Mirrors the cleanup removePlayer() already does per-player, just for the whole side.
     */
    private function clearSideSquad(CricketMatch $match, int $oldTeamId): void
    {
        DB::table('match_squads')->where('match_id', $match->id)->where('team_id', $oldTeamId)->delete();
        DB::table('match_players')->where('match_id', $match->id)->where('team_id', $oldTeamId)->delete();
    }

    /**
     * @param  array{user_id?: int, name?: string, phone?: string}  $player
     */
    public function addPlayer(User $actor, CricketMatch $match, Team $team, array $player): User
    {
        if (MatchSquadRules::isLocked($match)) {
            throw ValidationException::withMessages([
                'match' => 'Players cannot be added to a completed or cancelled match.',
            ]);
        }

        $user = $this->resolvePlayers($actor, [$player], 'player')[0];
        $oppositeTeamId = (int) $team->id === (int) $match->home_team_id
            ? (int) $match->away_team_id
            : (int) $match->home_team_id;

        $onOpposite = DB::table('match_squads')
            ->where('match_id', $match->id)
            ->where('team_id', $oppositeTeamId)
            ->where('user_id', $user)
            ->exists();

        if ($onOpposite) {
            throw ValidationException::withMessages([
                'user_id' => 'A player cannot appear on both sides of the same match.',
            ]);
        }

        $alreadyOnSide = DB::table('match_squads')
            ->where('match_id', $match->id)
            ->where('team_id', $team->id)
            ->where('user_id', $user)
            ->exists();

        if (! $alreadyOnSide) {
            $currentCount = DB::table('match_squads')
                ->where('match_id', $match->id)
                ->where('team_id', $team->id)
                ->count();
            $pps = MatchSquadRules::playersPerSide($match);
            // Before toss, keep squad ≤ players_per_side (XI = squad). After toss, allow bench growth.
            if ($match->status === MatchStatusEnum::SCHEDULED && $currentCount >= $pps) {
                throw ValidationException::withMessages([
                    'players' => "This side already has {$pps} players.",
                ]);
            }
        }

        $this->attachRosterAndSquad($match, $team, [$user], false);

        return User::query()->findOrFail($user);
    }

    /**
     * Detach a player from this match's squad (and XI if present). Keeps team roster membership.
     */
    public function removePlayer(CricketMatch $match, Team $team, User $player): void
    {
        if (MatchSquadRules::isLocked($match)) {
            throw ValidationException::withMessages([
                'match' => 'Players cannot be removed from a completed or cancelled match.',
            ]);
        }

        if (MatchSquadRules::hasMatchStarted($match)) {
            $remaining = DB::table('match_squads')
                ->where('match_id', $match->id)
                ->where('team_id', $team->id)
                ->where('user_id', '!=', $player->id)
                ->count();
            $pps = MatchSquadRules::playersPerSide($match);
            if ($remaining < $pps) {
                throw ValidationException::withMessages([
                    'user_id' => "Squad must keep at least {$pps} players once the match has started.",
                ]);
            }
        }

        $deleted = DB::table('match_squads')
            ->where('match_id', $match->id)
            ->where('team_id', $team->id)
            ->where('user_id', $player->id)
            ->delete();

        if ($deleted === 0) {
            throw ValidationException::withMessages([
                'user_id' => 'Player is not on this side\'s squad.',
            ]);
        }

        DB::table('match_players')
            ->where('match_id', $match->id)
            ->where('team_id', $team->id)
            ->where('user_id', $player->id)
            ->delete();
    }

    /**
     * Promote each side's match squad to playing XI (insertOrIgnore). Used when recording toss on a quick match.
     */
    public function promoteSquadToPlayingEleven(CricketMatch $match): void
    {
        $pps = MatchSquadRules::playersPerSide($match);
        foreach ([(int) $match->home_team_id, (int) $match->away_team_id] as $teamId) {
            $userIds = DB::table('match_squads')
                ->where('match_id', $match->id)
                ->where('team_id', $teamId)
                ->pluck('user_id')
                ->map(fn ($id) => (int) $id)
                ->all();

            if (count($userIds) !== $pps) {
                throw ValidationException::withMessages([
                    'players' => "Each side must have exactly {$pps} players to start.",
                ]);
            }

            $now = now();
            $xiRows = [];
            foreach ($userIds as $userId) {
                $xiRows[] = [
                    'match_id' => $match->id,
                    'team_id' => $teamId,
                    'user_id' => $userId,
                    'playing_role' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
            DB::table('match_players')->insertOrIgnore($xiRows);
        }
    }

    public function loadForResource(CricketMatch $match): CricketMatch
    {
        $match->load(['homeTeam', 'awayTeam', 'createdBy', 'tossWinnerTeam', 'tournament', 'innings']);
        $this->hydrateSquadPlayersForMatches(collect([$match]));

        return $match;
    }

    /**
     * @param  Collection<int, CricketMatch>|\Illuminate\Database\Eloquent\Collection<int, CricketMatch>  $matches
     */
    public function hydrateSquadPlayersForMatches($matches): void
    {
        $ids = $matches->pluck('id')->filter()->map(fn ($id) => (int) $id)->unique()->values()->all();
        if ($ids === []) {
            return;
        }

        $rows = DB::table('match_squads')
            ->whereIn('match_id', $ids)
            ->get(['match_id', 'team_id', 'user_id']);

        $users = User::query()
            ->whereIn('id', $rows->pluck('user_id')->unique()->filter()->all())
            ->get(['id', 'name', 'nickname', 'added_via_quick_match'])
            ->keyBy('id');

        $byMatchTeam = $rows->groupBy(fn ($row) => (int) $row->match_id);

        foreach ($matches as $match) {
            $teamMap = ($byMatchTeam->get((int) $match->id) ?? collect())
                ->groupBy(fn ($row) => (int) $row->team_id)
                ->map(fn ($teamRows) => $teamRows
                    ->map(fn ($row) => $users->get((int) $row->user_id))
                    ->filter()
                    ->values());

            if ($match->relationLoaded('homeTeam') && $match->homeTeam) {
                $match->homeTeam->setRelation(
                    'quickMatchPlayers',
                    $teamMap->get((int) $match->home_team_id, collect())
                );
            }
            if ($match->relationLoaded('awayTeam') && $match->awayTeam) {
                $match->awayTeam->setRelation(
                    'quickMatchPlayers',
                    $teamMap->get((int) $match->away_team_id, collect())
                );
            }
        }
    }

    /**
     * @param  array{team_id?: int|null, name?: string}  $side
     */
    private function resolveTeam(User $creator, array $side, string $sideKey): Team
    {
        if (! empty($side['team_id'])) {
            $team = Team::query()->find((int) $side['team_id']);
            if ($team === null || ! $creator->canManageTeam($team)) {
                throw ValidationException::withMessages([
                    "{$sideKey}.team_id" => 'You cannot use this team.',
                ]);
            }

            // Do not rename a saved team from Quick Match create — edit via team APIs.
            return $team;
        }

        $name = trim((string) ($side['name'] ?? ''));
        if ($name === '') {
            throw ValidationException::withMessages([
                "{$sideKey}.name" => 'Team name is required when team_id is not set.',
            ]);
        }

        return Team::create([
            'name' => $name,
            'code' => $this->uniqueTeamCode($name),
            'user_id' => $creator->id,
            'created_by' => $creator->id,
        ]);
    }

    /**
     * @param  list<array{user_id?: int, name?: string, phone?: string}>  $players
     * @return list<int>
     */
    private function resolvePlayers(User $creator, array $players, string $sideKey): array
    {
        $ids = [];

        foreach ($players as $index => $player) {
            if (! empty($player['user_id'])) {
                $user = User::query()->find((int) $player['user_id']);
                if ($user === null || ! $user->isUser() || $user->isBlocked()) {
                    throw ValidationException::withMessages([
                        "{$sideKey}.players.{$index}.user_id" => 'Player must be an active Tapeya user.',
                    ]);
                }
                $ids[] = (int) $user->id;

                continue;
            }

            $name = trim((string) ($player['name'] ?? ''));
            $phone = OtpService::normalizePhone((string) ($player['phone'] ?? ''));

            $existing = User::query()->where('phone', $phone)->first();
            if ($existing !== null) {
                throw ValidationException::withMessages([
                    "{$sideKey}.players.{$index}.phone" => 'This number is already registered. Add them from search.',
                ]);
            }

            $created = NicknameFromName::createUser([
                'name' => $name,
                'phone' => $phone,
                'type' => UserTypeEnum::USER,
                'status' => UserStatusEnum::VERIFICATION_PENDING,
                'password' => null,
                'created_by' => $creator->id,
                'added_via_quick_match' => true,
            ], $name);
            $ids[] = (int) $created->id;
        }

        return array_values(array_unique($ids));
    }

    /**
     * @param  list<int>  $playerIds
     */
    private function attachRosterAndSquad(CricketMatch $match, Team $team, array $playerIds, bool $asPlayingEleven): void
    {
        if ($playerIds === []) {
            return;
        }

        $team->players()->syncWithoutDetaching($playerIds);

        $now = now();
        $squadRows = [];
        foreach ($playerIds as $userId) {
            $squadRows[] = [
                'match_id' => $match->id,
                'team_id' => $team->id,
                'user_id' => $userId,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        DB::table('match_squads')->insertOrIgnore($squadRows);

        if (! $asPlayingEleven) {
            return;
        }

        $xiRows = [];
        foreach ($playerIds as $userId) {
            $xiRows[] = [
                'match_id' => $match->id,
                'team_id' => $team->id,
                'user_id' => $userId,
                'playing_role' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        DB::table('match_players')->insertOrIgnore($xiRows);
    }

    /**
     * @param  array{winning_side: string, chose_to_bat_or_bowl: string}  $toss
     */
    private function applyToss(CricketMatch $match, array $toss): void
    {
        $winningTeamId = $toss['winning_side'] === 'home'
            ? (int) $match->home_team_id
            : (int) $match->away_team_id;
        $chose = $toss['chose_to_bat_or_bowl'];

        $match->update([
            'toss_winner_team_id' => $winningTeamId,
            'chose_to_bat_or_bowl' => $chose,
            'status' => MatchStatusEnum::TOSS_DONE->value,
        ]);

        $otherTeamId = (int) $match->home_team_id === $winningTeamId
            ? (int) $match->away_team_id
            : (int) $match->home_team_id;
        $battingFirst = $chose === TossChoiceEnum::BAT->value;
        $innings1Batting = $battingFirst ? $winningTeamId : $otherTeamId;
        $innings1Bowling = $battingFirst ? $otherTeamId : $winningTeamId;

        if ($match->innings()->count() === 0) {
            $match->innings()->createMany([
                [
                    'innings_number' => 1,
                    'batting_team_id' => $innings1Batting,
                    'bowling_team_id' => $innings1Bowling,
                    'status' => 'not_started',
                ],
                [
                    'innings_number' => 2,
                    'batting_team_id' => $innings1Bowling,
                    'bowling_team_id' => $innings1Batting,
                    'status' => 'not_started',
                ],
            ]);
        }
    }

    private function uniqueTeamCode(string $name): string
    {
        $base = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $name) ?? '');
        $base = substr($base !== '' ? $base : 'QM', 0, 4);

        do {
            $code = $base.strtoupper(Str::random(4));
        } while (Team::query()->where('code', $code)->exists());

        return $code;
    }
}
