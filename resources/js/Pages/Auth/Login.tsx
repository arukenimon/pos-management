import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
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

            <div className="auth-page grid min-h-screen bg-background text-foreground lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                {/* Brand panel */}
                <div className="hidden flex-col justify-between border-r border-border/70 bg-card/70 p-12 lg:flex xl:p-16">
                    <a href="/" className="flex w-fit items-center gap-3 rounded-md">
                        <img
                            src="/favicon.svg"
                            alt=""
                            aria-hidden="true"
                            className="h-10 w-10 rounded-xl"
                        />
                        <span className="text-lg font-semibold tracking-tight">TindaHub</span>
                    </a>

                    <div className="max-w-md space-y-5 py-12">
                        <h2 className="text-4xl font-semibold leading-tight tracking-tight">
                            Welcome back.
                            <br />
                            Run your shop smarter.
                        </h2>
                        <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
                            Track sales, manage inventory, and grow your
                            business — all from one dashboard.
                        </p>
                    </div>

                    <div className="text-xs leading-relaxed text-muted-foreground">
                        &copy; {new Date().getFullYear()} TindaHub. All rights reserved.
                    </div>
                </div>

                {/* Form panel */}
                <main aria-labelledby="sign-in-heading" className="flex items-center justify-center px-6 py-12 sm:px-12">
                    <div className="w-full max-w-md xl:max-w-[25rem]">
                        <a
                            href="/"
                            className="mb-10 inline-flex items-center gap-3 rounded-md lg:hidden"
                        >
                            <img
                                src="/favicon.svg"
                                alt=""
                                aria-hidden="true"
                                className="h-10 w-10 rounded-xl"
                            />
                            <span className="text-lg font-semibold tracking-tight">
                                TindaHub
                            </span>
                        </a>

                        <div className="mb-8">
                            <h1 id="sign-in-heading" className="text-3xl font-semibold tracking-tight">
                                Sign in
                            </h1>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                Enter your credentials to access your account.
                            </p>
                        </div>

                        {status && (
                            <div role="status" className="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-300">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-foreground"
                                >
                                    Email
                                </Label>
                                <div className="relative">
                                    <Mail aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        autoComplete="username"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        aria-invalid={!!errors.email}
                                        aria-describedby={errors.email ? 'email-error' : undefined}
                                        className="h-12 border-input/70 bg-card pl-10 shadow-none"
                                    />
                                </div>
                                {errors.email && (
                                    <p id="email-error" className="text-sm text-red-600 dark:text-red-400">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <Label
                                        htmlFor="password"
                                        className="text-foreground"
                                    >
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="rounded-sm text-sm font-medium text-accent-foreground underline-offset-4 hover:underline"
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        aria-invalid={!!errors.password}
                                        aria-describedby={errors.password ? 'password-error' : undefined}
                                        className="h-12 border-input/70 bg-card pl-10 pr-12 shadow-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-inset"
                                        aria-controls="password"
                                        aria-pressed={showPassword}
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
                                    <p id="password-error" className="text-sm text-red-600 dark:text-red-400">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2.5">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    className="border-input bg-card shadow-none"
                                    checked={data.remember}
                                    onCheckedChange={(checked) =>
                                        setData(
                                            'remember',
                                            (!!checked || false) as false,
                                        )
                                    }
                                />
                                <label htmlFor="remember" className="cursor-pointer py-1 text-sm text-muted-foreground">
                                    Remember me
                                </label>
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-12 w-full text-sm font-semibold shadow-none"
                            >
                                {processing ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </form>

                        <p className="mt-8 text-center text-sm leading-relaxed text-muted-foreground">
                            Don't have an account?{' '}
                            <Link
                                href={route('register')}
                                className="rounded-sm font-medium text-accent-foreground underline-offset-4 hover:underline"
                            >
                                Create one
                            </Link>
                        </p>
                    </div>
                </main>
            </div>
        </>
    );
}
