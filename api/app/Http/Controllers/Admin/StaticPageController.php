<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\StoreStaticPageRequest;
use App\Http\Requests\Admin\UpdateStaticPageRequest;
use App\Http\Resources\Admin\StaticPageResource;
use App\Models\StaticPage;
use Illuminate\Http\JsonResponse;

class StaticPageController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(StaticPage::class, StaticPageResource::class, 'static page');
    }

    protected function baseQuery()
    {
        return StaticPage::query();
    }

    public function store(StoreStaticPageRequest $request): JsonResponse
    {
        return $this->_store($request, 'Static page created.');
    }

    public function show(StaticPage $static_page): JsonResponse
    {
        return $this->_show($static_page);
    }

    public function update(UpdateStaticPageRequest $request, StaticPage $static_page): JsonResponse
    {
        return $this->_patch($request, $static_page, 'Static page updated.');
    }

    public function destroy(StaticPage $static_page): JsonResponse
    {
        return $this->_destroy($static_page, null);
    }
}
