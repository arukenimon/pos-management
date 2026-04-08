import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Package, ShoppingCart, Trash2, Plus, Minus, Banknote, CreditCard, Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VariantAttributeValue {
    id: number;
    value: string;
    attribute: { id: number; name: string };
}

interface POSVariant {
    id: number;
    sku: string;
    price: string;
    total_stock: number;
    attribute_values?: VariantAttributeValue[];
}

interface POSProduct {
    id: number;
    name: string;
    images?: string[];
    variants: POSVariant[];
}

interface CartItem {
    variant: POSVariant;
    product: POSProduct;
    quantity: number;
}

interface POSPageProps extends PageProps {
    products: POSProduct[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const resolveImageSrc = (value: string): string => {
    if (value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://')) return value;
    if (value.startsWith('/storage/')) return value;
    if (value.startsWith('storage/')) return `/${value}`;
    return `/storage/${value}`;
};

const variantLabel = (variant: POSVariant): string => {
    if (!variant.attribute_values?.length) return variant.sku;
    return variant.attribute_values.map(av => av.value).join(' / ');
};

const priceRange = (product: POSProduct): string => {
    const prices = product.variants.map(v => Number(v.price)).filter(p => p > 0);
    if (!prices.length) return '—';
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `P${min.toFixed(2)}` : `P${min.toFixed(2)} – P${max.toFixed(2)}`;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function POSIndex({ products }: POSPageProps) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
    const [cashReceived, setCashReceived] = useState('');
    const [variantPickerProduct, setVariantPickerProduct] = useState<POSProduct | null>(null);
    const [processing, setProcessing] = useState(false);

    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    // ── Derived ───────────────────────────────────────────────────────────────

    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return products;
        const q = searchQuery.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.variants.some(v => v.sku.toLowerCase().includes(q))
        );
    }, [products, searchQuery]);

    const subtotal = useMemo(
        () => cart.reduce((s, i) => s + Number(i.variant.price) * i.quantity, 0),
        [cart]
    );
    const change = useMemo(() => (parseFloat(cashReceived) || 0) - subtotal, [cashReceived, subtotal]);

    // ── Cart actions ──────────────────────────────────────────────────────────

    const addToCart = useCallback((product: POSProduct, variant: POSVariant) => {
        if (variant.total_stock <= 0) { toast.error('Out of stock'); return; }

        setCart(prev => {
            const idx = prev.findIndex(i => i.variant.id === variant.id);
            if (idx >= 0) {
                if (prev[idx].quantity >= variant.total_stock) {
                    toast.error('Not enough stock');
                    return prev;
                }
                return prev.map((item, i) => i === idx ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { variant, product, quantity: 1 }];
        });

        const label = variant.attribute_values?.length ? ` (${variantLabel(variant)})` : '';
        toast.success(`${product.name}${label} added`);
        setVariantPickerProduct(null);
        setSearchQuery('');
    }, []);

    const handleProductClick = (product: POSProduct) => {
        if (product.variants.length === 1) {
            addToCart(product, product.variants[0]);
        } else {
            setVariantPickerProduct(product);
        }
    };

    const updateQty = (variantId: number, delta: number) => {
        setCart(prev => prev.reduce<CartItem[]>((acc, item) => {
            if (item.variant.id !== variantId) return [...acc, item];
            const newQty = item.quantity + delta;
            if (newQty <= 0) return acc; // remove
            if (newQty > item.variant.total_stock) { toast.error('Not enough stock'); return [...acc, item]; }
            return [...acc, { ...item, quantity: newQty }];
        }, []));
    };

    const removeFromCart = (variantId: number) => setCart(prev => prev.filter(i => i.variant.id !== variantId));
    const clearCart = () => { setCart([]); setCashReceived(''); };

    // ── Checkout ──────────────────────────────────────────────────────────────

    const handleCheckout = () => {
        if (cart.length === 0) { toast.error('Cart is empty'); return; }
        if (paymentMethod === 'cash' && (!cashReceived || change < 0)) {
            toast.error('Cash received is insufficient');
            return;
        }

        setProcessing(true);
        router.post(route('admin.pos.checkout'), {
            items: cart.map(i => ({ variant_id: i.variant.id, quantity: i.quantity })),
            payment_method: paymentMethod,
            cash_received: paymentMethod === 'cash' ? parseFloat(cashReceived) : null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Sale completed!');
                clearCart();
                router.reload({ only: ['products'] });
            },
            onError: (errors) => {
                toast.error((Object.values(errors)[0] as string) || 'Checkout failed');
            },
            onFinish: () => setProcessing(false),
        });
    };

    // ──────────────────────────────────────────────────────────────────────────
    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Point of Sale</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {products.length} products available
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="POS" />

            <div className="flex gap-4 h-[calc(100vh-11rem)]">

