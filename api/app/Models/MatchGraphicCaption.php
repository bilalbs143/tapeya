<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchGraphicCaption extends BaseModel
{
    protected $fillable = [
        'match_graphic_session_id',
        'title',
        'description',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(MatchGraphicSession::class, 'match_graphic_session_id');
    }
}
