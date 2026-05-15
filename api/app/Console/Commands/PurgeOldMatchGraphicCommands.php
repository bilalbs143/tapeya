<?php

namespace App\Console\Commands;

use App\Services\Broadcast\MatchGraphicCommandHistoryService;
use Illuminate\Console\Command;

class PurgeOldMatchGraphicCommands extends Command
{
    protected $signature = 'match-graphic:purge-old-commands
                            {--hours=24 : Delete commands whose created_at is older than this many hours}';

    protected $description = 'Delete match graphic commands older than the retention window (default 24h).';

    public function handle(MatchGraphicCommandHistoryService $history): int
    {
        $hours = max(1, (int) $this->option('hours'));
        $cutoff = now()->subHours($hours);

        $deleted = $history->deleteCommandsCreatedBefore($cutoff);

        $this->info("Deleted {$deleted} match_graphic_commands row(s) created before {$cutoff->toIso8601String()}.");

        return self::SUCCESS;
    }
}
