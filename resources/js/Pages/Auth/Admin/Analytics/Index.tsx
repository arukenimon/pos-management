import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import {
    AreaChart, Area,
    BarChart, Bar,
    PieChart, Pie, Cell, Tooltip as PieTooltip, Legend as PieLegend,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, ShoppingCart, Package, BarChart2, DollarSign } from 'lucide-react';
import { CHART_AXIS, CHART_COLORS, CHART_GRID, CHART_TOOLTIP } from '@/lib/chart-theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Summary {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    totalUnitsSold: number;
    totalProfit: number;
}

interface RevenueTrendPoint { date: string; revenue: number; orders: number; profit: number | null; }
interface TopProduct       { name: string; variant: string; units_sold: number; revenue: number; }
interface PaymentEntry     { method: string; count: number; revenue: number; }
interface StockTrendPoint  { date: string; stock_in: number; stock_out: number; }
interface HourlyPoint      { hour: string; orders: number; revenue: number; }

interface AnalyticsProps extends PageProps {
    period: string;
    summary: Summary;
    revenueTrend: RevenueTrendPoint[];
    topProducts: TopProduct[];
    paymentSplit: PaymentEntry[];
    stockTrend: StockTrendPoint[];
    hourlySales: HourlyPoint[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt  = (n: number) => 'P' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtK = (n: number) => n >= 1000 ? `P${(n / 1000).toFixed(1)}k` : `P${n.toFixed(0)}`;

const PIE_COLORS = [CHART_COLORS.revenue, CHART_COLORS.orders, CHART_COLORS.profit, CHART_COLORS.positive, CHART_COLORS.negative];

const PERIODS = [
    { value: 'today', label: 'Today' },
    { value: '7',     label: '7 days' },
    { value: '30',    label: '30 days' },
    { value: '90',    label: '90 days' },
    { value: 'year',  label: 'Year' },
];

// Shared chart theme
const AXIS_STYLE = CHART_AXIS;
const GRID_STROKE = CHART_GRID;

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, icon }: {
    title: string; value: string; sub: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="dashboard-card p-5">
            <div className="mb-4 flex items-center gap-2 text-indigo-600 dark:text-indigo-400"><span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span><p className="text-xs text-muted-foreground">{title}</p></div>
            <div>
                <p className="break-words text-xl font-semibold tracking-tight tabular-nums text-foreground 2xl:text-2xl">{value}</p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{sub}</p>
            </div>
        </div>
    );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="dashboard-card h-full p-5 sm:p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
            {children}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PERIOD_LABELS: Record<string, string> = {
    today: 'Today',
    '7':   'Last 7 Days',
    '30':  'Last 30 Days',
    '90':  'Last 90 Days',
    year:  `${new Date().getFullYear()} — by month`,
};

export default function AnalyticsIndex({
    period, summary, revenueTrend, topProducts, paymentSplit, stockTrend, hourlySales,
}: AnalyticsProps) {

    const { currentShop } = usePage<PageProps>().props;
    const shop = currentShop?.slug ?? '';

    const changePeriod = (p: string) => {
        router.get(`/${shop}/analytics`, { period: p }, { preserveScroll: true });
    };

    const noData = (arr: unknown[]) => arr.length === 0;
    const maxProductUnits = Math.max(1, ...topProducts.map(product => product.units_sold));

    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <BarChart2 className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">No data for this period</p>
        </div>
    );

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Sales and inventory insights</p>
                    </div>
                    {/* Period selector */}
                    <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
                        {PERIODS.map(p => (
                            <button
                                key={p.value}
                                type="button"
                                aria-pressed={period === p.value}
                                onClick={() => changePeriod(p.value)}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                                    period === p.value
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
            }
        >
            <Head title="Analytics" />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

                {/* KPI cards */}
                <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 xl:col-span-2 xl:grid-cols-5">
                    <KpiCard title="Revenue"    value={fmt(summary.totalRevenue)}              sub="Total for period"    icon={<TrendingUp className="h-5 w-5" />}   />
                    <KpiCard title="Profit"     value={fmt(summary.totalProfit)}               sub="Gross profit"        icon={<DollarSign className="h-5 w-5" />}   />
                    <KpiCard title="Orders"     value={summary.totalOrders.toLocaleString()}   sub="Completed sales"     icon={<ShoppingCart className="h-5 w-5" />} />
                    <KpiCard title="Avg Order"  value={fmt(summary.avgOrderValue)}             sub="Per transaction"     icon={<BarChart2 className="h-5 w-5" />}    />
                    <KpiCard title="Units Sold" value={summary.totalUnitsSold.toLocaleString()} sub="Items sold"         icon={<Package className="h-5 w-5" />}      />
                </div>

                {/* Revenue + Orders trend — follows selected period */}
                <div className="xl:col-span-2"><ChartCard title={`Revenue, Profit & Orders — ${PERIOD_LABELS[period] ?? period}`}>
                    {noData(revenueTrend) ? <EmptyState /> : (
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={revenueTrend} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor={CHART_COLORS.revenue} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={CHART_COLORS.revenue} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor={CHART_COLORS.profit} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={CHART_COLORS.profit} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor={CHART_COLORS.orders} stopOpacity={0.2} />
                                        <stop offset="95%" stopColor={CHART_COLORS.orders} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                                <XAxis dataKey="date" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="rev" tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtK} />
                                <YAxis yAxisId="ord" orientation="right" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={CHART_TOOLTIP}
                                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    formatter={(v: number, name: string) => name === 'Orders' ? [v, 'Orders'] : [fmt(v), name]}
                                />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Area yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue" stroke={CHART_COLORS.revenue} fill="url(#revGrad)"    strokeWidth={2} dot={false} />
                                <Area yAxisId="rev" type="monotone" dataKey="profit"  name="Profit"  stroke={CHART_COLORS.profit} fill="url(#profitGrad)" strokeWidth={2} dot={false} strokeDasharray="5 3" connectNulls />
                                <Area yAxisId="ord" type="monotone" dataKey="orders"  name="Orders"  stroke={CHART_COLORS.orders} fill="url(#ordGrad)"    strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

                </div>

                {/* Top Products + Payment Split */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:col-span-2">

                    {/* Top Products */}
                    <div className="lg:col-span-2">
                        <ChartCard title="Top Products by Units Sold">
                            {noData(topProducts) ? <EmptyState /> : (
                                <div>
                                    <p className="mb-5 text-xs text-gray-500 dark:text-gray-400">
                                        Ranked by units sold in the selected period.
                                    </p>
                                    <ol className="space-y-5" aria-label="Products ranked by units sold">
                                        {topProducts.map((product, index) => (
                                            <li key={`${product.name}-${product.variant}-${index}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-2">
                                                <div className="flex min-w-0 gap-2.5">
                                                    <span className="pt-0.5 text-xs tabular-nums text-gray-500 dark:text-gray-400" aria-hidden="true">
                                                        {index + 1}.
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="break-words text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                                                        {product.variant && (
                                                            <p className="mt-0.5 break-words text-xs text-gray-500 dark:text-gray-400">{product.variant}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right tabular-nums">
                                                    <p className="text-base font-semibold text-indigo-700 dark:text-indigo-300">
                                                        {product.units_sold.toLocaleString()}{' '}
                                                        <span className="text-xs font-medium">{product.units_sold === 1 ? 'unit' : 'units'}</span>
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{fmt(product.revenue)} revenue</p>
                                                </div>
                                                <div className="col-span-2 h-2 overflow-hidden rounded-full bg-indigo-50 dark:bg-gray-700" aria-hidden="true">
                                                    <div
                                                        className="h-full rounded-full bg-indigo-700 dark:bg-indigo-400"
                                                        style={{ width: `${(product.units_sold / maxProductUnits) * 100}%` }}
                                                    />
                                                </div>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}
                        </ChartCard>
                    </div>

                    {/* Payment Split */}
                    <div>
                        <ChartCard title="Payment Methods">
                            {noData(paymentSplit) ? <EmptyState /> : (
                                <div className="space-y-4">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={paymentSplit}
                                                dataKey="count"
                                                nameKey="method"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={55}
                                                outerRadius={85}
                                                paddingAngle={3}
                                            >
                                                {paymentSplit.map((_, i) => (
                                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <PieTooltip
                                                contentStyle={CHART_TOOLTIP}
                                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                                            />
                                            <PieLegend wrapperStyle={{ fontSize: 12 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="space-y-1.5">
                                        {paymentSplit.map((p, i) => (
                                            <div key={i} className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                                    <span className="text-gray-600 dark:text-gray-400">{p.method}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-semibold text-gray-900 dark:text-white">{p.count} orders</span>
                                                    <span className="ml-2 text-gray-400">{fmt(p.revenue)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </ChartCard>
                    </div>
                </div>

                {/* Stock trend */}
                <ChartCard title="Stock In vs Out Over Time">
                    {noData(stockTrend) ? <EmptyState /> : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={stockTrend} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                                <XAxis dataKey="date" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                                <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={CHART_TOOLTIP}
                                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar dataKey="stock_in"  name="Stock In"  fill={CHART_COLORS.orders} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="stock_out" name="Stock Out" fill={CHART_COLORS.revenue} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

                {/* Hourly sales heatmap (bar) */}
                <ChartCard title="Sales by Hour of Day">
                    {noData(hourlySales) ? <EmptyState /> : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={hourlySales} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                                <XAxis dataKey="hour" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                                <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={CHART_TOOLTIP}
                                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    formatter={(v: number, name: string) => [name === 'Revenue' ? fmt(v) : v, name]}
                                />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar dataKey="orders"  name="Orders"  fill={CHART_COLORS.revenue} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="revenue" name="Revenue" fill={CHART_COLORS.orders} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

            </div>
        </AdminLayout>
    );
}
