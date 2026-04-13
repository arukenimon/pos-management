import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Store, ChevronRight, LogOut } from 'lucide-react';

interface ShopEntry {
    id: number;
    name: string;
    slug: string;
    role: 'owner' | 'manager' | 'cashier';
}

interface ShopSelectorProps extends PageProps {
    shops: ShopEntry[];
}

const ROLE_COLORS = {
    owner:   'bg-purple-100 text-purple-700',
    manager: 'bg-blue-100 text-blue-700',
    cashier: 'bg-gray-100 text-gray-600',
};

const ROLE_LABELS = { owner: 'Owner', manager: 'Manager', cashier: 'Cashier' };

export default function ShopSelector({ shops, auth }: ShopSelectorProps) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 px-4">
            <Head title="Select Shop" />

            <div className="mx-auto w-full max-w-md">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-600 mb-4">
                        <Store className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Select a shop</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Hi {auth.user.name}, choose which shop to open.
                    </p>
                </div>

                {/* Shop cards */}
                <div className="space-y-3">
                    {shops.map(shop => (
                        <a
                            key={shop.id}
                            href={route('admin.dashboard', { shop: shop.slug })}
                            className="flex items-center justify-between px-5 py-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:shadow-sm transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                                    <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                                        {shop.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{shop.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-gray-400">/{shop.slug}</span>
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${ROLE_COLORS[shop.role]}`}>
                                            {ROLE_LABELS[shop.role]}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                        </a>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-8 flex flex-col items-center gap-3">
                    <Link
                        href="/register"
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                        + Create a new shop
                    </Link>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign out
                    </Link>
                </div>

            </div>
        </div>
    );
}
