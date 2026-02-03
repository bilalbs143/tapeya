<?php

namespace App\Http\Controllers\v1;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\QueryBuilder\QueryBuilder;

trait BaseControllerTrait
{
    protected function success($data = null, $message = null, $code = 200)
    {
        return response()->success($data, $message ? "messages.{$message}" : null, $code);
    }

    protected function failure($message = null, $code = 400)
    {
        return response()->failure($message ? "messages.{$message}" : null, $code);
    }

    protected function forbidden($message = null)
    {
        return response()->forbidden($message ? "messages.{$message}" : null);
    }

    public function index()
    {
        $records = QueryBuilder::for($this->baseQuery())
            ->allowedFilters($this->model->getFilters())
            ->defaultSort('-id')
            ->allowedSorts($this->model->getSorts())
            ->when(
                request()->has('all'),
                fn ($query) => $query->get(),
                fn ($query) => $query->pagination()
            );

        return $this->resource::collection($records);
    }

    protected function refresh($record)
    {
        $record = $this->baseQuery()->findOrFail($record->id);

        return $record;
    }

    protected function storeImage(Request $request, string $param, string $path, &$data, $record = null)
    {
        if ($request->hasFile($param)) {
            $data[$param] = $request->file($param)->store("images/{$path}");
            if ($record && $record->$param) {
                Storage::delete($record->$param);
            }
        }
    }

    protected function _store(Request $request, ?string $message = null, $callback = null, $dataMapper = null)
    {
        $data = $request->validated();
        if ($dataMapper) {
            $dataMapper($data);
        }

        $record = $this->model->create($data);

        if ($callback) {
            $callback($record);
        }

        $record = $this->refresh($record);

        return $this->success(new $this->resource($record), $message ?: "{$this->resourceName}_created", 201);
    }

    protected function _patch(Request $request, $record, ?string $message = null, $callback = null, $dataMapper = null)
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

        return $this->success(new $this->resource($record), $message ?: "{$this->resourceName}_updated");
    }

    protected function _show($record)
    {
        $record = $this->refresh($record);

        return $this->success(new $this->resource($record));
    }

    protected function _destroy($record, ?string $message = null, $callback = null, $force = false)
    {
        $record = $this->refresh($record);
        if ($force) {
            $record->forceDelete();
        } else {
            $record->delete();
        }

        if ($callback) {
            $callback($record);
        }

        return $this->success(null, $message ?: "{$this->resourceName}_deleted");
    }

    protected function isIndex()
    {
        return Str::after(Route::currentRouteAction(), '@') === 'index';
    }
}
