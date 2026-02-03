<?php

namespace App\Http\Controllers\v1\User;

use App\Http\Resources\v1\Popup\PopupResource;
use App\Models\Popup;

class PopupController extends BaseUserController
{
    public function __construct()
    {
        parent::__construct(Popup::class, PopupResource::class, 'popup');
    }

    protected function baseQuery()
    {
        return $this->model->active();
    }
}
