<?php

namespace App\Http\Controllers\v1\Admin;

use App\Http\Requests\v1\Admin\Sound\CreateSoundRequest;
use App\Http\Requests\v1\Admin\Sound\UpdateSoundRequest;
use App\Http\Resources\v1\Sound\SoundResource;
use App\Models\Sound;

class SoundController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(Sound::class, SoundResource::class, 'sound');
    }

    protected function baseQuery()
    {
        return $this->model->with([
            'creator',
            'editor',
        ]);
    }

    public function store(CreateSoundRequest $request)
    {
        return $this->_store($request);
    }

    public function patch(UpdateSoundRequest $request, Sound $sound)
    {
        return $this->_patch($request, $sound);
    }

    public function show(Sound $sound)
    {
        return $this->_show($sound);
    }

    public function destroy(Sound $sound)
    {
        return $this->_destroy($sound);
    }
}
