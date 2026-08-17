<?php

namespace App\Models;

/**
 * Domain alias for {@see TournamentMatch}. The table is `matches`.
 * Use this name in new Quick Match code; Eloquent identity stays TournamentMatch.
 */
class_alias(TournamentMatch::class, CricketMatch::class);
