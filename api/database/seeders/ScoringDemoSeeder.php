<?php

namespace Database\Seeders;

use App\Enums\Common\StatusEnum;
use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Enums\Event\MatchTimingEnum;
use App\Enums\Event\TossChoiceEnum;
use App\Enums\Tournament\TournamentTypeEnum;
use App\Enums\User\AppRoleEnum;
use App\Enums\User\BattingStyleEnum;
use App\Enums\User\BowlingStyleEnum;
use App\Enums\User\PlayingRoleEnum;
use App\Enums\User\RoleGuardEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Jobs\RefreshMatchStatsJob;
use App\Models\Ball;
use App\Models\Innings;
use App\Models\Role;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use App\Services\MatchCompletionService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Demo seeder for scoring flow: players, organizers, sponsors, tournaments.
 *
 * Run manually after migrations:
 *   php artisan db:seed --class=ScoringDemoSeeder
 *
 * Scope (via SEEDER_SCOPE env):
 *   - users  … only users (roles + players + organizers + sponsors). No tournaments/teams.
 *   - teams  … only teams path: users (by SCORING_DEMO_BASE) + tournaments + teams + attach.
 *   - all    … default: roles + all users + tournaments + teams + attach.
 *
 * For "teams" scope use the same base as a previous "users" run so existing users are reused:
 *   SEEDER_SCOPE=users SCORING_DEMO_BASE=sd123 php artisan db:seed --class=ScoringDemoSeeder
 *   SEEDER_SCOPE=teams SCORING_DEMO_BASE=sd123 php artisan db:seed --class=ScoringDemoSeeder
 *
 * Prerequisites: RoleSeeder must have been run (Roles exist).
 *
 * Creates:
 *   - 20 players (user + player role; playing_role / batting_style / bowling_style), password: password
 *   - 3 organizers (organizer role + cricket profile fields), password: password
 *   - 3 sponsors (sponsor role + cricket profile fields), password: password
 *   - 4 tournaments (organizer_id; number_of_groups / prize per schema; first three single-group, fourth two-group demo)
 *   - 6 teams (owned by sponsors; optional logo left null)
 *   - Attaches players to teams (team_user), two icon players per team (team_icon_players)
 *   - Attaches teams to tournaments (tournament_team with group_index when number_of_groups > 1)
 *   - Demo fixtures (matches): single-table tournaments get 2–3 scheduled games; two-group tournament
 *     gets one fixture per group. Several matches use today’s date for the scorecard schedule tab.
 *     Scheduled fixtures use a short format (5 overs per side).
 *   - Two fully completed demo matches (first fixture in tournament 1 & 2): toss, 1st & 2nd innings,
 *     legal balls, completed result, match squads + playing elevens, then RefreshMatchStatsJob (sync)
 *     so scorecard + /rankings?tournament_type=… stay consistent with ball data.
 */
class ScoringDemoSeeder extends Seeder
{
    private const SCOPE_USERS = 'users';

    private const SCOPE_TEAMS = 'teams';

    private const SCOPE_ALL = 'all';

    /** Overs cap for scheduled demo fixtures (scorecard schedule tab). */
    private const DEMO_FIXTURE_OVERS = 5;

    public function run(): void
    {
        $scope = $this->resolveScope();
        $this->command->info('Seeding scoring demo data (scope: '.$scope.')…');

        $this->ensureRoles();

        $base = $this->resolveBase($scope);

        if ($scope === self::SCOPE_TEAMS) {
            $players = $this->getOrCreatePlayers($base);
            $organizers = $this->getOrCreateOrganizers($base);
            $sponsors = $this->getOrCreateSponsors($base);
            $tournaments = $this->createTournaments($organizers);
            $this->createTeamsAndAttach($sponsors, $players, $tournaments);
            $matchCount = $this->createDemoMatches($tournaments);
            $this->seedDemoCompletedScorecards($tournaments);
            $this->command->info('Done (teams). Tournaments: '.count($tournaments).', Matches: '.$matchCount);

            return;
        }

        $players = $this->createPlayers($base);
        $organizers = $this->createOrganizers($base);
        $sponsors = $this->createSponsors($base);

        if ($scope === self::SCOPE_USERS) {
            $this->command->info('Done (users only). Players: '.count($players).', Organizers: '.count($organizers).', Sponsors: '.count($sponsors));

            return;
        }

        $tournaments = $this->createTournaments($organizers);
        $this->createTeamsAndAttach($sponsors, $players, $tournaments);
        $matchCount = $this->createDemoMatches($tournaments);
        $this->seedDemoCompletedScorecards($tournaments);
        $this->command->info('Done (all). Players: '.count($players).', Organizers: '.count($organizers).', Sponsors: '.count($sponsors).', Tournaments: '.count($tournaments).', Matches: '.$matchCount);
    }

