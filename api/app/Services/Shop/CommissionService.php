<?php

namespace App\Services\Shop;

use App\Models\Shop\Vendor;

class CommissionService
{
    /**
     * Locked formula (§8.5):
     * commission_amount = round(subtotal * rate / 100, 2)
     * vendor_earnings   = subtotal + shipping_amount - discount_amount - commission_amount
     *
     * @return array{rate: float, commission_amount: float, vendor_earnings: float}
     */
    public function calculate(
        Vendor $vendor,
        float $subtotal,
        float $shippingAmount = 0.0,
        float $discountAmount = 0.0,
    ): array {
        $rate = $vendor->resolvedCommissionRate();
        $commissionAmount = round($subtotal * ($rate / 100), 2);
        $vendorEarnings = round($subtotal + $shippingAmount - $discountAmount - $commissionAmount, 2);

        return [
            'rate' => $rate,
            'commission_amount' => $commissionAmount,
            'vendor_earnings' => $vendorEarnings,
        ];
    }
}
