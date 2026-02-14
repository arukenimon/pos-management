import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';

interface DashboardStats {
    totalRevenue: string;
    totalOrders: number;
    totalCustomers: number;
    averageOrderValue: string;
}

interface DashboardProps extends PageProps {
    stats?: DashboardStats;
}

export default function AdminDashboard({ auth, stats }: DashboardProps) {
    // Default stats if not provided
    const defaultStats: DashboardStats = {
        totalRevenue: '$12,426',
        totalOrders: 156,
        totalCustomers: 1, averageOrderValue: '$79.65',
    };

    const dashboardStats = stats || defaultStats;

    // Stats cards configuration
    const statsCards = [
        {
            title: 'Total Revenue',
            value: dashboardStats.totalRevenue,
            change: '+12.5%',
            changeType: 'increase' as const,
            icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            bgColor: 'bg-blue-500',
        },
        {
            title: 'Total Orders',
            value: dashboardStats.totalOrders.toString(),
            change: '+8.2%',
            changeType: 'increase' as const,
            icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
            bgColor: 'bg-green-500',
        },
        {
            title: 'Total Customers',
            value: dashboardStats.totalCustomers.toString(),
            change: '+15.3%',
            changeType: 'increase' as const,
            icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            bgColor: 'bg-purple-500',
        },
        {
            title: 'Avg. Order Value',
            value: dashboardStats.averageOrderValue,
            change: '-2.4%',
            changeType: 'decrease' as const,
            icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            ),
            bgColor: 'bg-orange-500',
        },
    ];

    // Recent orders data
    const recentOrders = [
        { id: '#ORD-001', customer: 'John Doe', amount: '$125.00', status: 'Completed', date: '2 min ago' },
        { id: '#ORD-002', customer: 'Jane Smith', amount: '$89.50', status: 'Processing', date: '15 min ago' },
        { id: '#ORD-003', customer: 'Bob Johnson', amount: '$245.00', status: 'Completed', date: '1 hour ago' },
        { id: '#ORD-004', customer: 'Alice Williams', amount: '$67.25', status: 'Pending', date: '2 hours ago' },
        { id: '#ORD-005', customer: 'Charlie Brown', amount: '$199.99', status: 'Completed', date: '3 hours ago' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Processing':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <AdminLayout
            header={
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Sari Sari Store - Dashboard
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Welcome back, ! Here's what's happening today.
                    </p>
                </div>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {statsCards.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {stat.title}
                                        </p>
                                        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                            {stat.value}
                                        </p>
                                        <p className={`mt-2 text-sm font-medium ${stat.changeType === 'increase'
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                            }`}>
                                            {stat.change} from last month
                                        </p>
                                    </div>
                                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                                        <div className="text-white">
                                            {stat.icon}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts and Tables Row */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Sales Chart */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Sales Overview
                            </h3>
                            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                {/* Placeholder for chart */}
                                <div className="text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <p className="mt-2 text-sm">Chart will be displayed here</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Top Products - Today
                            </h3>
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((item) => (
                                    <div key={item} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    Product {item}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {50 - item * 5} sales
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                            ${(1000 - item * 150).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Orders Table */}
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Recent Orders
                            </h3>
                            <a href="/admin/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                                View all →
                            </a>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Order ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {order.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {order.customer}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-semibold">
                                                {order.amount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {order.date}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { title: 'Add Product', icon: '📦', href: '/admin/products/create' },
                        { title: 'New Order', icon: '🛒', href: '/admin/orders/create' },
                        { title: 'Add User', icon: '👤', href: '/admin/users/create' },
                        { title: 'Reports', icon: '📊', href: '/admin/reports' },
                    ].map((action, index) => (
                        <a
                            key={index}
                            href={action.href}
                            className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:border-indigo-500 dark:hover:border-indigo-500 group"
                        >
                            <div className="text-4xl mb-2">{action.icon}</div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                {action.title}
                            </h4>
                        </a>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
