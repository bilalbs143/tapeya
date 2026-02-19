<?php

namespace App\Models\Event;

use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\EventRequestStatusEnum;
use App\Enums\Event\EventTypeEnum;
use App\Enums\Event\MatchTimingEnum;
use App\Models\BaseModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\QueryBuilder\AllowedFilter;

class EventRequest extends BaseModel
{
    protected $table = 'event_requests';

    protected $fillable = [
        'user_id',
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
        'city',
        'match_timings',
        'status',
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
            'status' => EventRequestStatusEnum::class,
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return ['id', 'user_id', 'status', 'event_type', 'contact_phone', 'city'];
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return ['id', 'event_name', 'start_date', 'status', 'created_at', 'updated_at'];
    }
}
