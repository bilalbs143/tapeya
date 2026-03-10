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
    public function run(): void
    {
        $this->command->info('Seeding scoring demo data…');

        $this->ensureRoles();

        $players = $this->createPlayers();
        $organizers = $this->createOrganizers();
        $sponsors = $this->createSponsors();
        $tournaments = $this->createTournaments($organizers);
        $this->createTeamsAndAttach($sponsors, $players, $tournaments);

        $this->command->info('Done. Players: ' . count($players) . ', Organizers: ' . count($organizers) . ', Sponsors: ' . count($sponsors) . ', Tournaments: ' . count($tournaments));
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

    private function createPlayers(): array
    {
        $playerRole = Role::where('slug', AppRoleEnum::PLAYER->value)->where('guard', RoleGuardEnum::APP->value)->first();
        if (! $playerRole) {
            throw new \RuntimeException('Player role not found. Run RoleSeeder first.');
        }

        $players = [];
        $numBase = time() % 1000000;
        $base = 'sd' . $numBase;
        for ($i = 1; $i <= 20; $i++) {
            $email = "player{$i}_{$base}@demo.local";
            $nick = "player{$i}_{$base}";
            $phone = '+92300' . str_pad((string) ($numBase * 10 + $i), 7, '0', STR_PAD_LEFT);

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

    private function createOrganizers(): array
    {
        $role = Role::where('slug', AppRoleEnum::ORGANIZER->value)->where('guard', RoleGuardEnum::APP->value)->first();
        if (! $role) {
            throw new \RuntimeException('Organizer role not found.');
        }

        $organizers = [];
        $numBase = time() % 1000000;
        $base = 'sd' . $numBase;
        for ($i = 1; $i <= 3; $i++) {
            $email = "organizer{$i}_{$base}@demo.local";
            $nick = "organizer{$i}_{$base}";
            $phone = '+92301' . str_pad((string) ($numBase * 10 + $i), 7, '0', STR_PAD_LEFT);

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

    private function createSponsors(): array
    {
        $role = Role::where('slug', AppRoleEnum::SPONSOR->value)->where('guard', RoleGuardEnum::APP->value)->first();
        if (! $role) {
            throw new \RuntimeException('Sponsor role not found.');
        }

        $sponsors = [];
        $numBase = time() % 1000000;
        $base = 'sd' . $numBase;
        for ($i = 1; $i <= 3; $i++) {
            $email = "sponsor{$i}_{$base}@demo.local";
            $nick = "sponsor{$i}_{$base}";
            $phone = '+92302' . str_pad((string) ($numBase * 10 + $i), 7, '0', STR_PAD_LEFT);

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
                'number_of_matches' => 6,
                'number_of_teams' => 4,
                'expected_players_count' => 44,
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
        $base = 'SC' . substr((string) time(), -4);
        $teamNames = ['Lions', 'Tigers', 'Eagles', 'Hawks', 'Falcons', 'Panthers'];
        $teams = [];

        for ($i = 0; $i < 6; $i++) {
            $sponsor = $sponsors[$i % count($sponsors)];
            $code = strtoupper(substr($teamNames[$i], 0, 3)) . $base . $i;
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
