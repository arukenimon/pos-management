import { FormEvent, PropsWithChildren, ReactNode } from 'react';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, ArrowUpRight, Search } from 'lucide-react';
import { Paginated, PlatformFilters } from '@/types/platform';

export const fieldClass = 'w-full min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring';
export const primaryButton = 'inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50';
export const secondaryButton = 'inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50';

export function Heading({ title, description, back }: { title: string; description: string; back?: { href: string; label: string } }) {
    return <div>
        {back && <Link href={back.href} className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" />{back.label}</Link>}
        <h1 className="break-words text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
    </div>;
}

export function Status({ suspended }: { suspended: boolean }) {
    return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-1 text-xs font-medium ${suspended ? 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'}`}><span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${suspended ? 'bg-amber-500' : 'bg-emerald-500'}`} />{suspended ? 'Suspended' : 'Active'}</span>;
}

export function Table({ headings, children, empty }: PropsWithChildren<{ headings: string[]; empty?: string }>) {
    return <div className="overflow-x-auto"><table className="w-full text-left text-sm">
        <thead className="border-y border-border bg-muted/30 text-xs text-muted-foreground"><tr>{headings.map(heading => <th key={heading} scope="col" className="whitespace-nowrap px-5 py-3 font-medium">{heading}</th>)}</tr></thead>
        <tbody className="divide-y divide-border">{empty ? <tr><td colSpan={headings.length} className="px-5 py-12 text-center text-muted-foreground">{empty}</td></tr> : children}</tbody>
    </table></div>;
}

export function Cell({ children }: PropsWithChildren) {
    return <td className="px-5 py-4 align-top">{children}</td>;
}

export function DetailLink({ href, children }: PropsWithChildren<{ href: string }>) {
    return <Link href={href} className="inline-flex max-w-64 items-center gap-2 rounded text-sm font-medium text-foreground hover:text-accent-foreground"><span className="truncate">{children}</span><ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /></Link>;
}

export function Pagination({ page }: { page: Omit<Paginated<unknown>, 'data'> }) {
    return <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-5 py-4">
        <p className="text-xs text-muted-foreground">{page.total ? `${page.from}–${page.to} of ${page.total}` : '0 results'}</p>
        <nav aria-label="Pagination" className="flex flex-wrap gap-1">{page.links.map((link, index) => {
            const label = link.label.includes('Previous') ? 'Previous' : link.label.includes('Next') ? 'Next' : link.label;
            const className = `rounded-md px-2.5 py-1.5 text-xs ${link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`;
            return link.url ? <Link key={`${label}-${index}`} href={link.url} preserveScroll aria-current={link.active ? 'page' : undefined} className={className}>{label}</Link> : <span key={`${label}-${index}`} aria-disabled="true" className="px-2.5 py-1.5 text-xs text-muted-foreground/50">{label}</span>;
        })}</nav>
    </div>;
}

export function DirectoryFilters({ url, filters, users = false }: { url: string; filters: PlatformFilters; users?: boolean }) {
    return <FilterForm url={url}>
        <label className="min-w-0 flex-1 text-xs text-muted-foreground">Search
            <span className="relative mt-1.5 block"><Search aria-hidden="true" className="absolute left-3 top-2.5 h-4 w-4" /><input name="q" type="search" defaultValue={filters.q ?? ''} maxLength={255} placeholder={users ? 'Name or email' : 'Shop name or slug'} className={`${fieldClass} pl-9`} /></span>
        </label>
        <label className="text-xs text-muted-foreground">Status<select name="status" defaultValue={filters.status ?? ''} className={`${fieldClass} mt-1.5 sm:w-40`}><option value="">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option></select></label>
        {users && <label className="text-xs text-muted-foreground">Email verification<select name="verification" defaultValue={filters.verification ?? ''} className={`${fieldClass} mt-1.5 sm:w-44`}><option value="">All accounts</option><option value="verified">Verified</option><option value="unverified">Unverified</option></select></label>}
    </FilterForm>;
}

export function FilterForm({ url, children }: PropsWithChildren<{ url: string }>) {
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const values = Object.fromEntries(Array.from(new FormData(event.currentTarget).entries()).map(([key, value]) => [key, String(value).trim()]).filter(([, value]) => value));
        router.get(url, values, { preserveScroll: true });
    };
    return <form onSubmit={submit} className="flex flex-col gap-4 p-5 sm:flex-row sm:flex-wrap sm:items-end">
        {children}<div className="flex gap-2"><button className={primaryButton} type="submit">Apply filters</button><Link className={secondaryButton} href={url}>Reset</Link></div>
    </form>;
}

export function Section({ title, action, children }: PropsWithChildren<{ title: string; action?: ReactNode }>) {
    return <section className="dashboard-card min-w-0 overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5"><h2 className="text-sm font-semibold">{title}</h2>{action}</div>{children}</section>;
}

export function Facts({ items }: { items: { label: string; value: ReactNode }[] }) {
    return <dl className="grid gap-5 p-5 sm:grid-cols-2">{items.map(item => <div key={item.label} className="min-w-0"><dt className="text-xs text-muted-foreground">{item.label}</dt><dd className="mt-2 break-words text-sm font-medium">{item.value}</dd></div>)}</dl>;
}

export function formatDate(value: string | null, time = false): string {
    if (!value) return '—';
    return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', ...(time ? { timeStyle: 'short' as const } : {}) });
}
