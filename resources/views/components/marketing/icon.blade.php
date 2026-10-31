@props(['name' => 'arrow', 'class' => ''])
<svg {{ $attributes->merge(['class' => $class]) }} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    @switch($name)
        @case('arrow')<path d="M5 12h14M13 6l6 6-6 6"/>@break
        @case('up-right')<path d="M6 18 18 6M6 6h12v12"/>@break
        @case('box')<path d="m12 3 9 5-9 5-9-5 9-5ZM3 8v9l9 5 9-5V8M12 13v9M7.5 5.5l9 5"/>@break
        @case('scan')<path d="M4 8V4h4m8 0h4v4M4 16v4h4m8 0h4v-4M7 8v8m3-8v8m4-8v8m3-8v8M2 12h20"/>@break
        @case('chart')<path d="M4 4v16h16M8 14l4-5 4 3 4-7"/>@break
        @case('team')<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3a4 4 0 0 1 0 8"/><circle cx="9" cy="7" r="4"/>@break
        @case('check')<path d="m5 12 4 4L19 6"/>@break
        @case('chevron')<path d="m9 5 7 7-7 7"/>@break
        @case('plus')<path d="M12 5v14M5 12h14"/>@break
        @case('sun')<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>@break
    @endswitch
</svg>
