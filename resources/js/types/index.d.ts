export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export interface Shop {
    id: number;
    name: string;
    slug: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
        shopRole: 'owner' | 'manager' | 'cashier' | null;
    };
    currentShop: Shop | null;
    url: string;
    flash: {
        success?: string;
        error?: string;
    };
};
