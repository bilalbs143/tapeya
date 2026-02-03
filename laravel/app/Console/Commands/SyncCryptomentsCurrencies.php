<?php

namespace App\Console\Commands;

use App\Services\CryptomentsService;
use Illuminate\Console\Command;

class SyncCryptomentsCurrencies extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cryptoments:sync-currencies
                            {--force : Force sync even if recently synced}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync Cryptoments chains and tokens to the database';

    protected $cryptomentsService;

    public function __construct(CryptomentsService $cryptomentsService)
    {
        parent::__construct();
        $this->cryptomentsService = $cryptomentsService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting Cryptoments currency synchronization...');

        // Check if Cryptoments is configured
        if (! $this->cryptomentsService->isConfigured()) {
            $this->error('Cryptoments is not properly configured. Please check your environment variables.');

            return Command::FAILURE;
        }

        // Show progress bar
        $this->info('Fetching chains and tokens from Cryptoments API...');

        $result = $this->cryptomentsService->syncCurrenciesToDatabase();

        if ($result['success']) {
            $this->info('✓ Successfully synced '.$result['synced_count'].' Cryptoments currencies');

            if (! empty($result['errors'])) {
                $this->warn('Some errors occurred during sync:');
                foreach ($result['errors'] as $error) {
                    $this->line('  - '.$error['token'].': '.$error['error']);
                }
            }

            return Command::SUCCESS;
        } else {
            $this->error('✗ Failed to sync Cryptoments currencies');
            $this->error('Error: '.$result['error']);

            return Command::FAILURE;
        }
    }
}
