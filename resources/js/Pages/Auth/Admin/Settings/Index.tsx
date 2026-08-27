import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { Barcode, Building2, Clock3, CreditCard, PackageCheck, ReceiptText, Save, Users } from 'lucide-react';

interface SettingsProps extends PageProps {
    shop: {
        name: string;
        slug: string;
        description: string | null;
        currency: string;
        taxRate: string;
        receiptFooter: string | null;
        paymentMethods: string[];
        barcodeScanningEnabled: boolean;
        lowStockThreshold: number;
    };
}

const inputClass = 'mt-1 block w-full rounded-lg border border-[#d9e8e5] bg-white px-3 py-2.5 text-sm text-[#102a2a] shadow-sm outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white';

export default function Settings({ shop }: SettingsProps) {
    const form = useForm({
        name: shop.name,
        description: shop.description ?? '',
        currency: shop.currency,
        taxRate: shop.taxRate,
        receiptFooter: shop.receiptFooter ?? '',
        paymentMethods: shop.paymentMethods,
        barcodeScanningEnabled: shop.barcodeScanningEnabled,
        lowStockThreshold: shop.lowStockThreshold,
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.put(`/${shop.slug}/settings`, { preserveScroll: true });
    };

    return (
        <AdminLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold text-[#102a2a] dark:text-white">Admin Settings</h1>
                    <p className="mt-1 text-sm text-[#54706d] dark:text-gray-400">Keep your shop profile and operating preferences in one place.</p>
                </div>
            }
        >
            <Head title="Admin Settings" />

            <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6">
                <section className="rounded-xl border border-[#d9e8e5] bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-[#d7f3ed] p-2 text-[#0f766e] dark:bg-teal-900/40 dark:text-teal-300"><Building2 className="h-5 w-5" /></div>
                        <div>
                            <h2 className="font-semibold text-[#102a2a] dark:text-white">Business profile</h2>
                            <p className="mt-1 text-sm text-[#54706d] dark:text-gray-400">Details shown throughout your back office.</p>
                        </div>
                    </div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <label className="block text-sm font-medium text-[#102a2a] dark:text-gray-200">
                            Store name
                            <input className={inputClass} value={form.data.name} onChange={event => form.setData('name', event.target.value)} required />
                            {form.errors.name && <p className="mt-1 text-xs text-red-600">{form.errors.name}</p>}
                        </label>
                        <label className="block text-sm font-medium text-[#102a2a] dark:text-gray-200">
                            Store description
                            <input className={inputClass} value={form.data.description} onChange={event => form.setData('description', event.target.value)} placeholder="Optional short description" />
                            {form.errors.description && <p className="mt-1 text-xs text-red-600">{form.errors.description}</p>}
                        </label>
                    </div>
                </section>

                <section className="rounded-xl border border-[#d9e8e5] bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-[#d7f3ed] p-2 text-[#0f766e] dark:bg-teal-900/40 dark:text-teal-300"><ReceiptText className="h-5 w-5" /></div>
                        <div className="flex-1">
                            <h2 className="font-semibold text-[#102a2a] dark:text-white">Sales & receipts</h2>
                            <p className="mt-1 text-sm text-[#54706d] dark:text-gray-400">These settings will be available when they are connected to checkout and receipts.</p>
                        </div>
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#d7f3ed] px-2.5 py-1 text-xs font-semibold text-[#0f766e] dark:bg-teal-900/40 dark:text-teal-300"><Clock3 className="h-3.5 w-3.5" />Coming soon</span>
                    </div>
                    <p id="sales-settings-status" className="mt-4 rounded-lg border border-[#d9e8e5] bg-[#f7fdfb] px-3 py-2 text-xs leading-5 text-[#54706d] dark:border-gray-600 dark:bg-gray-900/30 dark:text-gray-400">Checkout currently uses PHP and supports Cash and Card only. Currency, tax, and receipt footer controls are disabled until they can change those live checkout behaviours.</p>
                    <fieldset disabled aria-describedby="sales-settings-status" className="mt-5 opacity-60">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block text-sm font-medium text-[#102a2a] dark:text-gray-200">
                                Currency
                                <select className={inputClass} value={form.data.currency} onChange={event => form.setData('currency', event.target.value)}>
                                    <option value="PHP">PHP — Philippine peso</option>
                                    <option value="USD">USD — US dollar</option>
                                    <option value="EUR">EUR — Euro</option>
                                </select>
                            </label>
                            <label className="block text-sm font-medium text-[#102a2a] dark:text-gray-200">
                                Tax rate (%)
                                <input className={inputClass} type="number" min="0" max="100" step="0.01" value={form.data.taxRate} onChange={event => form.setData('taxRate', event.target.value)} />
                            </label>
                        </div>
                        <label className="mt-4 block text-sm font-medium text-[#102a2a] dark:text-gray-200">
                            Receipt footer
                            <input className={inputClass} value={form.data.receiptFooter} onChange={event => form.setData('receiptFooter', event.target.value)} placeholder="Thank you for shopping with us." />
                        </label>
                    </fieldset>
                </section>

                <section className="rounded-xl border border-[#d9e8e5] bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-[#d7f3ed] p-2 text-[#0f766e] dark:bg-teal-900/40 dark:text-teal-300"><CreditCard className="h-5 w-5" /></div>
                            <div className="flex-1">
                                <h2 className="font-semibold text-[#102a2a] dark:text-white">POS & inventory</h2>
                                <p className="mt-1 text-sm text-[#54706d] dark:text-gray-400">Set the stock level that needs attention on your dashboard.</p>
                            </div>
                        </div>
                    <fieldset disabled className="mt-5 opacity-60">
                        <div>
                            <p className="text-sm font-medium text-[#102a2a] dark:text-gray-200">Accepted payment methods</p>
                            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                {[['cash', 'Cash'], ['card', 'Card'], ['e_wallet', 'E-wallet']].map(([value, label]) => (
                                    <label key={value} className="flex items-center gap-3 rounded-lg border border-[#d9e8e5] p-3 text-sm text-[#102a2a] dark:border-gray-600 dark:text-gray-200">
                                        <input type="checkbox" checked={form.data.paymentMethods.includes(value)} readOnly className="rounded border-gray-300 text-[#0f766e] focus:ring-[#0f766e]" />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="mt-5">
                            <label className="flex items-start gap-3 rounded-lg border border-[#d9e8e5] p-4 dark:border-gray-600">
                                <input type="checkbox" checked={form.data.barcodeScanningEnabled} readOnly className="mt-0.5 rounded border-gray-300 text-[#0f766e] focus:ring-[#0f766e]" />
                                <span><span className="flex items-center gap-2 text-sm font-medium text-[#102a2a] dark:text-gray-200"><Barcode className="h-4 w-4" />Enable barcode scanning</span><span className="mt-1 block text-xs text-[#54706d] dark:text-gray-400">Allow barcode input on the POS screen.</span></span>
                            </label>
                        </div>
                    </fieldset>
                    <div className="mt-5 rounded-lg border border-[#d9e8e5] bg-[#f7fdfb] p-4 dark:border-gray-600 dark:bg-gray-900/30">
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-[#d7f3ed] p-2 text-[#0f766e] dark:bg-teal-900/40 dark:text-teal-300"><PackageCheck className="h-4 w-4" /></div>
                            <label className="block text-sm font-medium text-[#102a2a] dark:text-gray-200">
                                Low-stock threshold
                                <input className={inputClass} type="number" min="0" max="10000" value={form.data.lowStockThreshold} onChange={event => form.setData('lowStockThreshold', Number(event.target.value))} required />
                                <span className="mt-1 block text-xs font-normal text-[#54706d] dark:text-gray-400">Show an alert when an active product variant has this many units or fewer. Use 0 for out-of-stock only.</span>
                            </label>
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border border-[#d9e8e5] bg-[#f7fdfb] p-5 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-[#d7f3ed] p-2 text-[#0f766e] dark:bg-teal-900/40 dark:text-teal-300"><Users className="h-5 w-5" /></div>
                            <div><h2 className="font-semibold text-[#102a2a] dark:text-white">Team & access</h2><p className="mt-1 text-sm text-[#54706d] dark:text-gray-400">Invite staff and manage Owner, Manager, and Cashier roles.</p></div>
                        </div>
                        <Link href={`/${shop.slug}/settings/team`} className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[#0f766e] px-4 py-2 text-sm font-medium text-[#0f766e] transition hover:bg-[#d7f3ed] dark:text-teal-300">Manage team</Link>
                    </div>
                </section>

                <div className="flex justify-end pb-4">
                    <button type="submit" disabled={form.processing} className="inline-flex items-center gap-2 rounded-lg bg-[#0f766e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"><Save className="h-4 w-4" />{form.processing ? 'Saving…' : 'Save settings'}</button>
                </div>
            </form>
        </AdminLayout>
    );
}
