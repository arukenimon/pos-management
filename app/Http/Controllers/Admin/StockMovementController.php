<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockMovementController extends Controller
{
    public function index(Request $request)
    {
        $query = StockMovement::with([
            'variant.product:id,name,images',
            'variant.attributeValues.attribute',
            'performedBy:id,name',
        ])->orderByDesc('created_at');

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        if ($search = $request->query('search')) {
            $query->whereHas('variant', function ($q) use ($search) {
                $q->where('sku', 'like', "%{$search}%")
                  ->orWhereHas('product', fn ($pq) => $pq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($from = $request->query('from')) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to = $request->query('to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        $movements = $query->paginate(25)->withQueryString()
            ->through(fn ($m) => [
                'id'           => $m->id,
                'type'         => $m->type,
                'quantity'     => $m->quantity,
                'note'         => $m->note,
                'created_at'   => $m->created_at->format('M d, Y H:i'),
                'performed_by' => $m->performedBy?->name,
                'variant_sku'  => $m->variant?->sku,
                'product_name' => $m->variant?->product?->name,
                'product_image'=> $m->variant?->product?->images[0] ?? null,
                'variant_label'=> $m->variant?->attributeValues
                    ? $m->variant->attributeValues->map(fn ($av) => $av->value)->join(' / ')
                    : $m->variant?->sku,
            ]);

        $summary = [
            'total_in'  => (int) StockMovement::where('quantity', '>', 0)->sum('quantity'),
            'total_out' => (int) abs(StockMovement::where('quantity', '<', 0)->sum('quantity')),
            'purchases' => StockMovement::where('type', 'purchase')->count(),
            'sales'     => StockMovement::where('type', 'sale')->count(),
        ];

        return Inertia::render('Auth/Admin/Inventory/Movements', [
            'movements' => $movements,
            'filters'   => $request->only(['type', 'search', 'from', 'to']),
            'summary'   => $summary,
        ]);
    }
}
