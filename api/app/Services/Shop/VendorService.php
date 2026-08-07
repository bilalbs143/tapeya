<?php

namespace App\Services\Shop;

use App\Enums\Shop\VendorStatusEnum;
use App\Models\Shop\Vendor;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class VendorService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, ?User $actor = null): Vendor
    {
        return DB::transaction(function () use ($data) {
            $userId = $data['user_id'] ?? null;
            if ($userId !== null) {
                $this->assertAssignableUser((int) $userId);
            }

            $slug = $this->uniqueSlug($data['slug'] ?? Str::slug((string) $data['store_name']));
            $status = VendorStatusEnum::from($data['status'] ?? VendorStatusEnum::PENDING->value);

            $payload = [
                'user_id' => $userId,
                'store_name' => $data['store_name'],
                'slug' => $slug,
                'description' => $data['description'] ?? null,
                'phone' => $data['phone'] ?? null,
                'email' => $data['email'] ?? null,
                'address' => $data['address'] ?? null,
                'city' => $data['city'] ?? null,
                'country' => $data['country'] ?? null,
                'commission_rate' => $data['commission_rate'] ?? null,
                'default_shipping_amount' => $data['default_shipping_amount'] ?? 0,
                'status' => $status,
                'is_platform' => false,
                'meta' => $data['meta'] ?? null,
            ];

            if ($status === VendorStatusEnum::APPROVED) {
                $payload['approved_at'] = now();
            }

            return Vendor::query()->create($payload);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Vendor $vendor, array $data): Vendor
    {
        return DB::transaction(function () use ($vendor, $data) {
            $vendor = Vendor::query()->whereKey($vendor->id)->lockForUpdate()->firstOrFail();

            if (array_key_exists('user_id', $data) && (int) $data['user_id'] !== (int) $vendor->user_id) {
                if ($vendor->is_platform) {
                    throw new InvalidArgumentException('Platform house vendor cannot be reassigned.');
                }
                $this->assertAssignableUser((int) $data['user_id'], $vendor->id);
            }

            if (isset($data['store_name']) && ! isset($data['slug'])) {
                // Keep existing slug unless explicitly changed.
            }

            if (isset($data['slug'])) {
                $data['slug'] = $this->uniqueSlug((string) $data['slug'], $vendor->id);
            }

            $vendor->fill(collect($data)->except(['status', 'is_platform', 'approved_at', 'suspended_at'])->all());
            $vendor->save();

            return $vendor->fresh(['user']);
        });
    }

    public function approve(Vendor $vendor): Vendor
    {
        return DB::transaction(function () use ($vendor) {
            $vendor = Vendor::query()->whereKey($vendor->id)->lockForUpdate()->firstOrFail();

            if ($vendor->status === VendorStatusEnum::APPROVED) {
                return $vendor;
            }

            $vendor->update([
                'status' => VendorStatusEnum::APPROVED,
                'approved_at' => now(),
                'suspended_at' => null,
                'suspension_reason' => null,
            ]);

            return $vendor->fresh(['user']);
        });
    }

    public function suspend(Vendor $vendor, ?string $reason = null): Vendor
    {
        return DB::transaction(function () use ($vendor, $reason) {
            $vendor = Vendor::query()->whereKey($vendor->id)->lockForUpdate()->firstOrFail();

            if ($vendor->is_platform) {
                throw new InvalidArgumentException('Platform house vendor cannot be suspended.');
            }

            $vendor->update([
                'status' => VendorStatusEnum::SUSPENDED,
                'suspended_at' => now(),
                'suspension_reason' => $reason,
            ]);

            return $vendor->fresh(['user']);
        });
    }

    public function reject(Vendor $vendor, ?string $reason = null): Vendor
    {
        return DB::transaction(function () use ($vendor, $reason) {
            $vendor = Vendor::query()->whereKey($vendor->id)->lockForUpdate()->firstOrFail();

            if ($vendor->is_platform) {
                throw new InvalidArgumentException('Platform house vendor cannot be rejected.');
            }

            if ($vendor->status === VendorStatusEnum::APPROVED) {
                throw new InvalidArgumentException('Approved vendors must be suspended, not rejected.');
            }

            $vendor->update([
                'status' => VendorStatusEnum::REJECTED,
                'suspension_reason' => $reason,
                'suspended_at' => null,
            ]);

            return $vendor->fresh(['user']);
        });
    }

    /**
     * Vendor-facing store profile update (no commission / user / status).
     *
     * @param  array<string, mixed>  $data
     */
    public function updateStoreProfile(Vendor $vendor, array $data): Vendor
    {
        $allowed = collect($data)->only([
            'store_name',
            'description',
            'phone',
            'email',
            'address',
            'city',
            'country',
            'default_shipping_amount',
            'meta',
        ])->all();

        if (array_key_exists('default_shipping_amount', $allowed) && $allowed['default_shipping_amount'] === null) {
            $allowed['default_shipping_amount'] = 0;
        }

        $vendor->fill($allowed);
        $vendor->save();

        return $vendor->fresh();
    }

    private function assertAssignableUser(int $userId, ?int $ignoreVendorId = null): void
    {
        $user = User::query()->findOrFail($userId);
        if (! $user->isUser()) {
            throw new InvalidArgumentException('Vendor must be linked to an app user.');
        }

        $exists = Vendor::query()
            ->where('user_id', $userId)
            ->when($ignoreVendorId, fn ($q) => $q->where('id', '!=', $ignoreVendorId))
            ->exists();

        if ($exists) {
            throw new InvalidArgumentException('This user already has a vendor profile.');
        }
    }

    private function uniqueSlug(string $base, ?int $ignoreId = null): string
    {
        $base = Str::slug($base) ?: 'vendor';
        $slug = $base;
        $c = 0;
        while (
            Vendor::query()
                ->where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base.'-'.(++$c);
        }

        return $slug;
    }
}
