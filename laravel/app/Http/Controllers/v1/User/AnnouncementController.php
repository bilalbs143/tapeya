<?php

namespace App\Http\Controllers\v1\User;

use App\Http\Resources\v1\Announcement\AnnouncementResource;
use App\Models\Announcement;

class AnnouncementController extends BaseUserController
{
    public function __construct()
    {
        parent::__construct(Announcement::class, AnnouncementResource::class);
    }

    protected function baseQuery()
    {
        return $this->model->active()->when($this->isIndex(), function ($query) {
            $query->notImportant();
        });
    }

    public function getImportant()
    {
        $announcement = $this->model->important()->first();

        if (! $announcement) {
            return $this->failure('no_important_announcement', 404);
        }

        return $this->success(new AnnouncementResource($announcement));
    }
}
