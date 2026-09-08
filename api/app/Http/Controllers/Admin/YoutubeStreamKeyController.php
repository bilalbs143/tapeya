<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\YoutubeStreamKey\StoreYoutubeStreamKeyRequest;
use App\Http\Requests\Admin\YoutubeStreamKey\UpdateYoutubeStreamKeyRequest;
use App\Http\Resources\Admin\YoutubeStreamKeyResource;
use App\Models\YoutubeStreamKey;
use App\Streaming\Providers\YouTubeStreamProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Crypt;
use Spatie\QueryBuilder\QueryBuilder;

class YoutubeStreamKeyController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(YoutubeStreamKey::class, YoutubeStreamKeyResource::class, 'youtube_stream_key');
    }

    protected function baseQuery()
    {
        return YoutubeStreamKey::query();
    }

    public function index()
    {
        $query = QueryBuilder::for($this->baseQuery())
            ->allowedFilters($this->model->getFilters())
            ->defaultSort('-id')
            ->allowedSorts($this->model->getSorts());

        return YoutubeStreamKeyResource::collection($this->paginateOrAll($query));
    }

    public function store(StoreYoutubeStreamKeyRequest $request): JsonResponse
    {
        $title = $request->validated('title');
        $provisioned = app(YouTubeStreamProvider::class)->createKey($title);

        $key = YoutubeStreamKey::create([
            'title' => $title,
            'youtube_stream_id' => $provisioned['youtube_stream_id'],
            'ingest_rtmp_url' => $provisioned['ingest_rtmp_url'],
            'stream_key_encrypted' => $provisioned['stream_key_encrypted'],
            'is_active' => true,
            'created_by' => $request->user()->id,
        ]);

        return $this->success($this->detail($key), 'YouTube stream key created.', 'CREATED');
    }

    public function show(YoutubeStreamKey $youtubeStreamKey): JsonResponse
    {
        return $this->success($this->detail($youtubeStreamKey));
    }

    public function update(UpdateYoutubeStreamKeyRequest $request, YoutubeStreamKey $youtubeStreamKey): JsonResponse
    {
        $youtubeStreamKey->update($request->validated());

        return $this->success(new YoutubeStreamKeyResource($youtubeStreamKey->fresh()), 'YouTube stream key updated.');
    }

    public function destroy(YoutubeStreamKey $youtubeStreamKey): JsonResponse
    {
        if ($youtubeStreamKey->isInUse()) {
            return $this->failure('Cannot delete a key that is currently in use by a live stream.', 'VALIDATION_ERROR');
        }

        app(YouTubeStreamProvider::class)->deleteKey($youtubeStreamKey->youtube_stream_id);
        $youtubeStreamKey->delete();

        return $this->noContent();
    }

    /**
     * Decrypted ingest for create/show only — never returned from index.
     *
     * @return array<string, mixed>
     */
    private function detail(YoutubeStreamKey $key): array
    {
        return [
            ...(new YoutubeStreamKeyResource($key))->resolve(),
            'ingest' => [
                'rtmp_url' => $key->ingest_rtmp_url,
                'stream_key' => Crypt::decryptString($key->stream_key_encrypted),
                'backup_rtmp_url' => 'rtmp://b.rtmp.youtube.com/live2?backup=1',
            ],
        ];
    }
}
