import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { ArrowUpRight, LogOut, Plus, Store } from 'lucide-react';
import AccountLayout from '@/Layouts/AccountLayout';

interface ShopEntry { id: number; name: string; slug: string; role: 'owner' | 'manager' | 'cashier'; suspended: boolean; }
interface ShopSelectorProps extends PageProps { shops: ShopEntry[]; }

export default function ShopSelector({ shops, auth }: ShopSelectorProps) {
    return <AccountLayout>
        <Head title="Select Shop" />
        <span className="dashboard-icon mb-6"><Store className="h-5 w-5" /></span>
        <h1>Select a shop</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">Hi {auth.user.name.split(' ')[0]}. Where are we working today?</p>
        {auth.isSuperAdmin && <Link href="/super-admin" className="mt-4 inline-block text-sm font-medium text-accent-foreground">Platform administration →</Link>}
        {!shops.length && <p className="mt-8 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">You do not belong to any shops yet.</p>}
        <div className="mt-8 space-y-3">{shops.map(shop => <a key={shop.id} href={route(shop.role === 'cashier' ? 'admin.pos.index' : 'admin.dashboard', { shop: shop.slug })} className="group flex items-center gap-3.5 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/60">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary/10 font-display text-xl font-semibold text-accent-foreground">{shop.name.charAt(0).toUpperCase()}</span>
            <span className="min-w-0 flex-1"><strong className="block truncate text-sm font-semibold">{shop.name}</strong><span className="mt-1 block text-xs capitalize text-muted-foreground">{shop.suspended ? 'Suspended' : `${shop.role} workspace`}</span></span><ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
        </a>)}</div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4"><Link href="/register" className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-foreground"><Plus className="h-3.5 w-3.5" />Create a new shop</Link><Link href="/logout" method="post" as="button" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"><LogOut className="h-3.5 w-3.5" />Sign out</Link></div>
    </AccountLayout>;
}
