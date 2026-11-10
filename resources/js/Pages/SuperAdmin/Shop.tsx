import { Head } from '@inertiajs/react';
import { Boxes, ReceiptText, Users } from 'lucide-react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import MetricCard from '@/Components/Admin/MetricCard';
import StatusAction from '@/Components/SuperAdmin/StatusAction';
import { Cell, DetailLink, Facts, formatDate, Heading, Pagination, Section, Status, Table } from '@/Components/SuperAdmin/Primitives';
import { Paginated, PlatformShop, PlatformUser } from '@/types/platform';

export default function Shop({ shop, members }: { shop: PlatformShop & { suspension_reason: string | null; products_count: number; orders_count: number }; members: Paginated<PlatformUser> }) {
    return <PlatformLayout header={<Heading title={shop.name} description={`Shop /${shop.slug}`} back={{ href: '/super-admin/shops', label: 'All shops' }} />}>
        <Head title={`${shop.name} · Platform`} />
        <div className="space-y-6">
            <Section title="Shop access" action={<StatusAction url={`/super-admin/shops/${shop.id}/status`} suspended={!!shop.suspended_at} kind="shop" name={shop.name} />}>
                <Facts items={[{ label: 'Status', value: <Status suspended={!!shop.suspended_at} /> }, { label: 'Registered', value: formatDate(shop.created_at, true) }, ...(shop.suspended_at ? [{ label: 'Suspended since', value: formatDate(shop.suspended_at, true) }, { label: 'Internal reason', value: shop.suspension_reason }] : [])]} />
            </Section>
            <div className="grid gap-5 sm:grid-cols-3"><MetricCard label="Members" value={shop.members_count ?? 0} icon={Users} /><MetricCard label="Products" value={shop.products_count} detail="Product count" icon={Boxes} /><MetricCard label="Orders" value={shop.orders_count} detail="Order count across all statuses" icon={ReceiptText} /></div>
            <Section title="Members and owners"><Table headings={['Account', 'Shop role', 'Account status']} empty={!members.data.length ? 'This shop has no members.' : undefined}>{members.data.map(member => <tr key={member.id}><Cell><DetailLink href={`/super-admin/users/${member.id}`}>{member.name}</DetailLink><p className="mt-1 max-w-64 truncate text-xs text-muted-foreground">{member.email}</p></Cell><Cell><span className="capitalize">{member.shop_role}</span></Cell><Cell><Status suspended={!!member.suspended_at} /></Cell></tr>)}</Table><Pagination page={members} /></Section>
        </div>
    </PlatformLayout>;
}
