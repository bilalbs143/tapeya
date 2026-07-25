<?php

namespace App\Jobs;

use App\Models\TournamentMatch;
use App\Services\Broadcast\GraphicContextOrchestrator;
use App\Services\Broadcast\GraphicFollowUpScheduler;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

/**
 * Runs a configured graphic follow-up: activate a target command after an event.
 */
class ActivateGraphicCommandFollowUpJob implements ShouldQueue
{
    use Queueable;

    /**
     * @param  array<string, mixed>|null  $payload
     */
    public function __construct(
        public readonly int $matchId,
        public readonly string $ruleId,
        public readonly ?int $expectedActiveCommandId,
        public readonly ?array $payload,
        public readonly ?int $updatedByUserId = null,
    ) {
        // Wait for the triggering transaction to commit before queueing.
        $this->afterCommit = true;
    }

    public function handle(
        GraphicFollowUpScheduler $scheduler,
        GraphicContextOrchestrator $orchestrator,
    ): void {
        $rule = $scheduler->ruleById($this->ruleId);
        $activateKey = $rule['then']['activate'] ?? null;
        if (! is_string($activateKey) || $activateKey === '') {
            return;
        }

        $onlyIfStillActive = (bool) ($rule['then']['only_if_still_active'] ?? false);

        $match = TournamentMatch::find($this->matchId);
        if (! $match) {
            return;
        }

        $activated = DB::transaction(function () use ($scheduler, $match, $activateKey, $onlyIfStillActive) {
            return $scheduler->activateFollowUp(
                $match,
                $activateKey,
                $this->expectedActiveCommandId,
                $onlyIfStillActive,
                $this->payload,
                $this->updatedByUserId,
            );
        });

        if ($activated) {
            $orchestrator->syncAndBroadcast($match);
        }
    }
}
