<?php

namespace App\Http\Controllers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

abstract class BaseApiController extends Controller
{
    use BaseControllerTrait;

    /** @var Model */
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
     * @return Builder
     */
    abstract protected function baseQuery();
}