    private function resolveScope(): string
    {
        $scope = strtolower(trim((string) (env('SEEDER_SCOPE') ?? getenv('SEEDER_SCOPE') ?: 'all')));
        if (! in_array($scope, [self::SCOPE_USERS, self::SCOPE_TEAMS, self::SCOPE_ALL], true)) {
            $scope = self::SCOPE_ALL;
        }

        return $scope;
    }

    private function resolveBase(string $scope): string
    {
        $envBase = env('SCORING_DEMO_BASE') ?? getenv('SCORING_DEMO_BASE');
        if ($scope === self::SCOPE_TEAMS) {
            return $envBase !== null && $envBase !== '' ? (string) $envBase : 'default';
        }

        return $envBase !== null && $envBase !== '' ? (string) $envBase : 'sd'.(time() % 1000000);
    }

    private function ensureRoles(): void
    {
        $appRoles = [
            ['name' => 'Player', 'slug' => AppRoleEnum::PLAYER->value, 'guard' => RoleGuardEnum::APP->value],
            ['name' => 'Organizer', 'slug' => AppRoleEnum::ORGANIZER->value, 'guard' => RoleGuardEnum::APP->value],
            ['name' => 'Sponsor', 'slug' => AppRoleEnum::SPONSOR->value, 'guard' => RoleGuardEnum::APP->value],
        ];
        foreach ($appRoles as $r) {
            Role::firstOrCreate(
                ['slug' => $r['slug'], 'guard' => $r['guard']],
                ['name' => $r['name']]
            );
        }
    }

    /**
     * @return array{playing_role: PlayingRoleEnum, batting_style: BattingStyleEnum, bowling_style: ?BowlingStyleEnum}
     */
    private function demoCricketProfile(int $index): array
    {
        $playingRoles = PlayingRoleEnum::cases();
        $playing = $playingRoles[($index - 1) % count($playingRoles)];

        $battingStyles = BattingStyleEnum::cases();
        $batting = $battingStyles[($index - 1) % count($battingStyles)];

        $bowlingStyles = BowlingStyleEnum::cases();
        $bowling = $bowlingStyles[($index - 1) % count($bowlingStyles)];

        $bowlingStyle = match ($playing) {
            PlayingRoleEnum::BATSMAN => null,
            PlayingRoleEnum::BOWLER, PlayingRoleEnum::ALL_ROUNDER => $bowling,
        };

        return [
            'playing_role' => $playing,
            'batting_style' => $batting,
            'bowling_style' => $bowlingStyle,
        ];
    }

    private function createPlayers(string $base): array
    {
        $playerRole = Role::where('slug', AppRoleEnum::PLAYER->value)->where('guard', RoleGuardEnum::APP->value)->first();
        if (! $playerRole) {
            throw new \RuntimeException('Player role not found. Run RoleSeeder first.');
        }

        $players = [];
        $numBase = is_numeric($base) ? (int) $base : crc32($base);
        for ($i = 1; $i <= 20; $i++) {
            $email = "player{$i}_{$base}@demo.local";
            $nick = "player{$i}_{$base}";
            $phone = '+92300'.str_pad((string) (abs($numBase) % 10000000 + $i), 7, '0', STR_PAD_LEFT);

            $user = User::updateOrCreate(
                ['email' => $email],
                array_merge([
                    'name' => "Demo Player {$i}",
                    'nickname' => $nick,
                    'phone' => $phone,
                    'password' => Hash::make('password'),
                    'type' => UserTypeEnum::USER,
                    'status' => UserStatusEnum::ACTIVE,
                    'country' => 'Pakistan',
                    'city' => 'Karachi',
                ], $this->demoCricketProfile($i))
            );
            $user->roles()->syncWithoutDetaching([$playerRole->id]);
            $players[] = $user;
        }

        return $players;
    }

