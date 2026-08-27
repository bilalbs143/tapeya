<?php

namespace App\Models;

use App\Enums\Support\SupportMessageStatusEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportMessage extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'phone',
        'message',
        'attachment_path',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => SupportMessageStatusEnum::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
