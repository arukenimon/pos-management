import { Product } from "../Auth/Admin/Products/Index";
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { ShoppingCart, Search, Package, LogIn, UserPlus, LogOut } from 'lucide-react';
import { toast } from "react-toastify";
import CustomerLayout from "@/Layouts/CustomerLayout";


export interface Cart {
    id: number;
    customer_id: number;
    product_id: number;
    quantity: number;
    created_at: string;
    updated_at: string;
}

// Mock data for sari-sari store items
const mockProducts: Product[] = [
    {
        id: 1,
        name: "San Miguel Beer Pale Pilsen",
        description: "330ml bottle",
        sku: "SMB-001",
        status: "active",
        stocks: [{ id: 1, product_id: 1, quantity: 50, price: 45, created_at: "2025-12-28", updated_at: "2025-12-28" }]
    },
    {
        id: 2,
        name: "Lucky Me Pancit Canton",
        description: "Sweet & Spicy flavor",
        sku: "LM-002",
        status: "active",
        stocks: [{ id: 2, product_id: 2, quantity: 120, price: 15, created_at: "2025-12-28", updated_at: "2025-12-28" }]
    },
    {
        id: 3,
        name: "C2 Green Tea",
        description: "500ml bottle",
        sku: "C2-003",
        status: "active",
        stocks: [{ id: 3, product_id: 3, quantity: 80, price: 25, created_at: "2025-12-28", updated_at: "2025-12-28" }]
    },
    {
        id: 4,
        name: "Oishi Prawn Crackers",
        description: "90g pack",
        sku: "OIS-004",
        status: "active",
        stocks: [{ id: 4, product_id: 4, quantity: 45, price: 30, created_at: "2025-12-28", updated_at: "2025-12-28" }]
    },
    {
        id: 5,
        name: "Nescafe 3-in-1 Original",
        description: "20g sachet",
        sku: "NES-005",
        status: "active",
        stocks: [{ id: 5, product_id: 5, quantity: 200, price: 8, created_at: "2025-12-28", updated_at: "2025-12-28" }]
    },
    {
        id: 6,
        name: "Bear Brand Milk",
        description: "300ml can",
        sku: "BB-006",
        status: "active",
        stocks: [{ id: 6, product_id: 6, quantity: 60, price: 35, created_at: "2025-12-28", updated_at: "2025-12-28" }]
    },
    {
        id: 7,
        name: "Chips Ahoy",
        description: "120g pack",
        sku: "CA-007",
        status: "active",
        stocks: [{ id: 7, product_id: 7, quantity: 30, price: 55, created_at: "2025-12-28", updated_at: "2025-12-28" }]
    },
    {
        id: 8,
        name: "Monde Nissin Skyflakes",
        description: "250g pack",
        sku: "SF-008",
        status: "active",
        stocks: [{ id: 8, product_id: 8, quantity: 25, price: 40, created_at: "2025-12-28", updated_at: "2025-12-28" }]
    },
    {
        id: 9,
        name: "Safeguard Soap",
        description: "135g bar",
        sku: "SG-009",
        status: "active",
        stocks: [{ id: 9, product_id: 9, quantity: 40, price: 28, created_at: "2025-12-28", updated_at: "2025-12-28" }]
    },
    {
        id: 10,
        name: "Argentina Corned Beef",
        description: "175g can",
        sku: "ARG-010",
        status: "active",
        stocks: [{ id: 10, product_id: 10, quantity: 35, price: 48, created_at: "2025-12-28", updated_at: "2025-12-28" }]
    },
    {
        id: 11,
        name: "Coca-Cola",
        description: "1?.5L bottle",
        sku: "CC-011",
        status: "active",
        stocks: [{ id: 11, product_id: 11, quantity: 55, price: 60, created_at: "2025-12-28", updated_at: "2025-12-28" }]
    },
    {
        id: 12,
        name: "Tanduay Rum",
        description: "350ml bottle",
        sku: "TD-012",
        status: "active",
        stocks: [{ id: 12, product_id: 12, quantity: 20, price: 85, created_at: "2025-12-28", updated_at: "2025-12-28" }]
    },
    {
        id: 13,
        name: "Milo Energy Drink",
        description: "240ml can",
        sku: "ML-013",
        status: "active",
        stocks: [{ id: 13, product_id: 13, quantity: 70, price: 32, created_at: "2025-12-28", updated_at: "2025-12-28" }]
    },
    {
        id: 14,
        name: "Rebisco Crackers",
        description: "250g pack",
        sku: "REB-014",
        status: "active",
        stocks: [{ id: 14, product_id: 14, quantity: 28, price: 38, created_at: "2025-12-28", updated_at: "2025-12-28" }]
    },
    {
        id: 15,
        name: "Century Tuna Flakes",
        description: "155g can",
        sku: "CT-015",
        status: "active",
        stocks: [{ id: 15, product_id: 15, quantity: 45, price: 42, created_at: "2025-12-28", updated_at: "2025-12-28" }]
    }
];

