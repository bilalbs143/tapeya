<?php

namespace App\Http\Requests\User;

use App\Enums\Tournament\TournamentInterestFormFieldEnum;
use App\Models\TournamentInterestCampaign;
use Illuminate\Foundation\Http\FormRequest;

class StoreInterestSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $slug = $this->route('slug');
        $campaign = TournamentInterestCampaign::query()
            ->where('slug', $slug)
            ->firstOrFail();

        return TournamentInterestFormFieldEnum::submissionRules($campaign->resolvedFormFields());
    }
}
