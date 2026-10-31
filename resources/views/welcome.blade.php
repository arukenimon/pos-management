@php
    $appName = config('app.name', 'TindaHub');
    $startUrl = auth()->check() ? route('dashboard') : route('register');
    $startLabel = auth()->check() ? 'Open your workspace' : 'Get started';
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="A little less busy. A lot more business. TindaHub connects your sales, inventory, and team in one point-of-sale workspace, built for neighborhood shops.">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <meta name="theme-color" content="#080f21">
    <link rel="canonical" href="{{ route('home') }}">
    <link rel="icon" href="{{ asset('favicon.svg') }}" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap" rel="stylesheet">
    <link rel="preconnect" href="https://api.fontshare.com">
    <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,600,700,800&display=swap" rel="stylesheet">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="{{ $appName }}">
    <meta property="og:title" content="{{ $appName }} — Your shop. In a good place.">
    <meta property="og:description" content="Sales, inventory, and your team. A connected workspace for your everyday business.">
    <meta property="og:url" content="{{ route('home') }}">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="{{ $appName }} — Your shop. In a good place.">
    <meta name="twitter:description" content="Sales, inventory, and your team. A connected workspace for your everyday business.">
    <title>{{ $appName }} — Your shop. In a good place.</title>
    <script>try { document.documentElement.classList.toggle('dark', localStorage.getItem('tindahub.theme.v2') !== 'light'); } catch (_) {}</script>
    <script type="application/ld+json">{!! json_encode(['@context' => 'https://schema.org', '@type' => 'SoftwareApplication', 'name' => $appName, 'applicationCategory' => 'BusinessApplication', 'operatingSystem' => 'Web', 'description' => 'A connected point-of-sale and inventory workspace for small businesses.', 'url' => route('home')], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>
    @vite(['resources/css/app.css', 'resources/js/marketing.ts'])
</head>
<body class="marketing-page bg-background text-foreground">
    <a href="#main-content" class="skip-link">Skip to content</a>
    <header class="marketing-header">
        <div class="marketing-shell marketing-nav">
            <a class="marketing-brand" href="{{ route('home') }}" aria-label="TindaHub home"><img src="{{ asset('favicon.svg') }}" alt="" width="34" height="34"><span>TindaHub<em>.</em></span></a>
            <nav class="marketing-nav-links" aria-label="Main navigation"><a href="#features">The product</a><a href="#how-it-works">How it works</a><a href="#questions">Questions?</a></nav>
            <div class="marketing-nav-actions">
                <button type="button" class="utility-button" data-theme-toggle aria-label="Switch to light mode"><x-marketing.icon name="sun" class="h-[18px] w-[18px]" /></button>
                @guest <a class="marketing-login" href="{{ route('login') }}">Log in</a> @endguest
                <a class="marketing-button" href="{{ $startUrl }}">{{ $startLabel }}<x-marketing.icon name="up-right" /></a>
                <details class="marketing-mobile-menu"><summary aria-label="Open navigation"><span class="menu-lines" aria-hidden="true"></span></summary><nav aria-label="Mobile navigation"><a href="#features">The product</a><a href="#how-it-works">How it works</a><a href="#questions">Questions?</a>@guest<a href="{{ route('login') }}">Log in</a>@endguest</nav></details>
            </div>
        </div>
    </header>
    <main id="main-content" class="overflow-x-hidden w-full max-w-full">
        <section class="marketing-hero" aria-labelledby="hero-heading">
            <div class="marketing-shell hero-inner">
                <div class="hero-copy">
                    <h1 id="hero-heading" class="max-w-5xl" data-hero-copy>Your shop.<span>In a good place.</span></h1>
                    <p data-hero-copy>Less keeping up. More moving forward. Bring your sales, stock, and team together in one beautifully simple workspace.</p>
                    <div class="hero-actions" data-hero-copy><a href="{{ $startUrl }}" class="marketing-button large">{{ $startLabel }}<x-marketing.icon name="arrow" /></a><a href="#how-it-works" class="marketing-button secondary large">Take a closer look<x-marketing.icon name="up-right" /></a></div>
                    <div class="hero-caption" data-hero-copy><x-marketing.icon name="check" />Built for the way small businesses work.</div>
                </div>
                <figure class="hero-art"><x-marketing.product-preview mode="overview" id="hero" /><figcaption>A glimpse of your workspace. Illustrative data.</figcaption></figure>
            </div>
        </section>
        <div class="feature-marquee" aria-label="Connected tools for your shop">
            <div class="marquee-track" aria-hidden="true">
                @for($copy = 0; $copy < 2; $copy++)
                <div class="marquee-group" @if($copy) aria-hidden="true" @endif>
                    @foreach([['scan','Smoother checkouts'],['box','Stock in sync'],['chart','Clearer insights'],['team','A connected team'],['check','A better everyday']] as $feature)<span><x-marketing.icon :name="$feature[0]" />{{ $feature[1] }}</span>@endforeach
                </div>
                @endfor
            </div>
            <button type="button" class="marquee-pause" data-marquee-toggle aria-label="Pause feature animation" aria-pressed="false"><svg viewBox="0 0 20 20" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M5 4h3v12H5zM12 4h3v12h-3z"/></svg></button>
        </div>
        <section id="features" class="marketing-section marketing-shell" aria-labelledby="features-heading">
            <div class="section-intro" data-reveal><h2 id="features-heading">Big plans.<br>Meet the little details.</h2><p>The everyday tools that make a difference. Thoughtfully connected, so you can focus on what comes next.</p></div>
            <div class="feature-grid grid-flow-dense">
                <article class="feature-card" data-reveal><x-marketing.icon name="scan" /><h3>Goodbye, checkout chaos.</h3><p>Scan, add, and sell. Keep the line moving with quick product search, cash and card payments, and clear receipts.</p><div class="card-art" aria-hidden="true"><div class="card-receipt"><strong>A little moment, sorted.</strong><small>A sample sale at your shop</small><div class="receipt-line"><span>Coffee beans × 1</span><span>₱180.00</span></div><div class="receipt-line"><span>Oat milk × 2</span><span>₱250.00</span></div><div class="receipt-total"><span>Total</span><strong>₱430.00</strong></div></div></div></article>
                <article class="feature-card" data-reveal><x-marketing.icon name="box" /><h3>Stock, without the guesswork.</h3><p>Follow every product and variant. Get a heads-up when stock runs low, before a customer has to ask.</p><div class="inventory-art" aria-hidden="true"><div class="inventory-art-row"><x-marketing.icon name="box" /><strong>Coffee beans</strong><span><x-marketing.icon name="check" />In stock</span></div><div class="inventory-art-row"><x-marketing.icon name="box" /><strong>Oat milk</strong><span>Running low</span></div><div class="inventory-art-row"><x-marketing.icon name="box" /><strong>Sourdough</strong><span><x-marketing.icon name="check" />In stock</span></div></div></article>
                <article class="feature-card" data-reveal><x-marketing.icon name="team" /><h3>Everyone, on the same page.</h3><p>A workspace for your whole team. Give owners, managers, and cashiers the access they need.</p><div class="team-art" aria-hidden="true"><div class="team-person"><i>M</i><span>Owner</span></div><div class="team-person"><i>J</i><span>Manager</span></div><div class="team-person"><i>A</i><span>Cashier</span></div></div></article>
                <article class="feature-card" data-reveal><x-marketing.icon name="chart" /><h3>See the bigger picture.</h3><p>Your sales, best-selling products, and stock movements in one clear view. Less spreadsheet time. More perspective.</p><div class="card-chart" aria-hidden="true">@foreach([35,52,44,68,61,88,77,100,82,94] as $height)<i style="--bar-height: {{ $height }}%"></i>@endforeach</div></article>
            </div>
            <div class="feature-accordion" aria-label="Explore the connected tools">
                <details class="accordion-item" open><summary>Your catalog, organized.<x-marketing.icon name="plus" /></summary><p>Products, variants, barcodes, and incoming stock. Give every item a place and find it when you need it.</p></details>
                <details class="accordion-item"><summary>Your team, connected.<x-marketing.icon name="plus" /></summary><p>Invite the people who keep your shop moving, with access that fits their role.</p></details>
                <details class="accordion-item"><summary>Your numbers, clearer.<x-marketing.icon name="plus" /></summary><p>Keep sales, stock movements, and cash shifts close at hand. See what happened and plan what comes next.</p></details>
            </div>
        </section>
        <section id="how-it-works" class="marketing-section tour-section" aria-labelledby="tour-heading">
            <div class="marketing-shell tour-layout">
                <div class="tour-copy"><h2 id="tour-heading">One workspace.<br>Your whole day.</h2><p>Open the doors. Make the sale. Know where you stand. Every part of your business, working together.</p><a href="{{ $startUrl }}" class="marketing-button secondary">Find your flow<x-marketing.icon name="arrow" /></a></div>
                <div class="tour-cards">
                    <article class="tour-card"><h3>Make every sale feel simple.</h3><p>Find the right product, choose a payment method, and get back to your customer.</p><x-marketing.product-preview mode="checkout" id="tour-checkout" /><small>Product preview with illustrative data.</small></article>
                    <article class="tour-card"><h3>Know what’s on your shelves.</h3><p>Every sale updates your inventory. Follow quantities, variants, and stock batches as you go.</p><x-marketing.product-preview mode="inventory" id="tour-inventory" /><small>Product preview with illustrative data.</small></article>
                    <article class="tour-card"><h3>Close the day with clarity.</h3><p>Review your sales and cash shifts. Give tomorrow a clearer starting point.</p><x-marketing.product-preview mode="overview" id="tour-overview" /><small>Product preview with illustrative data.</small></article>
                </div>
            </div>
        </section>
        <section class="story-reveal" aria-label="Our approach"><div class="marketing-shell"><p data-word-reveal>Your business is more than the things you sell. It’s the people you serve, the team beside you, and the good days you’re building toward.</p><small>We’re here to make the everyday a little easier.</small></div></section>
        <section class="marketing-section marketing-shell" aria-labelledby="day-heading">
            <div class="section-intro" data-reveal><h2 id="day-heading">Made for your kind of day.</h2><p>From the quiet start to the last sale. A little more control, every step of the way.</p></div>
            <div class="day-carousel" data-carousel role="region" aria-roledescription="carousel" aria-label="A day with TindaHub">
                <div aria-live="polite" aria-atomic="true">
                    @foreach([
                        ['Open with confidence.', 'A quick look at stock and recent activity helps you start the day knowing what needs your attention.', 'overview', 'chart'],
                        ['Keep the good days moving.', 'Find products, scan barcodes, and handle cash or card payments while your stock stays up to date.', 'checkout', 'scan'],
                        ['Every detail, accounted for.', 'Check inventory and sales before you call it a day. Your next shift starts with a clearer picture.', 'inventory', 'box']
                    ] as $index => $slide)
                    <article class="day-slide" data-slide @if($index) hidden @endif role="group" aria-roledescription="slide" aria-label="{{ $index + 1 }} of 3"><div class="day-slide-copy"><x-marketing.icon :name="$slide[3]" /><h3>{{ $slide[0] }}</h3><p>{{ $slide[1] }}</p></div><div class="day-slide-art" aria-hidden="true"><x-marketing.product-preview :mode="$slide[2]" :id="'day-'.$index" /></div></article>
                    @endforeach
                </div>
                <div class="carousel-controls"><button type="button" data-carousel-prev aria-label="Previous slide"><x-marketing.icon name="arrow" /></button><button type="button" data-carousel-next aria-label="Next slide"><x-marketing.icon name="arrow" /></button></div>
            </div>
        </section>
        <section id="questions" class="marketing-section marketing-shell faq-layout" aria-labelledby="faq-heading">
            <div><h2 id="faq-heading">A few things<br>you might be wondering.</h2><p>Getting started should feel as straightforward as running your next sale.</p></div>
            <div>
                @foreach([
                    ['What do I need to get started?', 'Create an account, name your shop, and add your products and opening stock. TindaHub runs in your browser, so you can manage the shop from your computer or phone.'],
                    ['Can my team use it too?', 'Yes. Owners can invite team members and assign owner, manager, or cashier access. Each person sees the tools their role can use.'],
                    ['Does it work with barcodes?', 'Yes. Product management supports barcode lookup, and checkout supports product search and barcode scanners. You can also look up products with your device camera where supported.'],
                    ['What happens to stock after a sale?', 'Completed sales deduct stock from your inventory automatically. Stock movements keep a record of sales, incoming stock, and adjustments.'],
                    ['Can I review and export my sales?', 'Owners and managers can review sales and analytics. Shop owners can export sales and inventory reports as CSV or PDF.']
                ] as $faq)<details class="faq-item"><summary>{{ $faq[0] }}<x-marketing.icon name="plus" /></summary><p>{{ $faq[1] }}</p></details>@endforeach
            </div>
        </section>
        <section class="marketing-final" aria-labelledby="cta-heading"><div class="marketing-shell"><h2 id="cta-heading">Good things start<br><span>with a little clarity.</span></h2><p>Your next chapter deserves a workspace that keeps up. Let’s get your shop in a good place.</p><a href="{{ $startUrl }}" class="marketing-button large">{{ $startLabel }}<x-marketing.icon name="arrow" /></a></div></section>
    </main>
    <footer class="marketing-footer"><div class="marketing-shell"><div class="footer-inner"><div><a class="marketing-brand" href="{{ route('home') }}"><img src="{{ asset('favicon.svg') }}" alt="" width="34" height="34"><span>TindaHub<em>.</em></span></a><p>Your shop, connected.</p></div><nav class="footer-links" aria-label="Footer navigation"><a href="#features">The product</a><a href="#how-it-works">How it works</a><a href="{{ route('login') }}">Log in</a></nav></div><div class="footer-bottom"><span>&copy; {{ date('Y') }} {{ $appName }}. All rights reserved.</span><span>Made for the businesses that make a neighborhood.</span></div></div></footer>
</body>
</html>
