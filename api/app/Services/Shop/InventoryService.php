<?php

namespace App\Services\Shop;

use App\Enums\Shop\InventoryReasonEnum;
use App\Models\Shop\InventoryLog;
use App\Models\Shop\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use InvalidArgumentException;
use RuntimeException;

class InventoryService
{
    /**
     * Decrement stock for a sale. Product row must already be locked for update.
     */
    public function decrement(
        Product $product,
        int $quantity,
        InventoryReasonEnum $reason = InventoryReasonEnum::SALE,
        ?Model $reference = null,
        ?User $actor = null,
    ): InventoryLog {
        if ($quantity <= 0) {
            throw new InvalidArgumentException('Decrement quantity must be positive.');
        }

        if ($product->stock_quantity < $quantity) {
            throw new RuntimeException("Insufficient stock for product: {$product->name}.");
        }

        $product->decrement('stock_quantity', $quantity);
        $product->refresh();

        return $this->log($product, -$quantity, $reason, $reference, $actor);
    }

    /**
     * Restore stock (e.g. cancel). Product row must already be locked for update.
     */
    public function restore(
        Product $product,
        int $quantity,
        InventoryReasonEnum $reason = InventoryReasonEnum::CANCEL_RESTORE,
        ?Model $reference = null,
        ?User $actor = null,
    ): InventoryLog {
        if ($quantity <= 0) {
            throw new InvalidArgumentException('Restore quantity must be positive.');
        }

        $product->increment('stock_quantity', $quantity);
        $product->refresh();

        return $this->log($product, $quantity, $reason, $reference, $actor);
    }

    /**
     * Set absolute stock quantity (logs delta). Product row should be locked when called inside a txn.
     */
    public function setQuantity(
        Product $product,
        int $quantity,
        InventoryReasonEnum $reason = InventoryReasonEnum::MANUAL,
        ?Model $reference = null,
        ?User $actor = null,
    ): ?InventoryLog {
        if ($quantity < 0) {
            throw new InvalidArgumentException('Stock quantity cannot be negative.');
        }

        $delta = $quantity - (int) $product->stock_quantity;
        if ($delta === 0) {
            return null;
        }

        $product->update(['stock_quantity' => $quantity]);
        $product->refresh();

        return $this->log($product, $delta, $reason, $reference, $actor);
    }

    private function log(
        Product $product,
        int $delta,
        InventoryReasonEnum $reason,
        ?Model $reference,
        ?User $actor,
    ): InventoryLog {
        return InventoryLog::create([
            'product_id' => $product->id,
            'vendor_id' => $product->vendor_id,
            'delta' => $delta,
            'quantity_after' => (int) $product->stock_quantity,
            'reason' => $reason,
            'reference_type' => $reference ? $reference->getMorphClass() : null,
            'reference_id' => $reference?->getKey(),
            'actor_user_id' => $actor?->id,
        ]);
    }
}
