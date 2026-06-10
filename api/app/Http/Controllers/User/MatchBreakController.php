<?php

namespace App\Http\Controllers\User;

use App\Enums\Event\MatchBreakTypeEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\EndMatchBreakRequest;
use App\Http\Requests\User\StoreMatchBreakRequest;
use App\Jobs\SyncMatchGraphicContextJob;
use App\Models\MatchBreak;
use App\Models\MatchScoringAudit;
use App\Models\TournamentMatch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MatchBreakController extends Controller
{
    use BaseControllerTrait;

    public function index(Request $request, TournamentMatch $match): JsonResponse
    {
        if (! $request->user()?->canScoreMatchInApp($match)) {
            return $this->forbidden('You cannot view breaks for this match.');
        }

        $breaks = MatchBreak::query()
            ->where('match_id', $match->id)
            ->orderByDesc('started_at')
            ->get()
            ->map(fn (MatchBreak $break) => $this->formatBreak($break));

        return $this->success(['breaks' => $breaks]);
    }

    public function store(StoreMatchBreakRequest $request, TournamentMatch $match): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser->canScoreMatchInApp($match)) {
            return $this->forbidden('You cannot record breaks for this match.');
        }

        $inningsId = $request->validated('innings_id');
        if ($inningsId !== null) {
            $belongs = $match->innings()->where('id', $inningsId)->exists();
            if (! $belongs) {
                return $this->failure('Innings not found for this match.', 'VALIDATION_ERROR');
            }
        }

        $break = MatchBreak::query()->create([
            'match_id' => $match->id,
            'innings_id' => $inningsId,
            'break_type' => $request->validated('break_type'),
            'notes' => $request->validated('notes'),
            'started_at' => now(),
            'created_by' => $authUser->id,
        ]);

        MatchScoringAudit::query()->create([
            'tournament_match_id' => $match->id,
            'user_id' => $authUser->id,
            'action' => 'record_break',
            'ball_id' => null,
            'meta' => [
                'break_id' => $break->id,
                'break_type' => $break->break_type,
                'innings_id' => $break->innings_id,
            ],
        ]);

        SyncMatchGraphicContextJob::dispatch($match->id);

        return $this->success(
            ['break' => $this->formatBreak($break)],
            'Break recorded.',
            'CREATED',
        );
    }

    public function update(EndMatchBreakRequest $request, TournamentMatch $match, MatchBreak $break): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser->canScoreMatchInApp($match)) {
            return $this->forbidden('You cannot update breaks for this match.');
        }

        if ((int) $break->match_id !== (int) $match->id) {
            return $this->notFound('Break not found for this match.');
        }

        if ($break->ended_at !== null) {
            return $this->conflict('This break has already ended.');
        }

        $break->update(['ended_at' => now()]);

        SyncMatchGraphicContextJob::dispatch($match->id);

        return $this->success(
            ['break' => $this->formatBreak($break->fresh())],
            'Break ended.',
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function formatBreak(MatchBreak $break): array
    {
        return [
            'id' => $break->id,
            'match_id' => $break->match_id,
            'innings_id' => $break->innings_id,
            'break_type' => $break->break_type,
            'break_type_label' => MatchBreakTypeEnum::tryLabelFromValue($break->break_type),
            'notes' => $break->notes,
            'started_at' => $break->started_at?->toIso8601String(),
            'ended_at' => $break->ended_at?->toIso8601String(),
            'created_by' => $break->created_by,
        ];
    }
}
