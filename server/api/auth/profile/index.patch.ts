import { jwtVerify } from 'jose';
import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { mockUserAvatarGetUrl } from '~~/server/utils/auth/mockUserAvatarStore';
import {
    bffUpstreamProfilePatch,
    type BffAuthUserResponse,
} from '~~/server/utils/auth/authUpstreamBff';

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
);

const NAME_MAX_LEN = 100;

interface ProfilePatchResponse {
    success: true;
    data: { user: BffAuthUserResponse };
}

function roleAllowsProfileNames(roleRaw: string): boolean {
    const r = roleRaw.trim().toUpperCase();

    return r === 'MANAGER' || r === 'ADMIN';
}

function isNonEmptyTrimmedString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

export default defineEventHandler(async (event) => {
    const rawBody = await readBody(event);

    if (!rawBody || typeof rawBody !== 'object') {
        throw createError({
            statusCode: 400,
            message: 'Brak treści żądania',
        });
    }

    const source = rawBody as Record<string, unknown>;

    const bodyKeys = new Set<string>();

    if (Object.prototype.hasOwnProperty.call(source, 'firstName')) {
        bodyKeys.add('firstName');
    }

    if (Object.prototype.hasOwnProperty.call(source, 'lastName')) {
        bodyKeys.add('lastName');
    }

    if (Object.prototype.hasOwnProperty.call(source, 'phone')) {
        bodyKeys.add('phone');
    }

    if (Object.prototype.hasOwnProperty.call(source, 'bio')) {
        bodyKeys.add('bio');
    }

    const patch: Record<string, string | null> = {};

    if (bodyKeys.has('firstName')) {
        const v = source.firstName;

        if (v !== null && v !== undefined && typeof v !== 'string') {
            throw createError({
                statusCode: 400,
                message: 'Nieprawidłowy format pola firstName',
            });
        }

        if (typeof v === 'string') {
            const t = v.trim();

            if (t.length > NAME_MAX_LEN) {
                throw createError({
                    statusCode: 400,
                    message: `Imię może mieć co najwyżej ${NAME_MAX_LEN} znaków`,
                });
            }

            patch.firstName = t.length > 0 ? t : '';
        }
    }

    if (bodyKeys.has('lastName')) {
        const v = source.lastName;

        if (v !== null && v !== undefined && typeof v !== 'string') {
            throw createError({
                statusCode: 400,
                message: 'Nieprawidłowy format pola lastName',
            });
        }

        if (typeof v === 'string') {
            const t = v.trim();

            if (t.length > NAME_MAX_LEN) {
                throw createError({
                    statusCode: 400,
                    message: `Nazwisko może mieć co najwyżej ${NAME_MAX_LEN} znaków`,
                });
            }

            patch.lastName = t.length > 0 ? t : '';
        }
    }

    if (bodyKeys.has('phone')) {
        const v = source.phone;

        if (v !== null && v !== undefined && typeof v !== 'string') {
            throw createError({
                statusCode: 400,
                message: 'Nieprawidłowy format pola phone',
            });
        }

        patch.phone =
            v === null
                ? null
                : typeof v === 'string' && v.trim().length > 0
                  ? v.trim()
                  : null;
    }

    if (bodyKeys.has('bio')) {
        const v = source.bio;

        if (v !== null && v !== undefined && typeof v !== 'string') {
            throw createError({
                statusCode: 400,
                message: 'Nieprawidłowy format pola bio',
            });
        }

        patch.bio =
            v === null
                ? null
                : typeof v === 'string' && v.trim().length > 0
                  ? v.trim()
                  : null;
    }

    if (Object.keys(patch).length === 0) {
        throw createError({
            statusCode: 400,
            message:
                'Wymagane jest co najmniej jedno pole: bio, phone, firstName, lastName',
        });
    }

    const triesNames =
        Object.prototype.hasOwnProperty.call(patch, 'firstName') ||
        Object.prototype.hasOwnProperty.call(patch, 'lastName');

    return executeBffAdapter<ProfilePatchResponse>(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamProfilePatch(event, upstreamBase, patch),
        mock: async () => {
            const accessToken = getCookie(event, 'access_token');

            if (!accessToken) {
                throw createError({
                    statusCode: 401,
                    message: 'Brak tokena dostępu',
                });
            }

            try {
                const { payload } = await jwtVerify(accessToken, SECRET);

                const userId = String(payload.userId ?? '');
                const email = String(payload.email ?? '');
                let firstName = String(payload.firstName ?? '');
                let lastName = String(payload.lastName ?? '');
                const role = String(payload.role ?? 'STUDENT');
                let phone: string | null = null;
                let bio: string | null = null;

                if (!userId || !email) {
                    throw createError({
                        statusCode: 401,
                        message: 'Nieprawidłowy token',
                    });
                }

                if (triesNames && !roleAllowsProfileNames(role)) {
                    throw createError({
                        statusCode: 403,
                        statusMessage:
                            'Brak uprawnień do edycji imienia i nazwiska (wymagana rola MANAGER lub ADMIN).',
                    });
                }

                if ('firstName' in patch) {
                    const v = patch.firstName;

                    if (!isNonEmptyTrimmedString(v)) {
                        throw createError({
                            statusCode: 400,
                            message: 'Imię nie może być puste',
                        });
                    }

                    firstName = String(v).trim();
                }

                if ('lastName' in patch) {
                    const v = patch.lastName;

                    if (!isNonEmptyTrimmedString(v)) {
                        throw createError({
                            statusCode: 400,
                            message: 'Nazwisko nie może być puste',
                        });
                    }

                    lastName = String(v).trim();
                }

                if ('phone' in patch) {
                    phone = patch.phone ?? null;
                }

                if ('bio' in patch) {
                    bio = patch.bio ?? null;
                }

                const nameFromParts = [firstName, lastName]
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0)
                    .join(' ')
                    .trim();

                const nowIso = new Date().toISOString();

                return {
                    success: true,
                    data: {
                        user: {
                            id: userId,
                            name: nameFromParts || email,
                            firstName,
                            lastName,
                            email,
                            phone,
                            bio,
                            profileUpdatedAt: nowIso,
                            avatarUrl: mockUserAvatarGetUrl(userId),
                            role,
                        },
                    },
                };
            } catch (err: unknown) {
                if (
                    err &&
                    typeof err === 'object' &&
                    'statusCode' in err &&
                    typeof (err as { statusCode: unknown }).statusCode ===
                        'number'
                ) {
                    throw err;
                }

                throw createError({
                    statusCode: 401,
                    message: 'Nieprawidłowy lub wygasły token',
                });
            }
        },
    });
});
