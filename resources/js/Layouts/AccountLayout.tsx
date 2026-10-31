import { PropsWithChildren } from 'react';
import { ArrowLeft } from 'lucide-react';
import AuthBrandPanel from '@/Components/AuthBrandPanel';
import Brand from '@/Components/Brand';

export default function AccountLayout({ children, registering = false }: PropsWithChildren<{ registering?: boolean }>) {
    return <div className="auth-page grid min-h-screen bg-background text-foreground lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <AuthBrandPanel registering={registering} />
        <main className="relative flex min-w-0 flex-col px-6 py-7 sm:px-12 lg:px-14">
            <div className="flex items-center justify-between gap-4">
                <a href="/" className="rounded-lg lg:hidden" aria-label="TindaHub home"><Brand /></a>
                <a href="/" className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-lg text-xs text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" />Back to home</a>
            </div>
            <div className="mx-auto flex w-full max-w-[25rem] flex-1 flex-col justify-center py-10 lg:py-12">{children}</div>
            <p className="text-center text-[11px] text-muted-foreground">&copy; {new Date().getFullYear()} TindaHub. Your shop, connected.</p>
        </main>
    </div>;
}
