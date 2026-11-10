import { Head, Link } from '@inertiajs/react';
import { CalendarPlus, ShieldAlert, Store, Users } from 'lucide-react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import MetricCard from '@/Components/Admin/MetricCard';
import AuditTable from '@/Components/SuperAdmin/AuditTable';
import { Cell, DetailLink, formatDate, Heading, Section, Status, Table } from '@/Components/SuperAdmin/Primitives';
import { AuditEntry, PlatformShop } from '@/types/platform';

interface Metrics { shops: number; activeShops: number; suspendedShops: number; newShops: number; users: number; activeUsers: number; suspendedUsers: number; newUsers: number; }

export default function Overview({ metrics, newestShops, recentActions }: { metrics: Metrics; newestShops: PlatformShop[]; recentActions: AuditEntry[] }) {
    return <PlatformLayout header={<Heading title="Platform overview" description="A clear view of the shops and people using TindaHub." />}>
        <Head title="Platform overview" />
        <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Shops" value={metrics.shops.toLocaleString()} detail={`${metrics.activeShops} active · ${metrics.suspendedShops} suspended`} icon={Store} />
                <MetricCard label="Accounts" value={metrics.users.toLocaleString()} detail={`${metrics.activeUsers} active · ${metrics.suspendedUsers} suspended`} icon={Users} />
                <MetricCard label="New shops" value={metrics.newShops.toLocaleString()} detail="Registered in the past 30 days" icon={CalendarPlus} />
                <MetricCard label="New accounts" value={metrics.newUsers.toLocaleString()} detail="Registered in the past 30 days" icon={Users} />
            </div>
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
                <Section title="Newest shops" action={<Link href="/super-admin/shops" className="dashboard-link text-xs">View all shops →</Link>}>
                    <Table headings={['Shop', 'Status', 'Registered']} empty={!newestShops.length ? 'No shops have registered yet.' : undefined}>
                        {newestShops.map(shop => <tr key={shop.id}><Cell><DetailLink href={`/super-admin/shops/${shop.id}`}>{shop.name}</DetailLink><p className="mt-1 text-xs text-muted-foreground">/{shop.slug}</p></Cell><Cell><Status suspended={!!shop.suspended_at} /></Cell><Cell><span className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(shop.created_at)}</span></Cell></tr>)}
                    </Table>
                </Section>
                <section className="dashboard-card p-5"><span className="dashboard-icon"><ShieldAlert className="h-4 w-4" /></span><h2 className="mt-4 text-sm font-semibold">Access management</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Review suspended shops and accounts. Every access change includes an internal reason and an audit record.</p><div className="mt-5 flex flex-col items-start gap-3"><Link href="/super-admin/shops?status=suspended" className="dashboard-link text-sm">{metrics.suspendedShops} suspended shops →</Link><Link href="/super-admin/users?status=suspended" className="dashboard-link text-sm">{metrics.suspendedUsers} suspended accounts →</Link></div></section>
            </div>
            <Section title="Recent administrative actions" action={<Link href="/super-admin/audit-log" className="dashboard-link text-xs">View audit log →</Link>}><AuditTable entries={recentActions} /></Section>
        </div>
    </PlatformLayout>;
}
