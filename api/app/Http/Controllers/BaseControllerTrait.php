<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\QueryBuilder\QueryBuilder;

trait BaseControllerTrait
{
    protected function success($data = null, ?string $message = null, string $type = 'SUCCESS')
    {
        return response()->success($data, $message, $type);
    }

    protected function failure(?string $message = null, string $type = 'BAD_REQUEST', $errors = null)
    {
        return response()->failure($message, $type, $errors);
    }

    protected function forbidden(?string $message = null)
    {
        return response()->forbidden($message);
    }

    /**
     * 204 with no body, as JSON-capable response (JsonResponse) for controllers typed to JsonResponse.
     */
    protected function noContent(): JsonResponse
    {
        return new JsonResponse(null, 204);
    }

    /**
     * Store/update a single image field on a model in a consistent way.
     *
     * - Saves the uploaded file to "images/{$path}" on the default disk.
     * - Deletes the previous file if a record and old path exist.
     */
    protected function storeImage(Request $request, string $param, string $path, array &$data, $record = null): void
    {
        if ($request->hasFile($param)) {
            $data[$param] = $request
                ->file($param)
                ->store($path, config('filesystems.media_disk'));

            if ($record && $record->$param) {
                Storage::disk(config('filesystems.media_disk'))->delete($record->$param);
            }
        }
    }

    public function index()
    {
        $records = QueryBuilder::for($this->baseQuery())
            ->allowedFilters($this->model->getFilters())
            ->defaultSort('-id')
            ->allowedSorts($this->model->getSorts())
            ->when(
                request()->has('all'),
                fn ($q) => $q->get(),
                fn ($q) => $q->pagination()
            );

        return $this->resource::collection($records);
    }

    protected function refresh($record)
    {
        return $this->baseQuery()->findOrFail($record->id);
    }

    protected function _store(Request $request, ?string $message = null, ?callable $callback = null)
    {
        $data = $request->validated();
        $record = $this->model->create($data);
        if ($callback) {
            $callback($record);
        }
        $record = $this->refresh($record);
        $msg = $message ?? Str::headline($this->resourceName).' created.';

        return $this->success(new $this->resource($record), $msg, 'CREATED');
    }

    protected function _patch(Request $request, $record, ?string $message = null, ?callable $callback = null, ?callable $dataMapper = null)
    {
        $data = $request->validated();
        if ($dataMapper) {
            $dataMapper($data);
        }
        $record = $this->refresh($record);
        $record->update($data);
        if ($callback) {
            $callback($record);
        }
        $record = $this->refresh($record);
        $msg = $message ?? Str::headline($this->resourceName).' updated.';

        return $this->success(new $this->resource($record), $msg);
    }

    protected function _show($record)
    {
        $record = $this->refresh($record);

        return $this->success(new $this->resource($record));
    }

    protected function _destroy($record, ?string $message = null, ?callable $callback = null)
    {
        $record = $this->refresh($record);
        $record->delete();
        if ($callback) {
            $callback($record);
        }

        return $this->noContent();
    }
}
