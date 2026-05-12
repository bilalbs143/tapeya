<?php

namespace App\Http\Requests\Admin;

use App\Enums\Tournament\TournamentInterestCampaignStatusEnum;
use App\Models\Tournament;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTournamentInterestCampaignRequest extends FormRequest
{
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
            'tournament_name' => ['required_without:tournament_id', 'nullable', 'string', 'max:191'],
            'slug' => ['nullable', 'string', 'max:191', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'description' => ['nullable', 'string', 'max:5000'],
            'logo' => ['sometimes', 'nullable', 'image', 'max:5120'],
            'show_in_sidebar' => ['sometimes', 'boolean'],
            'show_dialog' => ['sometimes', 'boolean'],
            'status' => ['nullable', Rule::enum(TournamentInterestCampaignStatusEnum::class)],
        ];
    }

    public function messages(): array
    {
        return [
            'slug.regex' => 'Slug may only contain lowercase letters, digits and dashes.',
            'tournament_name.required_without' => 'Provide a tournament name when not linking to an existing tournament.',
        ];
    }
}