type ProductWithCart = Product & { cart_items: Cart[] };

export default function CustomerDashboard({
    products
}: { products: ProductWithCart[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    //const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
    const [addingToCart, setAddingToCart] = useState<number | null>(null);

    // const filteredProducts = mockProducts?.filter(product =>
    //     product?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    //     product?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase())
    // );

    const { user } = usePage().props.auth;

    useEffect(() => {
        console?.log(products);
    }, [products])

    const filteredProducts = useMemo(() => products, [products]);


    const { post, processing, errors, clearErrors, reset, recentlySuccessful } = useForm({
        product_id: '',
    })

    const addToCart = (product: Product) => {
        // Check if already in cart
        // const existingItem = cart?.find(item => item?.product?.id === product?.id);
        // if (existingItem) {
        //     return; // Don't add if already in cart
        // }
        // Trigger animation
        setAddingToCart(product?.id);
        // Add to cart
        //setCart([...cart, { product, quantity: 1 }]);

        post(route('customer.cart.add', { product_id: product.id }), {
            // onSuccess: () => {
            //     toast.success(`Product "${product.name}" added to cart!`);
            // },
            onError: (error) => {
                toast.error(`Failed to add "${product.name}" to cart. Please try again.`);
            }
        })
        // Remove animation after 600ms
        setTimeout(() => {
            setAddingToCart(null);
        }, 600);
    };

    const isInCart = (productId: number) => {
        return products?.some(item => item?.cart_items?.some(cartItem => cartItem.product_id === productId));
    };

    // const totalCartItems = cart?.reduce((sum, item) => sum + item?.quantity, 0);
    // const totalCartValue = cart?.reduce((sum, item) => sum + (item?.product?.stocks ? item.product.stocks[0]?.price : 0) * item?.quantity, 0);

    return (
        <CustomerLayout >
            {/* Search Bar */}
            <div className="mb-8">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search for products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e?.target?.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>
            {/* Stats */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Total Products</p>
                                    <p className="text-3xl font-bold text-gray-800">{mockProducts?.length}</p>
                                </div>
                                <Package className="w-12 h-12 text-blue-500 opacity-80" />
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Available Stock</p>
                                    <p className="text-3xl font-bold text-gray-800">
                                        {mockProducts?.reduce((sum, p) => sum + (p?.stocks ? p.stocks[0]?.quantity : 0), 0)}
                                    </p>
                                </div>
                                <Package className="w-12 h-12 text-green-500 opacity-80" />
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Categories</p>
                                    <p className="text-3xl font-bold text-gray-800">8</p>
                                </div>
                                <Package className="w-12 h-12 text-blue-500 opacity-80" />
                            </div>
                        </div>
                    </div> */}

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts?.map((product) => {
                    const stock = product?.stocks ? product.stocks[0] : null;
                    const isLowStock = stock && stock.quantity < 30;

                    return (
                        <div
                            key={product?.id}
                            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                        >
                            {/* Product Image Placeholder */}
                            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 h-48 flex items-center justify-center relative">
                                <Package className="w-16 h-16 text-blue-300" />
                                {isLowStock && (
                                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                        Low Stock
                                    </span>
                                )}
                                {stock && stock?.quantity === 0 && (
                                    <span className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                                            OUT OF STOCK
                                        </span>
                                    </span>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                                <h3 className="font-bold truncate text-gray-800 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                                    {product?.name}
                                </h3>
                                <p className="text-gray-500 text-sm mb-3">{product?.description}</p>

                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {/* ₱{stock?.price?.toFixed(2)} */}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Stock: {stock?.quantity || 0}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => addToCart(product)}
                                    disabled={isInCart(product?.id) || !stock || stock?.quantity === 0 || processing}
                                    className={`w-full py-2 rounded-lg font-semibold transition-all duration-300 ${isInCart(product?.id)
                                        ? 'bg-green-500 text-white cursor-not-allowed'
                                        : !stock || stock?.quantity === 0
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800'
                                        } ${addingToCart === product?.id ? 'animate-bounce scale-95' : ''
                                        }`}
                                >
                                    {!stock || stock?.quantity === 0
                                        ? "Out of Stock"
                                        : isInCart(product?.id)
                                            ? "✓ Added"
                                            : "Add to order"
                                    }
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredProducts?.length === 0 && (
                <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No products found</p>
                </div>
            )}
        </CustomerLayout>
    );
}


