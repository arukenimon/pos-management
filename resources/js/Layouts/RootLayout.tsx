import { usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";


export default function RootLayout({ children }: { children: React.ReactNode }) {
    const { flash } = usePage().props;
    useEffect(() => {
        if (flash.success) {
            toast.success(flash?.success);
        }
        if (flash.error) {
            toast.error(flash?.error);
        }
    }, [flash.success, flash.error]);

    return (
        <>
            <ToastContainer />
            {children}
        </>
    );
}