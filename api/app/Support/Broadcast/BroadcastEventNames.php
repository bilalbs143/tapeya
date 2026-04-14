<?php

namespace App\Support\Broadcast;

/**
 * Laravel `broadcastAs()` names. Echo listens with a leading dot (e.g. `.user.order.placed`).
 *
 * One constant per domain event. Payload shape is consistent: `id`, `notification_type`, `data`.
 *
 * @see \App\Events\Broadcast\User\OrderPlacedBroadcast
 * @see \App\Events\Broadcast\User\OrderStatusUpdatedBroadcast
 * @see \App\Events\Broadcast\Admin\OrderPlacedBroadcast
 * @see \App\Events\Broadcast\Admin\TournamentRequestSubmittedBroadcast
 * @see \App\Events\Broadcast\Admin\UserRegisteredBroadcast
 */
final class BroadcastEventNames
{
    public const USER_ORDER_PLACED = 'user.order.placed';

    public const USER_ORDER_STATUS_UPDATED = 'user.order.status_updated';

    public const ADMIN_ORDER_PLACED = 'admin.order.placed';

    public const ADMIN_TOURNAMENT_REQUEST_SUBMITTED = 'admin.tournament_request.submitted';

    public const ADMIN_USER_REGISTERED = 'admin.user.registered';
}