    /** @return array<User> */
    private function getOrCreatePlayers(string $base): array
    {
        return $this->createPlayers($base);
    }

    private function createOrganizers(string $base): array
    {
        $role = Role::where('slug', AppRoleEnum::ORGANIZER->value)->where('guard', RoleGuardEnum::APP->value)->first();
        if (! $role) {
            throw new \RuntimeException('Organizer role not found.');
        }

        $organizers = [];
        $numBase = is_numeric($base) ? (int) $base : crc32($base);
        for ($i = 1; $i <= 3; $i++) {
            $email = "organizer{$i}_{$base}@demo.local";
            $nick = "organizer{$i}_{$base}";
            $phone = '+92301'.str_pad((string) (abs($numBase) % 10000000 + $i), 7, '0', STR_PAD_LEFT);

            $user = User::updateOrCreate(
                ['email' => $email],
                array_merge([
                    'name' => "Organizer {$i}",
                    'nickname' => $nick,
                    'phone' => $phone,
                    'password' => Hash::make('password'),
                    'type' => UserTypeEnum::USER,
                    'status' => UserStatusEnum::ACTIVE,
                    'country' => 'Pakistan',
                    'city' => 'Lahore',
                ], $this->demoCricketProfile($i + 5))
            );
            $user->roles()->syncWithoutDetaching([$role->id]);
            $organizers[] = $user;
        }

        return $organizers;
    }

    /** @return array<User> */
    private function getOrCreateOrganizers(string $base): array
    {
        return $this->createOrganizers($base);
    }

    private function createSponsors(string $base): array
    {
        $role = Role::where('slug', AppRoleEnum::SPONSOR->value)->where('guard', RoleGuardEnum::APP->value)->first();
        if (! $role) {
            throw new \RuntimeException('Sponsor role not found.');
        }

        $sponsors = [];
        $numBase = is_numeric($base) ? (int) $base : crc32($base);
        for ($i = 1; $i <= 3; $i++) {
            $email = "sponsor{$i}_{$base}@demo.local";
            $nick = "sponsor{$i}_{$base}";
            $phone = '+92302'.str_pad((string) (abs($numBase) % 10000000 + $i), 7, '0', STR_PAD_LEFT);

            $user = User::updateOrCreate(
                ['email' => $email],
                array_merge([
                    'name' => "Sponsor {$i}",
                    'nickname' => $nick,
                    'phone' => $phone,
                    'password' => Hash::make('password'),
                    'type' => UserTypeEnum::USER,
                    'status' => UserStatusEnum::ACTIVE,
                    'country' => 'Pakistan',
                    'city' => 'Islamabad',
                ], $this->demoCricketProfile($i + 11))
            );
            $user->roles()->syncWithoutDetaching([$role->id]);
            $sponsors[] = $user;
        }

        return $sponsors;
    }

    /** @return array<User> */
    private function getOrCreateSponsors(string $base): array
    {
        return $this->createSponsors($base);
    }

