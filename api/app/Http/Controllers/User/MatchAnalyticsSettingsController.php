<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdateMatchAnalyticsSettingsRequest;
use App\Http\Resources\User\TournamentMatchResource;
use App\Jobs\SyncMatchGraphicContextJob;
use App\Models\MatchSetting;
use App\Models\TournamentMatch;
use Illuminate\Http\JsonResponse;

class MatchAnalyticsSettingsController extends Controller
{
    use BaseControllerTrait;

    public function update(UpdateMatchAnalyticsSettingsRequest $request, TournamentMatch $match): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser->canScoreMatchInApp($match)) {
            return $this->forbidden('You cannot update settings for this match.');
        }

        $validated = $request->validated();

        if (array_key_exists('wagon_wheel_enabled', $validated)) {
            $match->update(['wagon_wheel_enabled' => $validated['wagon_wheel_enabled']]);
        }

        $officials = array_intersect_key($validated, array_flip(['umpires', 'scorers', 'commentators']));
        if ($officials !== []) {
            MatchSetting::query()->updateOrCreate(
                ['match_id' => $match->id],
                $officials,
            );
        }

        $match->load(['homeTeam', 'awayTeam', 'tournament', 'stream', 'matchSetting']);

        SyncMatchGraphicContextJob::dispatch($match->id);

        return $this->success(
            [
                'match' => new TournamentMatchResource($match),
                'analytics_settings' => $match->analyticsSettings(),
            ],
            'Settings updated.',
        );
    }
}
