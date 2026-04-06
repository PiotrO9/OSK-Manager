import { jwtVerify } from 'jose';
import type { H3Event } from 'h3';

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
);

/**
 * Tryb lokalny: weryfikuje access_token bez wymuszania roli MANAGER.
 */
export async function requireAuthenticatedFromCookie(
    event: H3Event,
): Promise<void> {
    const accessToken = getCookie(event, 'access_token');

    if (!accessToken) {
        throwIfUnauthorized();
    }

    try {
        await jwtVerify(accessToken, SECRET);
    } catch {
        throwIfUnauthorized();
    }
}

function throwIfUnauthorized(): never {
    throw createError({
        statusCode: 401,
        message: 'Brak tokena dostępu lub nieprawidłowy token',
    });
}
