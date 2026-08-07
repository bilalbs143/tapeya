<?php

namespace App\Http\Middleware;

use App\Enums\Shop\VendorStatusEnum;
use App\Models\Shop\Vendor;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gates shop/vendor/* on the authenticated user's shop_vendors row + status.
 *
 * Modes:
 * - mutate (default): approved only
 * - read: pending/suspended allowed (rejected/missing still 403)
 */
class EnsureVendor
{
    public function handle(Request $request, Closure $next, string $mode = 'mutate'): Response
    {
        $user = $request->user();
        if ($user === null) {
            return response()->failure('Unauthenticated.', 'UNAUTHORIZED');
        }

        $vendor = $user->relationLoaded('shopVendor')
            ? $user->shopVendor
            : $user->shopVendor()->first();

        if ($vendor === null) {
            return response()->failure(
                'A vendor profile is required.',
                'VENDOR_PROFILE_REQUIRED'
            );
        }

        if ($vendor->status === VendorStatusEnum::REJECTED) {
            return response()->failure(
                'Vendor profile was rejected.',
                'VENDOR_NOT_APPROVED'
            );
        }

        if ($mode === 'read') {
            if (! in_array($vendor->status, [
                VendorStatusEnum::APPROVED,
                VendorStatusEnum::PENDING,
                VendorStatusEnum::SUSPENDED,
            ], true)) {
                return response()->failure(
                    'Vendor profile is not available.',
                    'VENDOR_NOT_APPROVED'
                );
            }
        } else {
            if ($vendor->status === VendorStatusEnum::SUSPENDED) {
                return response()->failure(
                    'Vendor account is suspended.',
                    'VENDOR_SUSPENDED'
                );
            }

            if ($vendor->status !== VendorStatusEnum::APPROVED) {
                return response()->failure(
                    'Vendor account is not approved.',
                    'VENDOR_NOT_APPROVED'
                );
            }
        }

        $request->attributes->set('vendor', $vendor);

        return $next($request);
    }

    public static function vendor(Request $request): Vendor
    {
        /** @var Vendor $vendor */
        $vendor = $request->attributes->get('vendor');

        return $vendor;
    }
}
