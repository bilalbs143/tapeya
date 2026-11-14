<?php

namespace App\Http\Requests\Admin;

use App\Enums\Tournament\TournamentInterestCampaignStatusEnum;
use App\Enums\Tournament\TournamentInterestFormFieldEnum;
use App\Http\Requests\Admin\Concerns\ValidatesTournamentInterestFormFields;
use App\Models\Tournament;
use App\Support\Interest\InterestCustomFields;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTournamentInterestCampaignRequest extends FormRequest
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
        return array_merge([
            'tournament_id' => ['nullable', 'integer', Rule::exists(Tournament::class, 'id')],
            'tournament_name' => ['required_without:tournament_id', 'nullable', 'string', 'max:191'],
            'slug' => ['nullable', 'string', 'max:191', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'description' => ['nullable', 'string', 'max:5000'],
            'form_fields' => ['sometimes', 'array', 'min:1'],
            'form_fields.*' => ['string', Rule::enum(TournamentInterestFormFieldEnum::class)],
            'logo' => ['sometimes', 'nullable', 'image', 'max:5120'],
            'show_in_sidebar' => ['sometimes', 'boolean'],
            'show_dialog' => ['sometimes', 'boolean'],
            'status' => ['nullable', Rule::enum(TournamentInterestCampaignStatusEnum::class)],
        ], InterestCustomFields::adminRules());
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

        $data = $this->normalizeCustomFieldsInData($data);
        if (! array_key_exists('custom_fields', $data)) {
            $data['custom_fields'] = [];
        }
        if (! array_key_exists('form_fields', $data)) {
            $data['form_fields'] = TournamentInterestFormFieldEnum::defaults();
        }

        return $data;
    }

    public function messages(): array
    {
        return [
            'slug.regex' => 'Slug may only contain lowercase letters, digits and dashes.',
            'tournament_name.required_without' => 'Provide a tournament name when not linking to an existing tournament.',
        ];
    }
}
