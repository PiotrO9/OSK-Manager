import type { BackendUserResponse } from '~/utils/auth/authSessionApi';

export interface AuthProfilePatchBody {
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    bio?: string | null;
}

export interface AuthDrivingSchoolSummary {
    id: string;
    name: string;
    city: string | null;
    address: string | null;
}

export interface AuthSession {
    userName: string;
    userId: string;
    email?: string;
    role?: string;
    avatarUrl?: string | null;
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    bio?: string | null;
    profileUpdatedAt?: string | null;
    pkkNumber?: string | null;
    drivingSchools: AuthDrivingSchoolSummary[];
    defaultOskId: string | null;
}

interface SessionUserPayload {
    id: string;
    userName: string;
    email: string;
    role?: string;
    avatarUrl?: string | null;
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    bio?: string | null;
    profileUpdatedAt?: string | null;
    pkkNumber?: string | null;
    drivingSchools: AuthDrivingSchoolSummary[];
    defaultOskId: string | null;
}

function normalizeDrivingSchoolsFromBackend(
    raw: unknown,
): AuthDrivingSchoolSummary[] {
    if (!Array.isArray(raw)) return [];

    const out: AuthDrivingSchoolSummary[] = [];

    for (const item of raw) {
        if (!item || typeof item !== 'object') continue;

        const o = item as Record<string, unknown>;
        const id = typeof o.id === 'string' ? o.id.trim() : '';
        const name = typeof o.name === 'string' ? o.name.trim() : '';

        if (!id || !name) continue;

        function readOptStringNull(key: string): string | null {
            if (!Object.prototype.hasOwnProperty.call(o, key)) return null;

            const v = o[key];

            if (v === null || v === undefined) return null;

            const t = String(v).trim();

            return t.length > 0 ? t : null;
        }

        out.push({
            id,
            name,
            city: readOptStringNull('city'),
            address: readOptStringNull('address'),
        });
    }

    return out;
}

function normalizeDefaultPkFromBackend(raw: unknown): string | null {
    if (raw === null || raw === undefined) return null;

    const t = String(raw).trim();

    return t.length > 0 ? t : null;
}

function optionalString(
    value: string | null | undefined,
): string | null | undefined {
    if (value === undefined) return undefined;

    if (value === null) return null;

    const t = String(value).trim();

    return t.length > 0 ? t : null;
}

export function normalizeBackendUserToSessionPayload(
    user: BackendUserResponse,
): SessionUserPayload {
    const nameFromApi = typeof user.name === 'string' ? user.name.trim() : '';

    let userName = nameFromApi;

    if (!userName) {
        const display = [user.firstName, user.lastName]
            .map((s) => String(s || '').trim())
            .filter(Boolean)
            .join(' ')
            .trim();

        userName = display || user.email;
    }

    let avatarUrl: string | null | undefined;

    if (Object.prototype.hasOwnProperty.call(user, 'avatarUrl')) {
        const raw = user.avatarUrl;

        if (raw === null || raw === undefined || String(raw).trim() === '') {
            avatarUrl = null;
        } else {
            avatarUrl = String(raw).trim();
        }
    }

    return {
        id: user.id,
        email: user.email,
        userName,
        role: user.role,
        avatarUrl,
        firstName: optionalString(user.firstName) ?? undefined,
        lastName: optionalString(user.lastName) ?? undefined,
        phone:
            user.phone === undefined ? undefined : optionalString(user.phone),
        bio: user.bio === undefined ? undefined : optionalString(user.bio),
        profileUpdatedAt:
            typeof user.profileUpdatedAt === 'string' &&
            user.profileUpdatedAt.trim().length > 0
                ? user.profileUpdatedAt.trim()
                : user.profileUpdatedAt === null
                  ? null
                  : undefined,
        pkkNumber: Object.prototype.hasOwnProperty.call(user, 'pkkNumber')
            ? optionalString(user.pkkNumber)
            : undefined,
        drivingSchools: normalizeDrivingSchoolsFromBackend(user.drivingSchools),
        defaultOskId: Object.prototype.hasOwnProperty.call(user, 'defaultOskId')
            ? normalizeDefaultPkFromBackend(user.defaultOskId)
            : null,
    };
}

export function createSessionFromUser(user: SessionUserPayload): AuthSession {
    return {
        userId: user.id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        bio: user.bio,
        profileUpdatedAt: user.profileUpdatedAt,
        pkkNumber: user.pkkNumber,
        drivingSchools: user.drivingSchools,
        defaultOskId: user.defaultOskId,
    };
}

export function createAuthSessionFromBackendUser(
    user: BackendUserResponse,
): AuthSession {
    return createSessionFromUser(normalizeBackendUserToSessionPayload(user));
}

export function buildAuthProfilePatchPayload(
    body: AuthProfilePatchBody,
): Record<string, string | null> {
    const out: Record<string, string | null> = {};

    if (Object.prototype.hasOwnProperty.call(body, 'firstName')) {
        out.firstName =
            typeof body.firstName === 'string' ? body.firstName.trim() : '';
    }

    if (Object.prototype.hasOwnProperty.call(body, 'lastName')) {
        out.lastName =
            typeof body.lastName === 'string' ? body.lastName.trim() : '';
    }

    if (Object.prototype.hasOwnProperty.call(body, 'phone')) {
        const p = body.phone;

        if (p === null || p === undefined) {
            out.phone = null;
        } else {
            const t = String(p).trim();

            out.phone = t.length > 0 ? t : null;
        }
    }

    if (Object.prototype.hasOwnProperty.call(body, 'bio')) {
        const b = body.bio;

        if (b === null || b === undefined) {
            out.bio = null;
        } else {
            const t = String(b).trim();

            out.bio = t.length > 0 ? t : null;
        }
    }

    return out;
}
