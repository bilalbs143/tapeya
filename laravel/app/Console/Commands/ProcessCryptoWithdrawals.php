<?php

namespace App\Console\Commands;

use App\Services\CryptoService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ProcessCryptoWithdrawals extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'crypto:process-withdrawals {--force : Force processing even if there are errors}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process pending crypto withdrawal requests with automatic USDT conversion';

    /**
     * Execute the console command.
     */
    public function handle(CryptoService $cryptoService)
    {
        $this->info('Starting crypto withdrawal processing...');

        try {
            $result = $cryptoService->processPendingWithdrawals();

            if (! $result['success']) {
                $this->error('Failed to process crypto withdrawals: '.($result['error'] ?? 'Unknown error'));

                if (! $this->option('force')) {
                    return 1;
                }
            }

            $this->info($result['message'] ?? 'Processing completed');

            return 0;

        } catch (\Exception $e) {
            $this->error('Crypto withdrawal processing failed: '.$e->getMessage());
            Log::error('Crypto withdrawal processing command failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return 1;
        }
    }
}
