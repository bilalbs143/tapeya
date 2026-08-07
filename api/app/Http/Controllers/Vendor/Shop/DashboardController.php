<?php

namespace App\Http\Controllers\Vendor\Shop;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Middleware\EnsureVendor;
use App\Services\Shop\VendorDashboardService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly VendorDashboardService $dashboard,
    ) {}

    public function show(Request $request): JsonResponse
    {
        $vendor = EnsureVendor::vendor($request);
        $from = $request->query('from') ? Carbon::parse($request->query('from')) : null;
        $to = $request->query('to') ? Carbon::parse($request->query('to')) : null;

        return $this->success($this->dashboard->build($vendor, $from, $to));
    }
}
