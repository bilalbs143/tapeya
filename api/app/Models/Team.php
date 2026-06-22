<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\QueryBuilder\AllowedFilter;

class Team extends BaseModel
{
    protected $table = 'teams';

    protected $fillable = [
        'name',
        'logo',
        'code',
        'country',
        'city',
        'user_id',
        'created_by',
    ];

    public function sponsor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Icon / star players for this team (order preserved by pivot insert order).
     */
    public function iconPlayers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'team_icon_players')
            ->orderBy('team_icon_players.id')
            ->withTimestamps();
    }

    /**
     * Full squad/players for this team (team-level squad, not match squad).
     */
    public function players(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'team_user')
            ->orderBy('users.name')
            ->orderBy('users.nickname')
            ->withTimestamps();
    }

    /**
     * Tournaments this team is participating in.
     */
    public function tournaments(): BelongsToMany
    {
        return $this->belongsToMany(Tournament::class, 'tournament_team')
            ->withTimestamps();
    }

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return [
            AllowedFilter::callback('search', function ($query, $value) {
                $term = '%'.addcslashes(mb_strtolower((string) $value), '%_\\').'%';
                $query->where(function ($q) use ($term) {
                    $q->whereRaw('LOWER(name) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(code) LIKE ?', [$term]);
                });
            }),
            AllowedFilter::exact('country'),
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return ['id', 'name', 'code', 'country', 'city', 'created_at', 'updated_at'];
    }
}
