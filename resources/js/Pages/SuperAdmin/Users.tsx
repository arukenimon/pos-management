import { Head } from '@inertiajs/react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Cell, DetailLink, DirectoryFilters, formatDate, Heading, Pagination, Status, Table } from '@/Components/SuperAdmin/Primitives';
import { Paginated, PlatformFilters, PlatformUser } from '@/types/platform';

export default function Users({ users, filters }: { users: Paginated<PlatformUser>; filters: PlatformFilters }) {
    return <PlatformLayout header={<Heading title="Users" description="Review accounts, email verification, and shop memberships." />}>
        <Head title="Platform users" />
        <section className="dashboard-card overflow-hidden">
            <DirectoryFilters url="/super-admin/users" filters={filters} users />
            <Table headings={['Account', 'Status', 'Email', 'Shops', 'Registered']} empty={!users.data.length ? 'No accounts match these filters.' : undefined}>
                {users.data.map(user => <tr key={user.id}><Cell><DetailLink href={`/super-admin/users/${user.id}`}>{user.name}</DetailLink><p className="mt-1 max-w-64 truncate text-xs text-muted-foreground">{user.email}</p>{user.is_super_admin && <p className="mt-1 text-xs font-medium text-accent-foreground">Super Admin</p>}</Cell><Cell><Status suspended={!!user.suspended_at} /></Cell><Cell><span className="whitespace-nowrap text-xs text-muted-foreground">{user.email_verified_at ? 'Verified' : 'Unverified'}</span></Cell><Cell>{user.shops_count}</Cell><Cell><span className="whitespace-nowrap text-muted-foreground">{formatDate(user.created_at)}</span></Cell></tr>)}
            </Table><Pagination page={users} />
        </section>
    </PlatformLayout>;
}
