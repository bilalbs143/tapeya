<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

/**
 * Bumps users.last_active_at at most once per throttle window per user.
 * Consumer auth:api routes only — do not attach to admin routes.
 */
class TouchLastActive
{
    public const CACHE_KEY_PREFIX = 'user:last_active:';

    public const THROTTLE_SECONDS = 900; // 15 minutes

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if ($user instanceof User) {
            $key = self::CACHE_KEY_PREFIX.$user->getKey();
            if (Cache::add($key, 1, self::THROTTLE_SECONDS)) {
                User::query()->whereKey($user->getKey())->update([
                    'last_active_at' => now(),
                ]);
            }
        }

        return $next($request);
    }
}
