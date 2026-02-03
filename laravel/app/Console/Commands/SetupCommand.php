<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SetupCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'setup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run on Production for first time';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->call('db:seed', ['--class' => 'BanksSeeder']);
        $this->call('db:seed', ['--class' => 'RolesAndPermissionsSeeder']);
        $this->call('db:seed', ['--class' => 'SuperAdminSeeder']);
        $this->call('db:seed', ['--class' => 'VpnWhitelistedIPSeeder']);
        $this->call('db:seed', ['--class' => 'MembershipCommissionSettingsSeeder']);
        $this->call('db:seed', ['--class' => 'SystemSettingsSeeder']);

        // through supervisor
        // php artisan pulse:work
        // php artisan queue:work
    }
}
