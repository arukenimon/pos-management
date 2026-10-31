import { PropsWithChildren } from 'react';
import AccountLayout from '@/Layouts/AccountLayout';

export default function Guest({ children }: PropsWithChildren) {
    return <AccountLayout>{children}</AccountLayout>;
}
