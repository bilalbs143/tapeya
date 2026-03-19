<?php

namespace Database\Seeders;

use App\Enums\Common\StatusEnum;
use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\MatchTimingEnum;
use App\Enums\Tournament\TournamentTypeEnum;
use App\Enums\User\AppRoleEnum;
use App\Enums\User\RoleGuardEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Role;
use App\Models\Team;
use App\Models\Tournament;
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
 *   - 20 players (user + player role), password: password
 *   - 3 organizers, password: password
 *   - 3 sponsors, password: password
 *   - 4 tournaments (organizer_id from organizers)
 *   - 6 teams (owned by sponsors)
 *   - Attaches players to teams, teams to tournaments
 *
 * Log in as any organizer (e.g. organizer1_<base>@demo.local) to create matches.
 */
class ScoringDemoSeeder extends Seeder
{
    private const SCOPE_USERS = 'users';

    private const SCOPE_TEAMS = 'teams';

    private const SCOPE_ALL = 'all';

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
            $this->command->info('Done (teams). Tournaments: '.count($tournaments));

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
        $this->command->info('Done (all). Players: '.count($players).', Organizers: '.count($organizers).', Sponsors: '.count($sponsors).', Tournaments: '.count($tournaments));
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

            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => "Demo Player {$i}",
                    'nickname' => $nick,
                    'phone' => $phone,
                    'password' => Hash::make('password'),
                    'type' => UserTypeEnum::USER,
                    'status' => UserStatusEnum::ACTIVE,
                    'country' => 'Pakistan',
                    'city' => 'Karachi',
                ]
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

            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => "Organizer {$i}",
                    'nickname' => $nick,
                    'phone' => $phone,
                    'password' => Hash::make('password'),
                    'type' => UserTypeEnum::USER,
                    'status' => UserStatusEnum::ACTIVE,
                    'country' => 'Pakistan',
                    'city' => 'Lahore',
                ]
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

            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => "Sponsor {$i}",
                    'nickname' => $nick,
                    'phone' => $phone,
                    'password' => Hash::make('password'),
                    'type' => UserTypeEnum::USER,
                    'status' => UserStatusEnum::ACTIVE,
                    'country' => 'Pakistan',
                    'city' => 'Islamabad',
                ]
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
            $t = Tournament::create([
                'organizer_id' => $org->id,
                'tournament_name' => "Demo {$typeLabel} {$i}",
                'tournament_type' => $type->value,
                'cricket_format' => $format->value,
                'venue_name' => "Venue {$i}",
                'start_date' => $start,
                'end_date' => $end,
                'number_of_teams' => 4,
                'country' => 'Pakistan',
                'city' => ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'][$i - 1],
                'match_timings' => $timing->value,
                'status' => StatusEnum::ACTIVE->value,
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

        // Attach players to teams (each team gets 5–6 players; overlap allowed)
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
            }
        }

        // Attach teams to tournaments (each tournament gets 2–4 teams)
        foreach ($tournaments as $idx => $tournament) {
            $take = min(4, count($teams) - $idx);
            $tournamentTeams = array_slice($teams, $idx, $take);
            if (count($tournamentTeams) < 2) {
                $tournamentTeams = array_slice($teams, 0, 2);
            }
            foreach ($tournamentTeams as $team) {
                DB::table('tournament_team')->insertOrIgnore([
                    'tournament_id' => $tournament->id,
                    'team_id' => $team->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

    }
}
