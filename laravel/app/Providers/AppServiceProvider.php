<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Auth\Events\Login;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        Password::defaults(fn () => Password::min(7));

        Gate::before(function ($user, $ability) {
            if ($user && $user->isAdmin()) {
                return true;
            }

            return null;
        });

        $this->resolveBindings();

        // Override package's listener to use Utils::getClientIp() instead of request()->ip()
        $this->app->booted(function ($app) {
            $dispatcher = $app->make(\Illuminate\Contracts\Events\Dispatcher::class);
            $dispatcher->forget(Login::class);
            $dispatcher->listen(Login::class, \App\Listeners\Auth\LogSuccessfulLogin::class);
        });
    }

    private function resolveBindings()
    {
        $this->paramsPatterns();
        $this->modelBindings();
    }

    private function paramsPatterns()
    {
        Route::pattern('id', '[0-9]+');
    }

    private function modelBindings()
    {
        $this->bindAgent();
        $this->bindMember();
    }

    private function bindAgent()
    {
        Route::pattern('agent', '[0-9]+');

        Route::bind('agent', function (string $value) {
            return User::agent()->findOrFail($value);
        });
    }

    private function bindMember()
    {
        Route::pattern('member', '[0-9]+');

        Route::bind('member', function (string $value) {
            return User::member()->findOrFail($value);
        });
    }
}
