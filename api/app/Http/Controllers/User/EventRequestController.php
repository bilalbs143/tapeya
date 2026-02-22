<?php

namespace App\Http\Controllers\User;

use App\Enums\Event\EventRequestStatusEnum;
use App\Events\EventRequestSubmitted;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\Event\StoreEventRequestRequest;
use App\Http\Resources\User\Event\EventRequestResource;
use App\Models\Event\EventRequest;
use Illuminate\Http\JsonResponse;

class EventRequestController extends Controller
{
    use BaseControllerTrait;

    /** Submit a new event service request. */
    public function store(StoreEventRequestRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()?->id;
        $data['status'] = EventRequestStatusEnum::PENDING;

        $eventRequest = EventRequest::create($data);
        event(new EventRequestSubmitted($eventRequest));

        return $this->success(
            new EventRequestResource($eventRequest),
            'Event request submitted successfully. Our team will review and contact you shortly.',
            'CREATED'
        );
    }
}
