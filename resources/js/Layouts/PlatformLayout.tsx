import { PropsWithChildren, ReactNode } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function PlatformLayout({ children, header }: PropsWithChildren<{ header?: ReactNode }>) {
    return <AdminLayout platform header={header}>{children}</AdminLayout>;
}
