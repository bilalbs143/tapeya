<?php

namespace App\Models;

use App\Enums\Broadcast\GraphicCommandTypeEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchGraphicCommand extends Model
{
    /** Commands are write-once — track creation time only, no updated_at column. */
    public const UPDATED_AT = null;

    protected $fillable = [
        'match_graphic_session_id',
        'command_type',
        'command_key',
        'payload',
        'display_mode',
        'created_by',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'command_type' => GraphicCommandTypeEnum::class,
            'payload' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(MatchGraphicSession::class, 'match_graphic_session_id');
    }
}
