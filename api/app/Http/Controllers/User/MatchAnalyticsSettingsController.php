<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdateMatchAnalyticsSettingsRequest;
use App\Http\Resources\User\TournamentMatchResource;
use App\Jobs\SyncMatchGraphicContextJob;
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

        // "At least one field required" is enforced by UpdateMatchAnalyticsSettingsRequest::withValidator().
        $match->update($request->validated());
        $match->load(['homeTeam', 'awayTeam', 'tournament', 'stream']);

        // Notify graphic overlay so it can enable/disable analytics prompts.
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
