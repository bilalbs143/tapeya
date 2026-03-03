<?php

namespace App\Events;

use App\Models\TournamentRequest;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TournamentRequestSubmitted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public TournamentRequest $tournamentRequest
    ) {}
}
