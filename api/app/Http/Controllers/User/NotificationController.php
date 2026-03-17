<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\NotificationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    use BaseControllerTrait;

    /**
     * List authenticated user's notifications.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $perPage = (int) $request->input('per_page', 15);
        $perPage = $perPage >= 1 && $perPage <= 100 ? $perPage : 15;

        $query = $user->notifications()->orderByDesc('created_at');

        $paginator = $query->paginate($perPage);
        $unreadCount = $user->unreadNotifications()->count();

        return NotificationResource::collection($paginator)->additional(['meta' => ['unread_count' => $unreadCount]]);
    }

    /**
     * Mark a notification as read for the authenticated user.
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        /** @var DatabaseNotification $notification */
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return $this->success(new NotificationResource($notification->fresh()), 'Notification marked as read.');
    }

    /**
     * Mark all notifications as read for the authenticated user.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications()->each(function (DatabaseNotification $n) {
            $n->markAsRead();
        });

        return $this->success(null, 'All notifications marked as read.');
    }

    /**
     * Delete all notifications for the authenticated user.
     */
    public function flush(Request $request): JsonResponse
    {
        $request->user()->notifications()->delete();

        return $this->success(null, 'All notifications have been deleted.');
    }
}
