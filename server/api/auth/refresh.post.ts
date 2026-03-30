import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
);

export default defineEventHandler(async (event) => {
    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamRefresh(event, upstream);
    }

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

        const userId = String(payload.userId);

        const profileDefaults: Record<
            string,
            { email: string; firstName: string; lastName: string; role: string }
        > = {
            '1': {
                email: 'test@test.com',
                firstName: 'Test',
                lastName: 'User',
                role: 'STUDENT',
            },
            '2': {
                email: 'admin@admin.com',
                firstName: 'Admin',
                lastName: 'User',
                role: 'ADMIN',
            },
        };

        const p = profileDefaults[userId] ?? {
            email: 'user@example.com',
            firstName: 'User',
            lastName: '',
            role: 'STUDENT',
        };

        const accessToken = await new SignJWT({
            userId,
            email: p.email,
            firstName: p.firstName,
            lastName: p.lastName,
            role: p.role,
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
            success: true,
            data: {},
        };
    } catch {
        deleteCookie(event, 'access_token', { path: '/' });
        deleteCookie(event, 'refresh_token', { path: '/' });

        throw createError({
            statusCode: 401,
            message: 'Nieprawidłowy lub wygasły refresh token',
        });
    }
});
