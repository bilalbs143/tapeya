<?php

namespace App\Http\Controllers\Vendor\Shop;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Middleware\EnsureVendor;
use App\Http\Requests\Vendor\Shop\UpdateStoreRequest;
use App\Http\Resources\Vendor\Shop\StoreResource;
use App\Services\Shop\VendorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly VendorService $vendors,
    ) {}

    public function show(Request $request): JsonResponse
    {
        return $this->success(new StoreResource(EnsureVendor::vendor($request)));
    }

    public function update(UpdateStoreRequest $request): JsonResponse
    {
        $vendor = $this->vendors->updateStoreProfile(
            EnsureVendor::vendor($request),
            $request->validated()
        );

        return $this->success(new StoreResource($vendor), 'Store updated.');
    }
}
