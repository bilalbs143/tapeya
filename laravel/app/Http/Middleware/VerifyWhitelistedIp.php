<?php

namespace App\Http\Middleware;

use App\Models\WhitelistedIp;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyWhitelistedIp
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);

        if (in_array($request->route()->uri(), WhitelistedIp::whitelistedRoutes())) {
            return $next($request);
        }

        if ($request->user()) {
            if (! $request->user()->isAdmin() || WhitelistedIp::isWhitelisted()) {
                return $next($request);
            }
        }

        return response()->forbidden();
    }
}
