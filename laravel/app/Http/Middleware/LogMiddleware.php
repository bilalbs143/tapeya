<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        info('Request', [
            'path' => $request->path(),
            'url' => $request->url(),
            'payload' => $request->all(),
            'ip' => $request->ip(),
            'headers' => $request->headers->all(),
        ]);

        $response = $next($request);

        info('Response', [
            'response' => $response->getContent(),
        ]);

        return $response;
    }
}
