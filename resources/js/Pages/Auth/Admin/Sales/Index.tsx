import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { useState, useCallback } from 'react';
import { Banknote, CreditCard, Receipt, TrendingUp, ShoppingBag, Calendar, DollarSign } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
    id: number;
    quantity: number;
    unit_price: string;
    subtotal: string;
    variant: {
        sku: string;
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

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedOrders {
    data: Order[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
}

interface SalesPageProps extends PageProps {
    orders: PaginatedOrders;
    filters: { search?: string; payment_method?: string };
    analytics: {
        total_sales: number;
        total_revenue: number;
        today_sales: number;
        today_revenue: number;
        total_profit: number;
        today_profit: number;
    };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const resolveImageSrc = (value: string): string => {
    if (value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://')) return value;
    if (value.startsWith('/storage/')) return value;
    if (value.startsWith('storage/')) return `/${value}`;
    return `/storage/${value}`;
};

const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
};

const variantLabel = (item: OrderItem) => {
    const av = item.variant?.attribute_values;
    if (av?.length) return av.map(a => a.value).join(' / ');
    return item.variant?.sku ?? '—';
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SalesIndex({ orders, filters, analytics }: SalesPageProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [paymentFilter, setPaymentFilter] = useState(filters.payment_method ?? '');

    const applyFilters = useCallback((overrides: Record<string, string>) => {
        router.get(route('admin.sales.index'), {
            search,
            payment_method: paymentFilter,
            ...overrides,
        }, { preserveScroll: true, preserveState: true, replace: true });
    }, [search, paymentFilter]);

    const handleSearch = (value: string) => {
        setSearch(value);
        applyFilters({ search: value });
    };

    const handlePaymentFilter = (value: string) => {
        setPaymentFilter(value);
        applyFilters({ payment_method: value });
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sales</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">All completed transactions</p>
                    </div>
                    <Link
                        href={route('admin.pos.index')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        Go to POS
                    </Link>
                </div>
            }
        >
            <Head title="Sales - Admin" />

            <div className="space-y-6">

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {[
                        { label: 'Total Sales',     value: analytics.total_sales,    icon: Receipt,      color: 'bg-indigo-500',  fmt: 'count' },
                        { label: 'Total Revenue',   value: analytics.total_revenue,  icon: TrendingUp,   color: 'bg-emerald-500', fmt: 'money' },
                        { label: 'Total Profit',    value: analytics.total_profit,   icon: DollarSign,   color: 'bg-violet-500',  fmt: 'money' },
                        { label: "Today's Sales",   value: analytics.today_sales,    icon: Calendar,     color: 'bg-blue-500',    fmt: 'count' },
                        { label: "Today's Revenue", value: analytics.today_revenue,  icon: Banknote,     color: 'bg-amber-500',   fmt: 'money' },
                        { label: "Today's Profit",  value: analytics.today_profit,   icon: DollarSign,   color: 'bg-teal-500',    fmt: 'money' },
                    ].map(s => (
                        <div key={s.label} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{s.label}</p>
                                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                                    {s.fmt === 'money' ? `P${Number(s.value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : s.value}
                                </p>
                            </div>
                            <div className={`p-2.5 ${s.color} rounded-lg`}>
                                <s.icon className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={e => handleSearch(e.target.value)}
                            placeholder="Search by order # or cashier name…"
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <select
                        value={paymentFilter}
                        onChange={e => handlePaymentFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">All Methods</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {orders.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <Receipt className="h-16 w-16 mb-3 opacity-20" />
                            <p className="font-medium">No sales yet</p>
                            <p className="text-sm mt-1">Completed sales will appear here</p>
                        </div>
                    ) : (
                        <>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cashier</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment</th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {orders.data.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                                                #{String(order.id).padStart(5, '0')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex -space-x-2">
                                                    {order.items.slice(0, 3).map(item => (
                                                        <div key={item.id} className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0" title={`${item.variant?.product?.name} × ${item.quantity}`}>
                                                            {item.variant?.product?.images?.[0] ? (
                                                                <img src={resolveImageSrc(item.variant.product.images[0])} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-gray-400">
                                                                    {item.variant?.product?.name?.[0]}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {order.items.length > 3 && (
                                                        <div className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-300">
                                                            +{order.items.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {order.items.reduce((s, i) => s + i.quantity, 0)} units
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.cashier?.name ?? '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    order.payment_method === 'cash'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}>
                                                    {order.payment_method === 'cash'
                                                        ? <Banknote className="h-3 w-3" />
                                                        : <CreditCard className="h-3 w-3" />
                                                    }
                                                    {order.payment_method === 'cash' ? 'Cash' : 'Card'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                                                P{Number(order.total).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {formatDate(order.created_at)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link
                                                    href={route('admin.sales.show', order.id)}
                                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {orders.last_page > 1 && (
                                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Showing {orders.from}–{orders.to} of {orders.total}
                                    </p>
                                    <div className="flex gap-1">
                                        {orders.links.filter(l => !l.label.includes('&')).map((link, i) => (
                                            <Link
                                                key={i}
                                                href={link.url ?? '#'}
                                                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                                                    link.active
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                                } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
