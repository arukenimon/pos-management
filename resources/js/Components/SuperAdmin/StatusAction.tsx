import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { fieldClass, primaryButton, secondaryButton } from './Primitives';

export default function StatusAction({ url, suspended, kind, name }: { url: string; suspended: boolean; kind: 'shop' | 'account'; name: string }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ status: '', reason: '', confirmed: false });
    const action = suspended ? 'Restore' : 'Suspend';
    const changeOpen = (next: boolean) => {
        if (form.processing) return;
        setOpen(next);
        form.reset();
        form.clearErrors();
    };

    return <>
        <button type="button" className={suspended ? primaryButton : secondaryButton} onClick={() => changeOpen(true)}><ShieldAlert className="h-4 w-4" />{action} {kind}</button>
        <Dialog open={open} onOpenChange={changeOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>{action} {kind}</DialogTitle><DialogDescription>
                    {suspended ? `Restore access to ${name}.` : kind === 'shop' ? `All members will lose access to ${name}. Their other active shops remain available.` : `${name} will lose access across all shops. Existing sessions and API tokens will be revoked.`}
                </DialogDescription></DialogHeader>
                <form onSubmit={event => {
                    event.preventDefault();
                    form.transform(data => ({ ...data, status: suspended ? 'active' : 'suspended' }));
                    form.patch(url, {
                        preserveScroll: true,
                        onSuccess: () => { setOpen(false); form.reset(); },
                    });
                }} className="space-y-5">
                    <label className="block text-sm font-medium" htmlFor="status-reason">Internal reason<textarea id="status-reason" required minLength={3} maxLength={1000} rows={4} value={form.data.reason} onChange={event => form.setData('reason', event.target.value)} className={`${fieldClass} mt-2`} aria-describedby="reason-help" /></label>
                    <p id="reason-help" className="text-xs text-muted-foreground">Recorded in the platform audit log. Shop members will not see this reason.</p>
                    {form.errors.reason && <p role="alert" className="text-sm text-destructive">{form.errors.reason}</p>}
                    <label className="flex items-start gap-3 text-sm"><input type="checkbox" required checked={form.data.confirmed} onChange={event => form.setData('confirmed', event.target.checked)} className="mt-0.5 rounded border-input bg-background text-primary focus:ring-ring" />I confirm this {kind} should be {suspended ? 'restored' : 'suspended'}.</label>
                    {(form.errors.status || form.errors.confirmed) && <p role="alert" className="text-sm text-destructive">{form.errors.status || form.errors.confirmed}</p>}
                    <DialogFooter><button type="button" disabled={form.processing} onClick={() => changeOpen(false)} className={secondaryButton}>Cancel</button><button type="submit" disabled={form.processing} className={primaryButton}>{form.processing ? 'Saving…' : `${action} ${kind}`}</button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </>;
}
