<?php

namespace App\Providers;

use App\Listeners\BroadcastAdminInboxNotification;
use App\Listeners\BroadcastUserDatabaseNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Notifications\Events\NotificationSent;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     * Laravel discovers listeners in app/Listeners automatically via handle(Event $event) type-hints.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        NotificationSent::class => [
            BroadcastAdminInboxNotification::class,
            BroadcastUserDatabaseNotification::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }
}
