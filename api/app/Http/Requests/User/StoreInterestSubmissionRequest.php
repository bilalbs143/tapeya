<?php

namespace App\Http\Requests\User;

use App\Enums\Tournament\TournamentInterestFormFieldEnum;
use App\Models\TournamentInterestCampaign;
use App\Support\Interest\InterestCustomFields;
use Illuminate\Foundation\Http\FormRequest;

class StoreInterestSubmissionRequest extends FormRequest
{
    private ?TournamentInterestCampaign $campaign = null;

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $campaign = $this->campaign();

        return array_merge(
            TournamentInterestFormFieldEnum::submissionRules($campaign->resolvedFormFields()),
            InterestCustomFields::answerRules($campaign->resolvedCustomFields()),
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function validated($key = null, $default = null)
    {
        $data = parent::validated($key, $default);
        if ($key !== null) {
            return $data;
        }

        if (array_key_exists('custom_answers', $data)) {
            $data['custom_answers'] = InterestCustomFields::normalizeAnswers(
                $this->campaign()->resolvedCustomFields(),
                $data['custom_answers'],
            );
        }

        return $data;
    }

    private function campaign(): TournamentInterestCampaign
    {
        return $this->campaign ??= TournamentInterestCampaign::query()
            ->where('slug', $this->route('slug'))
            ->firstOrFail();
    }
}
