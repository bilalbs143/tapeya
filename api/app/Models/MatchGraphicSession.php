<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MatchGraphicSession extends BaseModel
{
    protected $fillable = [
        'match_id',
        'graphic_theme_id',
        'config',
        'context',
        'pending_players',
        'active_command_id',
        'created_by',
        'updated_by',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'config' => 'array',
            'context' => 'array',
            'pending_players' => 'array',
        ];
    }

    public function match(): BelongsTo
    {
        return $this->belongsTo(TournamentMatch::class, 'match_id');
    }

    public function theme(): BelongsTo
    {
        return $this->belongsTo(GraphicTheme::class, 'graphic_theme_id');
    }

    public function activeCommand(): BelongsTo
    {
        return $this->belongsTo(MatchGraphicCommand::class, 'active_command_id');
    }

    public function commands(): HasMany
    {
        return $this->hasMany(MatchGraphicCommand::class, 'match_graphic_session_id')
            ->orderByDesc('id');
    }

    public function captions(): HasMany
    {
        return $this->hasMany(MatchGraphicCaption::class, 'match_graphic_session_id')
            ->orderByDesc('id');
    }
}
