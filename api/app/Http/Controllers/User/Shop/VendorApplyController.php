<?php

namespace App\Http\Controllers\User\Shop;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\Shop\ApplyVendorRequest;
use App\Http\Resources\Vendor\Shop\StoreResource;
use App\Services\Shop\VendorApplyService;
use Illuminate\Http\JsonResponse;
use InvalidArgumentException;

class VendorApplyController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly VendorApplyService $applyService,
    ) {}

    public function store(ApplyVendorRequest $request): JsonResponse
    {
        try {
            $vendor = $this->applyService->apply($request->user(), $request->validated());
        } catch (InvalidArgumentException $e) {
            return $this->failure($e->getMessage(), 'VALIDATION_ERROR');
        }

        return $this->success(new StoreResource($vendor), 'Vendor application submitted.', 'CREATED');
    }
}
