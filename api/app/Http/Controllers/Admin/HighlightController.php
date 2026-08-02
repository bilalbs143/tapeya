<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Highlight\HighlightVideoSourceEnum;
use App\Http\Requests\Admin\Highlight\StoreHighlightRequest;
use App\Http\Requests\Admin\Highlight\UpdateHighlightRequest;
use App\Http\Resources\Admin\HighlightResource;
use App\Models\Highlight;
use App\Support\Media\MediaDisk;
use Illuminate\Http\JsonResponse;

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

        MediaDisk::delete($highlight->getRawOriginal('thumbnail'));

        if ($highlight->video_source === HighlightVideoSourceEnum::UPLOAD) {
            MediaDisk::delete($highlight->getRawOriginal('video'));
        }

        $highlight->delete();

        return $this->noContent();
    }

    private function deleteStoredVideo(Highlight $highlight): void
    {
        if ($highlight->video_source !== HighlightVideoSourceEnum::UPLOAD) {
            return;
        }

        MediaDisk::delete($highlight->getRawOriginal('video'));
    }
}
