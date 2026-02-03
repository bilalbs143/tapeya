<?php

namespace App\Console\Commands;

use App\Services\QrCodeService;
use Illuminate\Console\Command;

class QrCodeCacheCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'qrcode:manage
                          {action : The action to perform: clear, stats, generate}
                          {--force : Force the action without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manage QR codes (clear, stats, generate)';

    /**
     * Execute the console command.
     */
    public function handle(QrCodeService $qrCodeService): int
    {
        $action = $this->argument('action');

        switch ($action) {
            case 'clear':
                return $this->clearQrCodes($qrCodeService);
            case 'stats':
                return $this->showStats($qrCodeService);
            case 'generate':
                return $this->generateQrCodes($qrCodeService);
            default:
                $this->error("Invalid action: {$action}");
                $this->info('Available actions: clear, stats, generate');

                return 1;
        }
    }

    /**
     * Clear QR codes from database
     */
    protected function clearQrCodes(QrCodeService $qrCodeService): int
    {
        if (! $this->option('force') && ! $this->confirm('Are you sure you want to clear all QR codes from the database?')) {
            $this->info('Operation cancelled.');

            return 0;
        }

        $this->info('Clearing QR codes from database...');

        try {
            $count = $qrCodeService->clearAllQrCodes();
            $this->info("✅ Cleared QR codes for {$count} users successfully.");

            return 0;
        } catch (\Exception $e) {
            $this->error("❌ Failed to clear QR codes: {$e->getMessage()}");

            return 1;
        }
    }

    /**
     * Show QR code statistics
     */
    protected function showStats(QrCodeService $qrCodeService): int
    {
        $this->info('QR Code Statistics:');

        try {
            $stats = $qrCodeService->getStats();

            $this->table(['Metric', 'Value'], [
                ['Total Users with Ref Code', $stats['total_users_with_ref_code']],
                ['Users with QR Code', $stats['users_with_qr_code']],
                ['Valid QR Codes', $stats['valid_qr_codes']],
                ['Expired QR Codes', $stats['expired_qr_codes']],
                ['QR Code Coverage %', $stats['qr_code_coverage_percentage'].'%'],
                ['Expiry Days', $stats['expiry_days']],
                ['Storage Files', $stats['storage_files']],
                ['Storage Size (MB)', $stats['storage_size_mb']],
                ['Storage Path', $stats['storage_path']],
            ]);

            return 0;
        } catch (\Exception $e) {
            $this->error("❌ Failed to get stats: {$e->getMessage()}");

            return 1;
        }
    }

    /**
     * Generate QR codes for all users with referral codes
     */
    protected function generateQrCodes(QrCodeService $qrCodeService): int
    {
        $this->info('Generating QR codes for all users...');

        try {
            // Get all users with ref_codes
            $users = \App\Models\User::whereNotNull('ref_code')
                ->where('ref_code', '!=', '')
                ->select('id', 'ref_code', 'username', 'referral_link_qr_code_path', 'referral_link_qr_code_expires_at')
                ->get();

            if ($users->isEmpty()) {
                $this->info('No users with referral codes found.');

                return 0;
            }

            $this->info("Found {$users->count()} users with referral codes.");

            $progressBar = $this->output->createProgressBar($users->count());
            $progressBar->start();

            $generated = 0;
            $skipped = 0;

            foreach ($users as $user) {
                try {
                    // Check if QR code is still valid
                    if ($qrCodeService->isQrCodeValid($user)) {
                        $skipped++;
                    } else {
                        $qrCodeService->generateAndStoreQrCode($user);
                        $generated++;
                    }
                } catch (\Exception $e) {
                    $this->newLine();
                    $this->warn("Failed to generate QR code for user {$user->id}: {$e->getMessage()}");
                }
                $progressBar->advance();
            }

            $progressBar->finish();
            $this->newLine();
            $this->info("✅ Generated QR codes for {$generated} users.");
            if ($skipped > 0) {
                $this->info("⏭️  Skipped {$skipped} users with valid QR codes.");
            }

            return 0;
        } catch (\Exception $e) {
            $this->error("❌ Failed to generate QR codes: {$e->getMessage()}");

            return 1;
        }
    }
}
