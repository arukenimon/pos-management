import { cn } from '@/lib/utils';

export default function Brand({ className = '', compact = false }: { className?: string; compact?: boolean }) {
    return <span className={cn('brand-lockup inline-flex shrink-0 items-center gap-2.5', className)}>
        <img src="/favicon.svg" width="34" height="34" alt="" aria-hidden="true" className="h-[34px] w-[34px] rounded-[10px]" />
        {!compact && <span className="font-display text-[23px] font-bold tracking-[-0.045em] text-foreground">TindaHub<span className="text-primary">.</span></span>}
    </span>;
}
