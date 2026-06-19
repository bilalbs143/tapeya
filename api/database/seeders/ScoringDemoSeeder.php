<?php

namespace Database\Seeders;

use App\Enums\Common\StatusEnum;
use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Enums\Event\MatchTimingEnum;
use App\Enums\Tournament\TournamentTypeEnum;
use App\Enums\User\AppRoleEnum;
use App\Enums\User\BattingStyleEnum;
use App\Enums\User\BowlingStyleEnum;
use App\Enums\User\PlayingRoleEnum;
use App\Enums\User\RoleGuardEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Role;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Database\Seeder;
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
 *   - 36 players (6 per team, no cross-team overlap; real names; playing_role / batting_style / bowling_style), password: password
 *   - 3 organizers (real names; organizer role + cricket profile fields), password: password
 *   - 3 sponsors (real names; sponsor role + cricket profile fields), password: password
 *   - 4 tournaments (organizer_id; short_name e.g. KPL/LSC; number_of_groups / prize per schema; first three single-group, fourth two-group demo)
 *   - 6 teams (PSL-style names; 3-letter uppercase codes; owned by sponsors; optional logo left null)
 *   - Attaches players to teams (team_user), two icon players per team (team_icon_players)
 *   - Attaches teams to tournaments (tournament_team with group_index when number_of_groups > 1)
 *   - Demo fixtures (matches): single-table tournaments get 2–3 scheduled games; two-group tournament
 *     gets one fixture per group. Several matches use today’s date for the scorecard schedule tab.
 *     All matches remain SCHEDULED (no toss, innings, balls, or stats materialization).
 */
class ScoringDemoSeeder extends Seeder
{
    private const SCOPE_USERS = 'users';

    private const SCOPE_TEAMS = 'teams';

    private const SCOPE_ALL = 'all';

    /** Overs cap for scheduled demo fixtures (scorecard schedule tab). */
    private const DEMO_FIXTURE_OVERS = 5;

    private const DEMO_TEAM_COUNT = 6;

    private const DEMO_PLAYERS_PER_TEAM = 6;

    private const DEMO_PLAYER_COUNT = self::DEMO_TEAM_COUNT * self::DEMO_PLAYERS_PER_TEAM;

    /** @var list<string> Six players per team in order (Karachi → Quetta); each name used once. */
    private const DEMO_PLAYER_NAMES = [
        // Karachi Kings
        'Babar Azam',
        'Imad Wasim',
        'Mohammad Abbas',
        'Amir Yamin',
        'Sahibzada Farhan',
        'Usman Shan',
        // Lahore Qalandars
        'Shaheen Afridi',
        'Fakhar Zaman',
        'Haris Rauf',
        'Abdullah Shafique',
        'Salman Mirza',
        'Zaman Khan',
        // Islamabad United
        'Mohammad Rizwan',
        'Shadab Khan',
        'Naseem Shah',
        'Faheem Ashraf',
        'Azam Khan',
        'Haider Ali',
        // Peshawar Zalmi
        'Saim Ayub',
        'Usama Mir',
        'Abrar Ahmed',
        'Khushdil Shah',
        'Waqar Salam Bhatti',
        'Rumman Raees',
        // Multan Sultans
        'Mohammad Nawaz',
        'Iftikhar Ahmed',
        'Usman Qadir',
        'Mohammad Wasim',
        'Agha Salman',
        'Tayyab Tahir',
        // Quetta Gladiators
        'Sarfaraz Ahmed',
        'Hasan Ali',
        'Mohammad Amir',
        'Saud Shakeel',
        'Mohammad Hafeez',
        'Umar Akmal',
    ];

    /** @var list<string> */
    private const DEMO_ORGANIZER_NAMES = [
        'Ramiz Raja',
        'Wasim Akram',
        'Shoaib Malik',
    ];

    /** @var list<string> */
    private const DEMO_SPONSOR_NAMES = [
        'Imran Khan',
        'Inzamam-ul-Haq',
        'Younis Khan',
    ];

    /** @var list<array{name: string, code: string}> */
    private const DEMO_TEAMS = [
        ['name' => 'Karachi Kings', 'code' => 'KNG'],
        ['name' => 'Lahore Qalandars', 'code' => 'LQR'],
        ['name' => 'Islamabad United', 'code' => 'ISU'],
        ['name' => 'Peshawar Zalmi', 'code' => 'ZLM'],
        ['name' => 'Multan Sultans', 'code' => 'SLT'],
        ['name' => 'Quetta Gladiators', 'code' => 'GLD'],
    ];

    /** @var list<string> */
    private const DEMO_TOURNAMENT_NAMES = [
        'Karachi Premier League',
        'Lahore Summer Cup',
        'Islamabad T20 Challenge',
        'National Club Championship',
    ];

