import { useState } from 'react';
import useNotifications from '@/hooks/useNotifications';

const kindAccent: Record<string, string> = {
    stock: 'bg-blue-500',
    product: 'bg-emerald-500',
    sale: 'bg-purple-500',
    info: 'bg-gray-400',
};

export default function NotificationBell() {
    const { items, unread, markAllRead, markRead } = useNotifications();
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((o) => !o)}
                className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                aria-label="Notifications"
            >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unread > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 flex items-center justify-center rounded-full bg-red-500 text-[0.65rem] font-semibold text-white">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</p>
                            {unread > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {items.length === 0 ? (
                                <p className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No notifications yet
                                </p>
                            ) : (
                                items.map((n) => (
                                    <button
                                        key={n.id}
                                        onClick={() => markRead(n.id)}
                                        className={`w-full text-left flex gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                                            n.read ? 'opacity-60' : ''
                                        }`}
                                    >
                                        <span
                                            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                                                kindAccent[n.kind] ?? kindAccent.info
                                            } ${n.read ? 'opacity-0' : ''}`}
                                        />
                                        <span className="min-w-0">
                                            <span className="block text-sm font-medium text-gray-900 dark:text-white">
                                                {n.title}
                                            </span>
                                            <span className="block text-sm text-gray-600 dark:text-gray-300 truncate">
                                                {n.message}
                                            </span>
                                            <span className="block text-xs text-gray-400 mt-0.5">{n.created_at}</span>
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
