<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class QrCodeService
{
    protected $expiryDays;

    protected $qrCodeSize;

    protected $qrCodeFormat;

    protected $storagePath;

    public function __construct()
    {
        $this->expiryDays = config('qrcode.expiry_days', 60);
        $this->qrCodeSize = config('qrcode.size', 300);
        $this->qrCodeFormat = config('qrcode.format', 'png');
        $this->storagePath = 'qr-codes';
    }

    public function getReferralQrCode(User $user): ?string
    {
        if (empty($user->ref_code)) {
            return null;
        }

        if ($this->isQrCodeValid($user)) {
            return $this->getQrCodeUrl($user->referral_link_qr_code_path);
        }

        $filePath = $this->generateAndStoreQrCode($user);

        return $filePath ? $this->getQrCodeUrl($filePath) : null;
    }

    public function isQrCodeValid(User $user): bool
    {
        return ! empty($user->referral_link_qr_code_path) &&
               ! empty($user->referral_link_qr_code_expires_at) &&
               Carbon::parse($user->referral_link_qr_code_expires_at)->isFuture() &&
               Storage::exists($user->referral_link_qr_code_path);
    }

    public function generateAndStoreQrCode(User $user): ?string
    {
        try {
            $referralUrl = route('referral_link', ['referral_code' => $user->ref_code]);

            $qrCodeContent = $this->generateQrCodeContent($referralUrl);

            if (! $qrCodeContent) {
                return null;
            }

            $filename = $this->generateFilename($user->ref_code);
            $filePath = $this->storagePath.'/'.$filename;

            if ($user->referral_link_qr_code_path && Storage::exists($user->referral_link_qr_code_path)) {
                // Storage::delete($user->referral_link_qr_code_path);
            }

            Storage::put($filePath, $qrCodeContent);

            $expiresAt = Carbon::now()->addDays($this->expiryDays);

            $user->update([
                'referral_link_qr_code_path' => $filePath,
                'referral_link_qr_code_expires_at' => $expiresAt,
            ]);

            return $filePath;
        } catch (\Exception $e) {
            Log::error('QR Code generation failed for user '.$user->id.': '.$e->getMessage());

            return null;
        }
    }

    protected function generateQrCodeContent(string $url): ?string
    {
        try {
            if (class_exists('\SimpleSoftwareIO\QrCode\Facades\QrCode')) {
                return \SimpleSoftwareIO\QrCode\Facades\QrCode::format($this->qrCodeFormat)
                    ->size($this->qrCodeSize)
                    ->margin(2)
                    ->errorCorrection('M')
                    ->generate($url);
            }

            return $this->generateFallbackQrCode($url);
        } catch (\Exception $e) {
            Log::error('QR Code content generation failed: '.$e->getMessage());

            return null;
        }
    }

    protected function generateFallbackQrCode(string $url): ?string
    {
        return null;

        // try {
        //     // Use a reliable online QR code service as fallback
        //     $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?'.http_build_query([
        //         'size' => $this->qrCodeSize.'x'.$this->qrCodeSize,
        //         'data' => $url,
        //         'format' => $this->qrCodeFormat,
        //         'margin' => 2,
        //         'ecc' => 'M',
        //     ]);

        //     $content = file_get_contents($qrUrl);

        //     return $content ?: null;

        // } catch (\Exception $e) {
        //     Log::error('Fallback QR Code generation failed: '.$e->getMessage());

        //     return null;
        // }
    }

    protected function generateFilename(string $refCode): string
    {
        $timestamp = Carbon::now()->timestamp;
        $hash = md5($refCode.$timestamp);

        return "qr_{$refCode}_{$hash}.{$this->qrCodeFormat}";
    }

    protected function getQrCodeUrl(string $filePath): string
    {
        return Storage::url($filePath);
    }

    public function regenerateQrCode(User $user): ?string
    {
        if (empty($user->ref_code)) {
            return null;
        }

        $filePath = $this->generateAndStoreQrCode($user);

        return $filePath ? $this->getQrCodeUrl($filePath) : null;
    }

    public function getUsersWithExpiredQrCodes()
    {
        return User::whereNotNull('ref_code')
            ->where('ref_code', '!=', '')
            ->where(function ($query) {
                $query->whereNull('referral_link_qr_code_expires_at')
                    ->orWhere('referral_link_qr_code_expires_at', '<', Carbon::now())
                    ->orWhereNull('referral_link_qr_code_path');
            });
    }

    public function regenerateExpiredQrCodes(int $batchSize = 100): int
    {
        $regeneratedCount = 0;

        $this->getUsersWithExpiredQrCodes()
            ->chunk($batchSize, function ($users) use (&$regeneratedCount) {
                foreach ($users as $user) {
                    try {
                        if ($this->generateAndStoreQrCode($user)) {
                            $regeneratedCount++;
                        }
                    } catch (\Exception $e) {
                        Log::error("Failed to regenerate QR code for user {$user->id}: ".$e->getMessage());
                    }
                }
            });

        return $regeneratedCount;
    }

    public function clearQrCode(User $user): bool
    {
        try {
            if ($user->referral_link_qr_code_path && Storage::exists($user->referral_link_qr_code_path)) {
                // Storage::delete($user->referral_link_qr_code_path);
            }

            // Clear database fields
            return $user->update([
                'referral_link_qr_code_path' => null,
                'referral_link_qr_code_expires_at' => null,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to clear QR code for user {$user->id}: ".$e->getMessage());

            return false;
        }
    }

    public function clearAllQrCodes(): int
    {
        $clearedCount = 0;

        try {
            $users = User::whereNotNull('referral_link_qr_code_path')->get();

            foreach ($users as $user) {
                if ($this->clearQrCode($user)) {
                    $clearedCount++;
                }
            }

            $this->cleanupOrphanedFiles();
        } catch (\Exception $e) {
            Log::error('Failed to clear all QR codes: '.$e->getMessage());
        }

        return $clearedCount;
    }

    protected function cleanupOrphanedFiles(): void
    {
        try {
            if (! Storage::exists($this->storagePath)) {
                return;
            }

            $allFiles = Storage::files($this->storagePath);
            $usedFiles = User::whereNotNull('referral_link_qr_code_path')
                ->pluck('referral_link_qr_code_path')
                ->toArray();

            $orphanedFiles = array_diff($allFiles, $usedFiles);

            if (! empty($orphanedFiles)) {
                // Storage::delete($orphanedFiles);
                Log::info('Cleaned up '.count($orphanedFiles).' orphaned QR code files');
            }

        } catch (\Exception $e) {
            Log::error('Failed to cleanup orphaned files: '.$e->getMessage());
        }
    }

    public function getStats(): array
    {
        $totalUsers = User::whereNotNull('ref_code')->where('ref_code', '!=', '')->count();
        $usersWithQr = User::whereNotNull('referral_link_qr_code_path')->count();
        $expiredQr = $this->getUsersWithExpiredQrCodes()->count();
        $validQr = $usersWithQr - $expiredQr;

        // Get storage stats
        $totalFiles = 0;
        $totalSize = 0;

        try {
            if (Storage::exists($this->storagePath)) {
                $files = Storage::files($this->storagePath);
                $totalFiles = count($files);

                foreach ($files as $file) {
                    $totalSize += Storage::size($file);
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to get storage stats: '.$e->getMessage());
        }

        return [
            'total_users_with_ref_code' => $totalUsers,
            'users_with_qr_code' => $usersWithQr,
            'valid_qr_codes' => max(0, $validQr),
            'expired_qr_codes' => $expiredQr,
            'qr_code_coverage_percentage' => $totalUsers > 0 ? round(($usersWithQr / $totalUsers) * 100, 2) : 0,
            'expiry_days' => $this->expiryDays,
            'storage_files' => $totalFiles,
            'storage_size_bytes' => $totalSize,
            'storage_size_mb' => round($totalSize / 1024 / 1024, 2),
            'storage_path' => $this->storagePath,
        ];
    }
}
