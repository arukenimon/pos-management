import { Link, usePage } from '@inertiajs/react';
import { Route } from 'lucide-react';
import { PropsWithChildren, useEffect, useState } from 'react';

export interface SidebarNavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    children?: SidebarNavItem[];
    isParent?: boolean | false;
    routename?: string;
}

interface AdminSidebarProps {
    navigation: SidebarNavItem[];
    currentPath: string;
    isMobileMenuOpen?: boolean;
    onCloseMobileMenu?: () => void;
}

const AdminSidebar = ({
    navigation,
    currentPath,
    isMobileMenuOpen = false,
    onCloseMobileMenu
}: AdminSidebarProps) => {
    const url = usePage().url;

    // Initialize expandedItems with parent items whose children are active
    const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
        const parentItems = new Set<string>();
        navigation.forEach(item => {
            if (item.children && item.children.length > 0) {
                // Check if any child is active
                const hasActiveChild = item.children.some(child => child.href === url);
                if (hasActiveChild) {
                    parentItems.add(item.name);
                }
            }
        });
        return parentItems;
    });

    const toggleExpand = (itemName: string) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemName)) {
                newSet.delete(itemName);
            } else {
                newSet.add(itemName);
            }
            return newSet;
        });
    };

    useEffect(() => {
        console.log('Current URL:', url);
    }, [url]);

    const isActive = (href: string) => {
        return href === url;
    };

    const renderNavItem = (item: SidebarNavItem, level: number = 0) => {
        const hasChildren = item.children && item.children.length > 0;

        const active = isActive(item.href) || item.children?.some(child => isActive(child.href));


        const isExpanded = expandedItems.has(item.name);

        return (
            <div key={item.name}>
                {hasChildren ? (
                    <button
                        onClick={() => toggleExpand(item.name)}
                        className={`
                            w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg
                            transition-all duration-200 group
                            ${level > 0 ? 'ml-4' : ''}
                            ${active
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                            }
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`} />
                            <span>{item.name}</span>
                        </div>
                        <svg
                            className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                ) : (
                    <Link
                        href={item.routename ? route(item.routename) : ''}
                        onClick={onCloseMobileMenu}
                        className={`
                            flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg
                            transition-all duration-200 group
                            ${level > 0 ? 'ml-4' : ''}
                            ${active
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                            }
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`} />
                            <span>{item.name}</span>
                        </div>
                        {item.badge && (
                            <span className={`
                                px-2 py-1 text-xs font-semibold rounded-full
                                ${active
                                    ? 'bg-white text-indigo-600'
                                    : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                                }
                            `}>
                                {item.badge}
                            </span>
                        )}
                    </Link>
                )}
                {hasChildren && isExpanded && (
                    <div className="mt-1 space-y-1">
                        {item.children?.map(child => renderNavItem(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 lg:hidden"
                    onClick={onCloseMobileMenu}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
                    transition-transform duration-300 ease-in-out
                    lg:translate-x-0
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
                        <Link href="/admin/dashboard" className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">A</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                Admin
                            </span>
                        </Link>

                        {/* Close button for mobile */}
                        <button
                            onClick={onCloseMobileMenu}
                            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                        {navigation.map(item => renderNavItem(item))}
                    </nav>

                    {/* Footer */}
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    Help & Support
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    Version 1.0.0
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
