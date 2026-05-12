<?php

namespace App\Http\Requests\User;

use App\Models\TournamentInterestCampaign;
use App\Models\TournamentInterestSubmission;
use Illuminate\Foundation\Http\FormRequest;

class StoreInterestSubmissionRequest extends FormRequest
{
    private bool $submissionResolved = false;

    private ?TournamentInterestSubmission $cachedSubmission = null;

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $idDocumentRules = ['file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'];
        $idDocumentRules[] = $this->existingSubmissionHasDocument()
            ? 'sometimes'
            : 'required';

        $profileRules = $this->shouldRequireProfilePictureFile()
            ? ['required', 'image', 'max:5120']
            : ['sometimes', 'nullable', 'image', 'max:5120'];

        return [
            'name' => ['required', 'string', 'max:191'],
            'nickname' => ['required', 'string', 'max:191'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['required', 'email', 'max:191'],
            'country' => ['required', 'string', 'max:100'],
            'city' => ['required', 'string', 'max:100'],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'profile_picture' => $profileRules,
            'id_document' => $idDocumentRules,
        ];
    }

    public function messages(): array
    {
        return [
            'profile_picture.required' => 'Add a profile picture.',
            'id_document.required' => 'Upload your CNIC or B-Form.',
        ];
    }

    /**
     * Allow updates without re-uploading: only force the file when the player
     * does not already have one stored against this campaign.
     */
    private function existingSubmissionHasDocument(): bool
    {
        $submission = $this->currentInterestSubmission();

        return $submission?->id_document_path !== null;
    }

    private function existingSubmissionHasProfilePicture(): bool
    {
        $submission = $this->currentInterestSubmission();

        return $submission?->profile_picture_path !== null;
    }

    /**
     * First create with no submission photo yet: the controller copies the
     * user's avatar when no file is sent, so the upload is not required then.
     */
    private function shouldRequireProfilePictureFile(): bool
    {
        if ($this->existingSubmissionHasProfilePicture()) {
            return false;
        }

        $submission = $this->currentInterestSubmission();
        if ($submission === null && $this->user()?->avatar) {
            return false;
        }

        return true;
    }

    private function currentInterestSubmission(): ?TournamentInterestSubmission
    {
        if ($this->submissionResolved) {
            return $this->cachedSubmission;
        }

        $this->submissionResolved = true;

        $slug = $this->route('slug');
        $userId = $this->user()?->id;
        if (! $slug || ! $userId) {
            return $this->cachedSubmission = null;
        }

        $campaignId = TournamentInterestCampaign::query()
            ->where('slug', $slug)
            ->value('id');
        if (! $campaignId) {
            return $this->cachedSubmission = null;
        }

        return $this->cachedSubmission = TournamentInterestSubmission::query()
            ->where('campaign_id', $campaignId)
            ->where('user_id', $userId)
            ->first();
    }
}
