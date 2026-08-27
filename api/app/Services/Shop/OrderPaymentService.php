<?php

namespace App\Services\Shop;

use App\Enums\Shop\PaymentStatusEnum;
use App\Models\Shop\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class OrderPaymentService
{
    /**
     * Record received amount / payment status (admin or vendor).
     * When amount_received is set for advance/paid, status is derived from amount vs total
     * (paid if >= total, advance if 0 < amount < total, unpaid if amount empty/0).
     *
     * @param  array{payment_status: string, amount_received?: float|null}  $data
     */
    public function verify(Order $order, array $data, User $actor): Order
    {
        return DB::transaction(function () use ($order, $data, $actor) {
            $order = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();
            $status = PaymentStatusEnum::from($data['payment_status']);

            if ($status === PaymentStatusEnum::REFUNDED) {
                throw new InvalidArgumentException('Use a dedicated refund flow for refund statuses.');
            }

            $amountReceived = array_key_exists('amount_received', $data)
                ? ($data['amount_received'] !== null ? (float) $data['amount_received'] : null)
                : ($order->amount_received !== null ? (float) $order->amount_received : null);

            if (in_array($status, [PaymentStatusEnum::PAID, PaymentStatusEnum::ADVANCE], true)) {
                if ($amountReceived === null) {
                    throw new InvalidArgumentException('amount_received is required when marking advance or paid.');
                }

                if ($amountReceived <= 0.009) {
                    $status = PaymentStatusEnum::UNPAID;
                    $amountReceived = null;
                } elseif ($amountReceived + 0.009 >= (float) $order->total) {
                    $status = PaymentStatusEnum::PAID;
                } else {
                    $status = PaymentStatusEnum::ADVANCE;
                }
            }

            $payload = [
                'payment_status' => $status,
                'amount_received' => $amountReceived,
            ];

            if (in_array($status, [PaymentStatusEnum::PAID, PaymentStatusEnum::ADVANCE], true)) {
                $payload['payment_verified_at'] = now();
                $payload['payment_verified_by'] = $actor->id;
            }

            if ($status === PaymentStatusEnum::UNPAID) {
                $payload['payment_verified_at'] = null;
                $payload['payment_verified_by'] = null;
                $payload['amount_received'] = null;
            }

            $order->update($payload);

            return $order->fresh(['items', 'vendorOrders', 'user', 'paymentVerifier']);
        });
    }

    /**
     * Manual refund recording (no gateway reverse).
     * `amount_received` is the remaining received balance after refund (not the refund amount).
     *
     * @param  array{payment_status?: string, amount_received?: float|null, notes?: string|null}  $data
     */
    public function refund(Order $order, array $data, User $actor): Order
    {
        return DB::transaction(function () use ($order, $data, $actor) {
            $order = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();

            if (! in_array($order->payment_status, [
                PaymentStatusEnum::PAID,
                PaymentStatusEnum::ADVANCE,
            ], true)) {
                throw new InvalidArgumentException('Only paid or advance orders can be refunded.');
            }

            $status = PaymentStatusEnum::from(
                $data['payment_status'] ?? PaymentStatusEnum::REFUNDED->value
            );

            if ($status !== PaymentStatusEnum::REFUNDED) {
                throw new InvalidArgumentException('Refund status must be refunded.');
            }

            $previousReceived = (float) ($order->amount_received ?? 0);

            $amountReceived = array_key_exists('amount_received', $data)
                ? ($data['amount_received'] !== null ? (float) $data['amount_received'] : null)
                : 0.0;

            if ($amountReceived === null) {
                throw new InvalidArgumentException('amount_received is required for refunds.');
            }

            if ($amountReceived < 0) {
                throw new InvalidArgumentException('Refund remaining amount cannot be negative.');
            }

            if ($amountReceived > $previousReceived + 0.009) {
                throw new InvalidArgumentException('Refund remaining amount cannot exceed amount previously received.');
            }

            // Full refund status: remaining balance must be zero.
            if ($amountReceived > 0.009) {
                throw new InvalidArgumentException('Full refund requires amount_received to be 0.');
            }

            $payload = [
                'payment_status' => PaymentStatusEnum::REFUNDED,
                'amount_received' => 0,
                'payment_verified_at' => now(),
                'payment_verified_by' => $actor->id,
            ];

            if (! empty($data['notes'])) {
                $existing = (string) ($order->notes ?? '');
                $payload['notes'] = trim($existing."\n[Refund] ".$data['notes']);
            }

            $order->update($payload);

            return $order->fresh(['items', 'vendorOrders', 'user', 'paymentVerifier']);
        });
    }
}
