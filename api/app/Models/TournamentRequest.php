<?php

namespace App\Models;

use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\MatchTimingEnum;
use App\Enums\Tournament\TournamentRequestStatusEnum;
use App\Enums\Tournament\TournamentTypeEnum;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\QueryBuilder\AllowedFilter;

class TournamentRequest extends BaseModel
{
    protected $table = 'tournament_requests';

    protected $fillable = [
        'user_id',
        'contact_person_name',
        'contact_phone',
        'tournament_name',
        'short_name',
        'tournament_type',
        'cricket_format',
        'venue_name',
        'start_date',
        'end_date',
        'number_of_teams',
        'number_of_groups',
        'country',
        'city',
        'match_timings',
        'status',
        'prize',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tournament_type' => TournamentTypeEnum::class,
            'cricket_format' => CricketFormatEnum::class,
            'match_timings' => MatchTimingEnum::class,
            'status' => TournamentRequestStatusEnum::class,
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Free-search scope: proposed tournament name, contact person's name, contact phone
     * (digits), or the requesting account's name/nickname/email/phone (delegates to
     * {@see User::scopeSearch()}, already eager-loaded via `with('user')`).
     */
    public function scopeSearch(Builder $query, ?string $value): void
    {
        if ($value === null || $value === '') {
            return;
        }
        $term = '%'.addcslashes(mb_strtolower($value), '%_\\').'%';
        $digits = preg_replace('/\D/', '', $value);
        $phoneLike = $digits !== '' ? '%'.$digits.'%' : null;
        $userIds = User::query()->select('id')->search($value)->pluck('id');

        $query->where(function (Builder $q) use ($term, $phoneLike, $userIds): void {
            $q->whereRaw('LOWER(tournament_name) LIKE ?', [$term])
                ->orWhereRaw('LOWER(contact_person_name) LIKE ?', [$term]);
            if ($phoneLike !== null) {
                $q->orWhereRaw("REGEXP_REPLACE(COALESCE(contact_phone, ''), '[^0-9]', '', 'g') LIKE ?", [$phoneLike]);
            }
            if ($userIds->isNotEmpty()) {
                $q->orWhereIn('user_id', $userIds);
            }
        });
    }

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return [
            AllowedFilter::exact('id'),
            AllowedFilter::exact('user_id'),
            AllowedFilter::exact('status'),
            AllowedFilter::exact('tournament_type'),
            'contact_phone',
            'city',
            AllowedFilter::scope('search'),
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return ['id', 'tournament_name', 'start_date', 'status', 'created_at', 'updated_at'];
    }
}
