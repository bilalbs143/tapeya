<?php

use App\Providers\AppServiceProvider;
use App\Providers\EventServiceProvider;
use App\Providers\MacroServiceProvider;
use App\Providers\StreamingServiceProvider;

return [
    AppServiceProvider::class,
    EventServiceProvider::class,
    MacroServiceProvider::class,
    StreamingServiceProvider::class,
];
