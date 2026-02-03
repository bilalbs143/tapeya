<?php

namespace App\Console\Commands;

use App\Models\CryptoCurrency;
use App\Services\Payments\NowPayments\CurrencyService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SyncCurrencies extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sync:currencies {--force : Force sync even if recently synced}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync currencies from NowPayments API with detailed information including icons';

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting currency synchronization...');

        try {
            // Check if we need to sync (skip if synced in last 6 hours unless forced)
            if (! $this->option('force')) {
                $lastSynced = CryptoCurrency::max('last_synced_at');
                if ($lastSynced && Carbon::parse($lastSynced)->diffInHours(now()) < 6) {
                    $this->info('Cryptocurrencies were synced recently. Use --force to override.');

                    return 0;
                }
            }

            $this->info('Fetching available currencies...');
            $currencyService = new CurrencyService;

            return $currencyService->sync();
        } catch (\Exception $e) {
            $this->error('Currency sync failed: '.$e->getMessage());
            Log::error('Currency sync failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return 1;
        }
    }
}
