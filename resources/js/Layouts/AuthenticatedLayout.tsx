import { PropsWithChildren, ReactNode } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Authenticated({ header, children }: PropsWithChildren<{ header?: ReactNode }>) {
    return <AdminLayout header={header}>{children}</AdminLayout>;
}
