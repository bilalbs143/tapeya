<?php

namespace App\Http\Middleware;

use App\Enums\User\UserLocaleEnum;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (env('APP_ENV') === 'local') {
            App::setLocale(UserLocaleEnum::en->value);

            return $next($request);
        }

        $locale = $request->user()?->locale ?? $request->header('X-Locale') ?? UserLocaleEnum::ko->value;

        App::setLocale($locale);

        return $next($request);
    }
}
