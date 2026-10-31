import MetricCard from '@/Components/Admin/MetricCard';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { useState, useCallback } from 'react';
import { Banknote, CreditCard, Receipt, TrendingUp, ShoppingBag, Calendar, DollarSign, RotateCcw } from 'lucide-react';

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
    status: 'completed' | 'voided' | 'refunded';
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
    filters: { search?: string; payment_method?: string; status?: string };
    analytics: {
        total_sales: number;
        total_revenue: number;
        today_sales: number;
        today_revenue: number;
        total_profit: number;
        today_profit: number;
        corrections_count: number;
        corrections_total: number;
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
    const { currentShop, auth } = usePage<PageProps>().props;
    const shop = currentShop?.slug ?? '';
    const [search, setSearch] = useState(filters.search ?? '');
    const [paymentFilter, setPaymentFilter] = useState(filters.payment_method ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');

    const applyFilters = useCallback((overrides: Record<string, string>) => {
        router.get(`/${shop}/sales`, {
            search,
            payment_method: paymentFilter,
            status: statusFilter,
            ...overrides,
        }, { preserveScroll: true, preserveState: true, replace: true });
    }, [search, paymentFilter, statusFilter, shop]);

    const handleSearch = (value: string) => {
        setSearch(value);
        applyFilters({ search: value });
    };

    const handlePaymentFilter = (value: string) => {
        setPaymentFilter(value);
        applyFilters({ payment_method: value });
    };

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value);
        applyFilters({ status: value });
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Sales</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Completed sales and their correction history</p>
                    </div>
                    <div className="flex gap-2">
                        {auth.shopRole === 'owner' && <><a href={`/${shop}/sales/export`} className="inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-300 hover:bg-accent">Export CSV</a><a href={`/${shop}/sales/report.pdf`} className="inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-300 hover:bg-accent">Sales PDF</a></>}
                        <Link href={`/${shop}/pos`} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"><ShoppingBag className="h-4 w-4" />Go to POS</Link>
                    </div>
                </div>
            }
        >
            <Head title="Sales - Admin" />

            <div className="space-y-6">

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 xl:grid-cols-4">
                    {[
                        { label: 'Net sales', value: analytics.total_sales, icon: Receipt, fmt: 'count', detail: 'Completed transactions' },
                        { label: 'Net revenue', value: analytics.total_revenue, icon: TrendingUp, fmt: 'money', detail: 'After corrections' },
                        { label: 'Net profit', value: analytics.total_profit, icon: DollarSign, fmt: 'money', detail: 'After product costs' },
                        { label: 'Refunds & voids', value: analytics.corrections_total, icon: RotateCcw, fmt: 'money', detail: `${analytics.corrections_count} corrected transactions` },
                    ].map(metric => <MetricCard key={metric.label} label={metric.label} value={metric.fmt === 'money' ? `₱${Number(metric.value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : Number(metric.value).toLocaleString()} detail={metric.detail} icon={metric.icon} />)}
                </div>
                <div className="dashboard-card grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    {[
                        { label: 'Sales today', value: analytics.today_sales.toLocaleString(), icon: Calendar },
                        { label: 'Revenue today', value: `₱${Number(analytics.today_revenue).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, icon: Banknote },
                        { label: 'Profit today', value: `₱${Number(analytics.today_profit).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, icon: DollarSign },
                    ].map(metric => <div key={metric.label} className="flex min-w-0 items-center gap-3 px-5 py-4"><metric.icon className="h-4 w-4 shrink-0 text-accent-foreground" /><span className="min-w-0"><span className="block text-[11px] text-muted-foreground">{metric.label}</span><strong className="mt-1 block break-words text-sm font-semibold tabular-nums">{metric.value}</strong></span></div>)}
                </div>

                {/* Filters */}
                <div className="dashboard-card bg-card rounded-lg border border-border p-4 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={e => handleSearch(e.target.value)}
                            placeholder="Search by order # or cashier name…"
                            className="w-full pl-9 pr-3 py-2 border border-input rounded-lg bg-card dark:bg-muted text-foreground placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <select
                        value={paymentFilter}
                        onChange={e => handlePaymentFilter(e.target.value)}
                        className="px-3 py-2 border border-input rounded-lg bg-card dark:bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">All Methods</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                    </select>
                    <select value={statusFilter} onChange={e => handleStatusFilter(e.target.value)} className="px-3 py-2 border border-input rounded-lg bg-card dark:bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="voided">Voided</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </div>

                {/* Table */}
                <div className="dashboard-card bg-card rounded-lg border border-border overflow-hidden">
                    {orders.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <Receipt className="h-16 w-16 mb-3 opacity-20" />
                            <p className="font-medium">No sales yet</p>
                            <p className="text-sm mt-1">Completed sales will appear here</p>
                        </div>
                    ) : (
                        <>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-background dark:bg-gray-700/50">
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cashier</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-border">
                                    {orders.data.map(order => (
                                        <tr key={order.id} className="hover:bg-muted/40 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                                                #{String(order.id).padStart(5, '0')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex -space-x-2">
                                                    {order.items.slice(0, 3).map(item => (
                                                        <div key={item.id} className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800 bg-muted overflow-hidden flex-shrink-0" title={`${item.variant?.product?.name} × ${item.quantity}`}>
                                                            {item.variant?.product?.images?.[0] ? (
                                                                <img src={resolveImageSrc(item.variant.product.images[0])} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                                                                    {item.variant?.product?.name?.[0]}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {order.items.length > 3 && (
                                                        <div className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-[10px] font-bold text-muted-foreground dark:text-foreground/80">
                                                            +{order.items.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {order.items.reduce((s, i) => s + i.quantity, 0)} units
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-foreground/80">{order.cashier?.name ?? '—'}</td>
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
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                                                    order.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                                                    order.status === 'voided' ? 'bg-gray-200 text-foreground/80 dark:bg-muted dark:text-foreground/80' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                }`}>{order.status}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-foreground">
                                                P{Number(order.total).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                                {formatDate(order.created_at)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link
                                                    href={`/${shop}/sales/${order.id}`}
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
                                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                                    <p className="text-xs text-muted-foreground">
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
                                                        : 'bg-card dark:bg-muted text-muted-foreground dark:text-foreground/80 border border-input hover:bg-muted/40 dark:hover:bg-gray-600'
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
