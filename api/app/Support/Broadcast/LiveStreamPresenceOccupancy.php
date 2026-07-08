<?php

namespace App\Support\Broadcast;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Read presence membership counts from Reverb/Pusher HTTP without joining channels.
 * Used by admin tooling so staff don't inflate the public viewer count.
 */
class LiveStreamPresenceOccupancy
{
    /**
     * @param  iterable<int|string>  $streamIds
     * @return array<int, int> stream id => member count
     */
    public function countsFor(iterable $streamIds): array
    {
        $ids = collect($streamIds)
            ->map(fn ($id) => (int) $id)
            ->filter(fn (int $id) => $id > 0)
            ->unique()
            ->values();

        $counts = array_fill_keys($ids->all(), 0);

        if ($ids->isEmpty() || config('broadcasting.default') !== 'reverb') {
            return $counts;
        }

        try {
            $pusher = Broadcast::driver('reverb')->getPusher();
        } catch (Throwable $e) {
            Log::debug('Live stream presence occupancy unavailable.', ['error' => $e->getMessage()]);

            return $counts;
        }

        foreach ($ids as $streamId) {
            try {
                // Echo join('live-stream.{id}.presence') → presence-live-stream.{id}.presence
                $response = $pusher->getPresenceUsers("presence-live-stream.{$streamId}.presence");
                $users = $response->users ?? [];
                $counts[$streamId] = is_countable($users) ? count($users) : 0;
            } catch (Throwable) {
                // Empty / unknown channel — treat as zero watchers.
                $counts[$streamId] = 0;
            }
        }

        return $counts;
    }
}
