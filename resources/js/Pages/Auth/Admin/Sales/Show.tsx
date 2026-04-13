import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { ArrowLeft, Banknote, CreditCard, User, Calendar, Hash, TrendingUp } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
    id: number;
    quantity: number;
    unit_price: string;
    subtotal: string;
    cost_price: string | null;
    variant: {
        sku: string;
        price: string;
        attribute_values?: { value: string; attribute: { name: string } }[];
        product: { id: number; name: string; images?: string[] };
    };
}

interface Order {
    id: number;
    total: string;
    payment_method: 'cash' | 'card';
    cash_received: string | null;
    change_given: string | null;
    created_at: string;
    cashier: { id: number; name: string };
    items: OrderItem[];
}

interface ShowPageProps extends PageProps {
    order: Order;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const resolveImageSrc = (value: string): string => {
    if (value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://')) return value;
    if (value.startsWith('/storage/')) return value;
    if (value.startsWith('storage/')) return `/${value}`;
    return `/storage/${value}`;
};

const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-PH', { dateStyle: 'long', timeStyle: 'medium' });

const variantLabel = (item: OrderItem) => {
    const av = item.variant?.attribute_values;
    if (av?.length) return av.map(a => `${a.attribute.name}: ${a.value}`).join(', ');
    return item.variant?.sku ?? '—';
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SalesShow({ order }: ShowPageProps) {
    const isCash = order.payment_method === 'cash';

    const totalProfit = order.items.reduce((sum, item) => {
        if (item.cost_price === null) return sum;
        return sum + (Number(item.unit_price) - Number(item.cost_price)) * item.quantity;
    }, 0);
    const hasCostData = order.items.some(i => i.cost_price !== null);

    return (
        <AdminLayout
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href={route('admin.sales.index')}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Order #{String(order.id).padStart(5, '0')}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Transaction details</p>
                    </div>
                </div>
            }
        >
            <Head title={`Order #${String(order.id).padStart(5, '0')} - Sales`} />

            <div className="max-w-3xl mx-auto space-y-6">

                {/* Meta cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { icon: Hash,       label: 'Order ID',  value: `#${String(order.id).padStart(5, '0')}` },
                        { icon: User,       label: 'Cashier',   value: order.cashier?.name ?? '—'               },
                        { icon: Calendar,   label: 'Date',      value: formatDate(order.created_at)             },
                        {
                            icon: isCash ? Banknote : CreditCard,
                            label: 'Payment',
                            value: isCash ? 'Cash' : 'Card',
                        },
                    ].map(m => (
                        <div key={m.label} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            <m.icon className="h-4 w-4 text-gray-400 mb-1.5" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">{m.label}</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{m.value}</p>
                        </div>
                    ))}
                </div>

                {/* Items */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Items</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400">Product</th>
                                    <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400">Qty</th>
                                    <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400">Cost/Unit</th>
                                    <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400">Sell Price</th>
                                    <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400">Revenue</th>
                                    <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400">Profit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {order.items.map(item => {
                                    const sellPrice = Number(item.unit_price);
                                    const revenue   = Number(item.subtotal);
                                    const costUnit  = item.cost_price !== null ? Number(item.cost_price) : null;
                                    const profit    = costUnit !== null ? (sellPrice - costUnit) * item.quantity : null;
                                    const margin    = profit !== null && revenue > 0 ? (profit / revenue) * 100 : null;

                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                                                        {item.variant?.product?.images?.[0] ? (
                                                            <img
                                                                src={resolveImageSrc(item.variant.product.images[0])}
                                                                className="w-full h-full object-cover"
                                                                alt={item.variant.product.name}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                                                                {item.variant?.product?.name?.[0] ?? '?'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {item.variant?.product?.name ?? '—'}
                                                        </p>
                                                        <p className="text-xs text-gray-400">{variantLabel(item)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">
                                                {costUnit !== null ? `P${costUnit.toFixed(2)}` : <span className="text-gray-300 dark:text-gray-600">—</span>}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">P{sellPrice.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">P{revenue.toFixed(2)}</td>
                                            <td className="px-5 py-3 text-right">
                                                {profit !== null ? (
                                                    <div>
                                                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">P{profit.toFixed(2)}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{margin!.toFixed(1)}% margin</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Profit Breakdown */}
                {hasCostData && (() => {
                    const totalRevenue = Number(order.total);
                    const totalCost    = order.items.reduce((s, i) => s + (i.cost_price !== null ? Number(i.cost_price) * i.quantity : 0), 0);
                    const profit       = totalProfit;
                    const margin       = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
                    const costPct      = totalRevenue > 0 ? (totalCost / totalRevenue) * 100 : 0;

                    return (
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Profit Breakdown</h2>

                            <div className="space-y-4">
                                {/* Stacked bar */}
                                <div>
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                                        <span>Cost ({costPct.toFixed(1)}%)</span>
                                        <span>Profit ({margin.toFixed(1)}%)</span>
                                    </div>
                                    <div className="h-7 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex">
                                        <div
                                            className="h-full bg-gray-400 dark:bg-gray-500 flex items-center justify-center text-xs font-semibold text-white"
                                            style={{ width: `${costPct}%` }}
                                        >
                                            {costPct > 12 ? `P${totalCost.toFixed(0)}` : ''}
                                        </div>
                                        <div
                                            className="h-full bg-emerald-500 flex items-center justify-center text-xs font-semibold text-white"
                                            style={{ width: `${margin}%` }}
                                        >
                                            {margin > 12 ? `P${profit.toFixed(0)}` : ''}
                                        </div>
                                    </div>
                                </div>

                                {/* Numbers */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center justify-center gap-1.5 mb-1">
                                            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-gray-400 dark:bg-gray-500 flex-shrink-0" />
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Cost</p>
                                        </div>
                                        <p className="font-semibold text-gray-900 dark:text-white">P{totalCost.toFixed(2)}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{costPct.toFixed(1)}% of revenue</p>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center justify-center gap-1.5 mb-1">
                                            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500 flex-shrink-0" />
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Gross Profit</p>
                                        </div>
                                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">P{profit.toFixed(2)}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{margin.toFixed(1)}% margin</p>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center justify-center gap-1.5 mb-1">
                                            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-indigo-500 flex-shrink-0" />
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
                                        </div>
                                        <p className="font-semibold text-gray-900 dark:text-white">P{totalRevenue.toFixed(2)}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">100%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Payment summary */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Payment Summary</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Subtotal</span>
                            <span>P{Number(order.total).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-gray-900 dark:text-white text-base border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
                            <span>Total</span>
                            <span>P{Number(order.total).toFixed(2)}</span>
                        </div>
                        {hasCostData && (
                            <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400 border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
                                <span className="flex items-center gap-1.5">
                                    <TrendingUp className="h-4 w-4" />
                                    Profit
                                </span>
                                <span>P{totalProfit.toFixed(2)}</span>
                            </div>
                        )}
                        {isCash && order.cash_received && (
                            <>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Cash Received</span>
                                    <span>P{Number(order.cash_received).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-medium text-emerald-600 dark:text-emerald-400">
                                    <span>Change</span>
                                    <span>P{Number(order.change_given ?? 0).toFixed(2)}</span>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        {isCash
                            ? <><Banknote className="h-4 w-4 text-green-500" /> Paid with Cash</>
                            : <><CreditCard className="h-4 w-4 text-blue-500" /> Paid with Card</>
                        }
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Link
                        href={route('admin.sales.index')}
                        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        ← Back to Sales
                    </Link>
                </div>

            </div>
        </AdminLayout>
    );
}
