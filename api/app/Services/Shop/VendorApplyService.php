<?php

namespace App\Services\Shop;

use App\Enums\Shop\VendorStatusEnum;
use App\Events\VendorApplicationSubmitted;
use App\Models\Shop\Vendor;
use App\Models\User;
use Illuminate\Support\Str;
use InvalidArgumentException;

class VendorApplyService
{
    public function __construct(
        private readonly VendorService $vendors,
    ) {}

    /**
     * Self-serve seller application for an app user.
     *
     * @param  array<string, mixed>  $data
     */
    public function apply(User $user, array $data): Vendor
    {
        if (! $user->isUser()) {
            throw new InvalidArgumentException('Only app users can apply as sellers.');
        }

        if ($user->shopVendor()->exists()) {
            throw new InvalidArgumentException('You already have a vendor profile.');
        }

        $vendor = $this->vendors->create([
            ...$data,
            'user_id' => $user->id,
            'status' => VendorStatusEnum::PENDING->value,
            'slug' => $data['slug'] ?? Str::slug((string) $data['store_name']),
        ], $user);

        event(new VendorApplicationSubmitted($vendor));

        return $vendor;
    }
}
