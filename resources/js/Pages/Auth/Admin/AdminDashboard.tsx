import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { Activity, ArrowDownLeft, ArrowRight, ArrowUpRight, BarChart3, CalendarDays, Package, Plus, Settings2, ShoppingBag, ShoppingCart, TriangleAlert, Users, Wallet } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART_AXIS, CHART_COLORS, CHART_GRID, CHART_TOOLTIP } from '@/lib/chart-theme';

interface Stats {
    total_revenue: number; total_orders: number; today_revenue: number;
    today_orders: number; avg_order_value: number; total_members: number;
}
interface Movement {
    id: number; type: 'purchase' | 'sale' | 'adjustment' | 'deletion'; quantity: number;
    note: string | null; created_at: string; performed_by: string | null;
    variant_sku: string | null; product_name: string | null;
    product_image: string | null; variant_label: string | null;
}
interface LowStockItem {
    id: number; product_name: string; product_image: string | null;
    sku: string; variant_label: string | null; quantity: number;
}
interface DashboardProps extends PageProps {
    stats: Stats; recentMovements: Movement[];
    lowStock: { count: number; threshold: number; items: LowStockItem[] };
    revenueTrend: { date: string; revenue: number; orders: number }[];
}
const fmt = (amount: number) => '₱' + amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const compact = (amount: number) => '₱' + Intl.NumberFormat('en-PH', { notation: 'compact', maximumFractionDigits: 1 }).format(amount);
const resolveImage = (value: string | null) => !value ? null : /^(data:|https?:|\/storage\/)/.test(value) ? value : value.startsWith('storage/') ? `/${value}` : `/storage/${value}`;
const movementColor = {
    purchase: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    sale: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
    adjustment: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    deletion: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
};

