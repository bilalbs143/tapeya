<?php

namespace App\Http\Resources\Vendor\Shop;

use App\Http\Resources\User\Shop\OrderItemResource;
use App\Support\Media\MediaDisk;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VendorOrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'vendor_id' => $this->vendor_id,
            'vendor_order_number' => $this->vendor_order_number,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'subtotal' => (float) $this->subtotal,
            'shipping_amount' => (float) $this->shipping_amount,
            'discount_amount' => (float) $this->discount_amount,
            'commission_rate_snapshot' => (float) $this->commission_rate_snapshot,
            'commission_amount' => (float) $this->commission_amount,
            'vendor_earnings' => (float) $this->vendor_earnings,
            'total' => (float) $this->total,
            'tracking_number' => $this->tracking_number,
            'carrier' => $this->carrier,
            'notes' => $this->notes,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'order' => $this->whenLoaded('order', function () {
                return [
                    'id' => $this->order->id,
                    'order_number' => $this->order->order_number,
                    'total' => (float) $this->order->total,
                    'currency' => $this->order->currency,
                    'payment_status' => $this->order->payment_status?->value,
                    'payment_status_label' => $this->order->payment_status?->label(),
                    'amount_received' => $this->order->amount_received !== null
                        ? (float) $this->order->amount_received
                        : null,
                    'payment_verified_at' => $this->order->payment_verified_at?->toIso8601String(),
                    'address' => $this->order->address,
                    'city' => $this->order->city,
                    'country' => $this->order->country,
                    'notes' => $this->order->notes,
                    'placed_at' => $this->order->placed_at?->toIso8601String(),
                ];
            }),
            'customer' => $this->when(
                $this->relationLoaded('order') && $this->order?->relationLoaded('user'),
                function () {
                    $user = $this->order?->user;
                    if ($user === null) {
                        return null;
                    }

                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'phone' => $user->phone,
                        'avatar_url' => MediaDisk::url($user->avatar),
                    ];
                }
            ),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
