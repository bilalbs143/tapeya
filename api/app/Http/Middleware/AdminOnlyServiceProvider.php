<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Configuration\Middleware;

class AdminOnlyServiceProvider
{
    public static function register(Middleware $middleware): void
    {
        $middleware->alias([
            'admin.only' => AdminOnly::class,
            'admin.permission' => EnsureAdminPermission::class,
        ]);
    }
}
