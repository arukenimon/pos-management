import { usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AppNotification, PageProps } from '@/types';

/**
 * Notification bell state, kept in sync from three sources:
 *  - initial load + Inertia navigations (shared `notifications` / `unreadCount` props),
 *  - live pushes over the user's private channel (Pusher),
 *  - optimistic updates when the user marks items read.
 */
export default function useNotifications() {
    const { auth, notifications: initial, unreadCount: initialUnread } =
        usePage<PageProps>().props;

    const [items, setItems] = useState<AppNotification[]>(initial ?? []);
    const [unread, setUnread] = useState<number>(initialUnread ?? 0);

    // Re-sync whenever Inertia reshares props (page visits, redirect-backs).
    useEffect(() => setItems(initial ?? []), [initial]);
    useEffect(() => setUnread(initialUnread ?? 0), [initialUnread]);

    // Live updates over the authenticated user's private channel.
    const userId = auth?.user?.id;
    useEffect(() => {
        if (!userId || !window.Echo) return;

        const channelName = `App.Models.User.${userId}`;
        window.Echo.private(channelName).notification((n: Record<string, unknown>) => {
            const item: AppNotification = {
                id: String(n.id ?? crypto.randomUUID()),
                kind: (n.kind as string) ?? 'info',
                title: (n.title as string) ?? '',
                message: (n.message as string) ?? '',
                read: false,
                created_at: 'Just now',
            };
            setItems((prev) => [item, ...prev].slice(0, 20));
            setUnread((c) => c + 1);
            toast.info(`${item.title}: ${item.message}`);
        });

        return () => window.Echo.leave(channelName);
    }, [userId]);

    const markAllRead = useCallback(() => {
        if (unread === 0) return;
        setItems((prev) => prev.map((i) => ({ ...i, read: true })));
        setUnread(0);
        window.axios.post('/notifications/read-all').catch(() => {});
    }, [unread]);

    const markRead = useCallback((id: string) => {
        setItems((prev) => {
            const target = prev.find((i) => i.id === id);
            if (target && !target.read) {
                setUnread((c) => Math.max(0, c - 1));
            }
            return prev.map((i) => (i.id === id ? { ...i, read: true } : i));
        });
        window.axios.post(`/notifications/${id}/read`).catch(() => {});
    }, []);

    return { items, unread, markAllRead, markRead };
}
