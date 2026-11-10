import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ArrowUpRight, Boxes, ChartNoAxesCombined, ChevronDown, CircleDollarSign, LayoutDashboard, LogOut, Menu as MenuIcon, Moon, Plus, ReceiptText, ScanLine, Settings2, Store, Sun, UserRound, Users } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import AdminSidebar, { SidebarNavItem, ShopRole } from '@/Components/Admin/AdminSidebar';
import NotificationBell from '@/Components/Admin/NotificationBell';
import useToasts from '@/hooks/useToasts';
import usePageEntrance from '@/hooks/usePageEntrance';
import { PageProps } from '@/types';
import { ScrollText, ShieldCheck } from 'lucide-react';

const platformNavigation: SidebarNavItem[] = [
    { name: 'Overview', href: '/super-admin', icon: LayoutDashboard },
    { name: 'Shops', href: '/super-admin/shops', icon: Store },
    { name: 'Users', href: '/super-admin/users', icon: Users },
    { name: 'Audit Log', href: '/super-admin/audit-log', icon: ScrollText },
];

export default function AdminLayout({ children, header, platform = false }: PropsWithChildren<{ header?: React.ReactNode; platform?: boolean }>) {
    useToasts();
    const { props: { auth, currentShop: sharedShop }, url } = usePage<PageProps>();
    const currentShop = platform ? null : sharedShop;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>(() => document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    const scope = useRef<HTMLDivElement>(null);
    const pathname = url.split('?')[0];
    usePageEntrance(scope, pathname);

    // Set the shop default before child pages resolve their routes.
    if (currentShop?.slug && (window as any).Ziggy) {
        (window as any).Ziggy.defaults = { ...(window as any).Ziggy.defaults, shop: currentShop.slug };
    }
    useEffect(() => { setIsMobileMenuOpen(false); }, [url]);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        document.documentElement.classList.toggle('dark', next === 'dark');
        try { localStorage.setItem('tindahub.theme.v2', next); } catch (_) { /* The theme works without local storage. */ }
    };
    const base = currentShop ? `/${currentShop.slug}` : '';
    const allNavigation: SidebarNavItem[] = currentShop ? [
        { name: 'Overview', href: `${base}/`, icon: LayoutDashboard, roles: ['owner', 'manager'] },
        { name: 'Inventory', href: `${base}/products/inventory`, icon: Boxes, roles: ['owner', 'manager'], children: [
            { name: 'All products', href: `${base}/products/inventory`, icon: Boxes, roles: ['owner', 'manager'] },
            { name: 'Stock movements', href: `${base}/inventory/movements`, icon: Boxes, roles: ['owner', 'manager'] },
        ] },
        { name: 'Sales', href: `${base}/sales`, icon: ReceiptText, roles: ['owner', 'manager'] },
        { name: 'Point of sale', href: `${base}/pos`, icon: ScanLine, roles: ['owner', 'manager', 'cashier'] },
        { name: 'Cash shifts', href: `${base}/pos/shifts`, icon: CircleDollarSign, roles: ['owner', 'manager', 'cashier'] },
        { name: 'Analytics', href: `${base}/analytics`, icon: ChartNoAxesCombined, roles: ['owner', 'manager'] },
        { name: 'Settings', href: `${base}/settings`, icon: Settings2, roles: ['owner'], children: [
            { name: 'Shop settings', href: `${base}/settings`, icon: Settings2, roles: ['owner'] },
            { name: 'Team & access', href: `${base}/settings/team`, icon: Users, roles: ['owner'] },
        ] },
    ] : [];
    const role: ShopRole | null = auth.shopRole ?? null;
    const filterNavigation = (items: SidebarNavItem[]): SidebarNavItem[] => items
        .filter(item => !item.roles || (role !== null && item.roles.includes(role)))
        .map(item => ({ ...item, ...(item.children ? { children: filterNavigation(item.children) } : {}) }));
    const navigation = platform ? platformNavigation : filterNavigation(allNavigation);
    const entries = navigation.flatMap(item => [item, ...(item.children ?? [])]);
    const currentPage = entries.find(item => item.href.replace(/\/$/, '') === pathname.replace(/\/$/, ''))?.name
        ?? (platform ? (pathname.startsWith('/super-admin/shops/') ? 'Shop details' : pathname.startsWith('/super-admin/users/') ? 'Account details' : 'Your account') : pathname.includes('/products/') ? 'Product details' : pathname.includes('/sales/') ? 'Sale details' : 'Your account');

    return <div className="app-shell min-h-screen bg-background text-foreground">
        <a href="#workspace-content" className="skip-link">Skip to content</a>
        <ToastContainer theme={theme} />
        <AdminSidebar navigation={navigation} currentPath={url} platform={platform} isMobileMenuOpen={isMobileMenuOpen} onCloseMobileMenu={() => setIsMobileMenuOpen(false)} />
        <div ref={scope} className="min-w-0 lg:pl-64">
            <header className="app-utility sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur-xl">
                <div className="flex h-[72px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                        <button type="button" aria-label="Open navigation" aria-expanded={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(true)} className="utility-button lg:hidden"><MenuIcon className="h-5 w-5" /></button>
                        <Link href={platform ? '/super-admin' : currentShop ? '/select-shop' : '/profile'} className="flex min-w-0 items-center gap-2 rounded-md text-xs text-muted-foreground hover:text-foreground">{platform ? <ShieldCheck className="hidden h-3.5 w-3.5 shrink-0 text-accent-foreground sm:block" /> : <Store className="hidden h-3.5 w-3.5 shrink-0 sm:block" />}<span className="max-w-[130px] truncate sm:max-w-44">{platform ? 'Platform administration' : currentShop?.name ?? 'TindaHub'}</span>{!platform && <ChevronDown className="h-3 w-3 shrink-0" />}</Link>
                        <span aria-hidden="true" className="text-border">/</span><span className="truncate text-xs font-medium">{currentPage}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
                        {currentShop && pathname !== `${base}/pos` && <Link href={`${base}/pos`} className="hidden items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium transition-colors hover:border-primary/50 sm:inline-flex"><Plus className="h-3.5 w-3.5 text-accent-foreground" />New sale<ArrowUpRight className="ml-2 h-3 w-3 text-muted-foreground" /></Link>}
                        <button type="button" onClick={toggleTheme} className="utility-button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}</button>
                        {!platform && <NotificationBell />}
                        <span aria-hidden="true" className="mx-1 hidden h-6 w-px bg-border sm:block" />
                        <Menu as="div" className="relative">
                            <MenuButton aria-label="Account menu" className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-muted"><span className="account-avatar">{auth.user.name.charAt(0).toUpperCase()}</span><ChevronDown className="hidden h-3 w-3 text-muted-foreground sm:block" /></MenuButton>
                            <MenuItems transition className="absolute right-0 mt-3 w-56 origin-top-right rounded-xl border border-border bg-popover p-1.5 shadow-xl transition duration-150 data-[closed]:scale-95 data-[closed]:opacity-0">
                                <div className="border-b border-border px-3 py-3"><p className="truncate text-sm font-semibold">{auth.user.name}</p><p className="mt-1 truncate text-xs text-muted-foreground">{auth.user.email}</p></div>
                                <MenuItem><Link href="/profile" className="account-menu-link"><UserRound className="h-4 w-4" />Your profile</Link></MenuItem>
                                {auth.isSuperAdmin && !platform && <MenuItem><Link href="/super-admin" className="account-menu-link"><ShieldCheck className="h-4 w-4" />Platform administration</Link></MenuItem>}
                                {platform && <MenuItem><Link href="/select-shop" className="account-menu-link"><Store className="h-4 w-4" />Your shops</Link></MenuItem>}
                                {role === 'owner' && currentShop && <MenuItem><Link href={`${base}/settings`} className="account-menu-link"><Settings2 className="h-4 w-4" />Shop settings</Link></MenuItem>}
                                <MenuItem><Link href="/logout" method="post" as="button" className="account-menu-link w-full text-rose-600 dark:text-rose-300"><LogOut className="h-4 w-4" />Sign out</Link></MenuItem>
                            </MenuItems>
                        </Menu>
                    </div>
                </div>
            </header>
            <div className="mx-auto max-w-[1600px]">
                {header && <div data-page-heading className="page-heading px-4 pt-7 sm:px-6 lg:px-8 lg:pt-9">{header}</div>}
                <main id="workspace-content" tabIndex={-1} className="workspace-content min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    </div>;
}
