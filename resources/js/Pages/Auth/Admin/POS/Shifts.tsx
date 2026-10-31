import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { ArrowLeft, Banknote, CheckCircle2, CircleDollarSign, Clock3 } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

type Shift = { id: number; opening_float: string; closing_cash: string | null; expected_cash: string | null; variance: string | null; opened_at: string; closed_at: string | null; notes: string | null };
interface Props extends PageProps { active: Shift | null; history: Shift[]; }
const money = (value: string | number | null) => `₱${Number(value ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

export default function Shifts({ active, history }: Props) {
    const shop = usePage<PageProps>().props.currentShop?.slug ?? '';
    const open = useForm({ opening_float: '' });
    const close = useForm({ closing_cash: '', notes: '' });
    return <AdminLayout header={<div><div><h1>Cash shifts</h1><p className="mt-1.5 text-muted-foreground">Start with a count. Finish with a clear picture.</p></div><Link href={`/${shop}/pos`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-xs font-medium hover:bg-accent"><ArrowLeft className="h-3.5 w-3.5" />Back to point of sale</Link></div>}>
        <Head title="Cash Shifts" />
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <section className="dashboard-card p-6 sm:p-7">
                <span className="dashboard-icon mb-5">{active ? <Banknote className="h-5 w-5" /> : <CircleDollarSign className="h-5 w-5" />}</span>
                <h2 className="text-2xl font-semibold tracking-tight">{active ? 'Your shift is in progress.' : 'Ready for a fresh shift?'}</h2>
                <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">{active ? `Opened ${new Date(active.opened_at).toLocaleString('en-PH')} with ${money(active.opening_float)} in the drawer. Count your cash to close and reconcile.` : 'Count the cash in your drawer before you begin. This opening amount helps keep the end-of-day count accurate.'}</p>
                {!active ? <form onSubmit={event => { event.preventDefault(); open.post(`/${shop}/pos/shifts/open`); }} className="mt-7 space-y-4">
                    <div className="space-y-2"><Label htmlFor="opening-float">Opening cash (PHP)</Label><Input id="opening-float" required type="number" min="0" step="0.01" value={open.data.opening_float} onChange={event => open.setData('opening_float', event.target.value)} placeholder="0.00" aria-invalid={!!open.errors.opening_float} aria-describedby={open.errors.opening_float ? 'opening-float-error' : undefined} />{open.errors.opening_float && <p id="opening-float-error" className="text-xs text-destructive">{open.errors.opening_float}</p>}</div>
                    <Button disabled={open.processing} className="w-full">{open.processing ? 'Opening shift…' : 'Open shift'}</Button>
                </form> : <form onSubmit={event => { event.preventDefault(); close.post(`/${shop}/pos/shifts/close`); }} className="mt-7 space-y-5">
                    <div className="space-y-2"><Label htmlFor="closing-cash">Cash counted in drawer (PHP)</Label><Input id="closing-cash" required type="number" min="0" step="0.01" value={close.data.closing_cash} onChange={event => close.setData('closing_cash', event.target.value)} placeholder="0.00" aria-invalid={!!close.errors.closing_cash} aria-describedby={close.errors.closing_cash ? 'closing-cash-error' : undefined} />{close.errors.closing_cash && <p id="closing-cash-error" className="text-xs text-destructive">{close.errors.closing_cash}</p>}</div>
                    <div className="space-y-2"><Label htmlFor="shift-notes">Shift note <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="shift-notes" value={close.data.notes} onChange={event => close.setData('notes', event.target.value)} placeholder="Anything the next shift should know?" />{close.errors.notes && <p className="text-xs text-destructive">{close.errors.notes}</p>}</div>
                    <Button disabled={close.processing} className="w-full">{close.processing ? 'Reconciling…' : 'Close & reconcile'}</Button>
                </form>}
            </section>
            <section className="dashboard-card overflow-hidden"><div className="flex items-center gap-2.5 border-b border-border px-6 py-5"><Clock3 className="h-4 w-4 text-muted-foreground" /><h2 className="text-base font-semibold">Recent shifts</h2></div>
                {history.length ? <div className="divide-y divide-border">{history.map(shift => <div key={shift.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 text-sm"><div><p className="font-medium">{new Date(shift.opened_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">Float {money(shift.opening_float)}{shift.closed_at ? ` · Expected ${money(shift.expected_cash)}` : ' · In progress'}</p></div>{shift.closed_at ? <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium ${Number(shift.variance) === 0 ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}><CheckCircle2 className="h-3.5 w-3.5" />{Number(shift.variance) === 0 ? 'Balanced' : `${Number(shift.variance) > 0 ? '+' : ''}${money(shift.variance)}`}</span> : <span className="rounded-md bg-primary/10 px-2.5 py-1.5 text-xs text-accent-foreground">Open</span>}</div>)}</div> : <div className="flex flex-col items-center px-6 py-16 text-center"><Clock3 className="mb-4 h-8 w-8 text-muted-foreground/50" /><p className="text-sm font-medium">A clean slate.</p><p className="mt-2 max-w-xs text-xs leading-6 text-muted-foreground">Your shift history will appear here when you open your first cash shift.</p></div>}
            </section>
        </div>
    </AdminLayout>;
}