    /** @param array<User> $organizers */
    private function createTournaments(array $organizers): array
    {
        $tournaments = [];
        $types = TournamentTypeEnum::cases();
        $formats = CricketFormatEnum::cases();
        $timings = MatchTimingEnum::cases();

        for ($i = 1; $i <= 4; $i++) {
            $org = $organizers[($i - 1) % count($organizers)];
            $type = $types[($i - 1) % count($types)];
            $format = $formats[($i - 1) % count($formats)];
            $timing = $timings[($i - 1) % count($timings)];
            $start = now()->addDays(7 + $i * 3);
            $end = $start->copy()->addDays(7);

            $typeLabel = $type->label();
            $numberOfGroups = $i === 4 ? 2 : 1;
            $t = Tournament::create([
                'organizer_id' => $org->id,
                'created_by' => $org->id,
                'tournament_name' => "Demo {$typeLabel} {$i}",
                'tournament_type' => $type->value,
                'cricket_format' => $format->value,
                'venue_name' => "Venue {$i}",
                'start_date' => $start,
                'end_date' => $end,
                'number_of_teams' => 4,
                'number_of_groups' => $numberOfGroups,
                'country' => 'Pakistan',
                'city' => ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'][$i - 1],
                'match_timings' => $timing->value,
                'status' => StatusEnum::ACTIVE->value,
                'prize' => $i === 4 ? 'Demo trophy + prize pool' : 'Participation medals (demo)',
            ]);
            $tournaments[] = $t;
        }

        return $tournaments;
    }

