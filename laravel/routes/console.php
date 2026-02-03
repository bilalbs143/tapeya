<?php

use App\Jobs\Auth\KillAllExpiredSessions;
use App\Jobs\GameSessions\EndOldGameSessions;
use App\Jobs\Losing\ComputeLosing;
use App\Jobs\Rolling\ComputeRolling;
use App\Jobs\Settlements\ComputeSettlements;
use App\Jobs\Settlements\ComputeUserSettlements;
use Illuminate\Support\Facades\Schedule;

// run a scheduler to print quote
Schedule::command('app:test')->everySecond();
Schedule::command('activitylog:clean')->daily();
Schedule::command('requestlog:prune')->daily();
Schedule::command('authentication-log:clear')->daily();
// Pause sync games for now
// Schedule::command('sync:games')->daily();
Schedule::command('sync:currencies')->monthly();
Schedule::command('crypto:process-withdrawals')->everyFiveMinutes();
Schedule::job(new KillAllExpiredSessions)->everyTwoMinutes()->timezone(env('APP_TIMEZONE', 'UTC'));
Schedule::command('app:compute-weekly-loss-bonus')->weekly()->mondays()->at('00:03')->timezone(env('APP_TIMEZONE', 'UTC'));
Schedule::command('promotions:process-weekly-payouts --day=tuesday')->weekly()->tuesdays()->at('00:05')->timezone(env('APP_TIMEZONE', 'UTC'));
Schedule::job(new ComputeRolling)->dailyAt('00:05')->timezone(env('APP_TIMEZONE', 'UTC'));
Schedule::job(new ComputeLosing)->dailyAt('00:10')->timezone(env('APP_TIMEZONE', 'UTC'));
Schedule::job(new ComputeSettlements)->dailyAt('00:15')->timezone(env('APP_TIMEZONE', 'UTC'));
Schedule::job(new ComputeUserSettlements)->dailyAt('00:25')->timezone(env('APP_TIMEZONE', 'UTC'));
Schedule::job(new EndOldGameSessions)->hourly()->timezone(env('APP_TIMEZONE', 'UTC'));
// Schedule::command('qrcode:regenerate-expired')->dailyAt('02:00')->withoutOverlapping();
