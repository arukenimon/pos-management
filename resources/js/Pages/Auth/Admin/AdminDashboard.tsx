import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { TrendingUp, ShoppingCart, Users, BarChart2, ArrowUpCircle, ArrowDownCircle, Package } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
    total_revenue: number;
    total_orders: number;
    today_revenue: number;
    today_orders: number;
    avg_order_value: number;
    total_members: number;
}

interface Movement {
    id: number;
    type: 'purchase' | 'sale' | 'adjustment' | 'deletion';
    quantity: number;
    note: string | null;
    created_at: string;
    performed_by: string | null;
    variant_sku: string | null;
    product_name: string | null;
    product_image: string | null;
    variant_label: string | null;
}

interface DashboardProps extends PageProps {
    stats: Stats;
    recentMovements: Movement[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
    'P' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const resolveImage = (v: string | null) => {
    if (!v) return null;
    if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://')) return v;
    if (v.startsWith('/storage/')) return v;
    if (v.startsWith('storage/')) return `/${v}`;
    return `/storage/${v}`;
};

const movementColor = (type: Movement['type']) => ({
    purchase:   'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
    sale:       'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
    adjustment: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
    deletion:   'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
}[type]);

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard({ auth, stats, recentMovements, currentShop }: DashboardProps) {
    const shop = currentShop?.slug ?? '';
    const statsCards = [
        {
            title: 'Total Revenue',
            value: fmt(stats.total_revenue),
            sub: `${fmt(stats.today_revenue)} today`,
            icon: <TrendingUp className="h-6 w-6" />,
            bg: 'bg-blue-500',
        },
        {
            title: 'Total Orders',
            value: stats.total_orders.toLocaleString(),
            sub: `${stats.today_orders} today`,
            icon: <ShoppingCart className="h-6 w-6" />,
            bg: 'bg-green-500',
        },
        {
            title: 'Team Members',
            value: stats.total_members.toLocaleString(),
            sub: 'In this shop',
            icon: <Users className="h-6 w-6" />,
            bg: 'bg-purple-500',
        },
        {
            title: 'Avg. Order Value',
            value: fmt(stats.avg_order_value),
            sub: 'Per transaction',
            icon: <BarChart2 className="h-6 w-6" />,
            bg: 'bg-orange-500',
        },
    ];

    return (
        <AdminLayout
            header={
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Welcome back, {auth.user.name}. Here's what's happening today.
                    </p>
                </div>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="space-y-6">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {statsCards.map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between shadow-sm">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{stat.sub}</p>
                            </div>
                            <div className={`${stat.bg} p-3 rounded-lg text-white flex-shrink-0`}>
                                {stat.icon}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Stock Movements */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Recent Stock Activity</h3>
                        <Link
                            href={`/${shop}/inventory/movements`}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                        >
                            View all →
                        </Link>
                    </div>

                    {recentMovements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <Package className="h-10 w-10 mb-2 opacity-30" />
                            <p className="text-sm">No stock movements yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {recentMovements.map(m => {
                                const img = resolveImage(m.product_image);
                                const isIn = m.quantity > 0;
                                return (
                                    <div key={m.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                        {/* Thumbnail */}
                                        <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                                            {img
                                                ? <img src={img} alt={m.product_name ?? ''} className="w-full h-full object-cover" />
                                                : <div className="w-full h-full flex items-center justify-center"><Package className="h-4 w-4 text-gray-400" /></div>
                                            }
                                        </div>

                                        {/* Product info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{m.product_name}</p>
                                            <p className="text-xs text-gray-400 truncate">{m.variant_label}</p>
                                        </div>

                                        {/* type badge */}
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${movementColor(m.type)}`}>
                                            {m.type}
                                        </span>

                                        {/* quantity */}
                                        <div className={`flex items-center gap-1 text-sm font-bold flex-shrink-0 ${isIn ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                            {isIn ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
                                            {Math.abs(m.quantity)}
                                        </div>

                                        {/* time */}
                                        <p className="text-[10px] text-gray-400 flex-shrink-0 hidden sm:block">{m.created_at}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { title: 'Add Product',      emoji: '📦', href: `/${shop}/products/create` },
                        { title: 'Point of Sale',    emoji: '🛒', href: `/${shop}/pos` },
                        { title: 'Sales History',    emoji: '📋', href: `/${shop}/sales` },
                        { title: 'Stock Movements',  emoji: '📊', href: `/${shop}/inventory/movements` },
                    ].map((a, i) => (
                        <Link
                            key={i}
                            href={a.href}
                            className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-sm transition-all group text-center"
                        >
                            <div className="text-3xl mb-2">{a.emoji}</div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                {a.title}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
