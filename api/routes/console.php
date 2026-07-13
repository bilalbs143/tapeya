<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
 * Graphic controller: drop command rows older than 24h (adjust via --hours on the command).
 * Tune the time if it overlaps with heavy jobs on your host.
 */
Schedule::command('match-graphic:purge-old-commands --hours=24')->dailyAt('03:30');

Schedule::command('push-notifications:purge-old-logs --days=7')->dailyAt('04:00');

Schedule::command('streams:sync')->everyMinute()->withoutOverlapping()->runInBackground();

Schedule::command('broadcasts:end-expired')->everyMinute()->withoutOverlapping()->runInBackground();

Schedule::command('broadcasts:monitor-operations')->everyFifteenMinutes()->withoutOverlapping();
