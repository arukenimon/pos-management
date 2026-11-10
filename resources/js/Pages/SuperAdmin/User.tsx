import { Head } from '@inertiajs/react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import StatusAction from '@/Components/SuperAdmin/StatusAction';
import { Cell, DetailLink, Facts, formatDate, Heading, Pagination, Section, Status, Table } from '@/Components/SuperAdmin/Primitives';
import { Paginated, PlatformShop, PlatformUser } from '@/types/platform';

export default function User({ account, memberships }: { account: PlatformUser & { suspension_reason: string | null }; memberships: Paginated<PlatformShop & { shop_role: string }> }) {
    return <PlatformLayout header={<Heading title={account.name} description={account.email} back={{ href: '/super-admin/users', label: 'All users' }} />}>
        <Head title={`${account.name} · Platform`} />
        <div className="space-y-6">
            <Section title="Account access" action={!account.is_super_admin && <StatusAction url={`/super-admin/users/${account.id}/status`} suspended={!!account.suspended_at} kind="account" name={account.name} />}>
                <Facts items={[{ label: 'Status', value: <Status suspended={!!account.suspended_at} /> }, { label: 'Registered', value: formatDate(account.created_at, true) }, { label: 'Email verification', value: account.email_verified_at ? `Verified ${formatDate(account.email_verified_at)}` : 'Unverified' }, { label: 'Platform access', value: account.is_super_admin ? 'Super Admin' : 'Standard account' }, ...(account.suspended_at ? [{ label: 'Suspended since', value: formatDate(account.suspended_at, true) }, { label: 'Internal reason', value: account.suspension_reason }] : [])]} />
                {account.is_super_admin && <p className="border-t border-border px-5 py-4 text-xs leading-6 text-muted-foreground">This account is protected. Platform access is managed through the server command.</p>}
            </Section>
            <Section title="Shop memberships"><Table headings={['Shop', 'Role', 'Shop status']} empty={!memberships.data.length ? 'This account does not belong to any shops.' : undefined}>{memberships.data.map(shop => <tr key={shop.id}><Cell><DetailLink href={`/super-admin/shops/${shop.id}`}>{shop.name}</DetailLink><p className="mt-1 text-xs text-muted-foreground">/{shop.slug}</p></Cell><Cell><span className="capitalize">{shop.shop_role}</span></Cell><Cell><Status suspended={!!shop.suspended_at} /></Cell></tr>)}</Table><Pagination page={memberships} /></Section>
        </div>
    </PlatformLayout>;
}
