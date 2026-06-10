<?php

namespace App\Http\Controllers\User;

use App\Enums\Tournament\TournamentInterestCampaignStatusEnum;
use App\Enums\Tournament\TournamentInterestSubmissionStatusEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreInterestSubmissionRequest;
use App\Http\Resources\User\InterestCampaignResource;
use App\Http\Resources\User\InterestSubmissionResource;
use App\Models\TournamentInterestCampaign;
use App\Models\TournamentInterestSubmission;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class InterestCampaignController extends Controller
{
    use BaseControllerTrait;

    /**
     * Featured interest campaign for the app sidebar: open status and show_in_sidebar.
     */
    public function sidebar(): JsonResponse
    {
        $campaign = TournamentInterestCampaign::query()
            ->where('show_in_sidebar', true)
            ->where('status', TournamentInterestCampaignStatusEnum::OPEN->value)
            ->first();

        if ($campaign === null) {
            return $this->success(['campaign' => null]);
        }

        return $this->success([
            'campaign' => [
                'slug' => $campaign->slug,
                'tournament_name' => $campaign->tournament_name,
            ],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $campaign = TournamentInterestCampaign::query()
            ->with('tournament')
            ->where('slug', $slug)
            ->firstOrFail();

        $user = request()->user();
        $mySubmission = TournamentInterestSubmission::query()
            ->where('campaign_id', $campaign->id)
            ->where('user_id', $user->id)
            ->first();

        $disk = Storage::disk(config('filesystems.media_disk'));
        $avatarUrl = $user->avatar ? $disk->url($user->avatar) : null;

        return $this->success([
            'campaign' => new InterestCampaignResource($campaign),
            'my_submission' => $mySubmission
                ? new InterestSubmissionResource($mySubmission)
                : null,
            'profile_defaults' => [
                'name' => $user->name,
                'nickname' => $user->nickname,
                'email' => $user->email,
                'phone' => $user->phone,
                'country' => $user->country,
                'city' => $user->city,
                'date_of_birth' => $user->date_of_birth?->format('Y-m-d'),
                'avatar_url' => $avatarUrl,
            ],
        ]);
    }

    public function store(StoreInterestSubmissionRequest $request, string $slug): JsonResponse
    {
        $campaign = TournamentInterestCampaign::query()
            ->where('slug', $slug)
            ->firstOrFail();

        if ($campaign->status === TournamentInterestCampaignStatusEnum::CLOSED) {
            return $this->failure('This interest form is closed.', 'CLOSED');
        }

        $user = $request->user();
        $payload = $request->validated();

        $data = [
            'name' => $payload['name'] ?? $user->name,
            'nickname' => $payload['nickname'] ?? $user->nickname,
            'email' => $payload['email'] ?? $user->email,
            'phone' => $payload['phone'] ?? $user->phone,
            'country' => $payload['country'] ?? $user->country,
            'city' => $payload['city'] ?? $user->city,
            'date_of_birth' => $payload['date_of_birth'] ?? $user->date_of_birth?->format('Y-m-d'),
            'status' => TournamentInterestSubmissionStatusEnum::PENDING->value,
            'withdrawn_at' => null,
        ];

        $submission = TournamentInterestSubmission::query()
            ->where('campaign_id', $campaign->id)
            ->where('user_id', $user->id)
            ->first();

        // On first submission, seed profile picture from the user's existing avatar
        // when they haven't uploaded one yet (upload happens via the media endpoint).
        if ($submission === null && $user->avatar) {
            $data['profile_picture_path'] = $user->avatar;
        }

        $isNew = $submission === null;
        if ($isNew) {
            $submission = TournamentInterestSubmission::create(array_merge($data, [
                'campaign_id' => $campaign->id,
                'user_id' => $user->id,
            ]));
        } else {
            $submission->update($data);
            $submission = $submission->fresh();
        }

        $this->backfillUserProfile($user, $payload);

        return $this->success(
            new InterestSubmissionResource($submission),
            $isNew ? 'Interest submitted.' : 'Interest updated.',
            $isNew ? 'CREATED' : 'OK',
        );
    }

    public function destroy(Request $request, string $slug): JsonResponse
    {
        $campaign = TournamentInterestCampaign::query()
            ->where('slug', $slug)
            ->firstOrFail();

        $submission = TournamentInterestSubmission::query()
            ->where('campaign_id', $campaign->id)
            ->where('user_id', $request->user()?->id)
            ->first();

        if ($submission === null) {
            return $this->success(null, 'No active interest to withdraw.');
        }

        $submission->update([
            'status' => TournamentInterestSubmissionStatusEnum::WITHDRAWN->value,
            'withdrawn_at' => now(),
        ]);

        return $this->success(
            new InterestSubmissionResource($submission->fresh()),
            'Interest withdrawn.',
        );
    }

    /**
     * Fill in profile scalar fields the player left blank. Never overwrites existing values.
     */
    private function backfillUserProfile(User $user, array $payload): void
    {
        $updates = [];

        foreach (['email', 'country', 'city', 'date_of_birth'] as $key) {
            if ($user->{$key} || empty($payload[$key])) {
                continue;
            }

            if ($key === 'email') {
                $taken = User::query()
                    ->where('email', $payload['email'])
                    ->where('id', '!=', $user->id)
                    ->exists();
                if ($taken) {
                    continue;
                }
            }

            $updates[$key] = $payload[$key];
        }

        if ($updates !== []) {
            $user->update($updates);
        }
    }
}
