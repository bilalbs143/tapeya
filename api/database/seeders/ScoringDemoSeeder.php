<?php

namespace Database\Seeders;

use App\Enums\Common\StatusEnum;
use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\DismissalTypeEnum;
use App\Enums\Event\InningsStatusEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Enums\Event\MatchTimingEnum;
use App\Enums\Tournament\TournamentTypeEnum;
use App\Enums\User\BattingStyleEnum;
use App\Enums\User\BowlingStyleEnum;
use App\Enums\User\PlayingRoleEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Jobs\RefreshMatchStatsJob;
use App\Models\Innings;
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
 *   - users  … only users (players + organizers + sponsors). No tournaments/teams.
 *   - teams  … only teams path: users (by SCORING_DEMO_BASE) + tournaments + teams + attach.
 *   - all    … default: all users + tournaments + teams + attach.
 *
 * For "teams" scope use the same base as a previous "users" run so existing users are reused:
 *   SEEDER_SCOPE=users SCORING_DEMO_BASE=sd123 php artisan db:seed --class=ScoringDemoSeeder
 *   SEEDER_SCOPE=teams SCORING_DEMO_BASE=sd123 php artisan db:seed --class=ScoringDemoSeeder
 *
 * Creates:
 *   - 66 players (11 per team, no cross-team overlap; real names; playing_role / batting_style / bowling_style), password: password
 *   - 3 organizers (real names; become tournament staff via organizer_id; cricket profile fields), password: password
 *   - 3 sponsors (real names; become team owners via teams.user_id; cricket profile fields), password: password
 *   - 6 tournaments (explicit type × format; Tapeya Open Championship 11-a-side; all four cricket formats)
 *   - 6 teams (PSL-style names; 3-letter uppercase codes; owned by sponsors; optional logo left null)
 *   - Attaches players to teams (team_user), two icon players per team (team_icon_players)
 *   - Attaches teams to tournaments (tournament_team): exactly number_of_teams per tournament;
 *     group_index assigned when number_of_groups > 1
 *   - Demo fixtures (matches): single-table tournaments get 2–3 scheduled games; two-group tournament
 *     gets one fixture per group. Several matches use today’s date for the scorecard schedule tab.
 *   - One completed match per tournament (first fixture) with innings, balls, and materialized career
 *     stats via RefreshMatchStatsJob. Covers all four cricket formats; two open_tournament + tape_ball
 *     events (LSC + PTO) so cross-tournament bucket aggregation can be tested.
 */
class ScoringDemoSeeder extends Seeder
{
    private const SCOPE_USERS = 'users';

    private const SCOPE_TEAMS = 'teams';

    private const SCOPE_ALL = 'all';

    /** Overs cap for scheduled demo fixtures (scorecard schedule tab). */
    private const DEMO_FIXTURE_OVERS = 5;

    /** Players selected per side when scoring the stats demo match. */
    private const DEMO_STATS_PLAYERS_PER_SIDE = 11;

    private const DEMO_TEAM_COUNT = 6;

    private const DEMO_PLAYERS_PER_TEAM = 11;

    private const DEMO_PLAYER_COUNT = self::DEMO_TEAM_COUNT * self::DEMO_PLAYERS_PER_TEAM;

