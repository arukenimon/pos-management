import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, CreditCard, Package, Loader2 } from 'lucide-react';
import { toast } from "react-toastify";
import CustomerLayout from "@/Layouts/CustomerLayout";
import { Cart } from './Index';
import { Product } from '../Auth/Admin/Products/Index';
import { only } from 'node:test';
import { set } from 'date-fns';
import { ca } from 'date-fns/locale';
import { useMutation } from '@tanstack/react-query';


type CartWithProduct = Cart & { product: Product };


export default function CheckoutPage({ carts }: { carts: CartWithProduct[] }) {
    const [localCarts, setLocalCarts] = useState(carts);
    const { data, setData, put, delete: deleteCart, processing } = useForm({
        //quantity: 0,
    });

    useEffect(() => {
        console.log('Carts prop changed:', carts);
        setLocalCarts(carts);
    }, [carts])

    const updateQuantity = useMutation({
        mutationFn: ({ cartId, newQuantity }: { cartId: number; newQuantity: number }) => {
            return new Promise<void>((resolve, reject) => {
                router.put(
                    route('customer.cart.update_quantity', { cart_id: cartId }),
                    { quantity: newQuantity },
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            router.reload({ only: ['carts'] });
                            toast.success('Quantity updated');
                            resolve();      // tell React Query "done"
                        },
                        onError: (err) => {
                            toast.error('Failed to update quantity');
                            reject(err);    // tell React Query "failed"
                        }
                    }
                );
            });
        }
    });


    const removeItem = (cartId: number) => {
        deleteCart(route('customer.cart.remove', { cart_id: cartId }), {
            preserveScroll: true,
            // onSuccess: () => {
            //     toast.success('Item removed from cart');
            //     setLocalCarts(prevCarts => prevCarts.filter(cart => cart.id !== cartId));
            // },
            onError: () => {
                toast.error('Failed to remove item');
            }
        });
    };



    const subtotal = localCarts && localCarts?.reduce((sum, cart) => {
        const price = cart.product?.stocks?.[0]?.price || 0;
        return sum + (price * cart.quantity);
    }, 0);

    const tax = subtotal * 0.12; // 12% VAT
    const total = subtotal + tax;

    const handleCheckout = () => {
        router.post(route('customer.checkout.process'), {}, {
            onSuccess: () => {
                toast.success('Order placed successfully!');
            },
            onError: () => {
                toast.error('Failed to process order.');
            }
        });
    };

    return (
        <CustomerLayout>
            <Head title="Order - Sari-Sari Store" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
                {/* Header */}
                <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <Link
                                href="/"
                                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                            </Link>
                            <div className="flex-1">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                                    Order
                                </h1>
                                <p className="text-blue-100 text-xs sm:text-sm mt-1">Review your order</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {localCarts && localCarts?.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
                            <Package className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                            <p className="text-gray-600 mb-6">Add some items to get started!</p>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all font-semibold"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                            {/* Cart Items */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                        Cart Items ({localCarts?.length})
                                    </h2>
                                    <div className="space-y-4">
                                        {localCarts?.map((cart) => {
                                            const product = cart.product;
                                            const stock = product?.stocks?.[0];
                                            const price = stock ? Number(stock.price) : 0;
                                            const itemTotal = price * cart.quantity;


                                            const isPendingUpdate = updateQuantity.isPending && cart.id === updateQuantity.variables?.cartId;

                                            return (
                                                <div
                                                    key={cart.id}
                                                    className="flex flex-col sm:flex-row gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                                                >
                                                    {/* Product Image Placeholder */}
                                                    <div className="w-full sm:w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Package className="w-10 h-10 text-blue-300" />
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-gray-800 text-base sm:text-lg mb-1 truncate">
                                                            {product?.name || 'Unknown Product'}
                                                        </h3>
                                                        <p className="text-gray-500 text-sm mb-2 line-clamp-2">
                                                            {product?.description || 'No description'}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <span className="font-semibold text-blue-600">
                                                                ₱{price.toFixed(2)}
                                                            </span>
                                                            <span>×</span>
                                                            <span>{cart.quantity}</span>
                                                            <span>=</span>
                                                            <span className="font-bold text-gray-800">
                                                                ₱{itemTotal.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Quantity Controls */}
                                                    <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-3">
                                                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                                                            <button
                                                                onClick={() => updateQuantity.mutate({ cartId: cart.id, newQuantity: cart.quantity - 1 })}
                                                                disabled={cart.quantity <= 1 || isPendingUpdate}
                                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                {isPendingUpdate ? (
                                                                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                                                                ) : (
                                                                    <Minus className="w-4 h-4 text-blue-600" />
                                                                )}
                                                            </button>
                                                            <span className="w-8 text-center font-semibold">
                                                                {cart.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity.mutate({ cartId: cart.id, newQuantity: cart.quantity + 1 })}
                                                                disabled={isPendingUpdate}
                                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                {isPendingUpdate ? (
                                                                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                                                                ) : (
                                                                    <Plus className="w-4 h-4 text-blue-600" />
                                                                )}
                                                            </button>
                                                        </div>
                                                        <button
                                                            onClick={() => removeItem(cart.id)}
                                                            disabled={processing}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-6">
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Order Summary</h2>

                                    <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal</span>
                                            <span className="font-semibold">₱{subtotal?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>VAT (12%)</span>
                                            <span className="font-semibold">₱{tax.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-800 mb-6">
                                        <span>Total</span>
                                        <span className="text-blue-600">₱{total.toFixed(2)}</span>
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 sm:py-4 rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all font-bold text-base sm:text-lg shadow-lg flex items-center justify-center gap-2"
                                    >
                                        {/* <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" /> */}
                                        Place Order for pickup
                                    </button>

                                    <Link
                                        href="/"
                                        className="block text-center text-blue-600 hover:text-blue-800 mt-4 text-sm font-semibold"
                                    >
                                        Continue Shopping
                                    </Link>

                                    <div className="mt-6 pt-4 border-t border-gray-200">
                                        <h3 className="font-semibold text-gray-800 mb-2 text-sm">Order Details</h3>
                                        <div className="text-xs text-gray-600 space-y-1">
                                            <p>Total Items: {localCarts?.reduce((sum, cart) => sum + cart.quantity, 0)}</p>
                                            <p>Products: {localCarts?.length}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </CustomerLayout>
    );
}