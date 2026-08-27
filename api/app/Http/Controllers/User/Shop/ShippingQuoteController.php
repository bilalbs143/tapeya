<?php

namespace App\Http\Controllers\User\Shop;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\Shop\Cart;
use App\Models\Shop\Vendor;
use App\Services\Shop\ShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingQuoteController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly ShippingService $shipping,
    ) {}

    public function show(Request $request): JsonResponse
    {
        $vendors = collect();
        $user = $request->user();
        if ($user) {
            $cart = Cart::query()
                ->where('user_id', $user->id)
                ->with('items.product')
                ->first();
            if ($cart) {
                $vendorIds = $cart->items
                    ->map(fn ($item) => $item->product?->vendor_id)
                    ->filter()
                    ->unique()
                    ->values()
                    ->all();
                if ($vendorIds !== []) {
                    $vendors = Vendor::query()->whereIn('id', $vendorIds)->get();
                }
            }
        }

        $amount = $this->shipping->quote($vendors);

        return $this->success(['amount' => $amount]);
    }
}
