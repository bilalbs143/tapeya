<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Drama\DramaVideoSourceEnum;
use App\Http\Requests\Admin\Drama\StoreDramaEpisodeRequest;
use App\Http\Requests\Admin\Drama\UpdateDramaEpisodeRequest;
use App\Http\Resources\Admin\DramaEpisodeResource;
use App\Models\DramaEpisode;
use App\Models\DramaSerial;
use App\Support\Media\MediaDisk;
use Illuminate\Http\JsonResponse;

class DramaEpisodeController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(DramaEpisode::class, DramaEpisodeResource::class, 'drama-episode');
    }

    protected function baseQuery()
    {
        return DramaEpisode::query()->with('serial:id,title');
    }

    public function store(StoreDramaEpisodeRequest $request): JsonResponse
    {
        $data = $request->validated();
        $record = $this->model->create($data);
        $this->syncSerialCount((int) $record->drama_serial_id);
        $record = $this->refresh($record);

        return $this->success(new DramaEpisodeResource($record), 'Episode created.', 'CREATED');
    }

    public function show(DramaEpisode $drama_episode): JsonResponse
    {
        return $this->_show($drama_episode);
    }

    public function update(UpdateDramaEpisodeRequest $request, DramaEpisode $drama_episode): JsonResponse
    {
        $validated = $request->validated();
        $newSource = $validated['video_source'] ?? null;
        $oldSerialId = (int) $drama_episode->drama_serial_id;

        if ($newSource === DramaVideoSourceEnum::YOUTUBE->value
            && $drama_episode->video_source === DramaVideoSourceEnum::UPLOAD) {
            $this->deleteStoredVideo($drama_episode);
        }

        $response = $this->_patch($request, $drama_episode, dataMapper: function (array &$data) use ($newSource, $drama_episode) {
            if ($newSource === DramaVideoSourceEnum::UPLOAD->value
                && $drama_episode->video_source === DramaVideoSourceEnum::YOUTUBE) {
                $data['video'] = null;
            }
        });

        $drama_episode->refresh();
        $this->syncSerialCount($oldSerialId);
        if ((int) $drama_episode->drama_serial_id !== $oldSerialId) {
            $this->syncSerialCount((int) $drama_episode->drama_serial_id);
        }

        return $response;
    }

    public function destroy(DramaEpisode $drama_episode): JsonResponse
    {
        $drama_episode = $this->refresh($drama_episode);
        $serialId = (int) $drama_episode->drama_serial_id;

        MediaDisk::delete($drama_episode->getRawOriginal('thumbnail'));
        if ($drama_episode->video_source === DramaVideoSourceEnum::UPLOAD) {
            MediaDisk::delete($drama_episode->getRawOriginal('video'));
        }

        $drama_episode->delete();
        $this->syncSerialCount($serialId);

        return $this->noContent();
    }

    private function deleteStoredVideo(DramaEpisode $episode): void
    {
        if ($episode->video_source !== DramaVideoSourceEnum::UPLOAD) {
            return;
        }

        MediaDisk::delete($episode->getRawOriginal('video'));
    }

    private function syncSerialCount(int $serialId): void
    {
        $serial = DramaSerial::query()->find($serialId);
        $serial?->refreshEpisodesCount();
    }
}
