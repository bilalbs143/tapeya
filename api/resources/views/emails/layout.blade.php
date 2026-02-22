<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $subject ?? config('app.name') }}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 24px; }
        .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        table.items { width: 100%; border-collapse: collapse; margin: 16px 0; }
        table.items th, table.items td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; }
        table.items th { background: #f8f9fa; font-weight: 600; }
        .total-row { font-weight: 700; font-size: 1.05em; }
        .meta { background: #f8f9fa; padding: 12px 16px; border-radius: 8px; margin: 16px 0; }
    </style>
</head>
<body>
    <div class="header">
        <strong>{{ config('app.name') }}</strong>
    </div>
    @yield('content')
    <div class="footer">
        {{ config('app.name') }} — {{ config('app.url') }}
    </div>
</body>
</html>
