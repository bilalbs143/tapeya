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
        'sponsor',
        'icon_players',
        'user_id',
        'created_by',
    ];

    /**
     * App user who owns/manages this team (capability), not the free-text sponsor.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
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

    /** Trim free-text field; empty → null. Comma-separated values are left as typed. */
    public static function normalizeFreeText(mixed $raw): ?string
    {
        if ($raw === null) {
            return null;
        }
        if (is_array($raw)) {
            $parts = [];
            foreach ($raw as $item) {
                if (! is_string($item) && ! is_numeric($item)) {
                    continue;
                }
                $part = trim((string) $item);
                if ($part !== '') {
                    $parts[] = $part;
                }
            }
            $raw = implode(', ', $parts);
        }

        $value = trim((string) $raw);

        return $value === '' ? null : mb_substr($value, 0, 500);
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
                        ->orWhereRaw('LOWER(code) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(COALESCE(sponsor, \'\')) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(COALESCE(icon_players, \'\')) LIKE ?', [$term]);
                });
            }),
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
