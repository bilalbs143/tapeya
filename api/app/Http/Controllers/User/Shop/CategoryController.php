<?php

namespace App\Http\Controllers\User\Shop;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\Shop\CategoryResource;
use App\Models\Shop\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\QueryBuilder;

class CategoryController extends Controller
{
    use BaseControllerTrait;

    public function index(): AnonymousResourceCollection|JsonResponse
    {
        $query = Category::query()->active()->with('parent');

        $records = QueryBuilder::for($query)
            ->allowedFilters(['id', 'parent_id'])
            ->defaultSort('sort_order')
            ->allowedSorts(['id', 'name', 'slug', 'sort_order'])
            ->when(
                request()->has('all'),
                fn ($q) => $q->get(),
                fn ($q) => $q->paginate((int) request('per_page', 15))
            );

        return CategoryResource::collection($records);
    }

    public function show(int $category): JsonResponse
    {
        $record = Category::query()->active()->with('parent')->findOrFail($category);

        return $this->success(new CategoryResource($record));
    }
}
