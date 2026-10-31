import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { Bell, CheckCheck } from 'lucide-react';
import useNotifications from '@/hooks/useNotifications';

const kindAccent: Record<string, string> = { stock: 'bg-cyan-500', product: 'bg-emerald-500', sale: 'bg-primary', info: 'bg-muted-foreground' };

export default function NotificationBell() {
    const { items, unread, markAllRead, markRead } = useNotifications();
    return <Popover className="relative">
        <PopoverButton className="utility-button relative" aria-label="Notifications">
            <Bell className="h-[18px] w-[18px]" />
            {unread > 0 && <span className="absolute right-0 top-0 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-semibold leading-4 text-white">{unread > 9 ? '9+' : unread}<span className="sr-only">unread notifications</span></span>}
        </PopoverButton>
        <PopoverPanel anchor={{ to: 'bottom end', gap: 14, padding: 16 }} transition className="z-50 w-80 max-w-[calc(100vw-32px)] origin-top-right overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl transition duration-150 data-[closed]:scale-95 data-[closed]:opacity-0">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4"><h2 className="text-sm font-semibold">Notifications</h2>{unread > 0 && <button type="button" onClick={markAllRead} className="inline-flex items-center gap-1.5 rounded text-[11px] font-medium text-accent-foreground hover:underline"><CheckCheck className="h-3.5 w-3.5" />Mark all read</button>}</div>
            <div className="max-h-96 overflow-y-auto">{!items.length ? <div className="flex flex-col items-center px-5 py-12 text-center"><Bell className="mb-4 h-7 w-7 text-muted-foreground/50" /><p className="text-sm font-medium">All quiet for now.</p><p className="mt-2 text-xs leading-6 text-muted-foreground">Updates from your shop will appear here.</p></div> : items.map(notification => <button type="button" key={notification.id} onClick={() => markRead(notification.id)} className={`flex w-full gap-3 border-b border-border/70 px-5 py-4 text-left transition-colors hover:bg-muted/50 ${notification.read ? 'opacity-60' : ''}`}>
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${kindAccent[notification.kind] ?? kindAccent.info} ${notification.read ? 'opacity-0' : ''}`} />
                <span className="min-w-0"><span className="block text-xs font-medium">{notification.title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{notification.message}</span><span className="mt-2 block text-[10px] text-muted-foreground">{notification.created_at}</span></span>
            </button>)}</div>
        </PopoverPanel>
    </Popover>;
}
