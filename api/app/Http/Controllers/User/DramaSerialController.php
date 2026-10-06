<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\DramaSerialResource;
use App\Models\DramaEpisode;
use App\Models\DramaSerial;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\QueryBuilder;

class DramaSerialController extends Controller
{
    use BaseControllerTrait;

    public function index(): JsonResponse
    {
        $query = QueryBuilder::for(DramaSerial::class)
            ->allowedFilters(DramaSerial::getFilters())
            ->allowedSorts(DramaSerial::getSorts())
            ->defaultSort('-created_at')
            ->where('is_active', true)
            ->addSelect([
                'drama_serials.*',
                'first_episode_id' => DramaEpisode::query()
                    ->select('id')
                    ->whereColumn('drama_serial_id', 'drama_serials.id')
                    ->where('is_active', true)
                    ->orderBy('episode_number')
                    ->limit(1),
            ]);

        return $this->success(DramaSerialResource::collection($this->paginateOrAll($query)));
    }

    public function show(DramaSerial $drama_serial): JsonResponse
    {
        if (! $drama_serial->is_active) {
            return $this->notFound('Drama serial not found.');
        }

        $drama_serial->load([
            'episodes' => fn ($q) => $q->where('is_active', true)->orderBy('episode_number'),
        ]);

        return $this->success(new DramaSerialResource($drama_serial));
    }
}
