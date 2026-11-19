<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdAuditLog extends BaseModel
{
    public $timestamps = false;

    protected $table = 'ad_audit_logs';

    protected $fillable = [
        'actor_admin_id',
        'entity_type',
        'entity_id',
        'action',
        'before',
        'after',
        'created_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'before' => 'array',
            'after' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function actorAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_admin_id');
    }
}
