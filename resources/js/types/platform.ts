export interface PlatformShop {
    id: number;
    name: string;
    slug: string;
    created_at: string;
    suspended_at: string | null;
    members_count?: number;
}

export interface PlatformUser {
    id: number;
    name: string;
    email: string;
    created_at: string;
    email_verified_at: string | null;
    suspended_at: string | null;
    is_super_admin: boolean;
    shops_count?: number;
    shop_role?: string;
}

export interface AuditEntry {
    id: number;
    actor: { id?: number; name: string; email?: string };
    target: { id: number; name: string; email?: string; slug?: string };
    target_type: 'shop' | 'user';
    target_id: number;
    action: string;
    reason: string;
    before_state: Record<string, string | boolean>;
    after_state: Record<string, string | boolean>;
    created_at: string;
}

export interface Paginated<T> {
    data: T[];
    from: number | null;
    to: number | null;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export type PlatformFilters = Record<string, string | null | undefined>;
