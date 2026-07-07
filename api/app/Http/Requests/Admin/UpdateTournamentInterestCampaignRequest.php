<?php

namespace App\Http\Requests\Admin;

use App\Enums\Tournament\TournamentInterestCampaignStatusEnum;
use App\Enums\Tournament\TournamentInterestFormFieldEnum;
use App\Http\Requests\Admin\Concerns\ValidatesTournamentInterestFormFields;
use App\Models\Tournament;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTournamentInterestCampaignRequest extends FormRequest
{
    use ValidatesTournamentInterestFormFields;
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'tournament_id' => ['nullable', 'integer', Rule::exists(Tournament::class, 'id')],
            'tournament_name' => ['sometimes', 'required', 'string', 'max:191'],
            'slug' => ['sometimes', 'required', 'string', 'max:191', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'description' => ['nullable', 'string', 'max:5000'],
            'form_fields' => ['sometimes', 'array', 'min:1'],
            'form_fields.*' => ['string', Rule::enum(TournamentInterestFormFieldEnum::class)],
            'show_in_sidebar' => ['sometimes', 'boolean'],
            'show_dialog' => ['sometimes', 'boolean'],
            'status' => ['sometimes', Rule::enum(TournamentInterestCampaignStatusEnum::class)],
        ];
    }

    public function messages(): array
    {
        return [
            'slug.regex' => 'Slug may only contain lowercase letters, digits and dashes.',
        ];
    }
}
