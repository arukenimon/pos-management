@php
    $appName = config('app.name', 'POS');
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <title>Set up your shop — {{ $appName }}</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
    @vite(['resources/css/app.css'])
</head>
<body class="font-sans antialiased bg-neutral-50 text-neutral-900 min-h-screen flex items-center justify-center px-6">
    <div class="max-w-md w-full bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
        <h1 class="text-2xl font-semibold tracking-tight">You're almost set up</h1>
        <p class="mt-3 text-neutral-600">
            Your account isn't linked to a shop yet. Ask the owner to invite you, or contact your administrator
            to get access.
        </p>
        <div class="mt-6 flex items-center gap-3">
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit" class="px-4 py-2 rounded-md bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition">
                    Log out
                </button>
            </form>
            <a href="{{ route('profile.edit') }}" class="px-4 py-2 rounded-md border border-neutral-300 text-sm font-medium hover:bg-neutral-100 transition">
                Profile
            </a>
        </div>
    </div>
</body>
</html>
