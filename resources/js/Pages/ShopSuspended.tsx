import { Head, Link } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';
import AccountLayout from '@/Layouts/AccountLayout';

export default function ShopSuspended({ shopName }: { shopName: string }) {
    return <AccountLayout>
        <Head title="Shop suspended" />
        <span className="dashboard-icon mb-6"><ShieldAlert className="h-5 w-5" /></span>
        <h1>Shop suspended</h1>
        <p className="mt-3 break-words text-sm leading-7 text-muted-foreground">Access to {shopName} is currently suspended. Contact platform support for help.</p>
        <div className="mt-7 flex flex-wrap gap-4">
            <Link href="/select-shop" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Choose another shop</Link>
            <Link href="/profile" className="rounded-lg border border-border px-4 py-2 text-sm font-medium">Your account</Link>
        </div>
    </AccountLayout>;
}
