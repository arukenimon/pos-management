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
                            Get started.
                            <br />
                            Set up your shop in minutes.
                        </h2>
                        <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
                            Create your account to start tracking sales, managing
                            inventory, and growing your business.
                        </p>

                        <ul className="space-y-3 pt-4 text-sm leading-relaxed text-muted-foreground">
                            <li className="flex items-center gap-3">
                                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary text-xs text-foreground">
                                    1
                                </span>
                                Free to start, no credit card required
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary text-xs text-foreground">
                                    2
                                </span>
                                Unlimited products and sales
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary text-xs text-foreground">
                                    3
                                </span>
                                Invite your team anytime
                            </li>
                        </ul>
                    </div>

                    <div className="text-xs leading-relaxed text-muted-foreground">
                        &copy; {new Date().getFullYear()} TindaHub. All rights reserved.
                    </div>
                </div>

                {/* Form panel */}
                <main aria-labelledby="register-heading" className="flex items-center justify-center px-6 py-10 sm:px-12 lg:py-8">
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

                        <div className="mb-6">
                            <h1 id="register-heading" className="text-3xl font-semibold tracking-tight">
                                Create your account
                            </h1>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                Tell us a bit about yourself and your shop.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="name"
                                    className="text-foreground"
                                >
                                    Your name
                                </Label>
                                <div className="relative">
                                    <User aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Jane Doe"
                                        autoComplete="name"
                                        required
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        aria-invalid={!!errors.name}
                                        aria-describedby={errors.name ? 'name-error' : undefined}
                                        className="h-12 border-input/70 bg-card pl-10 shadow-none"
                                    />
                                </div>
                                {errors.name && (
                                    <p id="name-error" className="text-sm text-red-600 dark:text-red-400">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="shop_name"
                                    className="text-foreground"
                                >
                                    Shop name
                                </Label>
                                <div className="relative">
                                    <Store aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                                        aria-invalid={!!shopErr}
                                        aria-describedby={shopErr ? 'shop-name-hint shop-name-error' : 'shop-name-hint'}
                                        className="h-12 border-input/70 bg-card pl-10 shadow-none"
                                    />
                                </div>
                                <p id="shop-name-hint" className="text-sm leading-relaxed text-muted-foreground">
                                    This becomes your shop's unique URL identifier.
                                </p>
                                {shopErr && (
                                    <p id="shop-name-error" className="text-sm text-red-600 dark:text-red-400">
                                        {shopErr}
                                    </p>
                                )}
                            </div>

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
                                        required
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
                                <Label
                                    htmlFor="password"
                                    className="text-foreground"
                                >
                                    Password
                                </Label>
                                <div className="relative">
                                    <Lock aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="Create a password"
                                        autoComplete="new-password"
                                        required
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

                            <div className="space-y-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="text-foreground"
                                >
                                    Confirm password
                                </Label>
                                <div className="relative">
                                    <Lock aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="password_confirmation"
                                        type={showConfirm ? 'text' : 'password'}
                                        name="password_confirmation"
                                        placeholder="Re-enter your password"
                                        autoComplete="new-password"
                                        required
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        aria-invalid={!!errors.password_confirmation}
                                        aria-describedby={errors.password_confirmation ? 'password-confirmation-error' : undefined}
                                        className="h-12 border-input/70 bg-card pl-10 pr-12 shadow-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((v) => !v)}
                                        className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-inset"
                                        aria-controls="password_confirmation"
                                        aria-pressed={showConfirm}
                                        aria-label={
                                            showConfirm
                                                ? 'Hide confirmed password'
                                                : 'Show confirmed password'
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
                                    <p id="password-confirmation-error" className="text-sm text-red-600 dark:text-red-400">
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-12 w-full text-sm font-semibold shadow-none"
                            >
                                {processing ? 'Creating account...' : 'Create account'}
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-sm leading-relaxed text-muted-foreground">
                            Already have an account?{' '}
                            <Link
                                href={route('login')}
                                className="rounded-sm font-medium text-accent-foreground underline-offset-4 hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </main>
            </div>
        </>
    );
}
