import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/Components/ui/dialog';
import { Attribute, AttributeValue, ProductVariant } from './ModifyProduct';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductVariantInventory {
    id: number;
    product_variant_id: number;
    quantity: number;
    cost_price: number;
    selling_price: number;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: number;
    name: string;
    description?: string;
    images?: string[];
    created_at?: string;
    status: 'active' | 'inactive';
    variants?: (ProductVariant & {
        inventories?: ProductVariantInventory[];
        attribute_values?: (AttributeValue & { attribute: Attribute })[];
    })[];
}

export interface ProductsPageProps extends PageProps {
    products: Product[];
    filters: {
        search?: string;
        status?: string;
    };
    analytics: {
        total: number;
        active: number;
        inactive: number;
    };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const resolveImageSrc = (value: string): string => {
    if (value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://')) return value;
    if (value.startsWith('/storage/')) return value;
    if (value.startsWith('storage/')) return `/${value}`;
    return `/storage/${value}`;
};

const totalStock = (product: Product): number =>
    product.variants?.reduce(
        (sum, v) => sum + (v.inventories?.reduce((s, inv) => s + inv.quantity, 0) ?? 0),
        0
    ) ?? 0;

// ─── Component ────────────────────────────────────────────────────────────────

export default function Products({ auth, products, filters, analytics }: ProductsPageProps) {

    const [searchQuery, setSearchQuery] = useState(filters.search ?? '');
    const [selectedStatus, setSelectedStatus] = useState<string>(filters.status ?? '');
    const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());

    // Stock modal state
    const [stockModalOpen, setStockModalOpen] = useState(false);
    const [selectedProductForStock, setSelectedProductForStock] = useState<Product | null>(null);
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

    const selectedVariant = selectedProductForStock?.variants?.find(v => v.id === selectedVariantId) ?? null;

    const { data, setData, post, delete: deletestock, processing, errors, reset } = useForm({
        quantity: 0,
        cost_price: 0,
    });

    const filteredProducts = products ?? [];

    // Sync modal product data when Inertia refreshes the products prop
    useEffect(() => {
        if (stockModalOpen && selectedProductForStock) {
            const updated = products.find(p => p.id === selectedProductForStock.id);
            if (updated) setSelectedProductForStock(updated);
        }
    }, [products]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        router.get(route('admin.products.inventory'), { search: value, status: filters.status }, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    useEffect(() => {
        setSelectedStatus(filters.status ?? '');
    }, [filters.status]);

    const handleSelectedStatusChange = useCallback((value: string) => {
        router.get(route('admin.products.inventory'), { search: filters.search, status: value }, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }, [filters.search]);

    const toggleProductSelection = (id: number) => {
        setSelectedProducts(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleAllProducts = () => {
        setSelectedProducts(
            selectedProducts.size === filteredProducts.length
                ? new Set()
                : new Set(filteredProducts.map(p => p.id))
        );
    };

    const handleDeleteSelected = () => {
        if (window.confirm(`Delete ${selectedProducts.size} product(s)?`)) {
            setSelectedProducts(new Set());
        }
    };

    const openStockModal = (product: Product) => {
        setSelectedProductForStock(product);
        setSelectedVariantId(product.variants?.[0]?.id ?? null);
        setStockModalOpen(true);
        reset();
    };

    const closeStockModal = () => {
        setStockModalOpen(false);
        setSelectedProductForStock(null);
        setSelectedVariantId(null);
        reset();
    };

    const handleAddStock = () => {
        if (!selectedVariantId) {
            toast.error('Please select a variant.');
            return;
        }
        post(route('admin.products.add-stock', selectedVariantId), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success('Stock added successfully');
                reset();
            },
            onError: () => toast.error('Failed to add stock'),
        });
    };

    const handleDeleteStock = (inventoryId: number) => {
        if (!window.confirm('Delete this stock batch?')) return;
        deletestock(route('admin.products.stocks.delete', inventoryId), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => toast.success('Stock batch deleted'),
            onError: () => toast.error('Failed to delete stock batch'),
        });
    };

    // ── UI helpers ────────────────────────────────────────────────────────────

    const getStatusBadge = (status: string): { title: string; bg: string } => {
        const map: Record<string, { title: string; bg: string }> = {
            active:   { title: 'Active',   bg: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
            inactive: { title: 'Inactive', bg: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
        };
        return map[status] ?? { title: status, bg: 'bg-gray-100 text-gray-800' };
    };

    const getStockColor = (qty: number) => {
        if (qty === 0) return 'text-red-600 dark:text-red-400';
        if (qty < 20)  return 'text-yellow-600 dark:text-yellow-400';
        return 'text-green-600 dark:text-green-400';
    };

    const variantLabel = (variant: Product['variants'][0]) => {
        if (!variant.attribute_values?.length) return variant.sku;
        return variant.attribute_values.map(av => `${av.attribute?.name}: ${av.value}`).join(' / ');
    };

    // ──────────────────────────────────────────────────────────────────────────
    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory</h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Manage your product inventory</p>
                    </div>
                    <Link
                        href="/admin/products/create"
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Product
                    </Link>
                </div>
            }
        >
            <Head title="Products - Admin" />

            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    {[
                        { label: 'Total Products', value: analytics.total,    color: 'bg-blue-500',  icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
                        { label: 'Active',          value: analytics.active,   color: 'bg-green-500', icon: 'M5 13l4 4L19 7' },
                        { label: 'Inactive',        value: analytics.inactive, color: 'bg-gray-500',  icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                </div>
                                <div className={`p-3 ${stat.color} rounded-lg`}>
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Products</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => handleSearch(e.target.value)}
                                    placeholder="Search by name..."
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock Status</label>
                            <select
                                value={selectedStatus}
                                onChange={e => handleSelectedStatusChange(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="">All</option>
                                <option value="safe">Safe (&gt;10)</option>
                                <option value="low">Low (1-10)</option>
                                <option value="critical">Critical (0)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Bulk actions */}
                {selectedProducts.size > 0 && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 p-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-indigo-900 dark:text-indigo-300">{selectedProducts.size} selected</span>
                        <div className="flex gap-2">
                            <button onClick={() => setSelectedProducts(new Set())} className="px-3 py-1.5 text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                Clear
                            </button>
                            <button onClick={handleDeleteSelected} className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">
                                Delete Selected
                            </button>
                        </div>
                    </div>
                )}

                {/* Select all toolbar */}
                {filteredProducts.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedProducts.size === filteredProducts.length}
                                onChange={toggleAllProducts}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select All ({filteredProducts.length})</span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{filteredProducts.length} products</span>
                    </div>
                )}

                {/* Product grid */}
                {filteredProducts.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 flex flex-col items-center justify-center">
                        <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No products found</p>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredProducts.map(product => {
                            const stock = totalStock(product);
                            return (
                                <div
                                    key={product.id}
                                    className={`group relative bg-white dark:bg-gray-800 rounded-lg border-2 transition-all duration-200 ${
                                        selectedProducts.has(product.id)
                                            ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md'
                                    }`}
                                >
                                    <div className="absolute top-3 left-3 z-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.has(product.id)}
                                            onChange={() => toggleProductSelection(product.id)}
                                            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer shadow-sm"
                                        />
                                    </div>
                                    <div className="absolute top-3 right-3 z-10">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(product.status).bg}`}>
                                            {getStatusBadge(product.status).title}
                                        </span>
                                    </div>

                                    {/* Image */}
                                    <div className="relative h-36 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-t-lg overflow-hidden">
                                        {product.images?.length ? (
                                            <img src={resolveImageSrc(product.images[0])} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <svg className="h-20 w-20 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </div>

                                    {/* Details */}
                                    <div className="p-4">
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 truncate">{product.name}</h3>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                                            {product.variants?.length ?? 0} variant{(product.variants?.length ?? 0) !== 1 ? 's' : ''}
                                        </p>
                                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Total stock</span>
                                            <span className={`text-sm font-semibold ${getStockColor(stock)}`}>{stock}</span>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <Link
                                                    href={route('admin.products.edit', product.id)}
                                                    className="inline-flex items-center justify-center px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md transition-colors"
                                                >
                                                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit
                                                </Link>
                                                <button className="inline-flex items-center justify-center px-2.5 py-1.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 dark:text-red-400 text-xs font-medium rounded-md transition-colors">
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => openStockModal(product)}
                                                className="w-full inline-flex items-center justify-center px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-md transition-colors"
                                            >
                                                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Add Stock
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Add Stock Modal */}
                <Dialog open={stockModalOpen} onOpenChange={setStockModalOpen}>
                    <DialogContent className="sm:max-w-[560px] bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                                    <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div>
                                    <DialogTitle>Add Stock</DialogTitle>
                                    <DialogDescription>
                                        {selectedProductForStock?.name}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            {/* Variant selector */}
                            {(selectedProductForStock?.variants?.length ?? 0) > 1 && (
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Select Variant</label>
                                    <select
                                        value={selectedVariantId ?? ''}
                                        onChange={e => setSelectedVariantId(Number(e.target.value))}
                                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {selectedProductForStock?.variants?.map(v => (
                                            <option key={v.id} value={v.id}>
                                                {variantLabel(v)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Selected variant info */}
                            {selectedVariant && (
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-md px-3 py-2 text-sm flex items-center justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">SKU</span>
                                    <span className="font-mono font-medium">{selectedVariant.sku}</span>
                                </div>
                            )}

                            {/* Inputs */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={data.quantity || ''}
                                        onChange={e => setData('quantity', parseInt(e.target.value) || 0)}
                                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="0"
                                    />
                                    {errors.quantity && <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                                        Cost Price
                                        <span className="ml-1 text-xs font-normal text-gray-400">(what you paid the supplier)</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-500 text-sm pointer-events-none">P</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.cost_price || ''}
                                            onChange={e => setData('cost_price', parseFloat(e.target.value) || 0)}
                                            className="block w-full pl-6 pr-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    {errors.cost_price && <p className="mt-1 text-xs text-red-600">{errors.cost_price}</p>}
                                </div>
                            </div>

                            {/* Selling price read-only info */}
                            {selectedVariant?.price && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Selling price will be set to <span className="font-semibold text-gray-700 dark:text-gray-200">P{Number(selectedVariant.price).toFixed(2)}</span> (from variant).
                                </p>
                            )}

                            {/* Existing inventory batches for selected variant */}
                            {selectedVariant && (
                                <div>
                                    <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                                        Current Batches
                                        <span className="ml-2 text-xs font-normal text-gray-400">
                                            ({selectedVariant.inventories?.reduce((s, i) => s + i.quantity, 0) ?? 0} total)
                                        </span>
                                    </h4>
                                    {(selectedVariant.inventories?.length ?? 0) > 0 ? (
                                        <ul className="max-h-48 overflow-y-auto divide-y border rounded-md border-gray-200 dark:border-gray-700">
                                            {selectedVariant.inventories!.map(inv => (
                                                <li key={inv.id} className="px-3 py-2.5 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <div className="text-sm">
                                                        <span className="font-medium">Batch #{inv.id}</span>
                                                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                            {inv.quantity} units
                                                        </span>
                                                        <span className="ml-2 text-xs text-gray-500">
                                                            Cost P{Number(inv.cost_price).toFixed(2)} / Sell P{Number(inv.selling_price).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteStock(inv.id)}
                                                        className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No stock batches yet.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <button
                                type="button"
                                onClick={closeStockModal}
                                className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={handleAddStock}
                                disabled={processing || !selectedVariantId}
                                className="inline-flex justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {processing ? 'Processing...' : 'Add Stock'}
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
