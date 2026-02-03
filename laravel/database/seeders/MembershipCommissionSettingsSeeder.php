<?php

namespace Database\Seeders;

use App\Enums\Membership\LevelsEnum;
use App\Models\MembershipCommissionSetting;
use Illuminate\Database\Seeder;

class MembershipCommissionSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (LevelsEnum::values() as $level) {
            MembershipCommissionSetting::firstOrCreate(['level' => $level]);
        }

        $this->command->info('Membership Commission Settings Seeded!');
    }
}
