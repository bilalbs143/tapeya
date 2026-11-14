<?php

namespace App\Http\Requests\Admin;

use App\Enums\Tournament\TournamentInterestFormFieldEnum;
use App\Enums\Tournament\TournamentInterestSubmissionStatusEnum;
use App\Models\TournamentInterestSubmission;
use App\Support\Interest\InterestCustomFields;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTournamentInterestSubmissionRequest extends FormRequest
{
    private ?TournamentInterestSubmission $submission = null;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $rules = [
            'name' => ['sometimes', 'required', 'string', 'max:191'],
            'status' => ['sometimes', Rule::enum(TournamentInterestSubmissionStatusEnum::class)],
            // Admin-only internal notes — empty string clears to null in the controller mapper.
            'notes' => ['sometimes', 'nullable', 'string', 'max:5000'],
        ];

        // Notes/status-only patches must not require the full campaign form.
        if (! $this->isEditingSubmissionFields()) {
            return $rules;
        }

        $campaign = $this->submission()->campaign;

        return array_merge(
            $rules,
            TournamentInterestFormFieldEnum::submissionRules($campaign?->resolvedFormFields() ?? []),
            InterestCustomFields::answerRules($campaign?->resolvedCustomFields() ?? []),
        );
    }

    private function isEditingSubmissionFields(): bool
    {
        foreach (['name', 'nickname', 'email', 'phone', 'country', 'city', 'date_of_birth', 'custom_answers'] as $key) {
            if ($this->exists($key)) {
                return true;
            }
        }

        return false;
    }

    private function submission(): TournamentInterestSubmission
    {
        if ($this->submission !== null) {
            return $this->submission;
        }

        /** @var TournamentInterestSubmission $submission */
        $submission = $this->route('submission');
        $submission->loadMissing('campaign');

        return $this->submission = $submission;
    }
}
