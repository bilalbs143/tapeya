<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchNote extends BaseModel
{
    protected $table = 'match_notes';

    protected $fillable = [
        'match_id',
        'user_id',
        'body',
    ];

    public function match(): BelongsTo
    {
        return $this->belongsTo(TournamentMatch::class, 'match_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
