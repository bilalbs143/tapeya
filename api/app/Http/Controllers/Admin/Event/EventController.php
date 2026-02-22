<?php

namespace App\Http\Controllers\Admin\Event;

use App\Events\EventCreated;
use App\Http\Controllers\Admin\BaseAdminController;
use App\Http\Requests\Admin\Event\StoreEventRequest;
use App\Http\Requests\Admin\Event\UpdateEventRequest;
use App\Http\Resources\Admin\Event\EventResource;
use App\Models\Event\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class EventController extends BaseAdminController
{
    private const EVENTS_IMAGE_DIR = 'events';

    public function __construct()
    {
        parent::__construct(Event::class, EventResource::class, 'event');
    }

    protected function baseQuery()
    {
        return Event::query();
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        $data = $request->validated();
        unset($data['display_image'], $data['cover_image']);

        if ($request->hasFile('display_image')) {
            $data['display_image'] = $request->file('display_image')->store(self::EVENTS_IMAGE_DIR, config('filesystems.media_disk'));
        }
        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')->store(self::EVENTS_IMAGE_DIR, config('filesystems.media_disk'));
        }

        $record = $this->model->create($data);
        $record = $this->refresh($record);

        event(new EventCreated($record));

        return $this->success(new EventResource($record), 'Event created.', 'CREATED');
    }

    public function show(Event $event): JsonResponse
    {
        return $this->_show($event);
    }

    public function update(UpdateEventRequest $request, Event $event): JsonResponse
    {
        $data = $request->validated();
        unset($data['display_image'], $data['cover_image']);

        if ($request->hasFile('display_image')) {
            if ($event->getRawOriginal('display_image')) {
                Storage::disk(config('filesystems.media_disk'))->delete($event->getRawOriginal('display_image'));
            }
            $data['display_image'] = $request->file('display_image')->store(self::EVENTS_IMAGE_DIR, config('filesystems.media_disk'));
        }
        if ($request->hasFile('cover_image')) {
            if ($event->getRawOriginal('cover_image')) {
                Storage::disk(config('filesystems.media_disk'))->delete($event->getRawOriginal('cover_image'));
            }
            $data['cover_image'] = $request->file('cover_image')->store(self::EVENTS_IMAGE_DIR, config('filesystems.media_disk'));
        }

        $event = $this->refresh($event);
        $event->update($data);
        $event = $this->refresh($event);

        return $this->success(new EventResource($event), 'Event updated.');
    }

    public function destroy(Event $event): JsonResponse
    {
        $event = $this->refresh($event);
        $disk = Storage::disk(config('filesystems.media_disk'));
        if ($event->display_image) {
            $disk->delete($event->display_image);
        }
        if ($event->cover_image) {
            $disk->delete($event->cover_image);
        }
        $event->delete();

        return $this->noContent();
    }
}
