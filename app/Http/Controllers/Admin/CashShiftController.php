<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CashShift;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashShiftController extends Controller
{
    public function index(Request $request)
    {
        $active = CashShift::where('user_id', $request->user()->id)->whereNull('closed_at')->latest('opened_at')->first();
        $history = CashShift::where('user_id', $request->user()->id)->latest('opened_at')->limit(10)->get();
        return Inertia::render('Auth/Admin/POS/Shifts', compact('active', 'history'));
    }
    public function open(Request $request)
    {
        $data = $request->validate(['opening_float' => ['required', 'numeric', 'min:0']]);
        $existing = CashShift::where('user_id', $request->user()->id)->whereNull('closed_at')->exists();
        if ($existing) return back()->withErrors(['opening_float' => 'Close your active shift before opening another.']);
        CashShift::create(['user_id' => $request->user()->id, 'opening_float' => $data['opening_float'], 'opened_at' => now()]);
        return back()->with('success', 'Cash shift opened.');
    }
    public function close(Request $request)
    {
        $data = $request->validate(['closing_cash' => ['required', 'numeric', 'min:0'], 'notes' => ['nullable', 'string', 'max:500']]);
        $shift = CashShift::where('user_id', $request->user()->id)->whereNull('closed_at')->latest('opened_at')->firstOrFail();
        $cashSales = Order::where('cashier_id', $request->user()->id)->where('payment_method', 'cash')->where('status', 'completed')->whereBetween('created_at', [$shift->opened_at, now()])->sum('total');
        $expected = (float) $shift->opening_float + (float) $cashSales;
        $shift->update(['closing_cash' => $data['closing_cash'], 'expected_cash' => $expected, 'variance' => (float) $data['closing_cash'] - $expected, 'closed_at' => now(), 'notes' => $data['notes'] ?? null]);
        return back()->with('success', 'Cash shift closed and reconciled.');
    }
}
