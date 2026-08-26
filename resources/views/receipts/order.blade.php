<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Receipt #{{ str_pad($order->id, 5, '0', STR_PAD_LEFT) }}</title>
    <style>
        body { font: 14px/1.45 Arial, sans-serif; color: #102a2a; margin: 32px auto; max-width: 420px; }
        h1 { font-size: 21px; margin: 0 0 4px; } .muted { color: #54706d; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; } td { padding: 7px 0; vertical-align: top; }
        .amount { text-align: right; white-space: nowrap; } .total td { border-top: 1px solid #d9e8e5; font-size: 16px; font-weight: 700; padding-top: 12px; }
        .status { display: inline-block; margin-top: 12px; padding: 3px 8px; border-radius: 999px; background: #d7f3ed; color: #0f766e; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        @media print { body { margin: 0 auto; } .no-print { display: none; } }
    </style>
</head>
<body>
    <button class="no-print" onclick="window.print()">Print receipt</button>
    <h1>{{ $shop->name }}</h1>
    <p class="muted">Receipt #{{ str_pad($order->id, 5, '0', STR_PAD_LEFT) }} · {{ $order->created_at->format('M d, Y g:i A') }}<br>Cashier: {{ $order->cashier->name }}</p>
    @if ($order->status !== 'completed')<span class="status">{{ $order->status }}</span>@endif
    <table>
        @foreach ($order->items as $item)
            <tr><td>{{ $item->variant->product->name }} × {{ $item->quantity }}</td><td class="amount">₱{{ number_format($item->subtotal, 2) }}</td></tr>
        @endforeach
        <tr class="total"><td>Total</td><td class="amount">₱{{ number_format($order->total, 2) }}</td></tr>
        <tr><td>Payment</td><td class="amount">{{ ucfirst($order->payment_method) }}</td></tr>
    </table>
    @if ($order->status !== 'completed' && $order->correction_reason)<p class="muted">Reason: {{ $order->correction_reason }}</p>@endif
</body>
</html>
