<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Tournament\TournamentInterestSubmissionStatusEnum;
use App\Http\Requests\Admin\UpdateTournamentInterestSubmissionRequest;
use App\Http\Resources\Admin\TournamentInterestSubmissionResource;
use App\Models\TournamentInterestSubmission;
use Illuminate\Http\JsonResponse;

class TournamentInterestSubmissionController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(
            TournamentInterestSubmission::class,
            TournamentInterestSubmissionResource::class,
            'interest submission',
        );
    }

    protected function baseQuery()
    {
        return TournamentInterestSubmission::query()->with(['user', 'campaign.tournament']);
    }

    public function show(TournamentInterestSubmission $submission): JsonResponse
    {
        return $this->_show($submission);
    }

    public function update(
        UpdateTournamentInterestSubmissionRequest $request,
        TournamentInterestSubmission $submission,
    ): JsonResponse {
        return $this->_patch($request, $submission, 'Interest submission updated.', null, function (array &$data) use ($submission) {
            if (array_key_exists('status', $data)) {
                $withdrawn = TournamentInterestSubmissionStatusEnum::WITHDRAWN->value;
                if ($data['status'] === $withdrawn && $submission->withdrawn_at === null) {
                    $data['withdrawn_at'] = now();
                } elseif ($data['status'] !== $withdrawn) {
                    $data['withdrawn_at'] = null;
                }
            }
        });
    }
}
