<?php

namespace App\Jobs\Auth;

use App\Models\AuthenticationLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Laravel\Sanctum\PersonalAccessToken;

class KillAllExpiredSessions implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $sessionIds = PersonalAccessToken::where('expires_at', '<', now())->pluck('id')->toArray();

        AuthenticationLog::whereIn('oauth_access_token_id', $sessionIds)->update([
            'logout_at' => now(),
        ]);

        // Delete expired tokens
        PersonalAccessToken::where('expires_at', '<', now())->delete();
    }
}
