<?php

namespace App\Console\Commands;

use App\Services\QrCodeService;
use Illuminate\Console\Command;

class RegenerateExpiredQrCodesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'qrcode:regenerate-expired
                          {--batch-size=100 : Number of users to process in each batch}
                          {--dry-run : Show what would be done without actually doing it}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Regenerate expired QR codes for users with referral codes';

    /**
     * Execute the console command.
     */
    public function handle(QrCodeService $qrCodeService): int
    {
        $batchSize = (int) $this->option('batch-size');
        $isDryRun = $this->option('dry-run');

        $this->info('🔍 Checking for users with expired QR codes...');

        try {
            // Get count of users with expired QR codes
            $expiredCount = $qrCodeService->getUsersWithExpiredQrCodes()->count();

            if ($expiredCount === 0) {
                $this->info('✅ No expired QR codes found. All QR codes are up to date!');

                return 0;
            }

            $this->info("📊 Found {$expiredCount} users with expired or missing QR codes.");

            if ($isDryRun) {
                $this->warn('🧪 DRY RUN MODE: No changes will be made.');

                // Show some sample users
                $sampleUsers = $qrCodeService->getUsersWithExpiredQrCodes()
                    ->select('id', 'username', 'ref_code', 'referral_link_qr_code_path', 'referral_link_qr_code_expires_at')
                    ->limit(5)
                    ->get();

                if ($sampleUsers->isNotEmpty()) {
                    $this->table(['User ID', 'Username', 'Ref Code', 'QR Expires At'],
                        $sampleUsers->map(function ($user) {
                            return [
                                $user->id,
                                $user->username,
                                $user->ref_code,
                                $user->referral_link_qr_code_expires_at ?
                                    $user->referral_link_qr_code_expires_at->format('Y-m-d H:i:s') :
                                    'Never generated',
                            ];
                        })
                    );
                }

                return 0;
            }

            $this->info('🚀 Starting QR code regeneration...');
            $startTime = microtime(true);

            $regeneratedCount = $qrCodeService->regenerateExpiredQrCodes($batchSize);

            $endTime = microtime(true);
            $executionTime = round($endTime - $startTime, 2);

            $this->newLine();
            $this->info("✅ Successfully regenerated QR codes for {$regeneratedCount} users.");
            $this->info("⏱️  Execution time: {$executionTime} seconds");

            if ($regeneratedCount < $expiredCount) {
                $failedCount = $expiredCount - $regeneratedCount;
                $this->warn("⚠️  {$failedCount} QR codes failed to regenerate. Check logs for details.");
            }

            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Command failed: {$e->getMessage()}");

            return 1;
        }
    }
}
