<?php

use App\Models\MatchStream;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function (User $user, int|string $id) {
    return (int) $user->id === (int) $id;
});

/*
| Shared admin inbox (System user DB notifications). Subscribers: admin Sanctum token (auth:api).
*/
Broadcast::channel('backoffice.notifications', function (User $user) {
    return $user->canAccessBackofficeApi();
});

/*
 * Public match graphics channel — no auth required.
 * Used by the graphics page (OBS/vMix browser source) to receive live graphic
 * command updates via Reverb without a user session.
 * The channel name carries the match id, limiting blast radius per fixture.
 */
Broadcast::channel('match.{matchId}.graphics', function () {
    return true;
});

/*
 * Private live-scoring channel — auth:api required.
 * Broadcasts MatchStateUpdated after every ball mutation so all clients
 * (scoring app, scorecard viewer, backoffice) stay in sync without polling.
 * Any authenticated user may subscribe; only the scoring API writes to it.
 */
Broadcast::channel('match.{matchId}.scoring', function (User $user, int|string $matchId) {
    return TournamentMatch::find((int) $matchId) !== null;
});

/*
 * Public live-stream chat channel — no WebSocket auth required.
 * Comments are sent via authenticated HTTP POST; receiving is unrestricted.
 */
Broadcast::channel('live-stream.{streamId}.chat', fn () => true);

/*
 * Presence channel — live broadcast viewer count.
 * Separate from chat; requires auth:api at WebSocket handshake.
 * Only while the stream is live or starting.
 */
Broadcast::channel('live-stream.{streamId}.presence', function (User $user, int|string $streamId) {
    $stream = MatchStream::query()->find((int) $streamId);

    if (! $stream || ! in_array($stream->status, ['live', 'starting'], true)) {
        return false;
    }

    return [
        'id' => $user->id,
        'name' => $user->name ?: ($user->nickname ?: 'Viewer'),
    ];
});