    /** @var list<string> Eleven players per team in order (Karachi → Quetta); each name used once. */
    private const DEMO_PLAYER_NAMES = [
        // Karachi Kings
        'Babar Azam',
        'Imad Wasim',
        'Mohammad Abbas',
        'Amir Yamin',
        'Sahibzada Farhan',
        'Usman Shan',
        'Mir Hamza',
        'Ahmed Shehzad',
        'Shan Masood',
        'James Vince',
        'Tim David',
        // Lahore Qalandars
        'Shaheen Afridi',
        'Fakhar Zaman',
        'Haris Rauf',
        'Abdullah Shafique',
        'Salman Mirza',
        'Zaman Khan',
        'David Willey',
        'Ali Raza',
        'Jahangir Khan',
        'Dilbar Hussain',
        'Yasir Shah',
        // Islamabad United
        'Mohammad Rizwan',
        'Shadab Khan',
        'Naseem Shah',
        'Faheem Ashraf',
        'Azam Khan',
        'Haider Ali',
        'Colin Ingram',
        'Alex Hales',
        'Paul Stirling',
        'Luke Gauchi',
        'Ben Dwarshuis',
        // Peshawar Zalmi
        'Saim Ayub',
        'Usama Mir',
        'Abrar Ahmed',
        'Khushdil Shah',
        'Waqar Salam Bhatti',
        'Rumman Raees',
        'Wanindu Hasaranga',
        'James Neesham',
        'Luke Wood',
        'Tom Kohler-Cadmore',
        'Sajid Khan',
        // Multan Sultans
        'Mohammad Nawaz',
        'Iftikhar Ahmed',
        'Usman Qadir',
        'Mohammad Wasim',
        'Agha Salman',
        'Tayyab Tahir',
        'Ihsanullah',
        'Abbas Afridi',
        'Sameen Gul',
        'Muzzammil Mumtaz',
        'David Miller',
        // Quetta Gladiators
        'Sarfaraz Ahmed',
        'Hasan Ali',
        'Mohammad Amir',
        'Saud Shakeel',
        'Mohammad Hafeez',
        'Umar Akmal',
        'Jason Roy',
        'Umaid Asif',
        'Odean Smith',
        'Ahsan Ali',
        'Will Jacks',
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

    /**
     * Explicit type × format mapping — one row per cricket format plus a second open + tape_ball
     * tournament for cross-event career aggregation.
     *
     * @var list<array{name: string, short: string, type: string, format: string, teams: int, groups: int, city: string, venue: string}>
     */
    private const DEMO_TOURNAMENT_CONFIG = [
        [
            'name' => 'Tapeya Open Championship',
            'short' => 'TOC',
            'type' => TournamentTypeEnum::OPEN_TOURNAMENT->value,
            'format' => CricketFormatEnum::TAPE_BALL->value,
            'teams' => 2,
            'groups' => 1,
            'city' => 'Karachi',
            'venue' => 'National Stadium Karachi',
        ],
        [
            'name' => 'Karachi Premier League',
            'short' => 'KPL',
            'type' => TournamentTypeEnum::LEAGUE->value,
            'format' => CricketFormatEnum::HARD_BALL->value,
            'teams' => 4,
            'groups' => 1,
            'city' => 'Karachi',
            'venue' => 'National Stadium Karachi',
        ],
        [
            'name' => 'Lahore Summer Cup',
            'short' => 'LSC',
            'type' => TournamentTypeEnum::OPEN_TOURNAMENT->value,
            'format' => CricketFormatEnum::TAPE_BALL->value,
            'teams' => 4,
            'groups' => 1,
            'city' => 'Lahore',
            'venue' => 'Gaddafi Stadium Lahore',
        ],
        [
            'name' => 'Islamabad T20 Challenge',
            'short' => 'ITC',
            'type' => TournamentTypeEnum::EMERGING->value,
            'format' => CricketFormatEnum::TENNIS_BALL->value,
            'teams' => 4,
            'groups' => 1,
            'city' => 'Islamabad',
            'venue' => 'Rawalpindi Cricket Stadium',
        ],
        [
            'name' => 'National Club Championship',
            'short' => 'NCC',
            'type' => TournamentTypeEnum::OPEN_TOURNAMENT->value,
            'format' => CricketFormatEnum::HARD_TENNIS->value,
            'teams' => 4,
            'groups' => 2,
            'city' => 'Rawalpindi',
            'venue' => 'Multan Cricket Stadium',
        ],
        [
            'name' => 'Pindi Tape Ball Open',
            'short' => 'PTO',
            'type' => TournamentTypeEnum::OPEN_TOURNAMENT->value,
            'format' => CricketFormatEnum::TAPE_BALL->value,
            'teams' => 4,
            'groups' => 1,
            'city' => 'Rawalpindi',
            'venue' => 'Rawalpindi Cricket Stadium',
        ],
    ];

    /** Striker run totals for the first completed match in each tournament (index-aligned with config). */
    private const DEMO_STATS_STRIKER_RUNS = [58, 45, 72, 28, 55, 33];

    public function run(): void
    {
        $scope = $this->resolveScope();
        $this->command->info('Seeding scoring demo data (scope: '.$scope.')…');

        $base = $this->resolveBase($scope);

        if ($scope === self::SCOPE_TEAMS) {
            $players = $this->getOrCreatePlayers($base);
            $organizers = $this->getOrCreateOrganizers($base);
            $sponsors = $this->getOrCreateSponsors($base);
            $tournaments = $this->createTournaments($organizers);
            $this->createTeamsAndAttach($sponsors, $players, $tournaments);
            $matchCount = $this->createDemoMatches($tournaments);
            $scoredCount = $this->scoreDemoMatchesForStats($tournaments);
            $this->command->info('Done (teams). Tournaments: '.count($tournaments).', Matches: '.$matchCount.', Scored: '.$scoredCount);

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
        $scoredCount = $this->scoreDemoMatchesForStats($tournaments);
        $this->command->info('Done (all). Players: '.count($players).', Organizers: '.count($organizers).', Sponsors: '.count($sponsors).', Tournaments: '.count($tournaments).', Matches: '.$matchCount.', Scored: '.$scoredCount);
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
        $players = [];
        for ($i = 1; $i <= self::DEMO_PLAYER_COUNT; $i++) {
            $displayName = self::DEMO_PLAYER_NAMES[$i - 1];
            $slug = $this->slugFromName($displayName);
            $email = "{$slug}_{$base}@demo.local";
            $nick = "{$slug}_{$base}";
            $phone = '+92300'.str_pad((string) (abs(crc32($email)) % 10000000), 7, '0', STR_PAD_LEFT);

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
        $organizers = [];
        for ($i = 1; $i <= count(self::DEMO_ORGANIZER_NAMES); $i++) {
            $displayName = self::DEMO_ORGANIZER_NAMES[$i - 1];
            $slug = $this->slugFromName($displayName);
            $email = "{$slug}_{$base}@demo.local";
            $nick = "{$slug}_{$base}";
            $phone = '+92301'.str_pad((string) (abs(crc32($email)) % 10000000), 7, '0', STR_PAD_LEFT);

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
        $sponsors = [];
        for ($i = 1; $i <= count(self::DEMO_SPONSOR_NAMES); $i++) {
            $displayName = self::DEMO_SPONSOR_NAMES[$i - 1];
            $slug = $this->slugFromName($displayName);
            $email = "{$slug}_{$base}@demo.local";
            $nick = "{$slug}_{$base}";
            $phone = '+92302'.str_pad((string) (abs(crc32($email)) % 10000000), 7, '0', STR_PAD_LEFT);

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
        $timings = MatchTimingEnum::cases();

        foreach (self::DEMO_TOURNAMENT_CONFIG as $i => $config) {
            $org = $organizers[$i % count($organizers)];
            $timing = $timings[$i % count($timings)];
            $start = now()->addDays(7 + ($i + 1) * 3);
            $end = $start->copy()->addDays(7);

            $t = Tournament::updateOrCreate(
                [
                    'tournament_name' => $config['name'],
                    'organizer_id' => $org->id,
                ],
                [
                    'created_by' => $org->id,
                    'short_name' => $config['short'],
                    'tournament_type' => $config['type'],
                    'cricket_format' => $config['format'],
                    'venue_name' => $config['venue'],
                    'start_date' => $start,
                    'end_date' => $end,
                    'number_of_teams' => $config['teams'],
                    'number_of_groups' => $config['groups'],
                    'country' => 'Pakistan',
                    'city' => $config['city'],
                    'match_timings' => $timing->value,
                    'status' => StatusEnum::ACTIVE->value,
                    'prize' => $config['groups'] > 1 ? 'Championship trophy + prize pool' : 'Participation medals',
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
            $team = Team::updateOrCreate(
                ['code' => $teamDef['code']],
                [
                    'name' => $teamDef['name'],
                    'country' => 'Pakistan',
                    'city' => 'Karachi',
                    'user_id' => $sponsor->id,
                    'created_by' => $sponsor->id,
                ]
            );
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

        // Attach teams to tournaments — exactly number_of_teams per tournament (pivot group_index when grouped).
        foreach ($tournaments as $idx => $tournament) {
            $need = (int) $tournament->number_of_teams;
            if ($need > count($teams)) {
                throw new \RuntimeException(
                    "Tournament {$tournament->tournament_name} requires {$need} teams but only ".count($teams).' demo teams exist.'
                );
            }
            $tournamentTeams = $this->selectTeamsForTournament($teams, $need, $idx);
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
     * Pick exactly $count teams from the demo pool (rotates start index per tournament).
     *
     * @param  array<Team>  $teams
     * @return array<Team>
     */
    private function selectTeamsForTournament(array $teams, int $count, int $tournamentIndex): array
    {
        $total = count($teams);
        if ($count >= $total) {
            return $teams;
        }

        $start = $tournamentIndex % $total;
        $selected = [];
        for ($i = 0; $i < $count; $i++) {
            $selected[] = $teams[($start + $i) % $total];
        }

        return $selected;
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
                        'players_per_side' => self::DEMO_PLAYERS_PER_TEAM,
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
                    'players_per_side' => self::DEMO_PLAYERS_PER_TEAM,
                    'overs' => self::DEMO_FIXTURE_OVERS,
                    'status' => MatchStatusEnum::SCHEDULED,
                ]);
                $created++;
            }
        }

        return $created;
    }

    /**
     * Score the first fixture in each tournament and refresh materialized career stats.
     *
     * @param  array<Tournament>  $tournaments
     */
    private function scoreDemoMatchesForStats(array $tournaments): int
    {
        $scored = 0;

        foreach ($tournaments as $index => $tournament) {
            $match = $this->findStatsMatchForTournament($tournament);

            if (! $match) {
                continue;
            }

            $strikerRuns = self::DEMO_STATS_STRIKER_RUNS[$index]
                ?? self::DEMO_STATS_STRIKER_RUNS[0];

            $this->scoreMatchWithStats($match, $strikerRuns);
            RefreshMatchStatsJob::dispatchSync($match->id);
            $scored++;
        }

        return $scored;
    }

    private function findStatsMatchForTournament(Tournament $tournament): ?TournamentMatch
    {
        $karachiId = Team::query()->where('code', 'KNG')->value('id');
        if ($karachiId) {
            $withKarachi = TournamentMatch::query()
                ->where('tournament_id', $tournament->id)
                ->where(function ($query) use ($karachiId) {
                    $query->where('home_team_id', $karachiId)
                        ->orWhere('away_team_id', $karachiId);
                })
                ->orderBy('id')
                ->first();
            if ($withKarachi) {
                return $withKarachi;
            }
        }

        return TournamentMatch::query()
            ->where('tournament_id', $tournament->id)
            ->orderBy('id')
            ->first();
    }

    private function scoreMatchWithStats(TournamentMatch $match, int $strikerRuns): void
    {
        $karachiId = Team::query()->where('code', 'KNG')->value('id');
        $battingTeamId = (int) $match->home_team_id;
        $bowlingTeamId = (int) $match->away_team_id;

        if ($karachiId && in_array($karachiId, [$match->home_team_id, $match->away_team_id], true)) {
            $battingTeamId = (int) $karachiId;
            $bowlingTeamId = (int) ($match->home_team_id === $karachiId
                ? $match->away_team_id
                : $match->home_team_id);
        }

        $battingPlayers = $this->playersForTeam($battingTeamId);
        $bowlingPlayers = $this->playersForTeam($bowlingTeamId);

        if (count($battingPlayers) < 2 || count($bowlingPlayers) < 2) {
            return;
        }

        $match->update([
            'players_per_side' => self::DEMO_STATS_PLAYERS_PER_SIDE,
            'status' => MatchStatusEnum::IN_PROGRESS,
            'toss_winner_team_id' => $battingTeamId,
            'chose_to_bat_or_bowl' => 'bat',
        ]);

        $innings1 = Innings::create([
            'match_id' => $match->id,
            'innings_number' => 1,
            'batting_team_id' => $battingTeamId,
            'bowling_team_id' => $bowlingTeamId,
            'status' => InningsStatusEnum::IN_PROGRESS->value,
        ]);

        $innings2 = Innings::create([
            'match_id' => $match->id,
            'innings_number' => 2,
            'batting_team_id' => $bowlingTeamId,
            'bowling_team_id' => $battingTeamId,
            'status' => InningsStatusEnum::NOT_STARTED->value,
        ]);

        $this->seedMatchSquads($match, $battingPlayers, $bowlingPlayers, $battingTeamId, $bowlingTeamId);

        $strikerId = $battingPlayers[0];
        $nonStrikerId = $battingPlayers[1];
        $bowlerId = $bowlingPlayers[0];
        $fielderId = $bowlingPlayers[1];
        $nextBatterId = $battingPlayers[2] ?? $battingPlayers[0];

        $innings1->balls()->create([
            'over' => 0,
            'ball_in_over' => 1,
            'striker_id' => $strikerId,
            'non_striker_id' => $nonStrikerId,
            'bowler_id' => $bowlerId,
            'runs' => 4,
            'runs_off_bat' => 4,
        ]);

        $innings1->balls()->create([
            'over' => 0,
            'ball_in_over' => 2,
            'striker_id' => $strikerId,
            'non_striker_id' => $nonStrikerId,
            'bowler_id' => $bowlerId,
            'runs' => 6,
            'runs_off_bat' => 6,
        ]);

        $innings1->balls()->create([
            'over' => 0,
            'ball_in_over' => 3,
            'striker_id' => $strikerId,
            'non_striker_id' => $nonStrikerId,
            'bowler_id' => $bowlerId,
            'runs' => max(0, $strikerRuns - 10),
            'runs_off_bat' => max(0, $strikerRuns - 10),
        ]);

        $innings1->balls()->create([
            'over' => 0,
            'ball_in_over' => 4,
            'striker_id' => $strikerId,
            'non_striker_id' => $nonStrikerId,
            'bowler_id' => $bowlerId,
            'runs' => 1,
            'runs_off_bat' => 0,
            'is_wide' => true,
        ]);

        $innings1->balls()->create([
            'over' => 0,
            'ball_in_over' => 5,
            'striker_id' => $nonStrikerId,
            'non_striker_id' => $strikerId,
            'bowler_id' => $bowlerId,
            'runs' => 0,
            'runs_off_bat' => 0,
            'is_wicket' => true,
            'dismissal_type' => DismissalTypeEnum::CAUGHT->value,
            'out_player_id' => $nonStrikerId,
            'fielder_id' => $fielderId,
        ]);

        $innings1->balls()->create([
            'over' => 0,
            'ball_in_over' => 6,
            'striker_id' => $nextBatterId,
            'non_striker_id' => $strikerId,
            'bowler_id' => $bowlerId,
            'runs' => 0,
            'runs_off_bat' => 0,
        ]);

        $innings1->update(['status' => InningsStatusEnum::COMPLETED->value]);

        $innings2->update(['status' => InningsStatusEnum::IN_PROGRESS->value]);
        $innings2->balls()->create([
            'over' => 0,
            'ball_in_over' => 1,
            'striker_id' => $bowlingPlayers[0],
            'non_striker_id' => $bowlingPlayers[1],
            'bowler_id' => $battingPlayers[0],
            'runs' => 12,
            'runs_off_bat' => 12,
        ]);
        $innings2->update(['status' => InningsStatusEnum::COMPLETED->value]);

        $match->update(['status' => MatchStatusEnum::COMPLETED]);
    }

    /** @return list<int> */
    private function playersForTeam(int $teamId): array
    {
        return DB::table('team_user')
            ->where('team_id', $teamId)
            ->orderBy('user_id')
            ->pluck('user_id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();
    }

    /**
     * @param  list<int>  $battingPlayers
     * @param  list<int>  $bowlingPlayers
     */
    private function seedMatchSquads(
        TournamentMatch $match,
        array $battingPlayers,
        array $bowlingPlayers,
        int $battingTeamId,
        int $bowlingTeamId
    ): void {
        $now = now();
        $rows = [];

        foreach ($battingPlayers as $playerId) {
            $rows[] = [
                'match_id' => $match->id,
                'team_id' => $battingTeamId,
                'user_id' => $playerId,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        foreach ($bowlingPlayers as $playerId) {
            $rows[] = [
                'match_id' => $match->id,
                'team_id' => $bowlingTeamId,
                'user_id' => $playerId,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        DB::table('match_squads')->insert($rows);
    }
}
