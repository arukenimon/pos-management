import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import {
    AreaChart, Area,
    BarChart, Bar,
    PieChart, Pie, Cell, Tooltip as PieTooltip, Legend as PieLegend,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, ShoppingCart, Package, BarChart2, DollarSign } from 'lucide-react';

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

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

const PERIODS = [
    { value: 'today', label: 'Today' },
    { value: '7',     label: '7 days' },
    { value: '30',    label: '30 days' },
    { value: '90',    label: '90 days' },
];

// Shared chart theme
const AXIS_STYLE  = { fontSize: 11, fill: '#9ca3af' };
const GRID_STROKE = '#374151';

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, icon, color }: {
    title: string; value: string; sub: string;
    icon: React.ReactNode; color: string;
}) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between shadow-sm">
            <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{sub}</p>
            </div>
            <div className={`${color} p-3 rounded-xl text-white flex-shrink-0`}>{icon}</div>
        </div>
    );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
            {children}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsIndex({
    period, summary, revenueTrend, topProducts, paymentSplit, stockTrend, hourlySales,
}: AnalyticsProps) {

    const changePeriod = (p: string) => {
        router.get(route('admin.analytics'), { period: p }, { preserveScroll: true });
    };

    const noData = (arr: unknown[]) => arr.length === 0;

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
                    <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        {PERIODS.map(p => (
                            <button
                                key={p.value}
                                onClick={() => changePeriod(p.value)}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                                    period === p.value
                                        ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
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

            <div className="space-y-6">

                {/* KPI cards */}
                <div className="grid grid-cols-2 gap-5 lg:grid-cols-5">
                    <KpiCard title="Revenue"    value={fmt(summary.totalRevenue)}              sub="Total for period"    icon={<TrendingUp className="h-5 w-5" />}   color="bg-indigo-500" />
                    <KpiCard title="Profit"     value={fmt(summary.totalProfit)}               sub="Gross profit"        icon={<DollarSign className="h-5 w-5" />}   color="bg-emerald-500" />
                    <KpiCard title="Orders"     value={summary.totalOrders.toLocaleString()}   sub="Completed sales"     icon={<ShoppingCart className="h-5 w-5" />} color="bg-blue-500" />
                    <KpiCard title="Avg Order"  value={fmt(summary.avgOrderValue)}             sub="Per transaction"     icon={<BarChart2 className="h-5 w-5" />}    color="bg-violet-500" />
                    <KpiCard title="Units Sold" value={summary.totalUnitsSold.toLocaleString()} sub="Items sold"         icon={<Package className="h-5 w-5" />}      color="bg-orange-500" />
                </div>

                {/* Revenue + Orders trend */}
                <ChartCard title="Revenue, Profit & Orders Over Time">
                    {noData(revenueTrend) ? <EmptyState /> : (
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={revenueTrend} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                                <XAxis dataKey="date" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="rev" tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtK} />
                                <YAxis yAxisId="ord" orientation="right" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8, fontSize: 12 }}
                                    labelStyle={{ color: '#e5e7eb' }}
                                    itemStyle={{ color: '#d1d5db' }}
                                    formatter={(v: number, name: string) => name === 'Orders' ? [v, 'Orders'] : [fmt(v), name]}
                                />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Area yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" fill="url(#revGrad)"    strokeWidth={2} dot={false} />
                                <Area yAxisId="rev" type="monotone" dataKey="profit"  name="Profit"  stroke="#10b981" fill="url(#profitGrad)" strokeWidth={2} dot={false} strokeDasharray="5 3" connectNulls />
                                <Area yAxisId="ord" type="monotone" dataKey="orders"  name="Orders"  stroke="#f59e0b" fill="url(#ordGrad)"    strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

                {/* Top Products + Payment Split */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* Top Products */}
                    <div className="lg:col-span-2">
                        <ChartCard title="Top Products by Units Sold">
                            {noData(topProducts) ? <EmptyState /> : (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart
                                        data={topProducts}
                                        layout="vertical"
                                        margin={{ top: 0, right: 16, left: 4, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
                                        <XAxis type="number" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            tick={AXIS_STYLE}
                                            tickLine={false}
                                            axisLine={false}
                                            width={90}
                                            tickFormatter={(v: string) => v.length > 12 ? v.slice(0, 12) + '…' : v}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8, fontSize: 12 }}
                                            labelStyle={{ color: '#e5e7eb' }}
                                            itemStyle={{ color: '#d1d5db' }}
                                            formatter={(v: number, name: string) => [name === 'Revenue' ? fmt(v) : v, name]}
                                        />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                        <Bar dataKey="units_sold" name="Units" fill="#6366f1" radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="revenue"    name="Revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
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
                                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8, fontSize: 12 }}
                                                itemStyle={{ color: '#d1d5db' }}
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
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8, fontSize: 12 }}
                                    labelStyle={{ color: '#e5e7eb' }}
                                    itemStyle={{ color: '#d1d5db' }}
                                />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar dataKey="stock_in"  name="Stock In"  fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="stock_out" name="Stock Out" fill="#f43f5e" radius={[4, 4, 0, 0]} />
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
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8, fontSize: 12 }}
                                    labelStyle={{ color: '#e5e7eb' }}
                                    itemStyle={{ color: '#d1d5db' }}
                                    formatter={(v: number, name: string) => [name === 'Revenue' ? fmt(v) : v, name]}
                                />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar dataKey="orders"  name="Orders"  fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="revenue" name="Revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

            </div>
        </AdminLayout>
    );
}
