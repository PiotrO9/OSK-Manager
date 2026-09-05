import { SignJWT, jwtVerify } from 'jose';
import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import {
    clearSessionCookies,
    setAccessTokenCookie,
} from '~~/server/utils/upstream/upstreamCookies';

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
);

export default defineEventHandler(async (event) => {
    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) => bffUpstreamRefresh(event, upstreamBase),
        mock: async () => {
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
                    {
                        email: string;
                        firstName: string;
                        lastName: string;
                        role: string;
                    }
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
                    '3': {
                        email: 'manager001@post.pl',
                        firstName: 'Jan',
                        lastName: 'Kierownik',
                        role: 'MANAGER',
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

                setAccessTokenCookie(event, accessToken, accessTokenExpiresIn);

                return {
                    success: true,
                    data: {},
                };
            } catch {
                clearSessionCookies(event);

                throw createError({
                    statusCode: 401,
                    message: 'Nieprawidłowy lub wygasły refresh token',
                });
            }
        },
    });
});
