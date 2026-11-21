<?php

namespace App\Support\Post;

use Illuminate\Database\Eloquent\Builder;

/**
 * Stable 80% actor pool for synthetic engagement — keeps 20% of users unused.
 *
 * Membership: MOD(id, 10) < 8 (ids ending in 8 or 9 are reserved).
 */
final class AutoEngagementUserPool
{
    /** Fraction of users eligible for auto likes/views/comments. */
    public const ELIGIBLE_FRACTION = 0.8;

    /**
     * Constrain a User query to the synthetic-engagement pool.
     *
     * @template TModel of \Illuminate\Database\Eloquent\Model
     *
     * @param  Builder<TModel>  $query
     * @return Builder<TModel>
     */
    /** Reserved remainder band: ids with MOD 8 or 9 stay out of the pool. */
    private const POOL_MODULUS = 10;

    private const POOL_THRESHOLD = 8;

    public static function constrain(Builder $query): Builder
    {
        $column = $query->getModel()->getQualifiedKeyName();

        return $query->whereRaw(
            'MOD('.$column.', ?) < ?',
            [self::POOL_MODULUS, self::POOL_THRESHOLD]
        );
    }

    public static function containsUserId(int $userId): bool
    {
        return $userId > 0 && ($userId % self::POOL_MODULUS) < self::POOL_THRESHOLD;
    }
}
