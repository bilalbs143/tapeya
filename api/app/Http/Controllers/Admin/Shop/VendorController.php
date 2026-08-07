<?php

namespace App\Http\Controllers\Admin\Shop;

use App\Http\Controllers\Admin\BaseAdminController;
use App\Http\Requests\Admin\Shop\RejectVendorRequest;
use App\Http\Requests\Admin\Shop\StoreVendorRequest;
use App\Http\Requests\Admin\Shop\SuspendVendorRequest;
use App\Http\Requests\Admin\Shop\UpdateVendorRequest;
use App\Http\Resources\Admin\Shop\VendorResource;
use App\Models\Shop\Vendor;
use App\Services\Shop\VendorService;
use Illuminate\Http\JsonResponse;
use InvalidArgumentException;

class VendorController extends BaseAdminController
{
    public function __construct(
        private readonly VendorService $vendors,
    ) {
        parent::__construct(Vendor::class, VendorResource::class, 'vendor');
    }

    protected function baseQuery()
    {
        return Vendor::query()->with(['user']);
    }

    public function store(StoreVendorRequest $request): JsonResponse
    {
        try {
            $vendor = $this->vendors->create($request->validated(), $request->user());
        } catch (InvalidArgumentException $e) {
            return $this->failure($e->getMessage(), 'VALIDATION_ERROR');
        }

        return $this->success(
            new VendorResource($this->refresh($vendor)),
            'Vendor created.',
            'CREATED'
        );
    }

    public function show(Vendor $vendor): JsonResponse
    {
        return $this->_show($vendor);
    }

    public function update(UpdateVendorRequest $request, Vendor $vendor): JsonResponse
    {
        try {
            $vendor = $this->vendors->update($vendor, $request->validated());
        } catch (InvalidArgumentException $e) {
            return $this->failure($e->getMessage(), 'VALIDATION_ERROR');
        }

        return $this->success(new VendorResource($this->refresh($vendor)), 'Vendor updated.');
    }

    public function destroy(Vendor $vendor): JsonResponse
    {
        if ($vendor->is_platform) {
            return $this->failure('Platform house vendor cannot be deleted.', 'VALIDATION_ERROR');
        }

        return $this->_destroy($vendor, null);
    }

    public function approve(Vendor $vendor): JsonResponse
    {
        try {
            $vendor = $this->vendors->approve($vendor);
        } catch (InvalidArgumentException $e) {
            return $this->failure($e->getMessage(), 'VALIDATION_ERROR');
        }

        return $this->success(new VendorResource($this->refresh($vendor)), 'Vendor approved.');
    }

    public function suspend(SuspendVendorRequest $request, Vendor $vendor): JsonResponse
    {
        try {
            $vendor = $this->vendors->suspend(
                $vendor,
                $request->validated('suspension_reason')
            );
        } catch (InvalidArgumentException $e) {
            return $this->failure($e->getMessage(), 'VALIDATION_ERROR');
        }

        return $this->success(new VendorResource($this->refresh($vendor)), 'Vendor suspended.');
    }

    public function reject(RejectVendorRequest $request, Vendor $vendor): JsonResponse
    {
        try {
            $vendor = $this->vendors->reject($vendor, $request->reason());
        } catch (InvalidArgumentException $e) {
            return $this->failure($e->getMessage(), 'VALIDATION_ERROR');
        }

        return $this->success(new VendorResource($this->refresh($vendor)), 'Vendor rejected.');
    }
}
