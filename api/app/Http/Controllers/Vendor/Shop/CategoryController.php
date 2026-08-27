<?php

namespace App\Http\Controllers\Vendor\Shop;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\Vendor\Shop\StoreCategoryRequest;
use App\Http\Requests\Vendor\Shop\UpdateCategoryRequest;
use App\Http\Resources\Vendor\Shop\CategoryResource;
use App\Models\Shop\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\QueryBuilder;

class CategoryController extends Controller
{
    use BaseControllerTrait;

    public function index(): AnonymousResourceCollection|JsonResponse
    {
        $query = QueryBuilder::for(Category::query()->active()->with('parent'))
            ->allowedFilters(['id', 'name', 'slug', 'parent_id'])
            ->defaultSort('-id')
            ->allowedSorts(['id', 'name', 'slug', 'created_at']);

        return CategoryResource::collection($this->paginateOrAll($query));
    }

    public function show(Category $category): JsonResponse
    {
        abort_unless($category->is_active, 404);
        $category->loadMissing('parent');

        return $this->success(new CategoryResource($category));
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $this->storeImage($request, 'image', 'shop/categories', $data);
        $record = Category::query()->create($data);
        $record->load('parent');

        return $this->success(new CategoryResource($record), 'Category created.', 'CREATED');
    }

    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        abort_unless($category->is_active, 404);
        $data = $request->validated();
        $this->storeImage($request, 'image', 'shop/categories', $data, $category);
        $category->update($data);
        $category = $category->fresh(['parent']);

        return $this->success(new CategoryResource($category), 'Category updated.');
    }
}
