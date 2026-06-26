import { jwtVerify } from 'jose';
import type { H3Event } from 'h3';

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
);

/**
 * Tryb lokalny (bez NUXT_API_UPSTREAM): ważny access_token — dowolna rola.
 */
export async function requireAuthUserIdFromCookie(
    event: H3Event,
): Promise<string> {
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

        if (!userId) {
            throw createError({
                statusCode: 401,
                message: 'Nieprawidłowy token',
            });
        }

        return userId;
    } catch (err: unknown) {
        if (
            err &&
            typeof err === 'object' &&
            'statusCode' in err &&
            typeof (err as { statusCode: unknown }).statusCode === 'number'
        ) {
            throw err;
        }

        throw createError({
            statusCode: 401,
            message: 'Nieprawidłowy lub wygasły token',
        });
    }
}
