<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ShopSelectorController extends Controller
{
    public function index()
    {
        $shops = Auth::user()->shops()->withPivot('role')->get()->map(fn ($s) => [
            'id'   => $s->id,
            'name' => $s->name,
            'slug' => $s->slug,
            'role' => $s->pivot->role,
        ]);

        return Inertia::render('ShopSelector', ['shops' => $shops]);
    }

    public function store(Request $request)
    {
        $request->validate(['slug' => 'required|string|exists:shops,slug']);

        $shop = Auth::user()->shops()->where('slug', $request->slug)->firstOrFail();

        return redirect()->route('admin.dashboard', ['shop' => $shop->slug]);
    }
}
