<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;

abstract class BaseAdminController extends Controller
{
    use BaseControllerTrait;

    abstract protected function baseQuery();

    public function __construct(
        public $model = null,
        public $resource = null,
        public ?string $resourceName = null
    ) {
        if ($this->model) {
            $this->model = app($this->model);
        }
    }
}
