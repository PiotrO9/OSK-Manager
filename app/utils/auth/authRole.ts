export const AUTH_ROLES = [
    'ADMIN',
    'MANAGER',
    'INSTRUCTOR',
    'STUDENT',
    'DEMO',
] as const;

export type AuthRole = (typeof AUTH_ROLES)[number];

const AUTH_ROLE_SET = new Set<string>(AUTH_ROLES);

export function normalizeAuthRole(raw: unknown): AuthRole | null {
    if (typeof raw !== 'string') {
        return null;
    }

    const role = raw.trim().toUpperCase();

    return AUTH_ROLE_SET.has(role) ? (role as AuthRole) : null;
}

export function isAuthRole(raw: unknown, role: AuthRole): boolean {
    return normalizeAuthRole(raw) === role;
}
