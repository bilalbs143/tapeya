<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchBreak extends BaseModel
{
    protected $table = 'match_breaks';

    protected $fillable = [
        'match_id',
        'innings_id',
        'break_type',
        'notes',
        'started_at',
        'ended_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }

    public function match(): BelongsTo
    {
        return $this->belongsTo(TournamentMatch::class, 'match_id');
    }

    public function innings(): BelongsTo
    {
        return $this->belongsTo(Innings::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
