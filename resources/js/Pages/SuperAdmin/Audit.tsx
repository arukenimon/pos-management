import { Head, usePage } from '@inertiajs/react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import AuditTable, { actionLabels } from '@/Components/SuperAdmin/AuditTable';
import { fieldClass, FilterForm, Heading, Pagination } from '@/Components/SuperAdmin/Primitives';
import { AuditEntry, Paginated, PlatformFilters } from '@/types/platform';

export default function Audit({ entries, filters }: { entries: Paginated<AuditEntry>; filters: PlatformFilters }) {
    const errors = usePage().props.errors;
    return <PlatformLayout header={<Heading title="Audit log" description="A permanent record of platform access changes and the reasons behind them." />}>
        <Head title="Platform audit log" />
        <section className="dashboard-card overflow-hidden">
            <FilterForm url="/super-admin/audit-log">
                <label className="min-w-0 flex-1 text-xs text-muted-foreground">Actor<input name="actor" defaultValue={filters.actor ?? ''} placeholder="Name or email" maxLength={255} className={`${fieldClass} mt-1.5`} /></label>
                <label className="min-w-0 flex-1 text-xs text-muted-foreground">Target<input name="target" defaultValue={filters.target ?? ''} placeholder="Name, email, or slug" maxLength={255} className={`${fieldClass} mt-1.5`} /></label>
                <label className="text-xs text-muted-foreground">Action<select name="action" defaultValue={filters.action ?? ''} className={`${fieldClass} mt-1.5 sm:w-48`}><option value="">All actions</option>{Object.entries(actionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label className="text-xs text-muted-foreground">From<input name="from" type="date" defaultValue={filters.from ?? ''} className={`${fieldClass} mt-1.5`} /></label>
                <label className="text-xs text-muted-foreground">To<input name="to" type="date" defaultValue={filters.to ?? ''} min={filters.from ?? undefined} className={`${fieldClass} mt-1.5`} /></label>
            </FilterForm>
            {Object.values(errors).length > 0 && <p role="alert" className="px-5 pb-4 text-sm text-destructive">{Object.values(errors).join(' ')}</p>}
            <AuditTable entries={entries.data} /><Pagination page={entries} />
        </section>
    </PlatformLayout>;
}
