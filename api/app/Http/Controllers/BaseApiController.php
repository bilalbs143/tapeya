<?php

namespace App\Http\Controllers;

abstract class BaseApiController extends Controller
{
    use BaseControllerTrait;

    /** @var \Illuminate\Database\Eloquent\Model */
    public $model;

    public string $resource;

    public string $resourceName;

    public function __construct(string $model, string $resource, string $resourceName)
    {
        $this->model = app($model);
        $this->resource = $resource;
        $this->resourceName = $resourceName;
    }

    /**
     * Base query for index/show (e.g. with(), scopes). Override in child.
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    abstract protected function baseQuery();
}
