<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\UpdateTournamentInterestSubmissionRequest;
use App\Http\Resources\Admin\TournamentInterestSubmissionResource;
use App\Models\TournamentInterestSubmission;
use App\Support\Interest\InterestCustomFields;
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
            if (array_key_exists('custom_answers', $data)) {
                $campaign = $submission->campaign;
                $merged = InterestCustomFields::mergeScalarAnswers(
                    $campaign?->resolvedCustomFields() ?? [],
                    $submission->rawCustomAnswers(),
                    is_array($data['custom_answers']) ? $data['custom_answers'] : [],
                );
                $data['custom_answers'] = $merged === [] ? null : $merged;
            }

            if (array_key_exists('notes', $data)) {
                $notes = is_string($data['notes']) ? trim($data['notes']) : null;
                $data['notes'] = $notes === '' || $notes === null ? null : $notes;
            }
        });
    }
}
