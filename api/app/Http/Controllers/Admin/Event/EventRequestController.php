<?php

namespace App\Http\Controllers\Admin\Event;

use App\Http\Controllers\Admin\BaseAdminController;
use App\Http\Requests\Admin\Event\UpdateEventRequestRequest;
use App\Http\Resources\Admin\Event\EventRequestResource;
use App\Models\Event\EventRequest;
use Illuminate\Http\JsonResponse;

class EventRequestController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(EventRequest::class, EventRequestResource::class, 'event request');
    }

    protected function baseQuery()
    {
        return EventRequest::query()->with('user');
    }

    public function show(EventRequest $eventRequest): JsonResponse
    {
        return $this->_show($eventRequest);
    }

    public function update(UpdateEventRequestRequest $request, EventRequest $eventRequest): JsonResponse
    {
        return $this->_patch($request, $eventRequest, 'Event request updated.');
    }
}
