import { ComponentType } from 'react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
    label: string;
    value: string | number;
    detail?: string;
    icon: ComponentType<{ className?: string }>;
    className?: string;
}

export default function MetricCard({ label, value, detail, icon: Icon, className }: MetricCardProps) {
    return <div className={cn('dashboard-card metric-card p-5', className)}>
        <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <Icon className="h-4 w-4 shrink-0 text-accent-foreground" />
        </div>
        <p className="mt-4 break-words text-[clamp(1.25rem,1.8vw,1.75rem)] font-semibold leading-tight tracking-tight tabular-nums text-foreground">{value}</p>
        {detail && <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{detail}</p>}
    </div>;
}
