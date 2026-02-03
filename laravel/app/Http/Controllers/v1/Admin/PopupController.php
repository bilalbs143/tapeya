<?php

namespace App\Http\Controllers\v1\Admin;

use App\Http\Requests\v1\Admin\Popup\CreatePopupRequest;
use App\Http\Requests\v1\Admin\Popup\UpdatePopupRequest;
use App\Http\Resources\v1\Popup\PopupResource;
use App\Models\Popup;

class PopupController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(Popup::class, PopupResource::class, 'popup');
    }

    protected function baseQuery()
    {
        return $this->model->with([
            'creator',
            'editor',
        ]);
    }

    public function store(CreatePopupRequest $request)
    {
        return $this->_store($request);
    }

    public function patch(UpdatePopupRequest $request, Popup $popup)
    {
        return $this->_patch($request, $popup);
    }

    public function show(Popup $popup)
    {
        return $this->_show($popup);
    }

    public function destroy(Popup $popup)
    {
        return $this->_destroy($popup);
    }
}
