<?php

namespace App\Providers;

use App\Events\Admin\Agent\AgentCreated;
use App\Events\Admin\Agent\AgentDeleted;
use App\Events\Admin\Agent\AgentPasswordUpdated;
use App\Events\Admin\Agent\AgentUpdated;
use App\Events\Admin\CustomerInquiry\CustomerInquiryReplied;
use App\Events\Admin\ExchangeRequest\ExchangeRequestApproved;
use App\Events\Admin\ExchangeRequest\ExchangeRequestRejected;
use App\Events\Auth\LoggedIn;
use App\Events\Auth\UserRegistered;
use App\Events\User\CustomerInquiry\NewCustomerInquiry;
use App\Events\User\ExchangeRequest\NewExchangeRequest;
use App\Events\User\QuickAccountInquiry\NewQuickAccountInquiry;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Event::listen(KillAuthSession::class);
        // Event::listen(UserUpdated::class);

        Event::listen(Registered::class, \Illuminate\Auth\Listeners\SendEmailVerificationNotification::class);
        Event::listen(LoggedIn::class, \App\Listeners\Auth\SendLoginNotification::class);
        Event::listen(UserRegistered::class, \App\Listeners\Auth\SendUserRegisteredNotification::class);
        Event::listen(AgentCreated::class, \App\Listeners\Admin\Agent\SendAgentCreatedNotification::class);
        Event::listen(AgentUpdated::class, \App\Listeners\Admin\Agent\SendAgentUpdatedNotification::class);
        Event::listen(AgentPasswordUpdated::class, \App\Listeners\Admin\Agent\SendAgentPasswordUpdatedNotification::class);
        Event::listen(AgentDeleted::class, \App\Listeners\Admin\Agent\SendAgentDeletedNotification::class);
        Event::listen(NewExchangeRequest::class, \App\Listeners\Admin\ExchangeRequest\SendNewExchangeRequestNotification::class);
        Event::listen(ExchangeRequestApproved::class, \App\Listeners\Admin\ExchangeRequest\SendExchangeRequestApprovedNotification::class);
        Event::listen(ExchangeRequestRejected::class, \App\Listeners\Admin\ExchangeRequest\SendExchangeRequestRejectedNotification::class);
        Event::listen(NewQuickAccountInquiry::class, \App\Listeners\Admin\QuickAccountInquiry\SendNewQuickAccountInquiryNotification::class);
        Event::listen(NewCustomerInquiry::class, \App\Listeners\Admin\CustomerInquiry\SendNewCustomerInquiryNotification::class);
        Event::listen(CustomerInquiryReplied::class, \App\Listeners\Admin\CustomerInquiry\SendCustomerInquiryRepliedNotification::class);
    }
}
