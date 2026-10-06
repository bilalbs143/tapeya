<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\Drama\StoreDramaSerialRequest;
use App\Http\Requests\Admin\Drama\UpdateDramaSerialRequest;
use App\Http\Resources\Admin\DramaSerialResource;
use App\Models\DramaSerial;
use App\Support\Media\MediaDisk;
use Illuminate\Http\JsonResponse;

class DramaSerialController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(DramaSerial::class, DramaSerialResource::class, 'drama-serial');
    }

    protected function baseQuery()
    {
        return DramaSerial::query();
    }

    public function store(StoreDramaSerialRequest $request): JsonResponse
    {
        $record = $this->model->create($request->validated());
        $record = $this->refresh($record);

        return $this->success(new DramaSerialResource($record), 'Drama serial created.', 'CREATED');
    }

    public function show(DramaSerial $drama_serial): JsonResponse
    {
        return $this->_show($drama_serial);
    }

    public function update(UpdateDramaSerialRequest $request, DramaSerial $drama_serial): JsonResponse
    {
        return $this->_patch($request, $drama_serial);
    }

    public function destroy(DramaSerial $drama_serial): JsonResponse
    {
        $drama_serial = $this->refresh($drama_serial);
        MediaDisk::delete($drama_serial->getRawOriginal('poster'));
        $drama_serial->delete();

        return $this->noContent();
    }
}
