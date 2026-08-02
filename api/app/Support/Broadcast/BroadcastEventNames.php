<?php

namespace App\Support\Broadcast;

use App\Events\Broadcast\Admin\BroadcastConcurrencyAlertBroadcast;
use App\Events\Broadcast\Admin\TournamentRequestSubmittedBroadcast;
use App\Events\Broadcast\Admin\UserRegisteredBroadcast;
use App\Events\Broadcast\Admin\YouTubeQuotaAlertBroadcast;
use App\Events\Broadcast\User\OrderPlacedBroadcast;
use App\Events\Broadcast\User\OrderStatusUpdatedBroadcast;
use App\Events\Broadcast\User\PostEngagementBroadcast;

/**
 * Laravel `broadcastAs()` names. Echo listens with a leading dot (e.g. `.user.order.placed`).
 *
 * One constant per domain event. Payload shape is consistent: `id`, `notification_type`, `data`.
 *
 * @see OrderPlacedBroadcast
 * @see OrderStatusUpdatedBroadcast
 * @see PostEngagementBroadcast
 * @see \App\Events\Broadcast\Admin\OrderPlacedBroadcast
 * @see TournamentRequestSubmittedBroadcast
 * @see UserRegisteredBroadcast
 * @see BroadcastConcurrencyAlertBroadcast
 * @see YouTubeQuotaAlertBroadcast
 */
final class BroadcastEventNames
{
    public const USER_ORDER_PLACED = 'user.order.placed';

    public const USER_ORDER_STATUS_UPDATED = 'user.order.status_updated';

    public const USER_POST_ENGAGEMENT = 'user.post.engagement';

    public const ADMIN_ORDER_PLACED = 'admin.order.placed';

    public const ADMIN_TOURNAMENT_REQUEST_SUBMITTED = 'admin.tournament_request.submitted';

    public const ADMIN_USER_REGISTERED = 'admin.user.registered';

    public const ADMIN_BROADCAST_CONCURRENCY_HIGH = 'admin.broadcast_concurrency.high';

    public const ADMIN_YOUTUBE_QUOTA_HIGH = 'admin.youtube_quota.high';

    /** Fired on public channel `match.{matchId}.graphics` when the active graphic changes. */
    public const MATCH_GRAPHIC_ACTIVATED = 'match.graphic.activated';
}
