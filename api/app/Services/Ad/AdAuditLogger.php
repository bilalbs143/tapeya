<?php

namespace App\Services\Ad;

use App\Models\AdAuditLog;
use App\Models\User;

class AdAuditLogger
{
    /**
     * @param  array<string, mixed>|null  $before
     * @param  array<string, mixed>|null  $after
     */
    public function log(
        string $entityType,
        int $entityId,
        string $action,
        ?User $actor = null,
        ?array $before = null,
        ?array $after = null,
    ): AdAuditLog {
        return AdAuditLog::query()->create([
            'actor_admin_id' => $actor?->id,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'action' => $action,
            'before' => $before,
            'after' => $after,
            'created_at' => now(),
        ]);
    }
}
