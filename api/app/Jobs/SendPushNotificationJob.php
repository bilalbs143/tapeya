<?php

namespace App\Jobs;

use App\Enums\Push\PushNotificationStatusEnum;
use App\Enums\Push\PushTargetTypeEnum;
use App\Models\DeviceToken;
use App\Models\PushNotificationLog;
use App\Services\Push\PushSender;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class SendPushNotificationJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [60, 120, 300];

    public int $timeout = 120;

    public function __construct(
        public int $logId
    ) {
        $this->onQueue('push-notifications');
    }

    public function handle(PushSender $pushSender): void
    {
        // Phase 1: chunk-level idempotency is not implemented. On retry after partial
        // success + exception, already-delivered tokens may receive a duplicate send.
        $log = PushNotificationLog::query()->find($this->logId);

        if (! $log) {
            return;
        }

        if ($log->status === PushNotificationStatusEnum::SENT) {
            return;
        }

        $log->update(['status' => PushNotificationStatusEnum::PROCESSING]);

        $successCount = 0;
        $failureCount = 0;
        $totalTokens = 0;

        try {
            $tokenQuery = DeviceToken::query()->where('is_active', true);

            if ($log->target_type === PushTargetTypeEnum::USER) {
                $tokenQuery->where('user_id', $log->target_user_id);
            }

            $tokenQuery->orderBy('id')->chunk(500, function ($tokens) use ($pushSender, $log, &$successCount, &$failureCount, &$totalTokens): void {
                $tokenValues = $tokens->pluck('token')->all();
                $totalTokens += count($tokenValues);

                if ($tokenValues === []) {
                    return;
                }

                $result = $pushSender->sendToTokens(
                    $tokenValues,
                    $log->title,
                    $log->body,
                    $log->data ?? [],
                    $log->image_url,
                );

                $successCount += $result['success_count'];
                $failureCount += $result['failure_count'];
            });

            $status = match (true) {
                $totalTokens === 0 => PushNotificationStatusEnum::FAILED,
                $failureCount === 0 => PushNotificationStatusEnum::SENT,
                $successCount === 0 => PushNotificationStatusEnum::FAILED,
                default => PushNotificationStatusEnum::PARTIAL,
            };

            $log->update([
                'status' => $status,
                'total_tokens' => $totalTokens,
                'success_count' => $successCount,
                'failure_count' => $failureCount,
                'sent_at' => $successCount > 0 ? now() : null,
                'error_message' => $totalTokens === 0 ? 'No active device tokens found' : null,
            ]);
        } catch (\Throwable $e) {
            Log::error('SendPushNotificationJob failed', [
                'log_id' => $this->logId,
                'message' => $e->getMessage(),
            ]);

            $log->update([
                'status' => PushNotificationStatusEnum::FAILED,
                'total_tokens' => $totalTokens,
                'success_count' => $successCount,
                'failure_count' => $failureCount,
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