    /** @var list<string> */
    private const DEMO_TOURNAMENT_SHORT_NAMES = [
        'KPL',
        'LSC',
        'ITC',
        'NCC',
    ];

    /** @var list<string> */
    private const DEMO_VENUES = [
        'National Stadium Karachi',
        'Gaddafi Stadium Lahore',
        'Rawalpindi Cricket Stadium',
        'Multan Cricket Stadium',
    ];

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

    private function slugFromName(string $name): string
    {
        $slug = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '_', $name) ?? '', '_'));

        return $slug !== '' ? $slug : 'user';
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
        for ($i = 1; $i <= self::DEMO_PLAYER_COUNT; $i++) {
            $displayName = self::DEMO_PLAYER_NAMES[$i - 1];
            $slug = $this->slugFromName($displayName);
            $email = "{$slug}_{$base}@demo.local";
            $nick = "{$slug}_{$base}";
            $phone = '+92300'.str_pad((string) (abs($numBase) % 10000000 + $i), 7, '0', STR_PAD_LEFT);

            $user = User::updateOrCreate(
                ['email' => $email],
                array_merge([
                    'name' => $displayName,
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
        for ($i = 1; $i <= count(self::DEMO_ORGANIZER_NAMES); $i++) {
            $displayName = self::DEMO_ORGANIZER_NAMES[$i - 1];
            $slug = $this->slugFromName($displayName);
            $email = "{$slug}_{$base}@demo.local";
            $nick = "{$slug}_{$base}";
            $phone = '+92301'.str_pad((string) (abs($numBase) % 10000000 + $i), 7, '0', STR_PAD_LEFT);

            $user = User::updateOrCreate(
                ['email' => $email],
                array_merge([
                    'name' => $displayName,
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
        for ($i = 1; $i <= count(self::DEMO_SPONSOR_NAMES); $i++) {
            $displayName = self::DEMO_SPONSOR_NAMES[$i - 1];
            $slug = $this->slugFromName($displayName);
            $email = "{$slug}_{$base}@demo.local";
            $nick = "{$slug}_{$base}";
            $phone = '+92302'.str_pad((string) (abs($numBase) % 10000000 + $i), 7, '0', STR_PAD_LEFT);

            $user = User::updateOrCreate(
                ['email' => $email],
                array_merge([
                    'name' => $displayName,
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

            $numberOfGroups = $i === 4 ? 2 : 1;
            $t = Tournament::updateOrCreate(
                [
                    'tournament_name' => self::DEMO_TOURNAMENT_NAMES[$i - 1],
                    'organizer_id' => $org->id,
                ],
                [
                    'created_by' => $org->id,
                    'short_name' => self::DEMO_TOURNAMENT_SHORT_NAMES[$i - 1],
                    'tournament_type' => $type->value,
                    'cricket_format' => $format->value,
                    'venue_name' => self::DEMO_VENUES[$i - 1],
                    'start_date' => $start,
                    'end_date' => $end,
                    'number_of_teams' => 4,
                    'number_of_groups' => $numberOfGroups,
                    'country' => 'Pakistan',
                    'city' => ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'][$i - 1],
                    'match_timings' => $timing->value,
                    'status' => StatusEnum::ACTIVE->value,
                    'prize' => $i === 4 ? 'Championship trophy + prize pool' : 'Participation medals',
                ]
            );
            $tournaments[] = $t;
        }

        return $tournaments;
    }

    /** @param array<User> $sponsors */
    /** @param array<User> $players */
    /** @param array<Tournament> $tournaments */
    private function createTeamsAndAttach(array $sponsors, array $players, array $tournaments): void
    {
        $teams = [];

        for ($i = 0; $i < self::DEMO_TEAM_COUNT; $i++) {
            $sponsor = $sponsors[$i % count($sponsors)];
            $teamDef = self::DEMO_TEAMS[$i];
            $team = Team::create([
                'name' => $teamDef['name'],
                'code' => $teamDef['code'],
                'country' => 'Pakistan',
                'city' => 'Karachi',
                'user_id' => $sponsor->id,
                'created_by' => $sponsor->id,
            ]);
            $teams[] = $team;
        }

        // Attach players to teams — disjoint squads (each player belongs to one team only).
        if (count($players) < self::DEMO_PLAYER_COUNT) {
            throw new \RuntimeException(
                'Expected '.self::DEMO_PLAYER_COUNT.' demo players for '.self::DEMO_TEAM_COUNT.' teams; got '.count($players).'.'
            );
        }

        $playerOffset = 0;
        foreach ($teams as $team) {
            for ($j = 0; $j < self::DEMO_PLAYERS_PER_TEAM; $j++) {
                $player = $players[$playerOffset++];
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
            $venue = $tournament->venue_name ?: 'National Stadium Karachi';
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
}
