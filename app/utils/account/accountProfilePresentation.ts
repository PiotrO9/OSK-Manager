import type { StatusTone } from '~/types/ui';
import { normalizeAuthRole } from '~/utils/auth/authRole';

export interface AccountRolePresentation {
    label: string;
    tone: StatusTone;
}

export function getAccountRolePresentation(
    role: string | null | undefined,
): AccountRolePresentation {
    switch (normalizeAuthRole(role)) {
        case 'STUDENT':
            return { label: 'Kursant', tone: 'neutral' };
        case 'INSTRUCTOR':
            return { label: 'Instruktor', tone: 'success' };
        case 'MANAGER':
            return { label: 'Manager', tone: 'info' };
        case 'ADMIN':
            return { label: 'Administrator', tone: 'warning' };
        case 'DEMO':
            return { label: 'Tryb demo', tone: 'warning' };
        default:
            return {
                label: role?.trim() || 'Nieznana rola',
                tone: 'neutral',
            };
    }
}

export function formatAccountProfileField(
    value: string | null | undefined,
): string {
    if (value === null || value === undefined || value.trim() === '') {
        return '—';
    }

    return value.trim();
}

export function getAccountUserInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) return 'U';

    if (parts.length === 1) return (parts[0] ?? '').slice(0, 2).toUpperCase();

    const first = parts[0]?.[0] ?? '';
    const last = parts.at(-1)?.[0] ?? '';

    return `${first}${last}`.toUpperCase() || 'U';
}

export function hasAccountPkkNumber(
    value: string | null | undefined,
): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}
