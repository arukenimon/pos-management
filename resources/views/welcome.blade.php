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
    <meta name="theme-color" content="#4f46e5">

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
<body class="font-sans antialiased bg-white text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900">
    <header class="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-slate-200/70">
        <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" class="flex items-center gap-2.5 font-semibold text-lg tracking-tight text-slate-900">
                <span class="grid place-items-center w-8 h-8 rounded-lg bg-indigo-600 text-white text-sm">●</span>
                <span>{{ $appName }}</span>
            </a>
            <nav class="flex items-center gap-2 sm:gap-3 text-sm">
                @auth
                    <a href="{{ route('dashboard') }}" class="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition">Open dashboard</a>
                @else
                    <a href="{{ route('login') }}" class="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 transition">Log in</a>
                    <a href="{{ route('register') }}" class="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition">Get started</a>
                @endauth
            </nav>
        </div>
    </header>

    <main>
        {{-- Hero --}}
        <section class="relative overflow-hidden bg-slate-50/60">
            {{-- One quiet wash + faint grid, no bright color blobs --}}
            <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10">
                <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[48rem] h-[32rem] rounded-full bg-indigo-200/30 blur-3xl"></div>
                <div class="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"></div>
            </div>

            <div class="max-w-6xl mx-auto px-6 py-24 md:py-32 text-center">
                <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-wide text-slate-600 bg-white ring-1 ring-inset ring-slate-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Built for single shops &amp; multi-location brands
                </span>
                <h1 class="mt-6 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.1] text-slate-900">
                    Point of sale, built for the<br class="hidden md:block">
                    way you <span class="text-indigo-600">actually run your shop.</span>
                </h1>
                <p class="mt-6 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto">
                    {{ $appName }} gives single-location retailers and multi-shop brands one place to ring up sales,
                    track inventory, and understand what's working — without thexx spreadsheets.
                </p>
                <div class="mt-10 flex flex-wrap items-center justify-center gap-3">
                    @guest
                        <a href="{{ route('register') }}" class="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium shadow-sm hover:bg-indigo-700 hover:-translate-y-0.5 transition">Start free</a>
                        <a href="{{ route('login') }}" class="px-6 py-3 rounded-xl font-medium text-slate-700 bg-white ring-1 ring-inset ring-slate-300 hover:ring-slate-400 transition">Sign in</a>
                    @else
                        <a href="{{ route('dashboard') }}" class="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium shadow-sm hover:bg-indigo-700 hover:-translate-y-0.5 transition">Go to dashboard</a>
                    @endguest
                </div>
                <p class="mt-5 text-sm text-slate-400">No credit card required · Set up in minutes</p>
            </div>
        </section>

        {{-- Features --}}
        <section class="max-w-6xl mx-auto px-6 py-24">
            <div class="text-center max-w-2xl mx-auto">
                <p class="text-sm font-semibold tracking-wide text-indigo-600 uppercase">Features</p>
                <h2 class="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Everything you need behind the counter</h2>
                <p class="mt-4 text-slate-500">From the first sale to a fleet of locations — one calm, fast workspace.</p>
            </div>

            <div class="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                @php
                    // Muted, tinted accents — soft background + colored icon, not bright fills.
                    $features = [
                        ['Fast checkout', 'A keyboard-friendly POS that handles cash, card, and variant pricing in seconds.', 'bg-indigo-50 text-indigo-600 ring-indigo-100', '⚡'],
                        ['Live inventory', "Stock moves are recorded as they happen. Know what's in the back room without counting it.", 'bg-emerald-50 text-emerald-600 ring-emerald-100', '📦'],
                        ['Sales analytics', 'See revenue, top sellers, and slow movers in one view — filter by day, shop, or category.', 'bg-violet-50 text-violet-600 ring-violet-100', '📈'],
                        ['Multi-shop ready', 'Run several locations from one account. Switch between shops in a click.', 'bg-sky-50 text-sky-600 ring-sky-100', '🏬'],
                        ['Team roles', 'Invite owners, managers, and cashiers with the right access for each role.', 'bg-amber-50 text-amber-600 ring-amber-100', '👥'],
                        ['Works on any browser', 'No installs. Open it on a tablet at the counter or a laptop in the back office.', 'bg-rose-50 text-rose-600 ring-rose-100', '🌐'],
                    ];
                @endphp
                @foreach ($features as [$heading, $copy, $tint, $glyph])
                    <div class="group">
                        <div class="inline-grid place-items-center w-11 h-11 rounded-xl text-lg ring-1 ring-inset {{ $tint }} transition group-hover:scale-105">
                            {{ $glyph }}
                        </div>
                        <h3 class="mt-5 font-semibold text-lg tracking-tight text-slate-900">{{ $heading }}</h3>
                        <p class="mt-2 text-slate-500 leading-relaxed">{{ $copy }}</p>
                    </div>
                @endforeach
            </div>
        </section>

        {{-- How it works --}}
        <section class="relative bg-slate-50/70 border-y border-slate-200/70">
            <div class="max-w-6xl mx-auto px-6 py-24">
                <div class="text-center max-w-2xl mx-auto">
                    <p class="text-sm font-semibold tracking-wide text-indigo-600 uppercase">How it works</p>
                    <h2 class="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">From sign-up to your first sale in four steps</h2>
                    <p class="mt-4 text-slate-500">No installs, no setup calls. Create an account and the workspace walks you through the rest.</p>
                </div>

                <div class="mt-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
                    @php
                        $steps = [
                            ['Create your shop', 'Sign up and name your shop. Adding a second or third location later is a single click.'],
                            ['Add your products', 'Enter items, prices, and variants — or import them. Stock levels start tracking right away.'],
                            ['Invite your team', 'Add owners, managers, and cashiers. Everyone gets exactly the access their role needs.'],
                            ['Start selling', 'Open the POS on any browser, ring up sales, and watch inventory and analytics update live.'],
                        ];
                    @endphp
                    @foreach ($steps as $i => [$heading, $copy])
                        <div class="relative">
                            <div class="flex items-center gap-3">
                                <span class="grid place-items-center w-9 h-9 rounded-full bg-white text-indigo-600 font-semibold ring-1 ring-inset ring-indigo-100">{{ $i + 1 }}</span>
                                @unless ($loop->last)
                                    <span aria-hidden="true" class="hidden lg:block flex-1 h-px bg-slate-200"></span>
                                @endunless
                            </div>
                            <h3 class="mt-5 font-semibold text-lg tracking-tight text-slate-900">{{ $heading }}</h3>
                            <p class="mt-2 text-slate-500 leading-relaxed">{{ $copy }}</p>
                        </div>
                    @endforeach
                </div>
            </div>
        </section>

        {{-- CTA --}}
        <section class="px-6 py-24">
            <div class="relative max-w-5xl mx-auto overflow-hidden rounded-3xl px-8 py-16 md:py-20 text-center bg-slate-900">
                <div aria-hidden="true" class="absolute inset-0 -z-0 opacity-60 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.35),transparent_60%)]"></div>
                <div class="relative">
                    <h2 class="text-3xl md:text-4xl font-semibold tracking-tight text-white">Ready to set up your shop?</h2>
                    <p class="mt-4 text-slate-300 max-w-xl mx-auto">Create an account and you'll be ringing up your first sale in minutes.</p>
                    <div class="mt-8">
                        @guest
                            <a href="{{ route('register') }}" class="inline-block px-7 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:-translate-y-0.5 transition">Create your shop</a>
                        @else
                            <a href="{{ route('dashboard') }}" class="inline-block px-7 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:-translate-y-0.5 transition">Go to dashboard</a>
                        @endguest
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer class="border-t border-slate-200/70">
        <div class="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-500">
            <p class="flex items-center gap-2">
                <span class="grid place-items-center w-5 h-5 rounded-md bg-indigo-600 text-white text-[10px]">●</span>
                &copy; {{ date('Y') }} {{ $appName }}. All rights reserved.
            </p>
            <!-- <nav class="flex items-center gap-5">
                <a href="{{ route('login') }}" class="hover:text-indigo-600 transition">Log in</a>
                <a href="{{ route('register') }}" class="hover:text-indigo-600 transition">Get started</a>
            </nav> -->
        </div>
    </footer>
</body>
</html>
