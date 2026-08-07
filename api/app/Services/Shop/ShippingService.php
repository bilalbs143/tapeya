<?php

namespace App\Services\Shop;

use App\Models\Shop\Vendor;
use Illuminate\Support\Collection;

class ShippingService
{
    /**
     * Flat shipping: sum of each vendor's default_shipping_amount.
     *
     * @param  Collection<int, Vendor>|iterable<mixed>  $vendors
     */
    public function quote(iterable $vendors = []): float
    {
        $sum = 0.0;
        foreach ($vendors as $vendor) {
            $sum += (float) ($vendor->default_shipping_amount ?? 0);
        }

        return round($sum, 2);
    }
}
