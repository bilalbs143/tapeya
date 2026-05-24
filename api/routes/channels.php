<?php

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
 * Used by the overlay page (OBS/vMix browser source) to receive live graphic
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
 * Public match chat channel — no WebSocket auth required.
 * Comments are sent via authenticated HTTP POST; receiving is unrestricted.
 * Isolated from scoring, stream-status, and graphics channels.
 */
Broadcast::channel('match.{matchId}.chat', function () {
    return true;
});

/*
 * Presence channel — live broadcast viewer count (Phase 2).
 * Separate from chat; requires auth:api at WebSocket handshake.
 * Only while the match stream is live or starting.
 */
Broadcast::channel('match.{matchId}.presence', function (User $user, int|string $matchId) {
    $match = TournamentMatch::query()
        ->with('stream')
        ->find((int) $matchId);

    if (! $match?->stream || ! in_array($match->stream->status, ['live', 'starting'], true)) {
        return false;
    }

    return [
        'id' => $user->id,
        'name' => $user->name ?: ($user->nickname ?: 'Viewer'),
    ];
});
