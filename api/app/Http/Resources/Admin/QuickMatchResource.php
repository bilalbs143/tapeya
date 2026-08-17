<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\User\QuickMatchResource as AppQuickMatchResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Backoffice moderation shape. Reuses the app resource, then adds cancel / result fields
 * and drops owner-only client flags that do not apply to staff.
 */
class QuickMatchResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $match = $this->resource;
        $base = (new AppQuickMatchResource($match))->toArray($request);
        unset($base['can_operate'], $base['is_owner']);

        return array_merge($base, [
            'cancel_reason' => $match->cancel_reason,
            'cancel_comments' => $match->cancel_comments,
            'result_summary' => $match->resultSummary(),
        ]);
    }
}
