<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Push\UpdatePushNotificationTemplateRequest;
use App\Http\Resources\Admin\PushNotificationTemplateResource;
use App\Models\PushNotificationTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\QueryBuilder;

class PushNotificationTemplateController extends Controller
{
    use BaseControllerTrait;

    public function index(): AnonymousResourceCollection
    {
        $query = QueryBuilder::for(PushNotificationTemplate::class)
            ->allowedFilters(PushNotificationTemplate::getFilters())
            ->allowedSorts(PushNotificationTemplate::getSorts())
            ->defaultSort('key');

        return PushNotificationTemplateResource::collection($this->paginateOrAll($query));
    }

    public function show(PushNotificationTemplate $pushNotificationTemplate): JsonResponse
    {
        return $this->success(new PushNotificationTemplateResource($pushNotificationTemplate));
    }

    public function update(
        UpdatePushNotificationTemplateRequest $request,
        PushNotificationTemplate $pushNotificationTemplate,
    ): JsonResponse {
        if ($pushNotificationTemplate->key === 'manual_broadcast') {
            return $this->failure(
                'The manual broadcast template cannot be edited. Admin sends use free-form title and body.',
                'BAD_REQUEST'
            );
        }

        $pushNotificationTemplate->update($request->validated());

        return $this->success(
            new PushNotificationTemplateResource($pushNotificationTemplate->fresh()),
            'Push notification template updated.'
        );
    }
}
