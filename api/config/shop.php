<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default commission rate (%)
    |--------------------------------------------------------------------------
    | Used when shop_vendors.commission_rate is null.
    */
    'default_commission_rate' => (float) env('SHOP_DEFAULT_COMMISSION_RATE', 10),

    /*
    |--------------------------------------------------------------------------
    | Platform house vendor
    |--------------------------------------------------------------------------
    */
    'house_vendor_slug' => 'tapeya-house',
    'house_vendor_store_name' => 'Tapeya',
];
