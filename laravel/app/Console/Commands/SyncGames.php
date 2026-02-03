<?php

namespace App\Console\Commands;

use App\Enums\Company\CompanyEnum;
use Exception;
use Illuminate\Console\Command;

class SyncGames extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sync:games';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync Games';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Increase memory limit for this command
        ini_set('memory_limit', '512M');

        $this->info('=== Syncing Games ===');

        foreach (CompanyEnum::allEnabled() as $companyKey) {
            if ($companyKey === CompanyEnum::FOURTEN) {
                $companyKey->service()->syncVendors();
            }
            $this->syncGames($companyKey);
        }

        $this->info('=== Games synced! ===');
    }

    private function syncGames(CompanyEnum $companyKey)
    {
        try {
            $this->info("=== Syncing {$companyKey->label()} Games ===");
            $companyKey->service()->syncGames();
            $this->info("=== Synced {$companyKey->label()} Games ===");
        } catch (Exception $e) {
            $this->error("=== {$companyKey->label()} with Error: {$e->getMessage()} at {$e->getFile()}:{$e->getLine()} Syncing failed ===");
        }
    }
}
