<?php

namespace App\Http\Controllers;

use App\Support\Media\MediaDisk;
use App\Utils\Constants\ApiConstants;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

    protected function notFound(?string $message = null)
    {
        return $this->failure($message ?? 'Not found.', 'NOT_FOUND');
    }

    protected function conflict(?string $message = null)
    {
        return $this->failure($message ?? 'Conflict.', 'CONFLICT');
    }

    /**
     * 204 with no body, as JSON-capable response (JsonResponse) for controllers typed to JsonResponse.
     */
    protected function noContent(): JsonResponse
    {
        return new JsonResponse(null, 204);
    }

    /**
     * Store/update a single image field on a model via {@see MediaDisk} (ACL-safe).
     *
     * - Saves the uploaded file under $path on the media disk.
     * - Deletes the previous file if a record and old path exist.
     */
    protected function storeImage(Request $request, string $param, string $path, array &$data, $record = null): void
    {
        if ($request->hasFile($param)) {
            if ($record && $record->$param) {
                MediaDisk::delete($record->getRawOriginal($param) ?? $record->$param);
            }

            $data[$param] = MediaDisk::storeUploaded($request->file($param), $path);
        }
    }

    /**
     * Return all results or a paginated page depending on the presence of the ?all query parameter.
     *
     * Works with any Eloquent builder, relation builder, or Spatie QueryBuilder instance.
     * Pass $defaultPerPage to override the global default for this specific endpoint.
     *
     * @param  Builder|\Illuminate\Database\Query\Builder|QueryBuilder  $query
     */
    protected function paginateOrAll($query, int $defaultPerPage = ApiConstants::PER_PAGE)
    {
        if (request()->has('all')) {
            return $query->get();
        }

        $perPage = request()->has('per_page') ? (int) request('per_page') : $defaultPerPage;

        return $query->paginate($perPage)->appends(request()->query());
    }

    public function index()
    {
        $query = QueryBuilder::for($this->baseQuery())
            ->allowedFilters($this->model->getFilters())
            ->defaultSort('-id')
            ->allowedSorts($this->model->getSorts());

        return $this->resource::collection($this->paginateOrAll($query));
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
