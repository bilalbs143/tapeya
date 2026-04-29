<?php

namespace App\Http\Middleware;

use App\Enums\User\RoleGuardEnum;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Requires an admin-guard permission for type=user backoffice staff.
 * {@see UserTypeEnum::ADMINISTRATOR} accounts bypass (full platform access).
 */
class EnsureAdminPermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();
        $guard = RoleGuardEnum::ADMIN->value;

        if (! $user || $user->isSystem() || ! $user->canAccessBackofficeApi()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($user->isAdmin()) {
            return $next($request);
        }

        if ($user->hasPermissionTo($permission, $guard)) {
            return $next($request);
        }

        return response()->json(['message' => 'Forbidden'], 403);
    }
}
