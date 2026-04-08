import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { ArrowLeft, Banknote, CreditCard, User, Calendar, Hash } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
    id: number;
    quantity: number;
    unit_price: string;
    subtotal: string;
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
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400">Product</th>
                                <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400">Qty</th>
                                <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400">Unit Price</th>
                                <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {order.items.map(item => (
                                <tr key={item.id}>
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
                                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">P{Number(item.unit_price).toFixed(2)}</td>
                                    <td className="px-5 py-3 text-right font-medium text-gray-900 dark:text-white">P{Number(item.subtotal).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

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
