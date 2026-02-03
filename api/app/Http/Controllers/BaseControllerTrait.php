<?php

namespace App\Http\Controllers;

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

    protected function _patch(Request $request, $record, ?string $message = null, ?callable $callback = null)
    {
        $data = $request->validated();
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
        $msg = $message ?? Str::headline($this->resourceName).' deleted.';

        return $this->success(null, $msg);
    }
}
