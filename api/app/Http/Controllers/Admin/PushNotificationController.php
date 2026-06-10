<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Push\NotificationEventEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Push\SendPushNotificationRequest;
use App\Http\Resources\Admin\PushNotificationLogResource;
use App\Models\PushNotificationLog;
use App\Services\Push\PushNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Auth;
use Spatie\QueryBuilder\QueryBuilder;

class PushNotificationController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly PushNotificationService $pushService,
    ) {}

    public function index(): AnonymousResourceCollection
    {
        $query = QueryBuilder::for(PushNotificationLog::class)
            ->allowedFilters(PushNotificationLog::getFilters())
            ->allowedSorts(PushNotificationLog::getSorts())
            ->defaultSort('-created_at')
            ->with(['targetUser:id,name', 'sentByUser:id,name']);

        return PushNotificationLogResource::collection($this->paginateOrAll($query));
    }

    public function show(PushNotificationLog $pushNotificationLog): JsonResponse
    {
        $pushNotificationLog->load(['targetUser:id,name', 'sentByUser:id,name']);

        return $this->success(new PushNotificationLogResource($pushNotificationLog));
    }

    public function send(SendPushNotificationRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $log = $this->pushService->dispatch(
            NotificationEventEnum::MANUAL_BROADCAST,
            [
                'title' => $validated['title'],
                'body' => $validated['body'],
            ],
            userId: null,
            imageUrl: $validated['image_url'] ?? null,
            sentByUserId: Auth::id(),
        );

        $log->load(['sentByUser:id,name']);

        return $this->success(
            new PushNotificationLogResource($log),
            'Push notification queued for delivery.',
            'CREATED'
        );
    }
}
