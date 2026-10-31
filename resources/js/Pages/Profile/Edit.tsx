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
    cashier: 'bg-muted text-foreground dark:bg-muted dark:text-foreground/80',
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
                    <h1 className="text-2xl font-bold text-foreground">Profile</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your account information, password, and preferences.
                    </p>
                </div>
            }
        >
            <Head title="Profile" />

            <div className="max-w-4xl space-y-6">
                {/* Hero card */}
                <section className="dashboard-card bg-card rounded-xl border border-border overflow-hidden">
                    <div className="h-16 border-b border-border bg-primary/5" />
                    <div className="px-5 pb-6 -mt-7 flex flex-wrap items-end gap-4 sm:px-6">
                        <div className="h-16 w-16 rounded-xl bg-primary ring-4 ring-card flex items-center justify-center shadow-md">
                            <span className="text-white text-2xl font-semibold">{initial}</span>
                        </div>
                        <div className="pb-1 min-w-0 flex-1">
                            <h2 className="text-xl font-semibold text-foreground truncate">
                                {user?.name}
                            </h2>
                            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                        </div>
                        {role && (
                            <span className={`mb-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${ROLE_BADGE[role] ?? ROLE_BADGE.cashier}`}>
                                {role}
                            </span>
                        )}
                    </div>
                </section>

                {/* Profile information */}
                <section className="dashboard-card bg-card rounded-xl border border-border">
                    <div className="px-6 py-5 border-b border-border flex items-start gap-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-foreground">Profile Information</h3>
                            <p className="mt-0.5 text-sm text-muted-foreground">
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
                <section className="dashboard-card bg-card rounded-xl border border-border">
                    <div className="px-6 py-5 border-b border-border flex items-start gap-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <KeyRound className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-foreground">Password</h3>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                Use a long, random password to keep your account secure.
                            </p>
                        </div>
                    </div>
                    <div className="px-6 py-6">
                        <UpdatePasswordForm />
                    </div>
                </section>

                {/* Danger zone */}
                <section className="dashboard-card bg-card rounded-xl border border-red-200 dark:border-red-900/50">
                    <div className="px-6 py-5 border-b border-red-200 dark:border-red-900/50 flex items-start gap-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-red-700 dark:text-red-400">Danger Zone</h3>
                            <p className="mt-0.5 text-sm text-muted-foreground">
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
