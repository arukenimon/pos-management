import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-[#f8fbf8] px-4 pt-10 sm:justify-center sm:pt-0">
            <div className="mb-2 flex items-center gap-3">
                <Link href="/" className="flex items-center gap-3 text-[#102a2a]">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 p-2 shadow-sm">
                        <ApplicationLogo className="h-full w-full fill-current text-white" />
                    </span>
                    <span className="text-lg font-bold tracking-tight">POS</span>
                </Link>
            </div>

            <div className="mt-4 w-full overflow-hidden rounded-xl border border-[#d9e8e5] bg-white px-6 py-7 shadow-[0_18px_45px_rgba(16,42,42,0.08)] sm:max-w-md sm:px-8">
                {children}
            </div>
        </div>
    );
}
