@php
    $appName        = config('app.name', 'POS');
    $appUrl         = rtrim(config('app.url', url('/')), '/');
    $title          = $appName . ' — Modern Point of Sale for Multi-Shop Retail';
    $description    = 'Run your retail business with confidence. ' . $appName . ' is a modern point-of-sale platform for single-shop operators and multi-location brands — manage inventory, ring up sales, and track performance from anywhere.';
    $canonical      = $appUrl . '/';
    $ogImage        = $appUrl . '/og-image.png';
    $structuredData = json_encode([
        '@context'            => 'https://schema.org',
        '@type'               => 'SoftwareApplication',
        'name'                => $appName,
        'applicationCategory' => 'BusinessApplication',
        'operatingSystem'     => 'Web',
        'url'                 => $canonical,
        'description'         => $description,
        'offers'              => ['@type' => 'Offer', 'price' => '0', 'priceCurrency' => 'USD'],
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#0a0a0a">

    <title>{{ $title }}</title>
    <meta name="description" content="{{ $description }}">
    <link rel="canonical" href="{{ $canonical }}">

    <meta property="og:type" content="website">
    <meta property="og:site_name" content="{{ $appName }}">
    <meta property="og:title" content="{{ $title }}">
    <meta property="og:description" content="{{ $description }}">
    <meta property="og:url" content="{{ $canonical }}">
    <meta property="og:image" content="{{ $ogImage }}">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $title }}">
    <meta name="twitter:description" content="{{ $description }}">
    <meta name="twitter:image" content="{{ $ogImage }}">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap" rel="stylesheet" />

    <script type="application/ld+json">{!! $structuredData !!}</script>

    @vite(['resources/css/app.css'])
</head>
<body class="font-sans antialiased bg-white text-neutral-900">
    <header class="border-b border-neutral-200">
        <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" class="font-semibold text-lg tracking-tight">{{ $appName }}</a>
            <nav class="flex items-center gap-3 text-sm">
                @auth
                    <a href="{{ route('dashboard') }}" class="px-4 py-2 rounded-md bg-neutral-900 text-white hover:bg-neutral-800 transition">Open dashboard</a>
                @else
                    <a href="{{ route('login') }}" class="px-4 py-2 rounded-md text-neutral-700 hover:text-neutral-900 transition">Log in</a>
                    <a href="{{ route('register') }}" class="px-4 py-2 rounded-md bg-neutral-900 text-white hover:bg-neutral-800 transition">Get started</a>
                @endauth
            </nav>
        </div>
    </header>

    <main>
        <section class="max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
            <h1 class="text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
                Point of sale, built for the way you actually run your shop.
            </h1>
            <p class="mt-6 text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto">
                {{ $appName }} gives single-location retailers and XXmulti-shop brands one place to ring up sales,
                track inventory, and understand what's working — without the spreadsheets.
            </p>
            <div class="mt-10 flex items-center justify-center gap-3">
                @guest
                    <a href="{{ route('register') }}" class="px-6 py-3 rounded-md bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition">Start free</a>
                    <a href="{{ route('login') }}" class="px-6 py-3 rounded-md border border-neutral-300 font-medium hover:bg-neutral-50 transition">Sign in</a>
                @else
                    <a href="{{ route('dashboard') }}" class="px-6 py-3 rounded-md bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition">Go to dashboard</a>
                @endguest
            </div>
        </section>

        <section class="max-w-6xl mx-auto px-6 py-16 border-t border-neutral-200">
            <h2 class="text-2xl md:text-3xl font-semibold tracking-tight text-center">Everything you need behind the counter</h2>
            <div class="mt-12 grid gap-8 md:grid-cols-3">
                <div>
                    <h3 class="font-semibold text-lg">Fast checkout</h3>
                    <p class="mt-2 text-neutral-600">A keyboard-friendly POS that handles cash, card, and variant pricing in seconds.</p>
                </div>
                <div>
                    <h3 class="font-semibold text-lg">Live inventory</h3>
                    <p class="mt-2 text-neutral-600">Stock moves are recorded as they happen. Know what's in the back room without counting it.</p>
                </div>
                <div>
                    <h3 class="font-semibold text-lg">Sales analytics</h3>
                    <p class="mt-2 text-neutral-600">See revenue, top sellers, and slow movers in one view — filter by day, shop, or category.</p>
                </div>
                <div>
                    <h3 class="font-semibold text-lg">Multi-shop ready</h3>
                    <p class="mt-2 text-neutral-600">Run several locations from one account. Switch between shops in a click.</p>
                </div>
                <div>
                    <h3 class="font-semibold text-lg">Team roles</h3>
                    <p class="mt-2 text-neutral-600">Invite owners, managers, and cashiers with the right access for each role.</p>
                </div>
                <div>
                    <h3 class="font-semibold text-lg">Works on any browser</h3>
                    <p class="mt-2 text-neutral-600">No installs. Open it on a tablet at the counter or a laptop in the back office.</p>
                </div>
            </div>
        </section>

        <section class="max-w-3xl mx-auto px-6 py-20 text-center">
            <h2 class="text-2xl md:text-3xl font-semibold tracking-tight">Ready to set up your shop?</h2>
            <p class="mt-4 text-neutral-600">Create an account and you'll be ringing up your first sale in minutes.</p>
            <div class="mt-8">
                @guest
                    <a href="{{ route('register') }}" class="px-6 py-3 rounded-md bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition">Create your shop</a>
                @else
                    <a href="{{ route('dashboard') }}" class="px-6 py-3 rounded-md bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition">Go to dashboard</a>
                @endguest
            </div>
        </section>
    </main>

    <footer class="border-t border-neutral-200">
        <div class="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-neutral-500">
            <p>&copy; {{ date('Y') }} {{ $appName }}. All rights reserved.</p>
            <nav class="flex items-center gap-4">
                <a href="{{ route('login') }}" class="hover:text-neutral-900 transition">Log in</a>
                <a href="{{ route('register') }}" class="hover:text-neutral-900 transition">Get started</a>
            </nav>
        </div>
    </footer>
</body>
</html>
