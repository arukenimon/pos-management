import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { ArrowLeft, Banknote, CreditCard, User, Calendar, Hash, TrendingUp, Printer, RotateCcw, Ban } from 'lucide-react';

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
    status: 'completed' | 'voided' | 'refunded';
    corrected_at: string | null;
    correction_reason: string | null;
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
    const { currentShop } = usePage<PageProps>().props;
    const shop = currentShop?.slug ?? '';
    const isCash = order.payment_method === 'cash';

    const totalProfit = order.items.reduce((sum, item) => {
        if (item.cost_price === null) return sum;
        return sum + (Number(item.unit_price) - Number(item.cost_price)) * item.quantity;
    }, 0);
    const hasCostData = order.items.some(i => i.cost_price !== null);
    const correctOrder = (action: 'void' | 'refund') => {
        const label = action === 'void' ? 'void' : 'refund';
        if (!confirm(`This will ${label} the sale and restore its stock. Continue?`)) return;
        const reason = prompt(`Reason for ${label}ing this sale (optional):`) ?? '';
        router.post(`/${shop}/sales/${order.id}/${action}`, { reason }, { preserveScroll: true });
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href={`/${shop}/sales`}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-gray-600 hover:bg-muted dark:hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Order #{String(order.id).padStart(5, '0')}
                        </h1>
                        <p className="text-sm text-muted-foreground">Transaction details</p>
                        {order.status !== 'completed' && <span className="mt-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold capitalize text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">{order.status}</span>}
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
                        <div key={m.label} className="bg-card rounded-lg border border-border p-4">
                            <m.icon className="h-4 w-4 text-muted-foreground mb-1.5" />
                            <p className="text-xs text-muted-foreground">{m.label}</p>
                            <p className="text-sm font-semibold text-foreground mt-0.5">{m.value}</p>
                        </div>
                    ))}
                </div>

                {/* Items */}
                <div className="dashboard-card bg-card rounded-lg border border-border overflow-hidden">
                    <div className="px-5 py-3 border-b border-border">
                        <h2 className="text-sm font-semibold text-foreground/80">Items</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-background dark:bg-gray-700/50 border-b border-border">
                                    <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground">Product</th>
                                    <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Qty</th>
                                    <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Cost/Unit</th>
                                    <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Sell Price</th>
                                    <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Revenue</th>
                                    <th className="text-right px-5 py-2.5 text-xs font-medium text-muted-foreground">Profit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-border">
                                {order.items.map(item => {
                                    const sellPrice = Number(item.unit_price);
                                    const revenue   = Number(item.subtotal);
                                    const costUnit  = item.cost_price !== null ? Number(item.cost_price) : null;
                                    const profit    = costUnit !== null ? (sellPrice - costUnit) * item.quantity : null;
                                    const margin    = profit !== null && revenue > 0 ? (profit / revenue) * 100 : null;

                                    return (
                                        <tr key={item.id} className="hover:bg-muted/40 dark:hover:bg-gray-700/20 transition-colors">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                        {item.variant?.product?.images?.[0] ? (
                                                            <img
                                                                src={resolveImageSrc(item.variant.product.images[0])}
                                                                className="w-full h-full object-cover"
                                                                alt={item.variant.product.name}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                                                                {item.variant?.product?.name?.[0] ?? '?'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">
                                                            {item.variant?.product?.name ?? '—'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{variantLabel(item)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center text-foreground/80">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right text-muted-foreground">
                                                {costUnit !== null ? `₱${costUnit.toFixed(2)}` : <span className="text-gray-300 dark:text-gray-600">—</span>}
                                            </td>
                                            <td className="px-4 py-3 text-right text-foreground/80">₱{sellPrice.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right font-medium text-foreground">₱{revenue.toFixed(2)}</td>
                                            <td className="px-5 py-3 text-right">
                                                {profit !== null ? (
                                                    <div>
                                                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">₱{profit.toFixed(2)}</p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">{margin!.toFixed(1)}% margin</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
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
                        <div className="dashboard-card bg-card rounded-lg border border-border p-5">
                            <h2 className="text-sm font-semibold text-foreground/80 mb-4">Profit Breakdown</h2>

                            <div className="space-y-4">
                                {/* Stacked bar */}
                                <div>
                                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                                        <span>Cost ({costPct.toFixed(1)}%)</span>
                                        <span>Profit ({margin.toFixed(1)}%)</span>
                                    </div>
                                    <div className="h-7 rounded-lg overflow-hidden bg-muted flex">
                                        <div
                                            className="h-full bg-gray-400 dark:bg-gray-500 flex items-center justify-center text-xs font-semibold text-white"
                                            style={{ width: `${costPct}%` }}
                                        >
                                            {costPct > 12 ? `₱${totalCost.toFixed(0)}` : ''}
                                        </div>
                                        <div
                                            className="h-full bg-emerald-500 flex items-center justify-center text-xs font-semibold text-white"
                                            style={{ width: `${margin}%` }}
                                        >
                                            {margin > 12 ? `₱${profit.toFixed(0)}` : ''}
                                        </div>
                                    </div>
                                </div>

                                {/* Numbers */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="text-center p-3 bg-background dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center justify-center gap-1.5 mb-1">
                                            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-gray-400 dark:bg-gray-500 flex-shrink-0" />
                                            <p className="text-xs text-muted-foreground">Total Cost</p>
                                        </div>
                                        <p className="font-semibold text-foreground">₱{totalCost.toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{costPct.toFixed(1)}% of revenue</p>
                                    </div>
                                    <div className="text-center p-3 bg-background dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center justify-center gap-1.5 mb-1">
                                            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500 flex-shrink-0" />
                                            <p className="text-xs text-muted-foreground">Gross Profit</p>
                                        </div>
                                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">₱{profit.toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{margin.toFixed(1)}% margin</p>
                                    </div>
                                    <div className="text-center p-3 bg-background dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center justify-center gap-1.5 mb-1">
                                            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-indigo-500 flex-shrink-0" />
                                            <p className="text-xs text-muted-foreground">Revenue</p>
                                        </div>
                                        <p className="font-semibold text-foreground">₱{totalRevenue.toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">100%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Payment summary */}
                <div className="dashboard-card bg-card rounded-lg border border-border p-5">
                    <h2 className="text-sm font-semibold text-foreground/80 mb-4">Payment Summary</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span>₱{Number(order.total).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-foreground text-base border-t border-border pt-2 mt-1">
                            <span>Total</span>
                            <span>₱{Number(order.total).toFixed(2)}</span>
                        </div>
                        {hasCostData && (
                            <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400 border-t border-border pt-2 mt-1">
                                <span className="flex items-center gap-1.5">
                                    <TrendingUp className="h-4 w-4" />
                                    Profit
                                </span>
                                <span>₱{totalProfit.toFixed(2)}</span>
                            </div>
                        )}
                        {isCash && order.cash_received && (
                            <>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Cash Received</span>
                                    <span>₱{Number(order.cash_received).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-medium text-emerald-600 dark:text-emerald-400">
                                    <span>Change</span>
                                    <span>₱{Number(order.change_given ?? 0).toFixed(2)}</span>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
                        {isCash
                            ? <><Banknote className="h-4 w-4 text-green-500" /> Paid with Cash</>
                            : <><CreditCard className="h-4 w-4 text-blue-500" /> Paid with Card</>
                        }
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                    <Link
                        href={`/${shop}/sales`}
                        className="px-4 py-2 text-sm text-muted-foreground dark:text-foreground/80 bg-card border border-input rounded-lg hover:bg-muted/40 dark:hover:bg-muted transition-colors"
                    >
                        ← Back to Sales
                    </Link>
                    <a href={`/${shop}/sales/${order.id}/receipt`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 dark:text-indigo-300 border border-primary rounded-lg hover:bg-accent transition-colors"><Printer className="h-4 w-4" />Reprint receipt</a>
                    <a href={`/${shop}/sales/${order.id}/receipt.pdf`} className="inline-flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 dark:text-indigo-300 border border-primary rounded-lg hover:bg-accent transition-colors"><Printer className="h-4 w-4" />Download PDF</a>
                    {order.status === 'completed' && (
                        <>
                            <button onClick={() => correctOrder('void')} className="inline-flex items-center gap-2 px-4 py-2 text-sm text-amber-700 dark:text-amber-300 border border-amber-500/40 rounded-lg hover:bg-amber-500/10 transition-colors"><Ban className="h-4 w-4" />Void sale</button>
                            <button onClick={() => correctOrder('refund')} className="inline-flex items-center gap-2 px-4 py-2 text-sm text-red-700 dark:text-red-300 border border-red-500/40 rounded-lg hover:bg-red-500/10 transition-colors"><RotateCcw className="h-4 w-4" />Refund</button>
                        </>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}
