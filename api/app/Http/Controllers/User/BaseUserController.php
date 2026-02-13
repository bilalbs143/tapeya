<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;

abstract class BaseUserController extends Controller
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
