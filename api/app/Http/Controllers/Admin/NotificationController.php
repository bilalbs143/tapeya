<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Notification\AdminNotificationTypeEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\NotificationResource;
use App\Utils\Constants\ApiConstants;
use App\Utils\Services\SystemUserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    use BaseControllerTrait;

    /**
     * List admin notifications (shared inbox on System user). All admins see the same feed.
     * Uses NotificationResource and same pagination structure as other admin list endpoints.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $systemUser = SystemUserService::get();
        if (! $systemUser) {
            $emptyPaginator = new LengthAwarePaginator([], 0, 15, 1);

            return NotificationResource::collection($emptyPaginator)->additional(['meta' => ['unread_count' => 0]]);
        }

        $perPage = (int) $request->input('per_page', ApiConstants::PER_PAGE);
        $perPage = $perPage >= 1 && $perPage <= 100 ? $perPage : ApiConstants::PER_PAGE;

        $allowedSortColumns = ['created_at', 'read_at'];
        $sort = $request->input('sort', '-created_at');
        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $column = ltrim($sort, '-');
        if (! in_array($column, $allowedSortColumns, true)) {
            $column = 'created_at';
            $direction = 'desc';
        }

        $query = $systemUser->notifications();
        $query->orderBy($column, $direction);

        if ($request->filled('filter[read]')) {
            $read = $request->input('filter[read]');
            if ($read === '0' || $read === 'unread') {
                $query->whereNull('read_at');
            } elseif ($read === '1' || $read === 'read') {
                $query->whereNotNull('read_at');
            }
        }

        if ($request->filled('filter[type]')) {
            $type = $request->input('filter[type]');
            if (AdminNotificationTypeEnum::tryFrom($type) !== null) {
                $query->whereJsonContains('data->type', $type);
            }
        }

        if ($request->filled('filter[created_after]')) {
            $query->whereDate('created_at', '>=', $request->input('filter[created_after]'));
        }
        if ($request->filled('filter[created_before]')) {
            $query->whereDate('created_at', '<=', $request->input('filter[created_before]'));
        }

        $paginator = $query->paginate($perPage);
        $unreadCount = $systemUser->unreadNotifications()->count();

        return NotificationResource::collection($paginator)->additional(['meta' => ['unread_count' => $unreadCount]]);
    }

    /**
     * Mark a notification as read. Stores the current admin's user id in read_by.
     */
    public function markAsRead(string $id): JsonResponse
    {
        $systemUser = SystemUserService::get();
        if (! $systemUser) {
            return $this->failure('Notifications not available.', 'NOT_FOUND');
        }

        $notification = $systemUser->notifications()->findOrFail($id);
        $notification->markAsRead();
        $notification->forceFill(['read_by' => Auth::id()])->save();

        return $this->success(new NotificationResource($notification->fresh()), 'Notification marked as read.');
    }

    /**
     * Mark all notifications as read for the System user (shared inbox).
     */
    public function markAllAsRead(): JsonResponse
    {
        $systemUser = SystemUserService::get();
        if (! $systemUser) {
            return $this->failure('Notifications not available.', 'NOT_FOUND');
        }

        $systemUser->unreadNotifications()->update([
            'read_at' => now(),
            'read_by' => Auth::id(),
        ]);

        return $this->success(null, 'All notifications marked as read.');
    }

    /**
     * Delete all notifications (flush shared inbox).
     */
    public function flush(): JsonResponse
    {
        $systemUser = SystemUserService::get();
        if (! $systemUser) {
            return $this->failure('Notifications not available.', 'NOT_FOUND');
        }

        $systemUser->notifications()->delete();

        return $this->success(null, 'All notifications have been deleted.');
    }
}
