import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
);

export default defineEventHandler(async (event) => {
    const refreshToken = getCookie(event, 'refresh_token');

    if (!refreshToken) {
        throw createError({
            statusCode: 401,
            message: 'Brak refresh token',
        });
    }

    try {
        const { payload } = await jwtVerify(refreshToken, SECRET);

        if (payload.type !== 'refresh' || !payload.userId) {
            throw createError({
                statusCode: 401,
                message: 'Nieprawidłowy refresh token',
            });
        }

        const now = Math.floor(Date.now() / 1000);
        const accessTokenExpiresIn = 60 * 60;

        const mockUsers: Record<string, { userName: string; email: string }> = {
            '1': { userName: 'Test User', email: 'test@test.com' },
            '2': { userName: 'Admin User', email: 'admin@admin.com' },
        };

        const user = mockUsers[payload.userId as string] || {
            userName: 'User',
            email: 'user@example.com',
        };

        const accessToken = await new SignJWT({
            userId: payload.userId,
            userName: user.userName,
            email: user.email,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt(now)
            .setExpirationTime(now + accessTokenExpiresIn)
            .sign(SECRET);

        setCookie(event, 'access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: accessTokenExpiresIn,
            path: '/',
        });

        return {
            accessToken,
        };
    } catch {
        deleteCookie(event, 'access_token');
        deleteCookie(event, 'refresh_token');

        throw createError({
            statusCode: 401,
            message: 'Nieprawidłowy lub wygasły refresh token',
        });
    }
});
