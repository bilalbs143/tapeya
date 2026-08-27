<?php

namespace App\Http\Resources\User\Shop;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'payment_status' => $this->payment_status?->value,
            'payment_status_label' => $this->payment_status?->label(),
            'payment_method' => $this->payment_method?->value ?? $this->payment_method,
            'payment_method_label' => $this->payment_method?->label(),
            'amount_received' => $this->amount_received !== null ? (float) $this->amount_received : null,
            'payment_verified_at' => $this->payment_verified_at?->toIso8601String(),
            'subtotal' => (float) $this->subtotal,
            'shipping_amount' => (float) $this->shipping_amount,
            'discount_amount' => (float) $this->discount_amount,
            'total' => (float) $this->total,
            'currency' => $this->currency,
            'address' => $this->address,
            'city' => $this->city,
            'country' => $this->country,
            'notes' => $this->notes,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'vendor_orders' => VendorOrderResource::collection($this->whenLoaded('vendorOrders')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
