import { Dialog, DialogPanel } from '@headlessui/react';
import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, ChevronDown, ChevronsUpDown, Search, Store, X } from 'lucide-react';
import { useState } from 'react';
import { PageProps } from '@/types';
import Brand from '@/Components/Brand';

export type ShopRole = 'owner' | 'manager' | 'cashier';

export interface SidebarNavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    children?: SidebarNavItem[];
    isParent?: boolean;
    routename?: string;
    roles?: ShopRole[];
}

interface AdminSidebarProps {
    navigation: SidebarNavItem[];
    currentPath: string;
    isMobileMenuOpen?: boolean;
    onCloseMobileMenu: () => void;
    platform?: boolean;
}

export default function AdminSidebar({ navigation, currentPath, isMobileMenuOpen = false, onCloseMobileMenu, platform = false }: AdminSidebarProps) {
    const { auth, currentShop } = usePage<PageProps>().props;
    const [search, setSearch] = useState('');
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
    const pathname = currentPath.split('?')[0].replace(/\/$/, '');
    const role = platform ? 'Super Admin' : auth.shopRole ?? 'Member';
    const isActive = (href: string) => pathname === href.replace(/\/$/, '');
    const toggle = (name: string, expanded: boolean) => setExpandedItems(previous => ({ ...previous, [name]: !expanded }));
    const query = search.trim().toLowerCase();
    const filtered = navigation.flatMap(item => {
        if (!query || item.name.toLowerCase().includes(query)) return [item];
        const children = item.children?.filter(child => child.name.toLowerCase().includes(query));
        return children?.length ? [{ ...item, children }] : [];
    });

    const renderItem = (item: SidebarNavItem, child = false) => {
        const active = isActive(item.href) || !!item.children?.some(entry => isActive(entry.href))
            || (platform && item.href !== '/super-admin' && pathname.startsWith(`${item.href}/`))
            || (item.name === 'Inventory' && pathname.includes('/products/'))
            || (item.name === 'Sales' && pathname.startsWith(`${item.href}/`))
            || (item.name === 'Settings' && pathname.startsWith(`${item.href}/`));
        const expanded = !!query || (expandedItems[item.name] ?? active);
        const itemClass = `group relative flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors ${child ? 'pl-10' : ''} ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'}`;
        return <div key={item.name}>
            {item.children?.length ? (
                <button type="button" onClick={() => toggle(item.name, expanded)} aria-expanded={expanded} className={itemClass}>
                    <item.icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-indigo-400' : ''}`} />
                    <span className="flex-1">{item.name}</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
            ) : (
                <Link href={item.href} onClick={onCloseMobileMenu} aria-current={isActive(item.href) ? 'page' : undefined} className={itemClass}>
                    {active && <span aria-hidden="true" className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-indigo-400" />}
                    {!child && <item.icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-indigo-400' : ''}`} />}
                    <span className="flex-1">{item.name}</span>
                    {item.badge != null && <span className="rounded bg-primary/10 px-1.5 text-xs text-indigo-300">{item.badge}</span>}
                    {!child && active && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </Link>
            )}
            {item.children && expanded && <div className="mt-1 space-y-1">{item.children.map(entry => renderItem(entry, true))}</div>}
        </div>;
    };

    const content = <div className="flex h-full flex-col bg-sidebar">
        <div className="flex h-[88px] shrink-0 items-center justify-between px-6">
            <Link href={navigation[0]?.href ?? '/profile'} onClick={onCloseMobileMenu} className="rounded-lg" aria-label="TindaHub workspace"><Brand /></Link>
            <button type="button" onClick={onCloseMobileMenu} aria-label="Close navigation" className="rounded-lg p-2 text-muted-foreground hover:bg-accent lg:hidden"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-5 pb-5">
            {platform && <div className="mb-5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-3"><p className="text-xs font-semibold text-foreground">Platform administration</p><Link href="/select-shop" onClick={onCloseMobileMenu} className="mt-2 inline-flex items-center gap-1.5 text-xs text-accent-foreground">Your shops<ArrowUpRight className="h-3 w-3" /></Link></div>}
            {!platform && currentShop && <Link href="/select-shop" onClick={onCloseMobileMenu} className="mb-5 flex items-center gap-2.5 rounded-lg border border-sidebar-border bg-card/50 px-3 py-3 transition-colors hover:border-primary/50"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-background"><Store className="h-4 w-4 text-accent-foreground" /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">{currentShop.name}</span><span className="mt-0.5 block text-[10px] capitalize text-muted-foreground">{role} workspace</span></span><ChevronsUpDown className="h-3 w-3 shrink-0 text-muted-foreground" /></Link>}
            <div className="relative">
                <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input type="search" value={search} onChange={event => setSearch(event.target.value)} aria-label="Search navigation" placeholder="Search navigation..." className="h-10 w-full rounded-md border border-input/60 bg-card pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring" />
            </div>
        </div>
        <nav aria-label="Main navigation" className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
            <p className="mb-3 px-3 text-[11px] font-medium text-muted-foreground">{platform ? 'Platform' : 'Your workspace'}</p>
            <div className="space-y-1">{filtered.map(item => <div key={item.name} className={item.name === 'Settings' ? 'mt-5 border-t border-sidebar-border pt-4' : ''}>{renderItem(item)}</div>)}</div>
            {!filtered.length && <p className="px-3 py-5 text-sm text-muted-foreground">No matching pages.</p>}
        </nav>
        <div className="mx-5 mb-5 border-t border-sidebar-border pt-4">
            <Link href="/profile" onClick={onCloseMobileMenu} className="flex items-center gap-2.5 rounded-lg p-1 transition-colors hover:bg-accent">
                <span className="account-avatar">{auth.user?.name?.charAt(0).toUpperCase()}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium text-foreground">{auth.user?.name}</span><span className="block text-[11px] capitalize text-muted-foreground">{role} account</span></span>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
        </div>
    </div>;

    return <>
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border lg:block">{content}</aside>
        <Dialog open={isMobileMenuOpen} onClose={onCloseMobileMenu} className="relative z-50 lg:hidden" aria-label="Navigation">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
            <DialogPanel className="fixed inset-y-0 left-0 w-64 border-r border-sidebar-border">{content}</DialogPanel>
        </Dialog>
    </>;
}
