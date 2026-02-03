<?php

namespace App\Http\Middleware;

use App\Utils\Services\Utils;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetRealClientIp
{
    /**
     * Handle an incoming request.
     * Sets X-Forwarded-For from the most reliable IP header so request()->ip() works correctly.
     * Handles various proxy scenarios: Cloudflare, AWS ELB, Nginx, and other proxies.
     *
     * Uses Utils::getClientIp() to avoid code duplication.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get the real client IP using the centralized Utils method
        $realIp = Utils::getClientIp();

        // If we found a real client IP from a trusted header, set it as X-Forwarded-For
        // This ensures request()->ip() returns the real client IP throughout the application
        // Only set if it's different from what's already in X-Forwarded-For to avoid overwriting
        if ($realIp && $realIp !== $request->ip()) {
            $request->headers->set('X-Forwarded-For', $realIp);
        }

        return $next($request);
    }
}
