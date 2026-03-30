import { jwtVerify } from 'jose';

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

        return {
            success: true,
            data: {
                user: {
                    id: userId,
                    email,
                    firstName,
                    lastName,
                    role,
                    phone: null as string | null,
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
