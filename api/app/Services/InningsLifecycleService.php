<?php

namespace App\Services;

use App\Enums\Event\InningsEndReasonEnum;
use App\Enums\Event\InningsStatusEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Models\Innings;
use App\Models\TournamentMatch;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Manual innings lifecycle actions (end innings with reason, etc.).
 */
class InningsLifecycleService
{
    public function __construct(
        private readonly MatchCompletionService $completionService,
    ) {}

    /**
     * End an innings manually (organizer action).
     *
     * @param  array{end_reason: string, end_comments?: string|null, points_awarded_each?: bool}  $data
     */
    public function endInnings(TournamentMatch $match, Innings $innings, array $data): Innings
    {
        if ($innings->match_id !== $match->id) {
            throw ValidationException::withMessages([
                'innings' => ['Innings does not belong to this match.'],
            ]);
        }

        if ($match->status === MatchStatusEnum::COMPLETED) {
            throw ValidationException::withMessages([
                'match' => ['Match is already completed.'],
            ]);
        }

        if ($innings->status === InningsStatusEnum::COMPLETED) {
            throw ValidationException::withMessages([
                'innings' => ['Innings is already completed.'],
            ]);
        }

        $reason = InningsEndReasonEnum::from($data['end_reason']);
        $endedBy = $reason->endedBy();

        // Scoring-based reasons imply deliveries have been bowled.
        // Administrative/weather reasons (rain, captain, referee, out_of_time) may legitimately end on 0 balls.
        $requiresBalls = in_array($reason, [
            InningsEndReasonEnum::ALL_OUT,
            InningsEndReasonEnum::OVERS_BOWLED,
            InningsEndReasonEnum::RUNS_CHASED,
            InningsEndReasonEnum::TARGET_REVISION,
        ], true);

        if ($requiresBalls && ! $innings->balls()->exists()) {
            throw ValidationException::withMessages([
                'end_reason' => ["The reason '{$reason->label()}' requires at least one ball to have been bowled."],
            ]);
        }

        DB::transaction(function () use ($innings, $reason, $endedBy, $data, $match) {
            $innings->update([
                'status' => InningsStatusEnum::COMPLETED,
                'end_reason' => $reason->value,
                'ended_by' => $endedBy?->value,
                'end_comments' => $data['end_comments'] ?? null,
                'points_awarded_each' => (bool) ($data['points_awarded_each'] ?? false),
            ]);

            $this->completionService->evaluate($match->fresh());
        });

        return $innings->fresh();
    }
}
