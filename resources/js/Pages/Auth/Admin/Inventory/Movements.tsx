import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { ArrowUpCircle, ArrowDownCircle, Package, Search, X } from 'lucide-react';
import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
}

interface Summary {
    total_in: number;
    total_out: number;
    purchases: number;
    sales: number;
}

interface MovementsProps extends PageProps {
    movements: Paginated<Movement>;
    filters: { type?: string; search?: string; from?: string; to?: string };
    summary: Summary;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const resolveImage = (v: string | null) => {
    if (!v) return null;
    if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://')) return v;
    if (v.startsWith('/storage/')) return v;
    if (v.startsWith('storage/')) return `/${v}`;
    return `/storage/${v}`;
};

const typeStyle: Record<Movement['type'], string> = {
    purchase:   'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
    sale:       'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
    adjustment: 'text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
    deletion:   'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Movements({ movements, filters, summary }: MovementsProps) {
    const { currentShop } = usePage<PageProps>().props;
    const shop = currentShop?.slug ?? '';
    const [search, setSearch] = useState(filters.search ?? '');
    const [type,   setType]   = useState(filters.type   ?? '');
    const [from,   setFrom]   = useState(filters.from   ?? '');
    const [to,     setTo]     = useState(filters.to     ?? '');

    const apply = () => {
        router.get(`/${shop}/inventory/movements`, { search, type, from, to }, { preserveScroll: true });
    };

    const clear = () => {
        setSearch(''); setType(''); setFrom(''); setTo('');
        router.get(`/${shop}/inventory/movements`, {});
    };

    const hasFilters = !!(filters.search || filters.type || filters.from || filters.to);

    return (
        <AdminLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stock Movements</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Full history of every stock change</p>
                </div>
            }
        >
            <Head title="Stock Movements" />

            <div className="space-y-5">

                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: 'Units In',  value: summary.total_in,  color: 'text-green-600 dark:text-green-400', icon: <ArrowUpCircle className="h-5 w-5" /> },
                        { label: 'Units Out', value: summary.total_out, color: 'text-red-500',                       icon: <ArrowDownCircle className="h-5 w-5" /> },
                        { label: 'Purchases', value: summary.purchases, color: 'text-indigo-600 dark:text-indigo-400', icon: null },
                        { label: 'Sales',     value: summary.sales,     color: 'text-blue-600 dark:text-blue-400',    icon: null },
                    ].map((s, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{s.label}</p>
                            <div className={`mt-1 flex items-center gap-1.5 text-2xl font-bold ${s.color}`}>
                                {s.icon}
                                {s.value.toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex flex-wrap gap-3 items-end">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[180px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && apply()}
                                placeholder="Product or SKU…"
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Type */}
                        <select
                            value={type}
                            onChange={e => setType(e.target.value)}
                            className="py-2 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All types</option>
                            <option value="purchase">Purchase</option>
                            <option value="sale">Sale</option>
                            <option value="adjustment">Adjustment</option>
                            <option value="deletion">Deletion</option>
                        </select>

                        {/* Date range */}
                        <input
                            type="date"
                            value={from}
                            onChange={e => setFrom(e.target.value)}
                            className="py-2 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="text-gray-400 text-sm self-center">to</span>
                        <input
                            type="date"
                            value={to}
                            onChange={e => setTo(e.target.value)}
                            className="py-2 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />

                        <button
                            onClick={apply}
                            className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                            Apply
                        </button>
                        {hasFilters && (
                            <button
                                onClick={clear}
                                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg"
                            >
                                <X className="h-3.5 w-3.5" /> Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {movements.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <Package className="h-12 w-12 mb-3 opacity-30" />
                            <p className="font-medium">No movements found</p>
                            {hasFilters && <p className="text-sm mt-1">Try adjusting your filters</p>}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-900/40">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Note</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">By</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {movements.data.map(m => {
                                            const img = resolveImage(m.product_image);
                                            const isIn = m.quantity > 0;
                                            return (
                                                <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                                                                {img
                                                                    ? <img src={img} alt={m.product_name ?? ''} className="w-full h-full object-cover" />
                                                                    : <div className="w-full h-full flex items-center justify-center"><Package className="h-4 w-4 text-gray-400" /></div>
                                                                }
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-semibold text-gray-900 dark:text-white truncate">{m.product_name}</p>
                                                                <p className="text-[11px] text-gray-400 truncate">{m.variant_label}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${typeStyle[m.type]}`}>
                                                            {m.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className={`flex items-center gap-1 font-bold ${isIn ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                                            {isIn ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
                                                            {Math.abs(m.quantity)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell">
                                                        {m.note ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                                                        {m.performed_by ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{m.created_at}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {movements.from ?? 0}–{movements.to ?? 0} of {movements.total} movements
                                </p>
                                <div className="flex gap-1">
                                    {movements.links.map((link, i) => (
                                        link.url ? (
                                            <Link
                                                key={i}
                                                href={link.url}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                                                    link.active
                                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-400'
                                                }`}
                                            />
                                        ) : (
                                            <span
                                                key={i}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className="px-2.5 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 text-gray-400 cursor-default"
                                            />
                                        )
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
