import { Product } from "../Auth/Admin/Products/Inventory";
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { ShoppingCart, Search, Package, LogIn, UserPlus, LogOut } from 'lucide-react';
import { toast } from "react-toastify";
import CustomerLayout from "@/Layouts/CustomerLayout";


export interface Cart {
    id: number;
    customer_id: number;
    product_id?: number;
    product_variant_id: number;
    quantity: number;
    created_at: string;
    updated_at: string;
}

type CustomerStock = {
    id: number;
    product_id?: number;
    product_variant_id?: number;
    quantity: number;
    price?: number;
    selling_price?: number;
    created_at: string;
    updated_at: string;
};

type ProductWithCartVariant = NonNullable<Product['variants']>[number] & {
    cart_items?: Cart[];
    inventories?: CustomerStock[];
};

type ProductWithCart = Omit<Product, 'variants'> & {
    sku?: string;
    stocks?: CustomerStock[];
    cart_items?: Cart[];
    variants?: ProductWithCartVariant[];
};

// Mock data for sari-sari store items
const mockProducts: ProductWithCart[] = [
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

    const variantQuantity = (variant?: ProductWithCartVariant | null) =>
        variant?.inventories?.reduce((sum, inventory) => sum + inventory.quantity, 0) ?? 0;

    const primaryVariant = (product: ProductWithCart) =>
        product.variants?.find(variant => variantQuantity(variant) > 0) ?? product.variants?.[0] ?? null;

    const stockInfo = (product: ProductWithCart) => {
        const legacyStock = product.stocks?.[0];
        if (legacyStock) {
            return {
                quantity: legacyStock.quantity,
                price: Number(legacyStock.price ?? legacyStock.selling_price ?? 0),
                variantId: legacyStock.product_variant_id,
            };
        }

        const variant = primaryVariant(product);
        if (!variant) return null;

        return {
            quantity: variantQuantity(variant),
            price: Number(variant.price ?? variant.inventories?.[0]?.selling_price ?? 0),
            variantId: variant.id,
        };
    };

    const filteredProducts = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return products;

        return products.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query) ||
            product.variants?.some(variant => variant.sku.toLowerCase().includes(query))
        );
    }, [products, searchQuery]);


    const { post, processing, errors, clearErrors, reset, recentlySuccessful } = useForm({
        product_id: '',
    })

    const addToCart = (product: ProductWithCart) => {
        // Check if already in cart
        // const existingItem = cart?.find(item => item?.product?.id === product?.id);
        // if (existingItem) {
        //     return; // Don't add if already in cart
        // }
        // Trigger animation
        setAddingToCart(product?.id);
        // Add to cart
        //setCart([...cart, { product, quantity: 1 }]);

        const stock = stockInfo(product);
        if (!stock?.variantId) {
            toast.error(`"${product.name}" has no available variant to add.`);
            setAddingToCart(null);
            return;
        }

        post(route('customer.cart.add', { variant_id: stock.variantId }), {
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

    const isInCart = (product: ProductWithCart) => {
        const variantIds = product.variants
            ?.map(variant => variant.id)
            .filter((id): id is number => typeof id === 'number') ?? [];

        return (
            product.cart_items?.some(cartItem => cartItem.product_id === product.id) ||
            product.variants?.some(variant =>
                variant.cart_items?.some(cartItem => cartItem.product_variant_id === variant.id)
            ) ||
            products?.some(item =>
                item.cart_items?.some(cartItem => variantIds.includes(cartItem.product_variant_id))
            )
        ) ?? false;
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
                    const stock = stockInfo(product);
                    const productIsInCart = isInCart(product);
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
                                    disabled={productIsInCart || !stock || stock?.quantity === 0 || processing}
                                    className={`w-full py-2 rounded-lg font-semibold transition-all duration-300 ${productIsInCart
                                        ? 'bg-green-500 text-white cursor-not-allowed'
                                        : !stock || stock?.quantity === 0
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800'
                                        } ${addingToCart === product?.id ? 'animate-bounce scale-95' : ''
                                        }`}
                                >
                                    {!stock || stock?.quantity === 0
                                        ? "Out of Stock"
                                        : productIsInCart
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
