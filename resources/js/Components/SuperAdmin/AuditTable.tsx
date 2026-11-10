import { AuditEntry } from '@/types/platform';
import { Cell, DetailLink, formatDate, Table } from './Primitives';

export const actionLabels: Record<string, string> = {
    'shop.suspended': 'Shop suspended', 'shop.restored': 'Shop restored',
    'user.suspended': 'Account suspended', 'user.restored': 'Account restored',
    'super_admin.granted': 'Platform access granted', 'super_admin.revoked': 'Platform access revoked',
};

export default function AuditTable({ entries }: { entries: AuditEntry[] }) {
    return <Table headings={['Action / time', 'Actor', 'Target', 'Change / reason']} empty={!entries.length ? 'No administrative actions recorded.' : undefined}>
        {entries.map(entry => <tr key={entry.id}>
            <Cell><p className="whitespace-nowrap font-medium">{actionLabels[entry.action] ?? entry.action}</p><p className="mt-1 whitespace-nowrap text-xs text-muted-foreground">{formatDate(entry.created_at, true)}</p></Cell>
            <Cell><p className="max-w-48 truncate">{entry.actor.name}</p><p className="mt-1 max-w-48 truncate text-xs text-muted-foreground">{entry.actor.email ?? 'CLI'}</p></Cell>
            <Cell><DetailLink href={`/super-admin/${entry.target_type === 'shop' ? 'shops' : 'users'}/${entry.target_id}`}>{entry.target.name}</DetailLink><p className="mt-1 max-w-48 truncate text-xs text-muted-foreground">{entry.target.email ?? entry.target.slug}</p></Cell>
            <Cell><p className="text-xs text-muted-foreground">{Object.values(entry.before_state).map(String).join(', ')} → {Object.values(entry.after_state).map(String).join(', ')}</p><p className="mt-1 min-w-48 max-w-md whitespace-pre-wrap break-words text-sm">{entry.reason}</p></Cell>
        </tr>)}
    </Table>;
}
