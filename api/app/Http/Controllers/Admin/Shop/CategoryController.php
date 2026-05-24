<?php

namespace App\Http\Controllers\Admin\Shop;

use App\Http\Controllers\Admin\BaseAdminController;
use App\Http\Requests\Admin\Shop\StoreCategoryRequest;
use App\Http\Requests\Admin\Shop\UpdateCategoryRequest;
use App\Http\Resources\Admin\Shop\CategoryResource;
use App\Models\Shop\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class CategoryController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(Category::class, CategoryResource::class, 'category');
    }

    protected function baseQuery()
    {
        return Category::query()->with('parent');
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $record = $this->model->create($data);
        $record = $this->refresh($record);

        return $this->success(new CategoryResource($record), 'Category created.', 'CREATED');
    }

    public function show(Category $category): JsonResponse
    {
        return $this->_show($category);
    }

    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $data = $request->validated();
        $category = $this->refresh($category);
        $category->update($data);
        $category = $this->refresh($category);

        return $this->success(new CategoryResource($category), 'Category updated.');
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->image) {
            Storage::disk(config('filesystems.media_disk'))->delete($category->image);
        }

        return $this->_destroy($category, null);
    }
}
