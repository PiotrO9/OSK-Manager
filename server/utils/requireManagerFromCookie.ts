import { jwtVerify } from 'jose';
import type { H3Event } from 'h3';

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
);

/**
 * Tryb lokalny (bez NUXT_API_UPSTREAM): weryfikuje access_token i rolę MANAGER.
 */
export async function requireManagerFromCookie(event: H3Event): Promise<void> {
    const accessToken = getCookie(event, 'access_token');

    if (!accessToken) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    try {
        const { payload } = await jwtVerify(accessToken, SECRET);
        const role = String(payload.role ?? '');

        if (role !== 'MANAGER') {
            throw createError({
                statusCode: 403,
                message: 'Ta operacja wymaga roli MANAGER',
            });
        }

        return;
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
