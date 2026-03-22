import { SignJWT } from 'jose';

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
);

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    if (!body.email || !body.password) {
        throw createError({
            statusCode: 400,
            message: 'Email i hasło są wymagane',
        });
    }

    const mockUsers = [
        {
            email: 'test@test.com',
            password: 'test123',
            id: '1',
            userName: 'Test User',
        },
        {
            email: 'admin@admin.com',
            password: 'admin123',
            id: '2',
            userName: 'Admin User',
        },
    ];

    const user = mockUsers.find(
        (u) => u.email === body.email && u.password === body.password,
    );

    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Nieprawidłowy email lub hasło',
        });
    }

    const now = Math.floor(Date.now() / 1000);
    const accessTokenExpiresIn = 60 * 60;
    const refreshTokenExpiresIn = 60 * 60 * 24 * 7;

    const accessToken = await new SignJWT({
        userId: user.id,
        userName: user.userName,
        email: user.email,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(now)
        .setExpirationTime(now + accessTokenExpiresIn)
        .sign(SECRET);

    const refreshToken = await new SignJWT({
        userId: user.id,
        type: 'refresh',
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(now)
        .setExpirationTime(now + refreshTokenExpiresIn)
        .sign(SECRET);

    setCookie(event, 'access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: accessTokenExpiresIn,
        path: '/',
    });

    setCookie(event, 'refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: refreshTokenExpiresIn,
        path: '/',
    });

    return {
        accessToken,
        user: {
            id: user.id,
            userName: user.userName,
            email: user.email,
        },
    };
});
