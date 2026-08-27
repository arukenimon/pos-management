import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Eye,
    EyeOff,
    Lock,
    Mail,
    Store,
    User,
} from 'lucide-react';
import { FormEventHandler, useState } from 'react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        shop_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const shopErr = (errors as Record<string, string>).shop_name;

    return (
        <>
            <Head title="Register" />

            <div className="grid min-h-screen bg-[#f8fbf8] dark:bg-gray-950 lg:grid-cols-2">
                {/* Brand panel */}
                <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#103f3c] via-indigo-700 to-[#0f766e] p-12 text-white lg:flex">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 translate-x-1/4 translate-y-1/4 rounded-full bg-indigo-400/30 blur-3xl"
                    />

                    <a href="/" className="relative z-10 flex items-center gap-3">
                        <img
                            src="/favicon.svg"
                            alt=""
                            aria-hidden="true"
                            className="h-10 w-10 rounded-xl"
                        />
                        <span className="text-lg font-semibold tracking-tight">TindaHub</span>
                    </a>

                    <div className="relative z-10 max-w-md space-y-6">
                        <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight">
                            Get started.
                            <br />
                            Set up your shop in minutes.
                        </h1>
                        <p className="text-base leading-relaxed text-indigo-100/90">
                            Create your account to start tracking sales, managing
                            inventory, and growing your business.
                        </p>

                        <ul className="space-y-3 pt-4 text-sm text-indigo-100/90">
                            <li className="flex items-center gap-3">
                                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/15 text-xs">
                                    1
                                </span>
                                Free to start, no credit card required
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/15 text-xs">
                                    2
                                </span>
                                Unlimited products and sales
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/15 text-xs">
                                    3
                                </span>
                                Invite your team anytime
                            </li>
                        </ul>
                    </div>

                    <div className="relative z-10 text-sm text-indigo-100/70">
                        &copy; {new Date().getFullYear()} TindaHub. All rights reserved.
                    </div>
                </div>

                {/* Form panel */}
                <div className="flex items-center justify-center px-6 py-12 sm:px-12">
                    <div className="w-full max-w-md">
                        <a
                            href="/"
                            className="mb-8 inline-flex items-center gap-2 lg:hidden"
                        >
                            <img
                                src="/favicon.svg"
                                alt=""
                                aria-hidden="true"
                                className="h-10 w-10 rounded-xl"
                            />
                            <span className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
                                TindaHub
                            </span>
                        </a>

                        <div className="mb-8">
                            <h2 className="text-3xl font-bold tracking-tight text-[#102a2a] dark:text-white">
                                Create your account
                            </h2>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Tell us a bit about yourself and your shop.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="name"
                                    className="text-gray-700 dark:text-gray-300"
                                >
                                    Your name
                                </Label>
                                <div className="relative">
                                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Jane Doe"
                                        autoComplete="name"
                                        autoFocus
                                        required
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        className="h-11 pl-9"
                                    />
                                </div>
                                {errors.name && (
                                    <p className="text-xs text-red-600 dark:text-red-400">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="shop_name"
                                    className="text-gray-700 dark:text-gray-300"
                                >
                                    Shop name
                                </Label>
                                <div className="relative">
                                    <Store className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="shop_name"
                                        name="shop_name"
                                        placeholder="My Awesome Shop"
                                        autoComplete="off"
                                        required
                                        value={data.shop_name}
                                        onChange={(e) =>
                                            setData('shop_name', e.target.value)
                                        }
                                        className="h-11 pl-9"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    This becomes your shop's unique URL identifier.
                                </p>
                                {shopErr && (
                                    <p className="text-xs text-red-600 dark:text-red-400">
                                        {shopErr}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-gray-700 dark:text-gray-300"
                                >
                                    Email
                                </Label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        autoComplete="username"
                                        required
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        className="h-11 pl-9"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-xs text-red-600 dark:text-red-400">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="password"
                                    className="text-gray-700 dark:text-gray-300"
                                >
                                    Password
                                </Label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        required
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        className="h-11 pl-9 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
                                        aria-label={
                                            showPassword
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-red-600 dark:text-red-400">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="text-gray-700 dark:text-gray-300"
                                >
                                    Confirm password
                                </Label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="password_confirmation"
                                        type={showConfirm ? 'text' : 'password'}
                                        name="password_confirmation"
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        required
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        className="h-11 pl-9 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
                                        aria-label={
                                            showConfirm
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                    >
                                        {showConfirm ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p className="text-xs text-red-600 dark:text-red-400">
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-11 w-full bg-indigo-600 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                            >
                                {processing ? 'Creating account...' : 'Create account'}
                            </Button>
                        </form>

                        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link
                                href={route('login')}
                                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
