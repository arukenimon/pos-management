import { Head, useForm, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { useState } from 'react';
import { Users, UserPlus, Shield, ChevronDown, Trash2 } from 'lucide-react';

interface Member {
    id: number;
    name: string;
    email: string;
    role: 'owner' | 'manager' | 'cashier';
}

interface TeamProps extends PageProps {
    shop: { id: number; name: string; slug: string };
    members: Member[];
}

const ROLE_COLORS = {
    owner:   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    cashier: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const ROLE_LABELS = { owner: 'Owner', manager: 'Manager', cashier: 'Cashier' };

export default function Team({ shop, members, auth }: TeamProps) {
    const { currentShop } = usePage<PageProps>().props;
    const shopSlug = currentShop?.slug ?? '';
    const [showInvite, setShowInvite] = useState(false);

    const invite = useForm({ email: '', role: 'cashier' as Member['role'] });
    const roleForm = useForm({ role: '' as Member['role'] });

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        invite.post(`/${shopSlug}/settings/team`, {
            preserveScroll: true,
            onSuccess: () => { invite.reset(); setShowInvite(false); },
        });
    };

    const handleRoleChange = (userId: number, newRole: Member['role']) => {
        router.put(`/${shopSlug}/settings/team/${userId}`, { role: newRole }, { preserveScroll: true });
    };

    const handleRemove = (userId: number, name: string) => {
        if (!confirm(`Remove ${name} from this shop?`)) return;
        router.delete(`/${shopSlug}/settings/team/${userId}`, { preserveScroll: true });
    };

    const isOwner = auth.shopRole === 'owner';

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Management</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{shop.name} · Manage who has access and their roles</p>
                    </div>
                    {isOwner && (
                        <button
                            onClick={() => setShowInvite(v => !v)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <UserPlus className="h-4 w-4" />
                            Add Member
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Team - Settings" />

            <div className="max-w-3xl space-y-6">

                {/* Invite form */}
                {isOwner && showInvite && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Add a team member</h2>
                        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1">
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={invite.data.email}
                                    onChange={e => invite.setData('email', e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {invite.errors.email && <p className="text-red-500 text-xs mt-1">{invite.errors.email}</p>}
                            </div>
                            <select
                                value={invite.data.role}
                                onChange={e => invite.setData('role', e.target.value as Member['role'])}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="cashier">Cashier</option>
                                <option value="manager">Manager</option>
                                <option value="owner">Owner</option>
                            </select>
                            <button
                                type="submit"
                                disabled={invite.processing}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                Add
                            </button>
                        </form>
                        <p className="text-xs text-gray-400 mt-2">
                            If the email doesn't have an account yet, one will be created automatically.
                        </p>
                    </div>
                )}

                {/* Members list */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{members.length} member{members.length !== 1 ? 's' : ''}</h2>
                    </div>
                    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                        {members.map(member => (
                            <li key={member.id} className="flex items-center justify-between px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                                        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                            {member.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {member.name}
                                            {member.id === auth.user.id && (
                                                <span className="ml-2 text-xs text-gray-400">(you)</span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isOwner && member.id !== auth.user.id ? (
                                        <select
                                            value={member.role}
                                            onChange={e => handleRoleChange(member.id, e.target.value as Member['role'])}
                                            className="text-xs px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="cashier">Cashier</option>
                                            <option value="manager">Manager</option>
                                            <option value="owner">Owner</option>
                                        </select>
                                    ) : (
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[member.role]}`}>
                                            <Shield className="h-3 w-3" />
                                            {ROLE_LABELS[member.role]}
                                        </span>
                                    )}
                                    {isOwner && member.id !== auth.user.id && (
                                        <button
                                            onClick={() => handleRemove(member.id, member.name)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                            title="Remove member"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Role reference */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Role permissions</h2>
                    <div className="space-y-2 text-sm">
                        {[
                            { role: 'owner',   color: ROLE_COLORS.owner,   desc: 'Full access. Can manage products, view sales & analytics, and manage team members.' },
                            { role: 'manager', color: ROLE_COLORS.manager, desc: 'Can manage products, view sales & analytics. Cannot manage team.' },
                            { role: 'cashier', color: ROLE_COLORS.cashier, desc: 'POS access only. Can process sales.' },
                        ].map(r => (
                            <div key={r.role} className="flex items-start gap-3">
                                <span className={`mt-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${r.color}`}>
                                    <Shield className="h-3 w-3" />
                                    {ROLE_LABELS[r.role as Member['role']]}
                                </span>
                                <p className="text-gray-500 dark:text-gray-400 text-xs leading-5">{r.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
