<?php

namespace App\Models\Event;

use App\Enums\Common\StatusEnum;
use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\EventTypeEnum;
use App\Enums\Event\MatchTimingEnum;
use App\Models\BaseModel;
use Spatie\QueryBuilder\AllowedFilter;

class Event extends BaseModel
{
    protected $table = 'events';

    protected $fillable = [
        'contact_person_name',
        'contact_phone',
        'event_name',
        'event_type',
        'cricket_format',
        'venue_name',
        'start_date',
        'end_date',
        'number_of_matches',
        'number_of_teams',
        'expected_players_count',
        'country',
        'city',
        'match_timings',
        'status',
        'display_image',
        'cover_image',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'event_type' => EventTypeEnum::class,
            'cricket_format' => CricketFormatEnum::class,
            'match_timings' => MatchTimingEnum::class,
            'status' => StatusEnum::class,
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return ['id', 'status', 'event_type', 'contact_phone', 'country', 'city'];
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return ['id', 'event_name', 'start_date', 'status', 'created_at', 'updated_at'];
    }
}
