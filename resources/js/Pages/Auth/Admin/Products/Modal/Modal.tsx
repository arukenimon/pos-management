
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/Components/ui/dialog';
import { useState } from 'react';
import { Product, stocks } from '../Index';
import { toast } from 'react-toastify';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { productQueryOptions } from '@/queryOptions/Products/queryOptions';
import { Loader2 } from 'lucide-react';
import { useForm } from '@inertiajs/react';

export default function Modal({ open, onOpenChange, selectedProduct }:
    { open: boolean, onOpenChange: (open: boolean) => void, selectedProduct: Product | null }) {



    //const [products, setProducts] = useState<Product[]>(initialProducts || []);
    // const [searchQuery, setSearchQuery] = useState('');
    // const [selectedCategory, setSelectedCategory] = useState<string>('all');
    // const [selectedStatus, setSelectedStatus] = useState<string>(filters.status || '');
    const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
    const [stockModalOpen, setStockModalOpen] = useState(false);
    const [selectedProductForStock, setSelectedProductForStock] = useState<Product | null>(null);
    const [stockQuantity, setStockQuantity] = useState<number>(0);

    const queryClient = useQueryClient();

    const { data, setData, post, delete: deletestock, put, processing, errors, recentlySuccessful, reset, clearErrors } = useForm({
        quantity: 0,
        price: 0,
    })
    const { data: stocksData, isFetching } = useQuery(productQueryOptions({ selectedProductForStock, reset }))



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
    return (
        <div>
            {/* Stock Modal */}
            <Dialog open={open} onOpenChange={onOpenChange}>
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
                        <div>
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
                        <div>
                            <label htmlFor="stock-price" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                                Price per Stock
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
                            onClick={() => {
                                setStockModalOpen(false);
                                setSelectedProductForStock(null);
                                reset();
                                clearErrors();
                            }}
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
    )
}