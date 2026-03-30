import { SignJWT } from 'jose';

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
);

interface PublicUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phone: string | null;
}

const mockUsers: Array<{
    email: string;
    password: string;
    public: PublicUser;
}> = [
    {
        email: 'test@test.com',
        password: 'test123',
        public: {
            id: '1',
            email: 'test@test.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'STUDENT',
            phone: null,
        },
    },
    {
        email: 'admin@admin.com',
        password: 'admin123',
        public: {
            id: '2',
            email: 'admin@admin.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
            phone: null,
        },
    },
];

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    if (!body.email || !body.password) {
        throw createError({
            statusCode: 400,
            message: 'Email i hasło są wymagane',
        });
    }

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamLogin(event, upstream, body);
    }

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

    const pub = user.public;

    const accessToken = await new SignJWT({
        userId: pub.id,
        email: pub.email,
        firstName: pub.firstName,
        lastName: pub.lastName,
        role: pub.role,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(now)
        .setExpirationTime(now + accessTokenExpiresIn)
        .sign(SECRET);

    const refreshToken = await new SignJWT({
        userId: pub.id,
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
        success: true,
        data: {
            user: pub,
        },
    };
});
