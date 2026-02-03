<?php

namespace App\Jobs\ResultCards;

use App\Models\Transaction;
use App\Utils\Services\Companies\AntechipService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GetAntechipResultCards implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 15;

    public $timeout = 120;

    public $failOnTimeout = true;

    /**
     * Create a new job instance.
     */
    public function __construct(public Transaction $transaction) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            (new AntechipService)->saveResultCards($this->transaction);
        } catch (Exception $e) {
            $this->release(now()->addMinutes(5));
        }
    }
}
