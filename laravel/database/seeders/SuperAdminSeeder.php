<?php

namespace Database\Seeders;

use App\Enums\Role\RolesEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\User;
use App\Utils\Services\RolesService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $system = User::updateOrCreate([
            'username' => 'system',
        ], [
            'name' => 'System',
            'type' => UserTypeEnum::SYSTEM,
            'password' => Str::password(50),
        ]);

        auth()->loginUsingId($system->id);

        if (User::where('username', 'admin')->exists()) {
            $this->command->warn('Super Admin already exists');
        } else {
            // $password = Str::password(20);
            $password = '123456@Qq';
            $user = User::updateOrCreate([
                'username' => 'admin',
            ], [
                'name' => 'Super Admin',
                'type' => UserTypeEnum::ADMINISTRATOR,
                'password' => $password,
                'status' => UserStatusEnum::ACTIVE,
            ]);

            RolesService::assignRole($user, RolesEnum::SUPER_ADMIN);
            $this->command->info("Super Admin Password: {$password}");
        }

        // TODO: Delete this section later, this is just for testing purpose of agent
        // $agent = null;
        // foreach (['ac', 'ad', 'ae', 'af', 'ag', 'ah', 'ai', 'aj', 'ak', 'al'] as $refCode) {
        //     if (User::withTrashed()->where('ref_code', $refCode)->exists()) {
        //         continue;
        //     }

        //     $agent = User::updateOrCreate([
        //         'username' => $refCode,
        //     ], [
        //         'parent_id' => $agent ? $agent?->id : null,
        //         'name' => 'Dummy Agent',
        //         'ref_code' => $refCode,
        //         'type' => UserTypeEnum::AGENT,
        //         'password' => '123456',
        //         'losing_point_ratio' => fake()->numberBetween(0, 99),
        //         'rolling_ratio' => fake()->numberBetween(0, 99),
        //     ]);
        //     RolesService::assignRole($agent, RolesEnum::AGENT);

        //     User::factory()->count(1)->create([
        //         'parent_id' => $agent->id,
        //     ]);
        // }
    }
}
