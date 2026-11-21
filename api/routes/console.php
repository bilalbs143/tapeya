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

Schedule::command('posts:purge-expired-originals')->dailyAt('04:30')->withoutOverlapping();

Schedule::command('posts:flush-view-counters')->everyMinute()->withoutOverlapping();

Schedule::command('posts:process-auto-engagement')->everyTenMinutes()->withoutOverlapping();

Schedule::command('posts:flush-auto-like-digests')->everyTenMinutes()->withoutOverlapping();

// Sweep any leftover digests that never crossed the 30-minute window cleanly.
Schedule::command('posts:flush-auto-like-digests --force')->dailyAt('23:55')->withoutOverlapping();

Schedule::command('posts:process-auto-comments')->everyThirtyMinutes()->withoutOverlapping(25);

Schedule::command('ads:reconcile-flights')->everyMinute()->withoutOverlapping()->runInBackground();

Schedule::command('ads:rollup-stats')->hourly()->withoutOverlapping();

Schedule::command('ads:purge-expired-events')->dailyAt('04:45')->withoutOverlapping();