export default function AdminDashboard({ auth, stats, recentMovements, lowStock, currentShop, revenueTrend }: DashboardProps) {
    const base = `/${currentShop?.slug ?? ''}`;
    const periodRevenue = revenueTrend.reduce((sum, day) => sum + day.revenue, 0);
    const todayShare = stats.total_orders ? Math.min(100, stats.today_orders / stats.total_orders * 100) : 0;
    const metrics = [
        { label: 'Total revenue', value: fmt(stats.total_revenue), context: `${fmt(stats.today_revenue)} today`, icon: Wallet },
        { label: 'Total orders', value: stats.total_orders.toLocaleString(), context: `${stats.today_orders} completed today`, icon: ShoppingBag },
        { label: 'Average order value', value: fmt(stats.avg_order_value), context: 'Per completed transaction', icon: BarChart3 },
        { label: 'Team members', value: stats.total_members.toLocaleString(), context: 'People in your shop', icon: Users },
    ];
    return <AdminLayout header={
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div><h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back, {auth.user.name.split(' ')[0]}</h1><p className="mt-1.5 text-sm text-muted-foreground">Here’s what’s happening in your shop today.</p></div>
            <Link href={`${base}/pos`} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"><Plus className="h-4 w-4" />New sale</Link>
        </div>
    }>
        <Head title="Dashboard" />
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 xl:grid-cols-4">
                {metrics.map(metric => <div key={metric.label} className="dashboard-card p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><metric.icon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />{metric.label}</div>
                    <p className="mt-4 break-words text-xl font-semibold tracking-tight tabular-nums text-foreground sm:text-2xl">{metric.value}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{metric.context}</p>
                </div>)}
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(260px,1fr)]">
                <section className="dashboard-card p-5 sm:p-6" aria-labelledby="revenue-heading">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div><h2 id="revenue-heading" className="text-sm text-muted-foreground">Revenue overview</h2><p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{fmt(periodRevenue)}</p></div>
                        <span className="inline-flex items-center gap-2 rounded-md border border-border bg-background/40 px-3 py-2 text-[11px] text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />Last 14 days</span>
                    </div>
                    <div className="mb-5 mt-5 flex gap-5 text-[11px] text-muted-foreground"><span className="flex items-center gap-2"><i className="h-1.5 w-1.5 rounded-full bg-[#c448f5]" />Revenue</span><span className="flex items-center gap-2"><i className="h-1.5 w-1.5 rounded-full bg-[#00bce8]" />Orders</span></div>
                    {revenueTrend.some(day => day.orders > 0) ? <div className="h-64 w-full min-w-0" role="img" aria-label="Daily revenue and completed orders over the last 14 days">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueTrend} margin={{ top: 10, right: 0, bottom: 0, left: -12 }}>
                                <defs><linearGradient id="dashboard-revenue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={CHART_COLORS.revenue} stopOpacity={0.28} /><stop offset="100%" stopColor={CHART_COLORS.revenue} stopOpacity={0} /></linearGradient></defs>
                                <CartesianGrid stroke={CHART_GRID} vertical={false} strokeDasharray="3 6" />
                                <XAxis dataKey="date" tick={CHART_AXIS} tickLine={false} axisLine={false} minTickGap={26} dy={8} />
                                <YAxis yAxisId="revenue" tick={CHART_AXIS} tickLine={false} axisLine={false} tickFormatter={compact} width={65} />
                                <YAxis yAxisId="orders" orientation="right" tick={CHART_AXIS} tickLine={false} axisLine={false} allowDecimals={false} width={30} />
                                <Tooltip contentStyle={CHART_TOOLTIP} labelStyle={{ color: 'hsl(var(--foreground))' }} formatter={(value: number, name: string) => [name === 'Revenue' ? fmt(value) : value, name]} />
                                <Area yAxisId="revenue" name="Revenue" dataKey="revenue" type="monotone" stroke={CHART_COLORS.revenue} fill="url(#dashboard-revenue)" strokeWidth={2.5} />
                                <Area yAxisId="orders" name="Orders" dataKey="orders" type="monotone" stroke={CHART_COLORS.orders} fill="transparent" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div> : <div className="flex h-64 flex-col items-center justify-center gap-3 text-center"><BarChart3 className="h-9 w-9 text-muted-foreground/50" /><p className="text-sm text-muted-foreground">No completed sales in the last 14 days.</p><Link href={`${base}/pos`} className="dashboard-link">Make your first sale<ArrowRight className="h-3.5 w-3.5" /></Link></div>}
                    <div className="mt-5 flex justify-between border-t border-border pt-4 text-xs"><span className="text-muted-foreground">Completed sales only</span><Link href={`${base}/analytics`} className="dashboard-link">View analytics<ArrowUpRight className="h-3.5 w-3.5" /></Link></div>
                </section>
                <section className="dashboard-card flex flex-col p-6" aria-labelledby="today-heading">
                    <div className="flex items-center justify-between"><h2 id="today-heading" className="text-sm font-medium">Today’s performance</h2><Activity className="h-4 w-4 text-indigo-400" /></div>
                    <div className="relative mx-auto my-5 h-44 w-44">
                        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" aria-hidden="true"><circle cx="80" cy="80" r="65" fill="none" stroke="hsl(var(--border))" strokeWidth="9" />{todayShare > 0 && <circle cx="80" cy="80" r="65" fill="none" stroke={CHART_COLORS.revenue} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${todayShare / 100 * 408.4} 408.4`} />}<circle cx="80" cy="80" r="52" fill="none" stroke={CHART_COLORS.orders} strokeOpacity="0.25" strokeWidth="3" /></svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center"><p className="text-3xl font-semibold tabular-nums">{stats.today_orders}</p><p className="mt-1 text-xs text-muted-foreground">orders today</p></div>
                    </div>
                    <div className="mt-auto space-y-4 text-xs"><div className="flex justify-between gap-3"><span className="text-muted-foreground">Revenue today</span><span className="font-medium tabular-nums">{fmt(stats.today_revenue)}</span></div><div className="flex justify-between gap-3"><span className="text-muted-foreground">Share of all orders</span><span className="font-medium tabular-nums">{todayShare.toFixed(1)}%</span></div></div>
                    <Link href={`${base}/sales`} className="dashboard-link mt-6 justify-between border-t border-border pt-4">Explore sales<ArrowUpRight className="h-3.5 w-3.5" /></Link>
                </section>
            </div>
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(260px,1fr)]">
                <section className="dashboard-card overflow-hidden" aria-labelledby="activity-heading">
                    <div className="flex items-center justify-between border-b border-border px-5 py-5"><h2 id="activity-heading" className="text-sm font-medium">Recent stock activity</h2><Link href={`${base}/inventory/movements`} className="dashboard-link">View all<ArrowUpRight className="h-3.5 w-3.5" /></Link></div>
                    {!recentMovements.length ? <div className="flex flex-col items-center gap-2 py-14 text-muted-foreground"><Package className="mb-1 h-8 w-8 opacity-40" /><p className="text-sm">No stock movements yet</p></div> : <div className="divide-y divide-border">{recentMovements.map(movement => {
                        const image = resolveImage(movement.product_image);
                        const incoming = movement.quantity > 0;
                        return <div key={movement.id} className="flex items-center gap-3 px-5 py-4 transition hover:bg-muted/40">
                            <div className="dashboard-icon overflow-hidden">{image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <Package className="h-4 w-4" />}</div>
                            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{movement.product_name ?? 'Deleted product'}</p><p className="mt-1 truncate text-xs text-muted-foreground">{movement.variant_label ?? movement.variant_sku ?? '—'}</p></div>
                            <span className={`rounded-md px-2 py-1 text-[11px] capitalize ${movementColor[movement.type]}`}>{movement.type}</span>
                            <span className={`flex min-w-10 items-center justify-end gap-1 text-xs font-medium tabular-nums ${incoming ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-300'}`}>{incoming ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}{Math.abs(movement.quantity)}</span>
                            <span className="hidden w-24 text-right text-[11px] text-muted-foreground sm:block">{movement.created_at}</span>
                        </div>;
                    })}</div>}
                </section>
                <section className="dashboard-card overflow-hidden" aria-labelledby="stock-heading">
                    <div className="border-b border-border p-5"><div className="flex items-center gap-2"><TriangleAlert className="h-4 w-4 text-amber-500 dark:text-amber-300" /><h2 id="stock-heading" className="flex-1 text-sm font-medium">Stock alerts</h2><span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300">{lowStock.count}</span></div><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{lowStock.count ? `Variants at ${lowStock.threshold} units or fewer.` : `All active variants are above ${lowStock.threshold} units.`}</p></div>
                    {lowStock.items.map(item => <div key={item.id} className="flex items-center gap-3 border-b border-border px-5 py-3.5"><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{item.product_name}</p><p className="mt-1 truncate text-[11px] text-muted-foreground">{item.variant_label ?? item.sku}</p></div><span className={`shrink-0 text-[11px] font-medium ${item.quantity ? 'text-amber-700 dark:text-amber-300' : 'text-rose-600 dark:text-rose-300'}`}>{item.quantity ? `${item.quantity} left` : 'Out of stock'}</span></div>)}
                    <div className="flex flex-wrap justify-between gap-3 p-5"><Link href={`${base}/products/inventory`} className="dashboard-link">View inventory<ArrowUpRight className="h-3.5 w-3.5" /></Link>{auth.shopRole === 'owner' && <Link href={`${base}/settings`} className="dashboard-link"><Settings2 className="h-3.5 w-3.5" />Threshold</Link>}</div>
                </section>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { title: 'Add product', detail: 'Grow your catalog', icon: Plus, href: `${base}/products/create` },
                    { title: 'Point of sale', detail: 'Start a transaction', icon: ShoppingCart, href: `${base}/pos` },
                    { title: 'Sales history', detail: 'Review past transactions', icon: ShoppingBag, href: `${base}/sales` },
                    { title: 'Stock movements', detail: 'Track your inventory', icon: Package, href: `${base}/inventory/movements` },
                ].map(action => <Link key={action.title} href={action.href} className="dashboard-card group flex items-center gap-3 p-4 transition-colors hover:border-indigo-400/60"><span className="dashboard-icon"><action.icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-xs font-medium">{action.title}</span><span className="mt-1 block text-[11px] text-muted-foreground">{action.detail}</span></span><ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-indigo-400" /></Link>)}
            </div>
        </div>
    </AdminLayout>;
}
