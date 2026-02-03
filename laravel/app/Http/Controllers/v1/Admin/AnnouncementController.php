<?php

namespace App\Http\Controllers\v1\Admin;

use App\Enums\Announcement\AnnouncementCategoryEnum;
use App\Events\Admin\Announcement\AnnouncementCreated;
use App\Http\Requests\v1\Admin\Announcement\CreateAnnouncementRequest;
use App\Http\Requests\v1\Admin\Announcement\UpdateAnnouncementRequest;
use App\Http\Resources\v1\Announcement\AnnouncementResource;
use App\Models\Announcement;
use Illuminate\Support\Facades\Auth;

class AnnouncementController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(Announcement::class, AnnouncementResource::class, 'announcement');
    }

    protected function baseQuery()
    {
        return $this->model->with([
            'creator',
            'editor',
        ])->when($this->isIndex(), function ($query) {
            $query->notImportant();
        });
    }

    public function getCategories()
    {
        return response()->json([
            'data' => AnnouncementCategoryEnum::withLabels(),
        ]);
    }

    public function store(CreateAnnouncementRequest $request)
    {
        return $this->_store($request, dataMapper: function (&$data) use ($request) {
            if ($request->boolean('is_important')) {
                $data['title'] = 'Important Announcement';
                $data['category'] = AnnouncementCategoryEnum::IMPORTANT;
                $data['marked_as_important_at'] = now();
                $data['marked_as_important_by'] = Auth::id();
            }
        }, callback: function (Announcement $record) {
            if ($record->isImportant()) {
                $this->model->where('id', '!=', $record->id)->important()->delete();
            }
            AnnouncementCreated::dispatch($record);
        });
    }

    public function patch(UpdateAnnouncementRequest $request, Announcement $announcement)
    {
        $isAlreadyImportant = $announcement->isImportant();

        return $this->_patch($request, $announcement, dataMapper: function (&$data) use ($request, $isAlreadyImportant) {
            if ($request->boolean('is_important')) {
                $data['title'] = 'Important Announcement';
                $data['category'] = AnnouncementCategoryEnum::IMPORTANT;
                $data['marked_as_important_at'] = now();
                $data['marked_as_important_by'] = Auth::id();
            } elseif ($isAlreadyImportant) {
                $data['marked_as_important_at'] = null;
                $data['marked_as_important_by'] = null;
            }
        }, callback: function (Announcement $record) {
            if ($record->isImportant()) {
                $this->model->where('id', '!=', $record->id)->important()->delete();
            }
        });
    }

    public function show(Announcement $announcement)
    {
        return $this->_show($announcement);
    }

    public function destroy(Announcement $announcement)
    {
        return $this->_destroy($announcement);
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
