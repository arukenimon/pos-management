import useToasts from "@/hooks/useToasts";
import { Head, Link, usePage } from "@inertiajs/react";
import { LogIn, LogOut, ShoppingCart, UserPlus } from "lucide-react";
import { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    const { user } = usePage().props.auth;
    const totalCartItems = 0;
    const totalCartValue = 0;

    // const { flash } = usePage().props;


    // useEffect(() => {
    //     if (flash?.success) {
    //         toast.success(flash?.success);
    //     }
    //     if (flash?.error) {
    //         toast.error(flash?.error);
    //     }
    // }, [flash])

    useToasts();

    return (
        <>
            <ToastContainer />
            <Head title="Sari-Sari Store Dashboard" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
                {/* Header */}
                <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
                    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
                        {/* Mobile Layout */}
                        <div className="flex flex-col gap-3 sm:hidden">
                            {/* Top row: Store name and Cart */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-xl font-bold">🏪 Sari-Sari Store</h1>
                                    <p className="text-blue-100 text-xs mt-0.5">Your neighborhood store</p>
                                </div>
                                <Link href={route('customer.checkout')} className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                    <ShoppingCart className="w-4 h-4" />
                                    <div className="text-right">
                                        <div className="text-xs font-semibold">{totalCartItems}</div>
                                        <div className="text-[10px]">₱{totalCartValue?.toFixed(2)}</div>
                                    </div>
                                </Link>
                            </div>
                            {/* Bottom row: User info or Auth buttons */}
                            <div className="flex items-center justify-end gap-2">
                                {user ? (
                                    <>
                                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm flex-1 min-w-0">
                                            <UserPlus className="w-4 h-4 flex-shrink-0" />
                                            <div className="text-left min-w-0 flex-1">
                                                <div className="text-xs font-semibold truncate">{user.name}</div>
                                                <div className="text-[10px]">Welcome back!</div>
                                            </div>
                                        </div>
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors text-xs font-semibold shadow-lg"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span className="hidden xs:inline">Logout</span>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="flex items-center gap-1.5 bg-white text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors text-xs font-semibold shadow-lg flex-1 justify-center"
                                        >
                                            <LogIn className="w-4 h-4" />
                                            Login
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="flex items-center gap-1.5 bg-white text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors text-xs font-semibold shadow-lg flex-1 justify-center"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden sm:flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">🏪 Sari-Sari Store</h1>
                                <p className="text-blue-100 mt-1 text-sm md:text-base">Your neighborhood store, now online!</p>
                            </div>
                            <div className="flex items-center gap-2 md:gap-4">
                                <Link href={route('customer.checkout')} className="flex items-center gap-2 bg-white/20 px-3 md:px-4 py-2 rounded-lg backdrop-blur-sm">
                                    <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                                    <div className="text-right">
                                        <div className="text-xs md:text-sm font-semibold">{totalCartItems} items</div>
                                        <div className="text-[10px] md:text-xs">₱{totalCartValue?.toFixed(2)}</div>
                                    </div>
                                </Link>
                                {user ? (
                                    <>
                                        <div className="flex items-center gap-2 bg-white/20 px-3 md:px-4 py-2 rounded-lg backdrop-blur-sm">
                                            <UserPlus className="w-5 h-5 md:w-6 md:h-6" />
                                            <div className="text-right">
                                                <div className="text-xs md:text-sm font-semibold truncate max-w-[120px]">{user.name}</div>
                                                <div className="text-[10px] md:text-xs">Welcome back!</div>
                                            </div>
                                        </div>
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="flex items-center gap-2 bg-red-500 text-white px-4 md:px-5 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm md:text-base font-semibold shadow-lg"
                                        >
                                            <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                                            Logout
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="flex items-center gap-2 bg-white text-blue-700 px-4 md:px-5 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm md:text-base font-semibold shadow-lg"
                                        >
                                            <LogIn className="w-4 h-4 md:w-5 md:h-5" />
                                            Login
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="flex items-center gap-2 bg-white text-blue-700 px-4 md:px-5 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm md:text-base font-semibold shadow-lg"
                                        >
                                            <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>
                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </main>
            </div>
        </>
    );
}