<?php

namespace App\Http\Requests\Admin;

use App\Enums\Common\StatusEnum;
use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\MatchTimingEnum;
use App\Enums\Tournament\TournamentTypeEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTournamentRequest extends FormRequest
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
            'organizer_id' => ['sometimes', 'integer', 'exists:users,id'],
            'tournament_name' => ['sometimes', 'string', 'max:255'],
            'tournament_type' => ['sometimes', Rule::enum(TournamentTypeEnum::class)],
            'cricket_format' => ['sometimes', Rule::enum(CricketFormatEnum::class)],
            'venue_name' => ['sometimes', 'string', 'max:255'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date', 'after_or_equal:start_date'],
            'number_of_teams' => ['sometimes', 'integer', 'min:1', 'max:500'],
            'number_of_groups' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:16'],
            'country' => ['sometimes', 'required', 'string', 'max:100'],
            'city' => ['sometimes', 'string', 'max:100'],
            'match_timings' => ['sometimes', Rule::enum(MatchTimingEnum::class)],
            'status' => ['sometimes', Rule::enum(StatusEnum::class)],
            'display_image' => ['sometimes', 'nullable', 'file', 'image', 'max:5120'],
            'cover_image' => ['sometimes', 'nullable', 'file', 'image', 'max:5120'],
            'prize' => ['nullable', 'string', 'max:255'],
        ];
    }
}
