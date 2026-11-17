<?php

namespace App\Http\Controllers\User;

use App\Enums\Tournament\TournamentInterestCampaignStatusEnum;
use App\Enums\Tournament\TournamentInterestFormFieldEnum;
use App\Enums\Tournament\TournamentInterestSubmissionStatusEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreInterestSubmissionRequest;
use App\Http\Resources\User\InterestCampaignResource;
use App\Http\Resources\User\InterestSubmissionResource;
use App\Models\TournamentInterestCampaign;
use App\Models\TournamentInterestSubmission;
use App\Models\User;
use App\Support\Interest\InterestCustomFields;
use App\Support\Media\MediaDisk;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
                'logo_url' => MediaDisk::url($campaign->logo_path),
            ],
        ]);
    }

    /**
     * Featured interest campaign for the in-app dialog: open status and show_dialog.
     */
    public function dialog(Request $request): JsonResponse
    {
        $campaign = TournamentInterestCampaign::query()
            ->where('show_dialog', true)
            ->where('status', TournamentInterestCampaignStatusEnum::OPEN->value)
            ->first();

        if ($campaign === null) {
            return $this->success(['campaign' => null]);
        }

        $payload = [
            'slug' => $campaign->slug,
            'tournament_name' => $campaign->tournament_name,
        ];

        $user = $request->user();
        $submission = TournamentInterestSubmission::query()
            ->where('campaign_id', $campaign->id)
            ->where('user_id', $user->id)
            ->first();

        $payload['my_submission_status'] = $submission?->status?->value;

        if ($payload['my_submission_status'] === null) {
            unset($payload['my_submission_status']);
        }

        return $this->success(['campaign' => $payload]);
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

        $avatarUrl = MediaDisk::url($user->avatar);

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

        $existing = TournamentInterestSubmission::query()
            ->where('campaign_id', $campaign->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing !== null) {
            return $this->failure('You have already submitted interest for this campaign.', 'ALREADY_SUBMITTED');
        }

        $defaults = [
            'name' => $user->name,
            'nickname' => $user->nickname,
            'email' => $user->email,
            'phone' => $user->phone,
            'country' => $user->country,
            'city' => $user->city,
            'date_of_birth' => $user->date_of_birth?->format('Y-m-d'),
        ];

        $data = [
            'status' => TournamentInterestSubmissionStatusEnum::PENDING->value,
            // Always stored — submissions.name is NOT NULL and mirrors the signed-in account.
            'name' => $user->name,
        ];

        foreach (TournamentInterestFormFieldEnum::scalarValues() as $field) {
            if (TournamentInterestFormFieldEnum::isAlwaysStored($field)) {
                continue;
            }
            if (! $campaign->formFieldEnabled($field)) {
                continue;
            }
            $data[$field] = $payload[$field] ?? $defaults[$field] ?? null;
        }

        $mergedAnswers = InterestCustomFields::mergeScalarAnswers(
            $campaign->resolvedCustomFields(),
            [],
            is_array($payload['custom_answers'] ?? null) ? $payload['custom_answers'] : [],
        );
        $data['custom_answers'] = $mergedAnswers === [] ? null : $mergedAnswers;

        // Seed profile picture from the user's avatar when they haven't uploaded one yet.
        if (
            $user->avatar
            && $campaign->formFieldEnabled(TournamentInterestFormFieldEnum::PROFILE_PICTURE->value)
        ) {
            $data['profile_picture_path'] = $user->avatar;
        }

        $submission = TournamentInterestSubmission::create(array_merge($data, [
            'campaign_id' => $campaign->id,
            'user_id' => $user->id,
        ]));

        $this->backfillUserProfile($user, $payload);

        return $this->success(
            new InterestSubmissionResource($submission),
            'Interest submitted.',
            'CREATED',
        );
    }

    /**
     * Fill in profile scalar fields the player left blank. Never overwrites existing values.
     */
    private function backfillUserProfile(User $user, array $payload): void
    {
        $updates = [];

        foreach (['email', 'country', 'city', 'date_of_birth'] as $key) {
            if (! array_key_exists($key, $payload) || $user->{$key} || empty($payload[$key])) {
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
