<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * Explicit mappings are intentionally empty.
     * Listeners under app/Listeners are auto-discovered via handle(Event $event) type-hints.
     * Do not also list discovered listeners here — that registers them twice.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }
}
