<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\Post\UpdatePostReportRequest;
use App\Http\Resources\Admin\PostReportResource;
use App\Models\PostReport;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class PostReportController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(PostReport::class, PostReportResource::class, 'post report');
    }

    protected function baseQuery()
    {
        return PostReport::query()->with([
            'post' => fn ($q) => $q->select([
                'id',
                'user_id',
                'type',
                'title',
                'body',
                'background_id',
                'cover_path',
                'status',
                'visibility',
                'reports_count',
            ])->with('video'),
            'reporter:id,name,nickname',
        ]);
    }

    public function index()
    {
        $query = QueryBuilder::for($this->baseQuery())
            ->allowedFilters([
                AllowedFilter::exact('status'),
                AllowedFilter::exact('reason'),
                AllowedFilter::exact('post_id'),
                AllowedFilter::exact('reporter_id'),
                AllowedFilter::scope('search'),
            ])
            ->defaultSort('-id')
            ->allowedSorts(['id', 'created_at', 'status', 'reason']);

        return PostReportResource::collection($this->paginateOrAll($query));
    }

    public function show(PostReport $postReport): JsonResponse
    {
        return $this->_show($postReport);
    }

    public function update(UpdatePostReportRequest $request, PostReport $postReport): JsonResponse
    {
        return $this->_patch($request, $postReport, 'Post report updated.');
    }
}
