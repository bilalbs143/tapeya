<?php

namespace App\Http\Requests\Admin\Event;

use App\Enums\Common\StatusEnum;
use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\EventTypeEnum;
use App\Enums\Event\MatchTimingEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEventRequest extends FormRequest
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
            'contact_person_name' => ['sometimes', 'string', 'max:255'],
            'contact_phone' => ['sometimes', 'string', 'regex:/^\+[1-9]\d{6,}$/', 'max:30'],
            'event_name' => ['sometimes', 'string', 'max:255'],
            'event_type' => ['sometimes', Rule::enum(EventTypeEnum::class)],
            'cricket_format' => ['sometimes', Rule::enum(CricketFormatEnum::class)],
            'venue_name' => ['sometimes', 'string', 'max:255'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date', 'after_or_equal:start_date'],
            'number_of_matches' => ['sometimes', 'integer', 'min:1', 'max:1000'],
            'number_of_teams' => ['sometimes', 'integer', 'min:1', 'max:500'],
            'expected_players_count' => ['sometimes', 'integer', 'min:1', 'max:10000'],
            'country' => ['sometimes', 'required', 'string', 'max:100'],
            'city' => ['sometimes', 'string', 'max:100'],
            'match_timings' => ['sometimes', Rule::enum(MatchTimingEnum::class)],
            'status' => ['sometimes', Rule::enum(StatusEnum::class)],
            'display_image' => ['nullable', 'image', 'min:1', 'max:5120'],
            'cover_image' => ['nullable', 'image', 'min:1', 'max:5120'],
        ];
    }
}
