import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Lock, Mail, Store } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login.store'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in" />

            <div className="grid min-h-screen bg-white dark:bg-gray-950 lg:grid-cols-2">
                {/* Brand panel */}
                <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-12 text-white lg:flex">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 translate-x-1/4 translate-y-1/4 rounded-full bg-purple-400/30 blur-3xl"
                    />

                    <a href="/" className="relative z-10 flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
                            <Store className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-semibold tracking-tight">POS</span>
                    </a>

                    <div className="relative z-10 max-w-md space-y-6">
                        <h1 className="text-4xl font-bold leading-tight tracking-tight">
                            Welcome back.
                            <br />
                            Run your shop smarter.
                        </h1>
                        <p className="text-base leading-relaxed text-indigo-100/90">
                            Track sales, manage inventory, and grow your
                            business — all from one dashboard.
                        </p>
                    </div>

                    <div className="relative z-10 text-sm text-indigo-100/70">
                        &copy; {new Date().getFullYear()} POS. All rights reserved.
                    </div>
                </div>

                {/* Form panel */}
                <div className="flex items-center justify-center px-6 py-12 sm:px-12">
                    <div className="w-full max-w-md">
                        <a
                            href="/"
                            className="mb-8 inline-flex items-center gap-2 lg:hidden"
                        >
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white">
                                <Store className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
                                POS
                            </span>
                        </a>

                        <div className="mb-8">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                                Sign in
                            </h2>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Enter your credentials to access your account.
                            </p>
                        </div>

                        {status && (
                            <div className="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-300">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
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
                                        autoFocus
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
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="text-gray-700 dark:text-gray-300"
                                    >
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
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

                            <label className="flex cursor-pointer items-center gap-2">
                                <Checkbox
                                    checked={data.remember}
                                    onCheckedChange={(checked) =>
                                        setData(
                                            'remember',
                                            (!!checked || false) as false,
                                        )
                                    }
                                />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Remember me
                                </span>
                            </label>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-11 w-full bg-indigo-600 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                            >
                                {processing ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </form>

                        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link
                                href={route('register')}
                                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
