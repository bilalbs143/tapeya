<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Highlight\HighlightVideoSourceEnum;
use App\Http\Requests\Admin\Highlight\StoreHighlightRequest;
use App\Http\Requests\Admin\Highlight\UpdateHighlightRequest;
use App\Http\Resources\Admin\HighlightResource;
use App\Models\Highlight;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class HighlightController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(Highlight::class, HighlightResource::class, 'highlight');
    }

    protected function baseQuery()
    {
        return Highlight::query()->with('tournament:id,tournament_name');
    }

    public function store(StoreHighlightRequest $request): JsonResponse
    {
        $data = $request->validated();
        $record = $this->model->create($data);
        $record = $this->refresh($record);

        return $this->success(new HighlightResource($record), 'Highlight created.', 'CREATED');
    }

    public function show(Highlight $highlight): JsonResponse
    {
        return $this->_show($highlight);
    }

    public function update(UpdateHighlightRequest $request, Highlight $highlight): JsonResponse
    {
        $validated = $request->validated();
        $newSource = $validated['video_source'] ?? null;

        if ($newSource === HighlightVideoSourceEnum::YOUTUBE->value
            && $highlight->video_source === HighlightVideoSourceEnum::UPLOAD) {
            $this->deleteStoredVideo($highlight);
        }

        return $this->_patch($request, $highlight, dataMapper: function (array &$data) use ($newSource, $highlight) {
            if ($newSource === HighlightVideoSourceEnum::UPLOAD->value
                && $highlight->video_source === HighlightVideoSourceEnum::YOUTUBE) {
                $data['video'] = null;
            }
        });
    }

    public function destroy(Highlight $highlight): JsonResponse
    {
        $highlight = $this->refresh($highlight);

        $disk = config('filesystems.media_disk');

        $thumbnail = $highlight->getRawOriginal('thumbnail');
        if ($thumbnail) {
            Storage::disk($disk)->delete($thumbnail);
        }

        if ($highlight->video_source === HighlightVideoSourceEnum::UPLOAD) {
            $video = $highlight->getRawOriginal('video');
            if ($video) {
                Storage::disk($disk)->delete($video);
            }
        }

        $highlight->delete();

        return $this->noContent();
    }

    private function deleteStoredVideo(Highlight $highlight): void
    {
        if ($highlight->video_source !== HighlightVideoSourceEnum::UPLOAD) {
            return;
        }

        $path = $highlight->getRawOriginal('video');

        if ($path) {
            Storage::disk(config('filesystems.media_disk'))->delete($path);
        }
    }
}
