@extends('emails.layout')

@section('content')
<p>Hi {{ $customerName }},</p>
<p>Your order status has been updated.</p>

<div class="meta">
    <strong>Order number:</strong> {{ $orderNumber }}<br>
    <strong>New status:</strong> {{ $statusLabel }}<br>
    @if(!empty($previousStatusLabel))
    <strong>Previous status:</strong> {{ $previousStatusLabel }}<br>
    @endif
    <strong>Total:</strong> {{ $total }}<br>
    <strong>Shipping to:</strong> {{ $address }}, {{ $city }}, {{ $country }}
</div>

<table class="items">
    <thead>
        <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Unit price</th>
            <th>Total</th>
        </tr>
    </thead>
    <tbody>
        @foreach($items as $item)
        <tr>
            <td>{{ $item->product_snapshot['name'] ?? 'Product' }}</td>
            <td>{{ $item->quantity }}</td>
            <td>{{ $item->unit_price }} {{ $currency }}</td>
            <td>{{ $item->total_price }} {{ $currency }}</td>
        </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr><td colspan="3">Subtotal</td><td>{{ $subtotal }} {{ $currency }}</td></tr>
        @if((float) $order->shipping_amount > 0)
        <tr><td colspan="3">Shipping</td><td>{{ $order->shipping_amount }} {{ $currency }}</td></tr>
        @endif
        <tr class="total-row"><td colspan="3">Total</td><td>{{ $total }}</td></tr>
    </tfoot>
</table>

<p>Thank you for shopping with us.</p>
@endsection
