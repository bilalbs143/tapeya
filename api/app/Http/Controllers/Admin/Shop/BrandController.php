<?php

namespace App\Http\Controllers\Admin\Shop;

use App\Http\Controllers\Admin\BaseAdminController;
use App\Http\Requests\Admin\Shop\StoreBrandRequest;
use App\Http\Requests\Admin\Shop\UpdateBrandRequest;
use App\Http\Resources\Admin\Shop\BrandResource;
use App\Models\Shop\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class BrandController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(Brand::class, BrandResource::class, 'brand');
    }

    protected function baseQuery()
    {
        return Brand::query();
    }

    public function store(StoreBrandRequest $request): JsonResponse
    {
        $data = $request->validated();
        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('shop/brands', config('filesystems.media_disk'));
        }
        $record = $this->model->create($data);
        $record = $this->refresh($record);

        return $this->success(new BrandResource($record), 'Brand created.', 'CREATED');
    }

    public function show(Brand $brand): JsonResponse
    {
        return $this->_show($brand);
    }

    public function update(UpdateBrandRequest $request, Brand $brand): JsonResponse
    {
        $data = $request->validated();
        if ($request->hasFile('logo')) {
            if ($brand->logo) {
                Storage::disk(config('filesystems.media_disk'))->delete($brand->logo);
            }
            $data['logo'] = $request->file('logo')->store('shop/brands', config('filesystems.media_disk'));
        }
        $brand = $this->refresh($brand);
        $brand->update($data);
        $brand = $this->refresh($brand);

        return $this->success(new BrandResource($brand), 'Brand updated.');
    }

    public function destroy(Brand $brand): JsonResponse
    {
        if ($brand->logo) {
            Storage::disk(config('filesystems.media_disk'))->delete($brand->logo);
        }

        return $this->_destroy($brand, null);
    }
}
