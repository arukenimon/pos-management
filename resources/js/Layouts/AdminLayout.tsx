import { useEffect, useState, PropsWithChildren } from 'react';
import { Link, usePage } from '@inertiajs/react';
import AdminSidebar, { SidebarNavItem, ShopRole } from '@/Components/Admin/AdminSidebar';
import { PageProps, Shop } from '@/types';

import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useToasts from '@/hooks/useToasts';
import NotificationBell from '@/Components/Admin/NotificationBell';
import { Computer } from 'lucide-react';

// Icon Components
const HomeIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const ShoppingCartIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const ProductsIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

const ChartIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

interface AdminLayoutProps extends PropsWithChildren {
    header?: React.ReactNode;
}

const AdminLayout = ({ children, header }: AdminLayoutProps) => {
    useToasts();
    const { auth, url, currentShop } = usePage<PageProps>().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Inject the current shop slug as a Ziggy default so all route() calls
    // automatically resolve to the correct /{shop}/... URLs without any changes
    // in individual page components.
    // Set synchronously so route() calls on first render resolve correctly.
    if (currentShop?.slug && (window as any).Ziggy) {
        (window as any).Ziggy.defaults = {
            ...(window as any).Ziggy.defaults,
            shop: currentShop.slug,
        };
    }

    useEffect(() => {
        if (currentShop?.slug && (window as any).Ziggy) {
            (window as any).Ziggy.defaults = {
                ...(window as any).Ziggy.defaults,
                shop: currentShop.slug,
            };
        }
    }, [currentShop?.slug]);

    useEffect(() => {
        const saved = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const nextTheme = saved === 'dark' || saved === 'light' ? saved : (prefersDark ? 'dark' : 'light');
        setTheme(nextTheme);
        document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        localStorage.setItem('theme', nextTheme);
        document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    };

    // Define navigation items — build URLs directly from slug to avoid Ziggy dependency
    const slug = currentShop?.slug ?? '';
    const base = slug ? `/${slug}` : '';
    const allNavigation: SidebarNavItem[] = [
        {
            name: 'Dashboard',
            href: `${base}/`,
            icon: HomeIcon,
            routename: 'admin.dashboard',
            roles: ['owner', 'manager'],
        },
        {
            name: 'Products',
            href: `${base}/products/inventory`,
            isParent: true,
            icon: ProductsIcon,
            roles: ['owner', 'manager'],
            children: [
                {
                    name: 'Inventory',
                    href: `${base}/products/inventory`,
                    routename: 'admin.products.inventory',
                    icon: ProductsIcon,
                    roles: ['owner', 'manager'],
                },
            ],
        },
        {
            name: 'Sales',
            href: `${base}/sales`,
            routename: 'admin.sales.index',
            icon: ShoppingCartIcon,
            roles: ['owner', 'manager'],
        },
        {
            name: 'POS',
            href: `${base}/pos`,
            routename: 'admin.pos.index',
            icon: Computer,
            roles: ['owner', 'manager', 'cashier'],
        },
        {
            name: 'Analytics',
            href: `${base}/analytics`,
            routename: 'admin.analytics',
            icon: ChartIcon,
            roles: ['owner', 'manager'],
        },
        {
            name: 'Settings',
            href: '#',
            icon: SettingsIcon,
            isParent: true,
            roles: ['owner'],
            children: [
                {
                    name: 'Admin Settings',
                    href: `${base}/settings`,
                    routename: 'admin.settings.index',
                    icon: SettingsIcon,
                    roles: ['owner'],
                },
                {
                    name: 'Team & Access',
                    href: `${base}/settings/team`,
                    routename: 'admin.settings.team',
                    icon: UsersIcon,
                    roles: ['owner'],
                },
            ],
        },
    ];

    const shopRole: ShopRole | null = auth?.shopRole ?? null;
    const isAllowed = (item: SidebarNavItem): boolean =>
        !item.roles || (shopRole !== null && item.roles.includes(shopRole));

    const filterNav = (items: SidebarNavItem[]): SidebarNavItem[] =>
        items
            .filter(isAllowed)
            .map(item => {
                if (!item.children) return item;
                const children = filterNav(item.children);
                if (children.length === 0) return null;
                return { ...item, children };
            })
            .filter((item): item is SidebarNavItem => item !== null);

    const navigation = filterNav(allNavigation);

    const queryClient = new QueryClient();

    

    return (
        <div className="min-h-screen bg-[#f8fbf8] dark:bg-gray-900">
            <ToastContainer />
            {/* Sidebar */}
            <AdminSidebar
                navigation={navigation}

                currentPath={url}
                isMobileMenuOpen={isMobileMenuOpen}
                onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
            />

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Top Header */}
                <header className="sticky top-0 z-30 border-b border-[#d9e8e5] bg-white/95 shadow-[0_1px_0_rgba(15,118,110,0.03)] backdrop-blur dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-2xl px-4 flex items-center gap-3">
                            {currentShop && (
                                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-700 flex-shrink-0">
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    {currentShop.name}
                                </span>
                            )}
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="search"
                                    placeholder="Search..."
                                    className="block w-full rounded-lg border border-[#d9e8e5] bg-[#f8fbf8] py-2 pl-10 pr-3 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Right side actions */}
                        <div className="flex items-center">
                            {/* Theme */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                aria-label="Toggle theme"
                                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                            >
                                {theme === 'dark' ? (
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m6.364.636-1.414 1.414M21 12h-2m-.636 6.364-1.414-1.414M12 21v-2m-6.364-.636 1.414-1.414M3 12h2m.636-6.364 1.414 1.414M12 8a4 4 0 100 8 4 4 0 000-8z" />
                                    </svg>
                                ) : (
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 118.646 3.646 9.003 9.003 0 0021.354 15.354z" />
                                    </svg>
                                )}
                            </button>

                            {/* Notifications */}
                            <NotificationBell />

                            {/* Profile dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
                                        <span className="text-white font-medium text-sm">
                                            {auth.user?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {auth.user?.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {auth?.shopRole ? auth.shopRole.charAt(0).toUpperCase() + auth.shopRole.slice(1) : 'No Role'}
                                        </p>
                                    </div>
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown menu */}
                                {isProfileDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                                            <Link
                                                href="/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                Profile Settings
                                            </Link>
                                            {auth?.shopRole === 'owner' && currentShop && (
                                                <Link
                                                    href={`/${currentShop.slug}/settings`}
                                                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    Admin Settings
                                                </Link>
                                            )}
                                            <hr className="my-1 border-gray-200 dark:border-gray-700" />
                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                Sign out
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Header */}
                {header && (
                    <div className="border-b border-[#d9e8e5] bg-white dark:border-gray-700 dark:bg-gray-800">
                        <div className="px-4 sm:px-6 lg:px-8 py-6">
                            {header}
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
