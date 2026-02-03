<?php

namespace App\Http\Middleware;

use App\Models\BlacklistedIp;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyBlacklistedIp
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (in_array($request->route()->uri(), BlacklistedIp::whitelistedRoutes())) {
            return $next($request);
        }

        if (BlacklistedIp::isBlacklisted()) {
            return response()->forbidden();
        }

        return $next($request);
    }
}