                {/* ── Left: Product browser ──────────────────────────────── */}
                <div className="flex-1 flex flex-col gap-3 min-w-0">

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Escape') setSearchQuery('');
                                if (e.key === 'Enter' && filteredProducts.length > 0) {
                                    handleProductClick(filteredProducts[0]);
                                }
                            }}
                            placeholder="Search by product name or SKU… (Enter to add first result)"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Product grid */}
                    <div className="flex-1 overflow-y-auto pr-1">
                        {filteredProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <Package className="h-16 w-16 mb-3 opacity-30" />
                                <p className="font-medium">No products found</p>
                                {searchQuery && <p className="text-sm mt-1">Try a different search term</p>}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                {filteredProducts.map(product => {
                                    const totalStock = product.variants.reduce((s, v) => s + v.total_stock, 0);
                                    return (
                                        <button
                                            key={product.id}
                                            type="button"
                                            onClick={() => handleProductClick(product)}
                                            className="group text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all duration-150 overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {/* Image */}
                                            <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
                                                {product.images?.length ? (
                                                    <img
                                                        src={resolveImageSrc(product.images[0])}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                                                    </div>
                                                )}
                                                {/* Variant count badge */}
                                                {product.variants.length > 1 && (
                                                    <span className="absolute top-1.5 right-1.5 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                        {product.variants.length}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="p-2.5">
                                                <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2 mb-1">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                                    {priceRange(product)}
                                                </p>
                                                <p className={`text-[10px] mt-0.5 font-medium ${totalStock > 10 ? 'text-green-600' : totalStock > 0 ? 'text-yellow-600' : 'text-red-500'}`}>
                                                    {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right: Cart ────────────────────────────────────────── */}
                <div className="w-80 flex-shrink-0 flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">

                    {/* Cart Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            <span className="font-semibold text-gray-900 dark:text-white">
                                Cart
                                {cart.length > 0 && (
                                    <span className="ml-1.5 text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded-full">
                                        {cart.reduce((s, i) => s + i.quantity, 0)}
                                    </span>
                                )}
                            </span>
                        </div>
                        {cart.length > 0 && (
                            <button
                                onClick={clearCart}
                                className="text-xs text-red-500 hover:text-red-700 font-medium"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                                <ShoppingCart className="h-12 w-12 mb-3 opacity-20" />
                                <p className="text-sm font-medium">Cart is empty</p>
                                <p className="text-xs mt-1">Click products to add them</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {cart.map(item => (
                                    <div key={item.variant.id} className="flex gap-3 px-4 py-3">
                                        {/* Thumbnail */}
                                        <div className="w-10 h-10 rounded-md bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                                            {item.product.images?.length ? (
                                                <img src={resolveImageSrc(item.product.images[0])} alt={item.product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="h-5 w-5 text-gray-400" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{item.product.name}</p>
                                            {item.variant.attribute_values?.length ? (
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400">{variantLabel(item.variant)}</p>
                                            ) : (
                                                <p className="text-[10px] font-mono text-gray-400">{item.variant.sku}</p>
                                            )}
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <button onClick={() => updateQty(item.variant.id, -1)} className="h-5 w-5 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="text-xs font-bold min-w-[1.5rem] text-center text-gray-900 dark:text-white">{item.quantity}</span>
                                                <button onClick={() => updateQty(item.variant.id, 1)} className="h-5 w-5 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                                <button onClick={() => removeFromCart(item.variant.id)} className="ml-1 text-red-400 hover:text-red-600">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Line total */}
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">
                                                P{(Number(item.variant.price) * item.quantity).toFixed(2)}
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                P{Number(item.variant.price).toFixed(2)} each
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Checkout section */}
                    {cart.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
                            {/* Total */}
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</span>
                                <span className="text-xl font-bold text-gray-900 dark:text-white">P{subtotal.toFixed(2)}</span>
                            </div>

                            {/* Payment method */}
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setPaymentMethod('cash'); setCashReceived(''); }}
                                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                        paymentMethod === 'cash'
                                            ? 'bg-indigo-600 border-indigo-600 text-white'
                                            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-400'
                                    }`}
                                >
                                    <Banknote className="h-4 w-4" /> Cash
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setPaymentMethod('card'); setCashReceived(''); }}
                                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                        paymentMethod === 'card'
                                            ? 'bg-indigo-600 border-indigo-600 text-white'
                                            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-400'
                                    }`}
                                >
                                    <CreditCard className="h-4 w-4" /> Card
                                </button>
                            </div>

                            {/* Cash received */}
                            {paymentMethod === 'cash' && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Cash Received</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm pointer-events-none">P</span>
                                        <input
                                            type="number"
                                            min={subtotal}
                                            step="0.01"
                                            value={cashReceived}
                                            onChange={e => setCashReceived(e.target.value)}
                                            placeholder={subtotal.toFixed(2)}
                                            className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    {cashReceived && (
                                        <div className={`flex justify-between text-sm font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            <span>Change</span>
                                            <span>P{change.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Checkout button */}
                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={processing || (paymentMethod === 'cash' && change < 0)}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
                            >
                                {processing ? 'Processing…' : `Complete Sale — P${subtotal.toFixed(2)}`}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Variant Picker Dialog ──────────────────────────────────── */}
            <Dialog open={!!variantPickerProduct} onOpenChange={() => setVariantPickerProduct(null)}>
                <DialogContent className="sm:max-w-[420px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    <DialogHeader>
                        <DialogTitle>Select Variant</DialogTitle>
                    </DialogHeader>

                    {variantPickerProduct && (
                        <div className="space-y-2 mt-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                {variantPickerProduct.name}
                            </p>
                            <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                                {variantPickerProduct.variants.map(variant => {
                                    const outOfStock = variant.total_stock <= 0;
                                    return (
                                        <button
                                            key={variant.id}
                                            type="button"
                                            disabled={outOfStock}
                                            onClick={() => addToCart(variantPickerProduct, variant)}
                                            className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-left"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    {variant.attribute_values?.length ? variantLabel(variant) : variant.sku}
                                                </p>
                                                {variant.attribute_values?.length ? (
                                                    <p className="text-[11px] font-mono text-gray-400 mt-0.5">{variant.sku}</p>
                                                ) : null}
                                            </div>
                                            <div className="text-right ml-4 flex-shrink-0">
                                                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                    P{Number(variant.price).toFixed(2)}
                                                </p>
                                                <p className={`text-[11px] font-medium ${
                                                    variant.total_stock > 10 ? 'text-green-600' :
                                                    variant.total_stock > 0 ? 'text-yellow-600' : 'text-red-500'
                                                }`}>
                                                    {outOfStock ? 'Out of stock' : `${variant.total_stock} left`}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
