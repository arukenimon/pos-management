import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { FormEventHandler, useEffect, useState } from 'react';
import { Product } from './Inventory';
import Modal from './Modal/Modal';
import { set } from 'date-fns';
import CustomTooltip from '@/Components/CustomTooltip';

interface Category {
    id: number;
    name: string;
}

interface AddProductProps extends PageProps {
    categories?: Category[];
    product?: Product;
}

interface PriceTier {
    min_quantity: number; // The minimum quantity for this tier
    price: number;
}

export interface Variant {
    id?: string;
    name: string;
    base_price: number;
    cost_each: number;
}

export default function ModifyProduct({ auth, categories: initialCategories, product }: AddProductProps) {
    // Mock categories if not provided
    const mockCategories: Category[] = [
        { id: 1, name: 'Electronics' },
        { id: 2, name: 'Accessories' },
        { id: 3, name: 'Furniture' },
        { id: 4, name: 'Clothing' },
        { id: 5, name: 'Books' },
    ];



    const categories = initialCategories || mockCategories;
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImageRemoved, setExistingImageRemoved] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm<{
        name: string;
        sku: string | null;
        description?: string;
        images: string[] | null;
        hasVariants?: boolean;
        variants?: Variant[];
    }>({
        name: product ? product.name : '',
        sku: product ? product.sku : '',
        //category_id: product ? product. : '',
        //price: product ? product.price : '',
        //stock: product ? product.stock : '',
        // status: product ? product.status : 'active',
        description: product ? product.description : '',
        images: product?.images ?? null,
        hasVariants: false,
        variants: product?.variants ?? [],
    });

    useEffect(() => console.log('product prop:', product), [product]);

    // This effect sets the initial image preview if editing an existing product with an image
    useEffect(() => {
        if (!imagePreview && !existingImageRemoved && product?.images?.length) {
            const value = product.images[0];
            if (value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://')) {
                setImagePreview(value);
            } else if (value.startsWith('/storage/')) {
                setImagePreview(value);
            } else if (value.startsWith('storage/')) {
                setImagePreview(`/₱{value}`);
            } else {
                setImagePreview(`/storage/₱{value}`);
            }
        }
    }, [existingImageRemoved, imagePreview, product]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setData('images', [reader.result]);
                    setImagePreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('images', null);
        setImagePreview(null);
        setExistingImageRemoved(true);
    };

    const handleBarcodeScanner = async () => {
        setScanError(null);
        setIsScanning(true);

        try {
            // Check if browser supports Barcode Detection API
            if ('BarcodeDetector' in window) {
                const barcodeDetector = new (window as any).BarcodeDetector();
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });

                // Create video element
                const video = document.createElement('video');
                video.srcObject = stream;
                video.play();

                // Wait for video to be ready
                await new Promise(resolve => {
                    video.onloadedmetadata = resolve;
                });

                // Try to detect barcode
                const barcodes = await barcodeDetector.detect(video);

                if (barcodes.length > 0) {
                    setData('sku', barcodes[0].rawValue);
                    stream.getTracks().forEach(track => track.stop());
                    setIsScanning(false);
                } else {
                    setScanError('No barcode detected. Please try again or enter manually.');
                    stream.getTracks().forEach(track => track.stop());
                    setIsScanning(false);
                }
            } else {
                // Fallback: Use prompt for manual scanner input
                setScanError('Camera scanning not supported. Use a physical barcode scanner or enter SKU manually.');
                setIsScanning(false);
            }
        } catch (error) {
            console.error('Barcode scanning error:', error);
            setScanError('Camera access denied or not available. Please enter SKU manually or use a physical barcode scanner.');
            setIsScanning(false);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // In a real app, this would post to your backend
        if (!product) {
            post(route('admin.products.create.post'), {
                onSuccess: () => {
                },
            });
        } else {
            put(route('admin.products.edit.post', { id: product.id }), {
                onSuccess: () => {
                    // Optionally handle success (e.g., show a notification)
                },
            });
        }
    };

    const [stockModalOpen, setStockModalOpen] = useState(false);

    const [priceTiers, setPriceTiers] = useState<PriceTier[]>([]);

    useEffect(() => console.log('Current price tiers:', priceTiers), [priceTiers]);

    const [priceTierQuantity, setPriceTierQuantity] = useState<number>(0);
    const [priceTierPrice, setPriceTierPrice] = useState<number>(0);

    // Variant state
    const [variants, setVariants] = useState<Variant[]>(product?.variants ?? []);
    const [variantName, setVariantName] = useState<string>('');
    const [variantbase_price, setVariantbase_price] = useState<number>(0);
    const [variantcost_each, setVariantcost_each] = useState<number>(0);

    const addVariant = () => {
        if (variantName && variantbase_price > 0 && variantcost_each >= 0) {
            const newVariant: Variant = {
                id: Date.now().toString(),
                name: variantName,
                base_price: variantbase_price,
                cost_each: variantcost_each,
            };
            setVariants([...variants, newVariant]);
            // Reset form
            setVariantName('');
            setVariantbase_price(0);
            setVariantcost_each(0);
        }
    };

    const removeVariant = (id: string) => {
        setVariants(variants.filter(v => v.id !== id));
    };

    useEffect(() => setData('variants', variants), [variants])

    useEffect(() => console.log('Current variants:', data.variants), [data.variants]);

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <Link href={route('admin.products.inventory')} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                                Products
                            </Link>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span>
                                {product ? 'Edit Product' : 'Add New Product'}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {product ? 'Edit Product' : 'Add New Product'}
                        </h1>
                    </div>
                    <Link
                        href={route('admin.products.inventory')}
                        className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Inventory
                    </Link>
                </div>
            }
        >
            <Head title="Add Product - Admin" />

            <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Basic Information
                            </h2>

                            <div className="space-y-4">
                                {/* Product Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Product Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Enter product name"
                                        required
                                        autoFocus
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                    )}
                                </div>


                                {/* Description */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                        placeholder="Enter product description..."
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                                    )}
                                </div>

                                {/* Check if this product has variants (e.g., different sizes or colors) and show variant options if true. Otherwise, show regular price and stock fields. */}
                                {/* Use checkbox */}
                                <div>
                                    <label htmlFor="has-variants" className="inline-flex items-center text-sm text-gray-700 dark:text-gray-300">
                                        <input
                                            id="has-variants"
                                            type="checkbox"
                                            checked={data.hasVariants}
                                            onChange={(e) => setData('hasVariants', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2">This product has variants (e.g., different sizes or colors)</span>
                                    </label>
                                </div>


                                {data.hasVariants ? (
                                    <div className="space-y-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                            Variants
                                            <CustomTooltip label='This section allows you to manage different variants of the product, such as sizes or colors.' />
                                        </h2>

                                        {/* Display Added Variants */}
                                        {variants.length > 0 && (
                                            <div className="mt-6">
                                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                                    Added Variants ({variants.length})
                                                </h3>
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                                            <tr>
                                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                    Name
                                                                </th>
                                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                    Base Price
                                                                </th>
                                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                    Cost Each
                                                                </th>
                                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                    Profit Margin
                                                                </th>
                                                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                    Action
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                            {variants.map((variant) => {
                                                                const profitMargin = variant.base_price - variant.cost_each;
                                                                const profitPercentage = variant.cost_each > 0 ? ((profitMargin / variant.cost_each) * 100)?.toFixed(1) : '0';
                                                                return (
                                                                    <tr key={variant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                                                            {variant.name}
                                                                        </td>
                                                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                                            ₱{variant?.base_price}
                                                                        </td>
                                                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                                            ₱{variant?.cost_each}
                                                                        </td>
                                                                        <td className="px-4 py-3 text-sm">
                                                                            <span className={`inline-flex items-center ₱{profitMargin > 0
                                                                                ? 'text-green-700 dark:text-green-400'
                                                                                : profitMargin < 0
                                                                                    ? 'text-red-700 dark:text-red-400'
                                                                                    : 'text-gray-700 dark:text-gray-300'
                                                                                }`}>
                                                                                ₱{profitMargin.toFixed(2)} ({profitPercentage}%)
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-3 text-sm text-right">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeVariant(variant?.id ?? '')}
                                                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                                            >
                                                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                </svg>
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                            {/* Product Name */}
                                            <div >
                                                <label htmlFor="variant-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    id="variant-name"
                                                    type="text"
                                                    value={variantName}
                                                    onChange={(e) => setVariantName(e.target.value)}
                                                    className="block w-full border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                                                    placeholder="e.g., Small, Red, 500ml"
                                                />
                                            </div>
                                            <div className='w-full'>
                                                <label htmlFor="variant-base-price" className="block text-sm font-medium  text-gray-700 dark:text-gray-200">
                                                    Base Price
                                                    <CustomTooltip label='The amount you charge customers for one unit of this product.' />
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        name="variant-base-price"
                                                        id="variant-base-price"
                                                        min="0"
                                                        step="0.01"
                                                        value={variantbase_price || ''}
                                                        onChange={(e) => setVariantbase_price(parseFloat(e.target.value) || 0)}
                                                        className="block w-full border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                            <div className='w-full'>
                                                <label htmlFor="variant-cost-each" className="block text-sm font-medium  text-gray-700 dark:text-gray-200">
                                                    Cost Each
                                                    <CustomTooltip label='The amount it costs you to produce or purchase one unit of this product.' />
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        name="variant-cost-each"
                                                        id="variant-cost-each"
                                                        min="0"
                                                        step="0.01"
                                                        value={variantcost_each || ''}
                                                        onChange={(e) => setVariantcost_each(parseFloat(e.target.value) || 0)}
                                                        className="block w-full border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className='w-full justify-end'>
                                            <button onClick={addVariant} type="button" className="w-full flex items-center justify-center px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-sm font-medium rounded-lg transition-colors duration-200">
                                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Add Variant
                                            </button>
                                        </div>

                                        {errors.variants && (
                                            <div className="mt-4 text-sm text-red-600 dark:text-red-400">
                                                {errors.variants}
                                            </div>)
                                        }
                                    </div>
                                ) : (
                                    <>
                                        <div className='flex justify-between gap-4'>
                                            <div className='w-full'>
                                                <label htmlFor="base-price" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                                                    Base Price
                                                    <CustomTooltip label='The amount you charge customers for one unit of this product.' />
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        name="base-price"
                                                        id="base-price"
                                                        min="1"
                                                        // value={data.base_price}
                                                        // onChange={(e) => setData('base_price', parseInt(e.target.value) || 0)}
                                                        className="block w-full border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                                                        placeholder="0"
                                                    />
                                                    {/* <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 dark:text-gray-400 sm:text-sm">stock(s)</span>
                                            </div> */}
                                                </div>
                                                {/* {errors.quantity && (
                                            <p className="mt-2 text-sm text-red-600" id="quantity-error">
                                                {errors.quantity}
                                            </p>
                                        )} */}
                                            </div>
                                            <div className='w-full'>
                                                <label htmlFor="stock-price" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                                                    Cost Each
                                                    <CustomTooltip label='The amount it costs you to produce or purchase one unit of this product.' />
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        name="stock-price"
                                                        id="stock-price"
                                                        min="0"
                                                        step="0.01"
                                                        // value={data.price}
                                                        // onChange={(e) => setData('price', parseFloat(e.target.value) || 0)}
                                                        className="block w-full border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                                                        placeholder="0.00"
                                                    />
                                                    {/* <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 dark:text-gray-400 sm:text-sm">₱</span>
                                            </div> */}
                                                </div>
                                                {/* {errors.price && (
                                            <p className="mt-2 text-sm text-red-600" id="price-error">
                                                {errors.price}
                                            </p>
                                        )} */}
                                            </div>
                                        </div>

                                        <div className="space-y-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                Price Tiers (Bulk Pricing)
                                                <CustomTooltip label='Offers special pricing based on quantity purchased. For example, buy 10 or more and get a 10% discount. This encourages customers to buy in larger quantities and helps you move more inventory.' />
                                            </h2>

                                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 space-y-2'>
                                                <div className='w-full justify-end'>
                                                    <label htmlFor="base-price" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                                                        If quantity is at least...
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            name="base-price"
                                                            id="base-price"
                                                            min="1"
                                                            value={priceTierQuantity}
                                                            onChange={(e) => setPriceTierQuantity(parseInt(e.target.value) || 0)}
                                                            className="block w-full border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                                                            placeholder="0"
                                                        />
                                                        {/* <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">stock(s)</span>
                                                </div> */}
                                                    </div>
                                                    {/* {errors.quantity && (
                                            <p className="mt-2 text-sm text-red-600" id="quantity-error">
                                                {errors.quantity}
                                            </p>
                                        )} */}
                                                </div>
                                                <div className='w-full justify-end'>
                                                    <label htmlFor="base-price" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                                        Set total price to...
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            name="base-price"
                                                            id="base-price"
                                                            min="1"
                                                            value={priceTierPrice}
                                                            onChange={(e) => setPriceTierPrice(parseInt(e.target.value) || 0)}
                                                            className="block w-full border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                                                            placeholder="0"
                                                        />
                                                        {/* <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">stock(s)</span>
                                                </div> */}
                                                    </div>
                                                    {/* {errors.quantity && (
                                            <p className="mt-2 text-sm text-red-600" id="quantity-error">
                                                {errors.quantity}
                                            </p>
                                        )} */}
                                                </div>
                                            </div>
                                            {/* Button Add */}
                                            <div className='w-full'>
                                                <button onClick={() => {
                                                    if (priceTierQuantity > 0 && priceTierPrice > 0) {
                                                        setPriceTiers([...priceTiers, { min_quantity: priceTierQuantity, price: priceTierPrice }]);
                                                        setPriceTierQuantity(0);
                                                        setPriceTierPrice(0);
                                                    }
                                                }} type="button" className="w-full flex items-center justify-center px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-sm font-medium rounded-lg transition-colors duration-200">
                                                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    Add Tier
                                                </button>
                                            </div>
                                        </div></>
                                )}



                            </div>
                        </div>

                        {/* Pricing & Inventory */}
                        {/* <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Pricing & Inventory
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Price <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 dark:text-gray-400">₱</span>
                                            </div>
                                            <input
                                                id="price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.price}
                                                onChange={(e) => setData('price', e.target.value)}
                                                className="block w-full pl-7 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                        {errors.price && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Stock Quantity <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="stock"
                                            type="number"
                                            min="0"
                                            value={data.stock}
                                            onChange={(e) => setData('stock', e.target.value)}
                                            className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="0"
                                            required
                                        />
                                        {errors.stock && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.stock}</p>
                                        )}
                                    </div>
                                </div>
                            </div> */}

                        {/* Product Image */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Product Image
                            </h2>

                            <div className="space-y-4">
                                {imagePreview ? (
                                    <div className="relative">
                                        <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                            <img
                                                src={imagePreview}
                                                alt="Product preview"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                                        >
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="image"
                                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                PNG, JPG or WEBP (MAX. 2MB)
                                            </p>
                                        </div>
                                        <input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                                {errors.images && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.images}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Category & Status */}
                        {/* <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Organization
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="category_id"
                                        value={data.category_id}
                                        onChange={(e) => setData('category_id', e.target.value)}
                                        className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category_id && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="out_of_stock">Out of Stock</option>
                                    </select>
                                    {errors.status && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status}</p>
                                    )}
                                </div>
                            </div>
                        </div> */}

                        {/* Quick Tips */}
                        {/* <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
                            <div className="flex items-start gap-3">
                                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                                        Quick Tips
                                    </h3>
                                    <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1.5">
                                        <li>• Use descriptive product names</li>
                                        <li>• Keep SKUs unique and consistent</li>
                                        <li>• Add high-quality product images</li>
                                        <li>• Set accurate stock quantities</li>
                                        <li>• Choose appropriate categories</li>
                                    </ul>
                                </div>
                            </div>
                        </div> */}

                        {/* Action Buttons */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {product ? 'Updating Product...' : 'Creating Product...'}
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {product ? 'Update Product' : 'Create Product'}
                                        </>
                                    )}
                                </button>

                                <Link
                                    href={route('admin.products.inventory')}
                                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
            {/* <Modal open={stockModalOpen} onOpenChange={setStockModalOpen} selectedProduct={product ?? null} /> */}
        </AdminLayout>
    );
}
