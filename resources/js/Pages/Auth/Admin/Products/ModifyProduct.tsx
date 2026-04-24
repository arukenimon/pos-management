import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { FormEventHandler, useEffect, useState } from 'react';
import { Product } from './Inventory';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface AttributeValue {
    id: number;
    value: string;
    attribute_id: number;
}

export interface Attribute {
    id: number;
    name: string;
    values: AttributeValue[];
}

export interface ProductVariant {
    id?: number;
    sku: string;
    price: string;
    attribute_value_ids: number[];
    attribute_values?: (AttributeValue & { attribute: Attribute })[];
}

interface ModifyProductProps extends PageProps {
    product?: Product & {
        variants?: ProductVariant[];
    };
    attributes: Attribute[];
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function ModifyProduct({ auth, product, attributes }: ModifyProductProps) {
    const { currentShop } = usePage<PageProps>().props;
    const shop = currentShop?.slug ?? '';

    const existingVariants: ProductVariant[] = product?.variants?.map(v => ({
        id: v.id,
        sku: v.sku,
        price: v.price !== null && v.price !== undefined ? String(v.price) : '',
        attribute_value_ids: v.attribute_values?.map((av: any) => av.id) ?? [],
        attribute_values: v.attribute_values,
    })) ?? [];

    const { data, setData, post, put, processing, errors } = useForm<{
        name: string;
        description: string;
        images: string[] | null;
        variants: ProductVariant[];
    }>({
        name: product?.name ?? '',
        description: product?.description ?? '',
        images: product?.images ?? null,
        variants: existingVariants,
    });

    // â”€â”€ Image â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImageRemoved, setExistingImageRemoved] = useState(false);

    useEffect(() => {
        if (!imagePreview && !existingImageRemoved && product?.images?.length) {
            const v = product.images[0];
            if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://') || v.startsWith('/storage/')) {
                setImagePreview(v);
            } else if (v.startsWith('storage/')) {
                setImagePreview(`/${v}`);
            } else {
                setImagePreview(`/storage/${v}`);
            }
        }
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                setData('images', [reader.result]);
                setImagePreview(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setData('images', null);
        setImagePreview(null);
        setExistingImageRemoved(true);
    };

    // â”€â”€ Variant builder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [variantSku, setVariantSku] = useState('');
    const [variantPrice, setVariantPrice] = useState('');
    const [selectedAttrValues, setSelectedAttrValues] = useState<number[]>([]);
    const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);

    const toggleAttrValue = (id: number) => {
        setSelectedAttrValues(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const addVariant = () => {
        if (!variantSku.trim() || !variantPrice) return;

        if (editingVariantIndex !== null) {
            // Update existing variant
            const updated = data.variants.map((v, i) =>
                i === editingVariantIndex
                    ? { ...v, sku: variantSku.trim(), price: variantPrice, attribute_value_ids: selectedAttrValues }
                    : v
            );
            setData('variants', updated);
            setEditingVariantIndex(null);
        } else {
            setData('variants', [
                ...data.variants,
                { sku: variantSku.trim(), price: variantPrice, attribute_value_ids: selectedAttrValues },
            ]);
        }
        setVariantSku('');
        setVariantPrice('');
        setSelectedAttrValues([]);
    };

    const startEditVariant = (index: number) => {
        const v = data.variants[index];
        setEditingVariantIndex(index);
        setVariantSku(v.sku);
        setVariantPrice(v.price);
        setSelectedAttrValues(v.attribute_value_ids);
    };

    const cancelEdit = () => {
        setEditingVariantIndex(null);
        setVariantSku('');
        setVariantPrice('');
        setSelectedAttrValues([]);
    };

    const removeVariant = (index: number) => {
        setData('variants', data.variants.filter((_, i) => i !== index));
    };

    // Human-readable label from selected attribute_value_ids
    const getVariantLabel = (variant: ProductVariant): string => {
        if (!attributes.length || !variant.attribute_value_ids.length) return '';
        // Use cached attribute_values if present (edit mode), else look up from attributes prop
        if (variant.attribute_values?.length) {
            return variant.attribute_values
                .map(av => `${av.attribute?.name ?? ''}: ${av.value}`)
                .join(' / ');
        }
        return variant.attribute_value_ids.map(id => {
            for (const attr of attributes) {
                const val = attr.values.find(v => v.id === id);
                if (val) return `${attr.name}: ${val.value}`;
            }
            return String(id);
        }).join(' / ');
    };

    // â”€â”€ Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!product) {
            post(`/${shop}/products/create`);
        } else {
            put(`/${shop}/products/edit/${product.id}`);
        }
    };

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <Link href={`/${shop}/products/inventory`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                                Inventory
                            </Link>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span>{product ? 'Edit Product' : 'Add New Product'}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {product ? 'Edit Product' : 'Add New Product'}
                        </h1>
                    </div>
                    <Link
                        href={`/${shop}/products/inventory`}
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
            <Head title={product ? 'Edit Product - Admin' : 'Add Product - Admin'} />

            <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* â”€â”€ Main content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Basic Information */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Product Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Enter product name"
                                        required
                                        autoFocus
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                                </div>
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                                    </label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        rows={3}
                                        className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                        placeholder="Enter product description..."
                                    />
                                    {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Variants */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Variants</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                                Each variant is a sellable version of this product (e.g. Red / Large). At least one is required.
                            </p>

                            {/* Added variants list */}
                            {data.variants.length > 0 && (
                                <div className="mb-5 space-y-2">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                                        Added Variants ({data.variants.length})
                                    </h3>
                                    {data.variants.map((v, i) => {
                                        const label = getVariantLabel(v);
                                        const isEditing = editingVariantIndex === i;
                                        return (
                                            <div key={i} className={`flex items-center justify-between rounded-lg px-4 py-3 border transition-colors ${
                                                isEditing
                                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-400 dark:border-indigo-600'
                                                    : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
                                            }`}>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        <span className="font-mono text-indigo-600 dark:text-indigo-400">{v.sku}</span>
                                                        {v.price ? (
                                                            <span className="ml-3 text-xs text-gray-500 dark:text-gray-400">
                                                                ₱{Number(v.price).toFixed(2)}
                                                            </span>
                                                        ) : null}
                                                    </p>
                                                    {label && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => isEditing ? cancelEdit() : startEditVariant(i)}
                                                        className={`p-1 rounded transition-colors ${
                                                            isEditing
                                                                ? 'text-indigo-600 hover:text-indigo-800 dark:text-indigo-400'
                                                                : 'text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                                                        }`}
                                                        title={isEditing ? 'Cancel edit' : 'Edit variant'}
                                                    >
                                                        {isEditing ? (
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => { if (isEditing) cancelEdit(); removeVariant(i); }}
                                                        className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded transition-colors"
                                                        title="Delete variant"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* New variant builder */}
                            <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 space-y-4">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {editingVariantIndex !== null
                                        ? `Editing Variant #${editingVariantIndex + 1}`
                                        : data.variants.length === 0 ? 'Add First Variant' : 'Add Another Variant'
                                    }
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="variant-sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            SKU <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="variant-sku"
                                            type="text"
                                            value={variantSku}
                                            onChange={e => setVariantSku(e.target.value)}
                                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="e.g. SHIRT-RED-M"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="variant-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Selling Price <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm pointer-events-none">₱</span>
                                            <input
                                                id="variant-price"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={variantPrice}
                                                onChange={e => setVariantPrice(e.target.value)}
                                                className="block w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Attribute value picker */}
                                {attributes.length > 0 ? (
                                    <div className="space-y-3">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Attributes
                                        </p>
                                        {attributes.map(attr => (
                                            <div key={attr.id}>
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{attr.name}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {attr.values.map(val => {
                                                        const selected = selectedAttrValues.includes(val.id);
                                                        return (
                                                            <button
                                                                key={val.id}
                                                                type="button"
                                                                onClick={() => toggleAttrValue(val.id)}
                                                                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                                                                    selected
                                                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                                                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-400'
                                                                }`}
                                                            >
                                                                {val.value}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                                        No attributes defined yet. Variants can still be created with just a SKU.
                                        You can add attributes (e.g. Size, Color) from an attributes manager later.
                                    </p>
                                )}

                                <button
                                    type="button"
                                    onClick={addVariant}
                                    disabled={!variantSku.trim() || !variantPrice}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 disabled:opacity-50 disabled:cursor-not-allowed text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-sm font-medium rounded-lg transition-colors"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingVariantIndex !== null ? 'M5 13l4 4L19 7' : 'M12 4v16m8-8H4'} />
                                    </svg>
                                    {editingVariantIndex !== null ? 'Update Variant' : 'Add Variant'}
                                </button>
                            </div>

                            {errors.variants && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.variants}</p>
                            )}
                        </div>

                        {/* Product Image */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Image</h2>
                            <div className="space-y-4">
                                {imagePreview ? (
                                    <div className="relative">
                                        <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                            <img src={imagePreview} alt="Product preview" className="w-full h-full object-contain" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                        >
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="image"
                                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or WEBP (MAX. 2MB)</p>
                                        </div>
                                        <input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                )}
                                {errors.images && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.images}</p>}
                            </div>
                        </div>
                    </div>

                    {/* â”€â”€ Sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Actions */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            {product ? 'Updating...' : 'Creating...'}
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
                                    href={`/${shop}/products/inventory`}
                                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </div>

                        {/* Variant summary */}
                        <div className={`rounded-lg border p-4 ${
                            data.variants.length === 0
                                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        }`}>
                            <h3 className={`text-sm font-semibold mb-1 ${
                                data.variants.length === 0
                                    ? 'text-amber-900 dark:text-amber-300'
                                    : 'text-green-900 dark:text-green-300'
                            }`}>
                                {data.variants.length === 0
                                    ? 'No variants yet'
                                    : `${data.variants.length} variant${data.variants.length !== 1 ? 's' : ''} added`
                                }
                            </h3>
                            <p className={`text-xs ${
                                data.variants.length === 0
                                    ? 'text-amber-700 dark:text-amber-400'
                                    : 'text-green-700 dark:text-green-400'
                            }`}>
                                {data.variants.length === 0
                                    ? 'Add at least one variant before saving.'
                                    : 'Stock and inventory per variant can be managed from the Inventory page after saving.'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
