import { Head } from '@inertiajs/react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Cell, DetailLink, DirectoryFilters, formatDate, Heading, Pagination, Status, Table } from '@/Components/SuperAdmin/Primitives';
import { Paginated, PlatformFilters, PlatformShop } from '@/types/platform';

export default function Shops({ shops, filters }: { shops: Paginated<PlatformShop>; filters: PlatformFilters }) {
    return <PlatformLayout header={<Heading title="Shops" description="Review registered shops and manage platform access." />}>
        <Head title="Platform shops" />
        <section className="dashboard-card overflow-hidden">
            <DirectoryFilters url="/super-admin/shops" filters={filters} />
            <Table headings={['Shop', 'Status', 'Members', 'Registered']} empty={!shops.data.length ? 'No shops match these filters.' : undefined}>
                {shops.data.map(shop => <tr key={shop.id}><Cell><DetailLink href={`/super-admin/shops/${shop.id}`}>{shop.name}</DetailLink><p className="mt-1 text-xs text-muted-foreground">/{shop.slug}</p></Cell><Cell><Status suspended={!!shop.suspended_at} /></Cell><Cell>{shop.members_count}</Cell><Cell><span className="whitespace-nowrap text-muted-foreground">{formatDate(shop.created_at)}</span></Cell></tr>)}
            </Table><Pagination page={shops} />
        </section>
    </PlatformLayout>;
}
