<?php

namespace Database\Seeders;

use App\Models\WhitelistedIp;
use Illuminate\Database\Seeder;

class VpnWhitelistedIPSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        WhitelistedIp::firstOrCreate([
            'ip' => '139.59.230.43',
            'memo' => 'VPN IP',
        ]);

        $this->command->info('VPN IP seeded as Whitelisted IP for Admin!');
    }
}
