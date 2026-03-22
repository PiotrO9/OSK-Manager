import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
);

export default defineEventHandler(async (event) => {
    const accessToken = getCookie(event, 'access_token');

    if (!accessToken) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    try {
        const { payload } = await jwtVerify(accessToken, SECRET);

        const mockUsers: Record<string, { userName: string; email: string }> = {
            '1': { userName: 'Test User', email: 'test@test.com' },
            '2': { userName: 'Admin User', email: 'admin@admin.com' },
        };

        const userId = payload.userId as string;
        const user = mockUsers[userId] || {
            userName: payload.userName as string,
            email: payload.email as string,
        };

        return {
            accessToken,
            user: {
                id: userId,
                userName: user.userName,
                email: user.email,
            },
        };
    } catch {
        deleteCookie(event, 'access_token');
        deleteCookie(event, 'refresh_token');

        throw createError({
            statusCode: 401,
            message: 'Nieprawidłowy lub wygasły token',
        });
    }
});
