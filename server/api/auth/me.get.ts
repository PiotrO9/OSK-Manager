import { jwtVerify } from 'jose';
import { mockUserAvatarGetUrl } from '~~/server/utils/auth/mockUserAvatarStore';

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
);

export default defineEventHandler(async (event) => {
    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamMe(event, upstream);
    }

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
        const firstName = String(payload.firstName ?? '');
        const lastName = String(payload.lastName ?? '');
        const role = String(payload.role ?? 'STUDENT');

        if (!userId || !email) {
            throw createError({
                statusCode: 401,
                message: 'Nieprawidłowy token',
            });
        }

        const nameFromParts = [firstName, lastName]
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
            .join(' ')
            .trim();

        const avatarFromMock = mockUserAvatarGetUrl(userId);

        return {
            success: true,
            data: {
                user: {
                    id: userId,
                    name: nameFromParts || email,
                    firstName: firstName || '',
                    lastName: lastName || '',
                    email,
                    phone: null as string | null,
                    bio: null as string | null,
                    profileUpdatedAt: null as string | null,
                    pkkNumber:
                        role.trim().toUpperCase() === 'STUDENT'
                            ? (null as string | null)
                            : undefined,
                    avatarUrl: avatarFromMock,
                    role,
                    drivingSchools: [],
                    defaultOskId: null as string | null,
                },
            },
        };
    } catch (err: unknown) {
        deleteCookie(event, 'access_token', { path: '/' });
        const code =
            err && typeof err === 'object' && 'code' in err
                ? String((err as { code: unknown }).code)
                : '';

        /*
         * Wygasły access: zostaw refresh — klient wywoła POST /api/auth/refresh.
         * Zły podpis itd.: czyść oba.
         */
        if (code !== 'ERR_JWT_EXPIRED') {
            deleteCookie(event, 'refresh_token', { path: '/' });
        }

        throw createError({
            statusCode: 401,
            message: 'Nieprawidłowy lub wygasły token',
        });
    }
});
