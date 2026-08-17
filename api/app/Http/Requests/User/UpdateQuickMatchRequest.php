<?php

namespace App\Http\Requests\User;

use App\Enums\Event\CricketFormatEnum;
use App\Models\CricketMatch;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateQuickMatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $match = $this->route('quickMatch');

        return $user !== null
            && $match instanceof CricketMatch
            && $user->canOperateQuickMatch($match);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'cricket_format' => ['sometimes', 'string', Rule::in(CricketFormatEnum::values())],
            'overs' => ['sometimes', 'integer', 'min:1', 'max:255'],
            'players_per_side' => ['sometimes', 'integer', 'min:2', 'max:20'],
            // Reassign a side's team before toss. Semantics (team_id vs name, both-empty
            // rejection) mirror StoreQuickMatchRequest and are enforced by
            // QuickMatchService::resolveTeam() — kept in one place, not duplicated here.
            'home' => ['sometimes', 'array'],
            'home.team_id' => ['sometimes', 'nullable', 'integer', 'exists:teams,id'],
            'home.name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'away' => ['sometimes', 'array'],
            'away.team_id' => ['sometimes', 'nullable', 'integer', 'exists:teams,id'],
            'away.name' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
