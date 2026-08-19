export const AUTH_ROLES = [
    'ADMIN',
    'MANAGER',
    'INSTRUCTOR',
    'STUDENT',
    'DEMO',
] as const;

export type AuthRole = (typeof AUTH_ROLES)[number];

export const MANAGER_ACCESS_ROLES = ['ADMIN', 'MANAGER'] as const;
export const MANAGER_OR_INSTRUCTOR_ACCESS_ROLES = [
    'ADMIN',
    'MANAGER',
    'INSTRUCTOR',
] as const;
export const STUDENT_OR_INSTRUCTOR_ACCESS_ROLES = [
    'STUDENT',
    'INSTRUCTOR',
] as const;

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

export function canAccessRole(
    raw: unknown,
    allowedRoles: readonly AuthRole[],
): boolean {
    const role = normalizeAuthRole(raw);

    return role !== null && allowedRoles.includes(role);
}

export function hasManagerAccess(raw: unknown): boolean {
    return canAccessRole(raw, MANAGER_ACCESS_ROLES);
}

export function hasManagerOrInstructorAccess(raw: unknown): boolean {
    return canAccessRole(raw, MANAGER_OR_INSTRUCTOR_ACCESS_ROLES);
}

export function hasStudentOrInstructorAccess(raw: unknown): boolean {
    return canAccessRole(raw, STUDENT_OR_INSTRUCTOR_ACCESS_ROLES);
}
