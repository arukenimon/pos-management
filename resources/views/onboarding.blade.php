<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
<head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow">
    <title>Set up your shop — {{ config('app.name', 'TindaHub') }}</title>
    <link rel="icon" href="{{ asset('favicon.svg') }}" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.bunny.net"><link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap" rel="stylesheet">
    <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,600,700,800&display=swap" rel="stylesheet">
    <script>try { document.documentElement.classList.toggle('dark', localStorage.getItem('tindahub.theme.v2') !== 'light'); } catch (_) {}</script>
    @vite(['resources/css/app.css'])
</head>
<body class="flex min-h-screen flex-col bg-background px-6 py-8 font-sans text-foreground antialiased">
    <a href="{{ route('home') }}" class="mx-auto inline-flex items-center gap-2.5 rounded-lg"><img src="{{ asset('favicon.svg') }}" width="34" height="34" alt=""><span class="font-display text-2xl font-bold tracking-tight">TindaHub<span class="text-primary">.</span></span></a>
    <main class="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center py-12">
        <div class="dashboard-card p-7 sm:p-10"><span class="dashboard-icon mb-6"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-5 w-5" aria-hidden="true"><path d="M3 10h18l-2-6H5l-2 6Zm1 0v10h16V10M9 20v-7h6v7"/></svg></span>
        <h1 class="text-4xl font-semibold leading-tight tracking-tight">A place for your shop.</h1>
        <p class="mt-5 text-sm leading-7 text-muted-foreground">Your account isn’t connected to a shop yet. Ask your shop owner to invite you, or contact your administrator to get access.</p>
        <div class="mt-8 flex flex-wrap items-center gap-3"><a href="{{ route('profile.edit') }}" class="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary/90">Open your profile</a><form method="POST" action="{{ route('logout') }}">@csrf<button type="submit" class="inline-flex min-h-11 items-center rounded-lg border border-border px-5 text-sm font-medium transition-colors hover:bg-muted">Sign out</button></form></div>
        </div>
    </main>
    <p class="text-center text-xs text-muted-foreground">Your shop, connected.</p>
</body>
</html>
