<?php

namespace App\Http\Requests\Admin\Event;

use App\Enums\Common\StatusEnum;
use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\EventTypeEnum;
use App\Enums\Event\MatchTimingEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEventRequest extends FormRequest
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
            'contact_person_name' => ['required', 'string', 'max:255'],
            'contact_phone' => ['required', 'string', 'regex:/^\+[1-9]\d{6,}$/', 'max:30'],
            'event_name' => ['required', 'string', 'max:255'],
            'event_type' => ['required', Rule::enum(EventTypeEnum::class)],
            'cricket_format' => ['required', Rule::enum(CricketFormatEnum::class)],
            'venue_name' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'number_of_matches' => ['required', 'integer', 'min:1', 'max:1000'],
            'number_of_teams' => ['required', 'integer', 'min:1', 'max:500'],
            'expected_players_count' => ['required', 'integer', 'min:1', 'max:10000'],
            'country' => ['required', 'string', 'max:100'],
            'city' => ['required', 'string', 'max:100'],
            'match_timings' => ['required', Rule::enum(MatchTimingEnum::class)],
            'status' => ['required', Rule::enum(StatusEnum::class)],
            'display_image' => ['nullable', 'image', 'min:1', 'max:5120'],
            'cover_image' => ['nullable', 'image', 'min:1', 'max:5120'],
        ];
    }
}
