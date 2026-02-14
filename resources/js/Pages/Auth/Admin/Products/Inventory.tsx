import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { title } from 'process';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/Components/ui/dialog';

export interface Product {
    id: number;
    name: string;
    description?: string;
    sku: string | null;
    images?: string[];
    created_at?: string;
    status: 'active' | 'inactive' | 'out_of_stock';
    stocks?: stocks[];
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
        safe: number;
        low: number;
        critical: number;
    };
}

export interface stocks {
    id: number;
    product_id: number;
    quantity: number;
    created_at: string;
    updated_at: string;
    price: number;
}

const resolveImageSrc = (value: string): string => {
    if (value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://')) {
        return value;
    }
    if (value.startsWith('/storage/')) {
        return value;
    }
    if (value.startsWith('storage/')) {
        return `/${value}`;
    }
    return `/storage/${value}`;
};

export default function Products({ auth, products, filters, analytics }: ProductsPageProps) {

    //const [products, setProducts] = useState<Product[]>(initialProducts || []);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>(filters.status || '');
    const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
    const [stockModalOpen, setStockModalOpen] = useState(false);
    const [selectedProductForStock, setSelectedProductForStock] = useState<Product | null>(null);
    const [stockQuantity, setStockQuantity] = useState<number>(0);

    const { data: stocksData, isFetching } = useQuery({
        queryKey: ['stocks', selectedProductForStock?.id],
        queryFn: async (): Promise<stocks[]> => {
            reset();
            if (!selectedProductForStock) return [];
            const response = await fetch(`/api/admin/products/stocks/${selectedProductForStock.id}`, {
                credentials: 'include', // Send cookies with request
                headers: {
                    'Accept': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
    })

    useEffect(() => {
        console.log(products)
    }, [products])

    // const stocksData = useMemo(() => stocksData_ || [], [stocksData_]);


    // Get unique categories
    const categories = ['all', ...Array.from(new Set(products.map(p => p.name)))];

    const filteredProducts = products || [];

    const handleSearch = (value: string) => {

        setSearchQuery(value);

        router.get(
            route('admin.products.inventory'),
            { search: value, status: filters.status },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            }
        );
    };

    useEffect(() => {
        setSelectedStatus(filters.status || 'all');
    }, [filters.status]);
    const handleSelectedStatusChange = useCallback((value: string) => {

        //setSelectedStatus(value);

        router.get(
            route('admin.products.inventory'),
            { search: filters.search, status: value },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            }
        );
    }, [filters.search]);

    // Toggle product selection
    const toggleProductSelection = (productId: number) => {
        setSelectedProducts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    // Toggle all products selection
    const toggleAllProducts = () => {
        if (selectedProducts.size === filteredProducts.length) {
            setSelectedProducts(new Set());
        } else {
            setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
        }
    };

    // Get status badge styling
    const getStatusBadge = (status: string): { title: string; bg: string } => {
        // switch (status) {
        //     case 'active':
        //         return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        //     case 'inactive':
        //         return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        //     case 'out_of_stock':
        //         return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        //     default:
        //         return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        // }

        const statMap: { [key: string]: { title: string; bg: string } } = {
            'active': {
                title: 'Active',
                bg: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            },
            'inactive': {
                title: 'Inactive',
                bg: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            },
            'out_of_stock': {
                title: 'Out of Stock',
                bg: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            },
        }

        return statMap[status];
    };

    // Get stock status color
    const getStockColor = (stock: number) => {
        if (stock === 0) return 'text-red-600 dark:text-red-400';
        if (stock < 20) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-green-600 dark:text-green-400';
    };

    // Handle delete selected
    const handleDeleteSelected = () => {
        if (window.confirm(`Are you sure you want to delete ${selectedProducts.size} product(s)?`)) {
            // In a real app, this would make an API call
            //setProducts(prev => prev.filter(p => !selectedProducts.has(p.id)));
            setSelectedProducts(new Set());
        }
    };

    // Handle stock modal
    const openStockModal = (product: Product) => {
        setSelectedProductForStock(product);
        setStockQuantity(0);
        setStockModalOpen(true);
    };

    const closeStockModal = () => {
        setStockModalOpen(false);
        setSelectedProductForStock(null);
        setStockQuantity(0);
    };

    const queryClient = useQueryClient();

    const { data, setData, post, delete: deletestock, put, processing, errors, recentlySuccessful, reset, clearErrors } = useForm({
        quantity: 0,
        price: 0,
        selling_price: 0,
    })


    const handleAddStock = () => {
        // if (!selectedProductForStock || data.quantity <= 0) {
        //     return;
        // }

        post(route('admin.products.add-stock', selectedProductForStock?.id), {
            onSuccess: () => {
                toast.success('Stock added successfully');
                queryClient.invalidateQueries({
                    queryKey: ['stocks'],
                })
                //closeStockModal();
            },
            onError: () => {
                toast.error('Failed to add stock');
            },
        })
    };

    const handleDeleteStock = (stockId: number) => {
        if (window.confirm('Are you sure you want to delete this stock batch?')) {
            deletestock(route('admin.products.stocks.delete', stockId), {
                onSuccess: () => {
                    toast.success('Stock batch deleted successfully');
                    queryClient.invalidateQueries({
                        queryKey: ['stocks'],
                    })
                },
                onError: () => {
                    toast.error('Failed to delete stock batch');
                }
            });
        }
    };




    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Inventory
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Manage your product inventory
                        </p>
                    </div>
                    <Link
                        href="/admin/products/create"
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm"
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
                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Products
                                </p>
                                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                    {analytics.total}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-500 rounded-lg">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Safe
                                </p>
                                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                    {analytics.safe}
                                    {/* {products.filter(p => p.status === 'active').length} */}
                                </p>
                            </div>
                            <div className="p-3 bg-green-500 rounded-lg">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Low
                                </p>
                                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                    {analytics.low}
                                    {/* ${stocksData?.reduce((sum, stock) => sum + stock.quantity, 0).toFixed(2)} */}
                                </p>
                            </div>
                            <div className="p-3 bg-yellow-500 rounded-lg">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Critical
                                </p>
                                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                    {analytics.critical}
                                    {/* {products.filter(p => p.stock === 0).length} */}
                                </p>
                            </div>
                            <div className="p-3 bg-red-500 rounded-lg">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Search Products
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    id="search"
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search by name or SKU..."
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Category Filter */}
                        {/* <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Category
                            </label>
                            <select
                                id="category"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'all' ? 'All Categories' : cat}
                                    </option>
                                ))}
                            </select>
                        </div> */}

                        {/* Status Filter */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status
                            </label>
                            <select
                                id="status"
                                value={selectedStatus}
                                onChange={(e) => handleSelectedStatusChange(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="">All</option>
                                <option value="safe">Safe</option>
                                <option value="low">Low</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedProducts.size > 0 && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-300">
                                {selectedProducts.size} product(s) selected
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedProducts(new Set())}
                                    className="px-3 py-1.5 text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100"
                                >
                                    Clear Selection
                                </button>
                                <button
                                    onClick={handleDeleteSelected}
                                    className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
                                >
                                    Delete Selected
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Select All Toolbar (Desktop) */}
                {filteredProducts.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                                onChange={toggleAllProducts}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Select All ({filteredProducts.length})
                            </label>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12">
                        <div className="flex flex-col items-center justify-center">
                            <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                                No products found
                            </p>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Try adjusting your search or filter criteria
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className={`grid ${products.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4`}>
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className={`
                                    group relative bg-white dark:bg-gray-800 rounded-lg border-2 transition-all duration-200
                                    ${selectedProducts.has(product.id)
                                        ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md'
                                    }
                                `}
                            >
                                {/* Checkbox Overlay */}
                                <div className="absolute top-3 left-3 z-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.has(product.id)}
                                        onChange={() => toggleProductSelection(product.id)}
                                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer shadow-sm"
                                    />
                                </div>

                                {/* Status Badge */}
                                <div className="absolute top-3 right-3 z-10">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(product.status).bg}`}>
                                        {/* {product.status.replace('_', ' ')} */}
                                        {getStatusBadge(product.status).title}
                                    </span>
                                </div>

                                {/* Product Image */}
                                <div className="relative h-36 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-t-lg overflow-hidden">
                                    {product.images && product.images.length > 0 ? (
                                        <img
                                            src={resolveImageSrc(product.images[0])}
                                            alt={product.name}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <svg className="h-20 w-20 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                        </div>
                                    )}
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                                </div>

                                {/* Product Details */}
                                <div className="p-4">
                                    {/* Product Name */}
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 truncate">
                                        {product.name}
                                    </h3>

                                    {/* SKU & Category */}
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                            SKU: {product.sku}
                                        </span>
                                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                            {/* {product.category} */}
                                        </span>
                                    </div>

                                    {/* Price & Stock */}
                                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                                        <div>
                                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                {/* ${product.price.toFixed(2)} */}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-semibold ${product.stocks && getStockColor(product?.stocks?.reduce((sum, stock) => sum + stock.quantity, 0))}`}>
                                                {product?.stocks?.reduce((sum, stock) => sum + stock.quantity, 0)}
                                            </p>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                in stock
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <Link
                                                href={route('admin.products.edit', product.id)}
                                                className="inline-flex items-center justify-center px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md transition-colors duration-200"
                                            >
                                                <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    // if (window.confirm('Are you sure you want to delete this product?')) {
                                                    //     setProducts(prev => prev.filter(p => p.id !== product.id));
                                                    // }
                                                }}
                                                className="inline-flex items-center justify-center px-2.5 py-1.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-md transition-colors duration-200"
                                            >
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => openStockModal(product)}
                                            className="w-full inline-flex items-center justify-center px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-md transition-colors duration-200"
                                        >
                                            <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add Stock
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {filteredProducts.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                Previous
                            </button>
                            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredProducts.length}</span> of{' '}
                                    <span className="font-medium">{filteredProducts.length}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <span className="sr-only">Previous</span>
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-indigo-50 dark:bg-indigo-900/20 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                        1
                                    </button>
                                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <span className="sr-only">Next</span>
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stock Modal */}
                <Dialog open={stockModalOpen} onOpenChange={setStockModalOpen}>
                    <DialogContent className="sm:max-w-[600px] bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
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
                                        Add stock quantity for <span className="font-semibold text-foreground">{selectedProductForStock?.name}</span>
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {/* Add Price also */}
                            <div className='flex gap-4 justify-between'>
                                <div className='w-full'>
                                    <label htmlFor="stock-quantity" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                                        Quantity to Add
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="stock-quantity"
                                            id="stock-quantity"
                                            min="1"
                                            value={data.quantity}
                                            onChange={(e) => setData('quantity', parseInt(e.target.value) || 0)}
                                            className="block w-full pr-12 border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                                            placeholder="0"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">stock(s)</span>
                                        </div>
                                    </div>
                                    {errors.quantity && (
                                        <p className="mt-2 text-sm text-red-600" id="quantity-error">
                                            {errors.quantity}
                                        </p>
                                    )}
                                </div>

                                <div className='w-full'>
                                    <label htmlFor="stock-price" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                                        Cost Price
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="stock-price"
                                            id="stock-price"
                                            min="0"
                                            step="0.01"
                                            value={data.price}
                                            onChange={(e) => setData('price', parseFloat(e.target.value) || 0)}
                                            className="block w-full pr-12 border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                                            placeholder="0.00"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                                        </div>
                                    </div>
                                    {errors.price && (
                                        <p className="mt-2 text-sm text-red-600" id="price-error">
                                            {errors.price}
                                        </p>
                                    )}
                                </div>

                                {/* <div className='w-full'>
                                    <label htmlFor="stock-selling-price" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                                        Selling Price
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="stock-selling-price"
                                            id="stock-selling-price"
                                            min="0"
                                            step="0.01"
                                            value={data.selling_price}
                                            onChange={(e) => setData('selling_price', parseFloat(e.target.value) || 0)}
                                            className="block w-full pr-12 border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                                            placeholder="0.00"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                                        </div>
                                    </div>
                                    {errors.selling_price && (
                                        <p className="mt-2 text-sm text-red-600" id="selling-price-error">
                                            {errors.selling_price}
                                        </p>
                                    )}
                                </div> */}
                            </div>


                            {/* Current info */}
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Product SKU:</span>
                                    <span className="font-medium">{selectedProductForStock?.sku || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${selectedProductForStock && getStatusBadge(selectedProductForStock.status).bg}`}>
                                        {selectedProductForStock && getStatusBadge(selectedProductForStock.status).title}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-gray-500 dark:text-gray-400">Total Stocks:</span>
                                    <span className={`font-medium ${stocksData && getStockColor(stocksData?.reduce((sum, stock) => sum + stock.quantity, 0))}`}>{stocksData?.reduce((sum, stock) => sum + stock.quantity, 0) || 'N/A'}</span>
                                </div>
                            </div>

                            {/* Batch Stocks */}
                            <div>
                                <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Current Stock Batches:</h4>
                                {stocksData && stocksData?.length > 0 ? (
                                    <ul className="max-h-60 overflow-y-auto divide-y border rounded-md border-gray-200 dark:border-gray-700">
                                        {stocksData.map((batch) => (
                                            <li key={batch.id} className="px-4 py-3 flex justify-between items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-medium">
                                                            Batch #{batch.id}
                                                        </span>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                            {batch.quantity} stock{batch.quantity > 1 ? "s" : ""}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            {/* <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg> */}
                                                            ₱{batch?.price || 'N/A'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            {new Date(batch.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteStock(batch.id)}
                                                    className="flex-shrink-0 p-1.5 rounded-md text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    title="Delete batch"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {isFetching ? 'Loading stock batches...' : 'No stock batches available.'}
                                    </p>
                                )}
                            </div>
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
                                disabled={processing}
                                className="inline-flex justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                        Processing...
                                    </>
                                ) : (
                                    'Add Stock'
                                )}
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
