<?php

namespace App\Events;

use App\Models\Shop\Vendor;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VendorApplicationSubmitted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Vendor $vendor
    ) {}
}
