<?php

namespace App\Http\Controllers\v1\Admin;

use App\Http\Requests\v1\Admin\AppRelease\CreateAppReleaseRequest;
use App\Http\Resources\v1\AppRelease\AppReleaseResource;
use App\Models\AppRelease;

class AppReleaseController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(AppRelease::class, AppReleaseResource::class, 'app_release');
    }

    protected function baseQuery()
    {
        return $this->model->query();
    }

    public function store(CreateAppReleaseRequest $request)
    {
        return $this->_store($request, dataMapper: function (&$data) use ($request) {
            $file = $request->file('file_path');

            $data['file_name'] = $file->getClientOriginalName();
            $data['file_size'] = $file->getSize();
            $data['file_hash'] = hash_file('sha256', $file);
            $data['mime_type'] = $file->getMimeType();
            $data['os'] = $request->getOS();
            $data['type'] = $request->getType();
            $data['release_channel'] = $request->getReleaseChannel();
            $data['is_active'] = true;
            $data['released_at'] = now();

            $lastVersion = $this->model->getLastVersionInfo($request->getOS(), $request->getType());

            if ($request->isMajor()) {
                $data['major_version'] = $lastVersion['major_version'] + 1;
                $data['minor_version'] = 0;
                $data['patch_version'] = 0;
            } elseif ($request->isMinor()) {
                $data['major_version'] = $lastVersion['major_version'];
                $data['minor_version'] = $lastVersion['minor_version'] + 1;
                $data['patch_version'] = 0;
            } elseif ($request->isPatch()) {
                $data['major_version'] = $lastVersion['major_version'];
                $data['minor_version'] = $lastVersion['minor_version'];
                $data['patch_version'] = $lastVersion['patch_version'] + 1;
            }

            $data['version'] = $data['major_version'].'.'.$data['minor_version'].'.'.$data['patch_version'];
        }, callback: function (AppRelease $record) {
            AppRelease::where('os', $record->os)->where('type', $record->type)->where('is_active', true)->whereNot('id', $record->id)->update([
                'is_active' => false,
                'disabled_at' => now(),
            ]);
        });
    }
}
