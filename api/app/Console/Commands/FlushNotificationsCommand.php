<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FlushNotificationsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:flush
                            {--force : Skip confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete all rows from the notifications table';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if (! $this->option('force') && ! $this->confirm('This will delete all notifications. Continue?')) {
            return self::FAILURE;
        }

        $count = DB::table('notifications')->count();
        DB::table('notifications')->delete();

        $this->info("Flushed {$count} notification(s).");

        return self::SUCCESS;
    }
}