    /** @param array<User> $sponsors */
    /** @param array<User> $players */
    /** @param array<Tournament> $tournaments */
    private function createTeamsAndAttach(array $sponsors, array $players, array $tournaments): void
    {
        $base = 'SC'.substr((string) time(), -4);
        $teamNames = ['Lions', 'Tigers', 'Eagles', 'Hawks', 'Falcons', 'Panthers'];
        $teams = [];

        for ($i = 0; $i < 6; $i++) {
            $sponsor = $sponsors[$i % count($sponsors)];
            $code = strtoupper(substr($teamNames[$i], 0, 3)).$base.$i;
            $team = Team::create([
                'name' => "Demo {$teamNames[$i]}",
                'code' => $code,
                'country' => 'Pakistan',
                'city' => 'Karachi',
                'user_id' => $sponsor->id,
                'created_by' => $sponsor->id,
            ]);
            $teams[] = $team;
        }

        // Attach players to teams (each team gets 6 players; overlap allowed)
        foreach ($teams as $idx => $team) {
            $perTeam = 6;
            for ($j = 0; $j < $perTeam; $j++) {
                $player = $players[($idx * 3 + $j) % count($players)];
                DB::table('team_user')->insertOrIgnore([
                    'team_id' => $team->id,
                    'user_id' => $player->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                if ($j < 2) {
                    DB::table('team_icon_players')->insertOrIgnore([
                        'team_id' => $team->id,
                        'user_id' => $player->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // Attach teams to tournaments (each tournament gets 2–4 teams; pivot group_index when grouped)
        foreach ($tournaments as $idx => $tournament) {
            $take = min(4, count($teams) - $idx);
            $tournamentTeams = array_slice($teams, $idx, $take);
            if (count($tournamentTeams) < 2) {
                $tournamentTeams = array_slice($teams, 0, 2);
            }
            $numberOfGroups = max(1, (int) ($tournament->number_of_groups ?? 1));
            $nTeams = count($tournamentTeams);
            foreach ($tournamentTeams as $teamOrder => $team) {
                $groupIndex = null;
                if ($numberOfGroups > 1 && $nTeams > 0) {
                    $chunk = (int) ceil($nTeams / $numberOfGroups);
                    $groupIndex = (int) min($numberOfGroups, (int) floor($teamOrder / $chunk) + 1);
                }
                DB::table('tournament_team')->insertOrIgnore([
                    'tournament_id' => $tournament->id,
                    'team_id' => $team->id,
                    'group_index' => $groupIndex,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

    }

    /**
     * Seed scheduled matches so GET /tournaments/{id}/matches (scorecard schedule tab) has data.
     *
     * @param  array<Tournament>  $tournaments
     */
    private function createDemoMatches(array $tournaments): int
    {
        $today = now()->startOfDay();
        $created = 0;

        foreach ($tournaments as $tournament) {
            $tournament->refresh();
            $venue = $tournament->venue_name ?: 'Demo ground';
            $numberOfGroups = max(1, (int) ($tournament->number_of_groups ?? 1));

            if ($numberOfGroups <= 1) {
                $teams = $tournament->teams()->orderBy('teams.id')->get();
                if ($teams->count() < 2) {
                    continue;
                }
                /** @var list<int> $ids */
                $ids = $teams->pluck('id')->map(fn ($id) => (int) $id)->values()->all();
                $n = count($ids);

                $fixtures = [
                    [$ids[0], $ids[1], null, $today->copy(), '10:00'],
                    [$ids[1], $ids[0], null, $today->copy(), '15:30'],
                ];
                if ($n >= 4) {
                    $fixtures[] = [$ids[2], $ids[3], null, $today->copy()->addDay(), '14:00'];
                } elseif ($n >= 3) {
                    $fixtures[] = [$ids[0], $ids[2], null, $today->copy()->addDay(), '11:00'];
                }

                foreach ($fixtures as $row) {
                    [$homeId, $awayId, $groupIndex, $date, $time] = $row;
                    if ($homeId === $awayId) {
                        continue;
                    }
                    TournamentMatch::create([
                        'tournament_id' => $tournament->id,
                        'group_index' => $groupIndex,
                        'home_team_id' => $homeId,
                        'away_team_id' => $awayId,
                        'match_date' => $date,
                        'match_time' => $time,
                        'venue_name' => $venue,
                        'players_per_side' => 11,
                        'overs' => self::DEMO_FIXTURE_OVERS,
                        'status' => MatchStatusEnum::SCHEDULED,
                    ]);
                    $created++;
                }

                continue;
            }

            for ($g = 1; $g <= $numberOfGroups; $g++) {
                $gTeams = $tournament->teams()->wherePivot('group_index', $g)->orderBy('teams.id')->get();
                if ($gTeams->count() < 2) {
                    continue;
                }
                $homeId = (int) $gTeams[0]->id;
                $awayId = (int) $gTeams[1]->id;
                $time = $g === 1 ? '10:00' : '18:00';
                TournamentMatch::create([
                    'tournament_id' => $tournament->id,
                    'group_index' => $g,
                    'home_team_id' => $homeId,
                    'away_team_id' => $awayId,
                    'match_date' => $today->copy(),
                    'match_time' => $time,
                    'venue_name' => $venue,
                    'players_per_side' => 11,
                    'overs' => self::DEMO_FIXTURE_OVERS,
                    'status' => MatchStatusEnum::SCHEDULED,
                ]);
                $created++;
            }
        }

        return $created;
    }

    /**
     * Full score path for two sample matches (league + open_tournament types) so UI scorecard,
     * player-stats, and rankings have materialized stats rows aligned with balls.
     *
     * @param  array<Tournament>  $tournaments
     */
    private function seedDemoCompletedScorecards(array $tournaments): void
    {
        if (count($tournaments) < 2) {
            return;
        }

        $first = $this->firstScheduledMatchForTournament($tournaments[0]->id);
        $second = $this->firstScheduledMatchForTournament($tournaments[1]->id);

        if ($first) {
            $this->seedCompletedDemoMatch($first);
        }
        if ($second) {
            $this->seedCompletedDemoMatch($second);
        }
    }

    private function firstScheduledMatchForTournament(int $tournamentId): ?TournamentMatch
    {
        return TournamentMatch::query()
            ->where('tournament_id', $tournamentId)
            ->orderBy('match_date')
            ->orderBy('match_time')
            ->orderBy('id')
            ->first();
    }

    /**
     * Toss → two innings → short ball-by-ball (1 over cap) chase so MatchCompletionService marks COMPLETED.
     * Mirrors MatchTossController + organizer scoring rules (legal ball = not wide / not no-ball).
     */
    private function seedCompletedDemoMatch(TournamentMatch $match): void
    {
        $match->loadMissing(['tournament']);
        $homeId = (int) $match->home_team_id;
        $awayId = (int) $match->away_team_id;

        $homeSquad = $this->squadUserIdsForTeam($homeId);
        $awaySquad = $this->squadUserIdsForTeam($awayId);
        if (count($homeSquad) < 2 || count($awaySquad) < 2) {
            return;
        }

        DB::transaction(function () use ($match, $homeId, $awayId, $homeSquad, $awaySquad) {
            Innings::query()->where('match_id', $match->id)->delete();
            DB::table('match_squads')->where('match_id', $match->id)->delete();
            DB::table('match_players')->where('match_id', $match->id)->delete();

            $strikerHome = $homeSquad[0];
            $nonHome = $homeSquad[1];
            $bowlerAway = $awaySquad[0];
            $strikerAway = $awaySquad[0];
            $nonAway = $awaySquad[1];
            $bowlerHome = $homeSquad[1] ?? $homeSquad[0];

            $match->update([
                'overs' => 1,
                'players_per_side' => 11,
                'match_date' => now()->startOfDay(),
                'match_time' => '10:00',
                'toss_winner_team_id' => $homeId,
                'winning_team_id' => $homeId,
                'chose_to_bat_or_bowl' => TossChoiceEnum::BAT->value,
                'status' => MatchStatusEnum::TOSS_DONE,
                'is_no_result' => false,
                'win_by_runs' => null,
                'win_by_wickets' => null,
            ]);

            $match->innings()->createMany([
                [
                    'innings_number' => 1,
                    'batting_team_id' => $homeId,
                    'bowling_team_id' => $awayId,
                    'status' => 'not_started',
                ],
                [
                    'innings_number' => 2,
                    'batting_team_id' => $awayId,
                    'bowling_team_id' => $homeId,
                    'status' => 'not_started',
                ],
            ]);

            $now = now();
            foreach ($homeSquad as $uid) {
                DB::table('match_squads')->insert([
                    'match_id' => $match->id,
                    'team_id' => $homeId,
                    'user_id' => $uid,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
            foreach ($awaySquad as $uid) {
                DB::table('match_squads')->insert([
                    'match_id' => $match->id,
                    'team_id' => $awayId,
                    'user_id' => $uid,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            foreach ($homeSquad as $uid) {
                DB::table('match_players')->insert([
                    'match_id' => $match->id,
                    'team_id' => $homeId,
                    'user_id' => $uid,
                    'playing_role' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
            foreach ($awaySquad as $uid) {
                DB::table('match_players')->insert([
                    'match_id' => $match->id,
                    'team_id' => $awayId,
                    'user_id' => $uid,
                    'playing_role' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            $match->refresh();
            $inn1 = $match->innings()->where('innings_number', 1)->firstOrFail();
            $inn2 = $match->innings()->where('innings_number', 2)->firstOrFail();

            // Innings 1: 6 legal balls, 1 run total (last ball scores 1) — completes when overs (1) filled.
            for ($b = 1; $b <= 5; $b++) {
                $this->createDemoBall($inn1->id, 0, $b, $strikerHome, $nonHome, $bowlerAway, 0);
            }
            $this->createDemoBall($inn1->id, 0, 6, $strikerHome, $nonHome, $bowlerAway, 1);

            // Innings 2: chase — 2 runs off first ball beats target (1); innings completes on runs > target.
            $this->createDemoBall($inn2->id, 0, 1, $strikerAway, $nonAway, $bowlerHome, 2);
        });

        $match->refresh();
        app(MatchCompletionService::class)->evaluate($match->fresh(['innings.balls']));

        Bus::dispatchSync(new RefreshMatchStatsJob($match->id));
    }

    /** @return list<int> */
    private function squadUserIdsForTeam(int $teamId): array
    {
        return Team::query()
            ->findOrFail($teamId)
            ->players()
            ->orderBy('users.id')
            ->limit(11)
            ->pluck('users.id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();
    }

    private function createDemoBall(
        int $inningsId,
        int $over,
        int $ballInOver,
        int $strikerId,
        int $nonStrikerId,
        int $bowlerId,
        int $runsOffBat,
    ): void {
        Ball::create([
            'innings_id' => $inningsId,
            'over' => $over,
            'ball_in_over' => $ballInOver,
            'striker_id' => $strikerId,
            'non_striker_id' => $nonStrikerId,
            'bowler_id' => $bowlerId,
            'runs' => $runsOffBat,
            'runs_off_bat' => $runsOffBat,
            'is_no_ball' => false,
            'is_wide' => false,
            'is_leg_bye' => false,
            'is_bye' => false,
            'is_free_hit' => false,
            'penalty_runs' => 0,
            'is_wicket' => false,
        ]);
    }
}
