import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { User as UserIcon, KeyRound, AlertTriangle } from 'lucide-react';

import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

const ROLE_BADGE: Record<string, string> = {
    owner:   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    cashier: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const role = auth.shopRole;
    const initial = user?.name?.charAt(0).toUpperCase() ?? '?';

    return (
        <AdminLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage your account information, password, and preferences.
                    </p>
                </div>
            }
        >
            <Head title="Profile" />

            <div className="max-w-4xl space-y-6">
                {/* Hero card */}
                <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="h-24 bg-gradient-to-r from-indigo-600 to-purple-600" />
                    <div className="px-6 pb-6 -mt-10 flex items-end gap-4">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 ring-4 ring-white dark:ring-gray-800 flex items-center justify-center shadow-md">
                            <span className="text-white text-3xl font-bold">{initial}</span>
                        </div>
                        <div className="pb-2 min-w-0 flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                                {user?.name}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                        </div>
                        {role && (
                            <span className={`mb-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${ROLE_BADGE[role] ?? ROLE_BADGE.cashier}`}>
                                {role}
                            </span>
                        )}
                    </div>
                </section>

                {/* Profile information */}
                <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-start gap-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Profile Information</h3>
                            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                                Update your account's name and email address.
                            </p>
                        </div>
                    </div>
                    <div className="px-6 py-6">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>
                </section>

                {/* Password */}
                <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-start gap-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <KeyRound className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Password</h3>
                            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                                Use a long, random password to keep your account secure.
                            </p>
                        </div>
                    </div>
                    <div className="px-6 py-6">
                        <UpdatePasswordForm />
                    </div>
                </section>

                {/* Danger zone */}
                <section className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-900/50">
                    <div className="px-6 py-5 border-b border-red-200 dark:border-red-900/50 flex items-start gap-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-red-700 dark:text-red-400">Danger Zone</h3>
                            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                                Permanently delete your account and all associated data.
                            </p>
                        </div>
                    </div>
                    <div className="px-6 py-6">
                        <DeleteUserForm />
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
