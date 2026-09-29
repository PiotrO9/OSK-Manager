import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { createError, getCookie, type H3Event } from 'h3';
import type { BffAuthUserResponse } from './authTypes';
import { mockUserAvatarGetUrl } from './mockUserAvatarStore';
import {
    clearAccessCookie,
    clearSessionCookies,
    setAccessTokenCookie,
} from '../upstream/upstreamCookies';

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
);

const PROFILE_DEFAULTS: Record<
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

function unauthorized(message: string): never {
    throw createError({ statusCode: 401, message });
}

function jwtErrorCode(error: unknown): string {
    if (!error || typeof error !== 'object' || !('code' in error)) return '';

    return String((error as { code?: unknown }).code ?? '');
}

function profileForUser(userId: string) {
    return (
        PROFILE_DEFAULTS[userId] ?? {
            email: 'user@example.com',
            firstName: 'User',
            lastName: '',
            role: 'STUDENT',
        }
    );
}

function userFromPayload(payload: JWTPayload): BffAuthUserResponse {
    const userId = String(payload.userId ?? '');
    const email = String(payload.email ?? '');
    const firstName = String(payload.firstName ?? '');
    const lastName = String(payload.lastName ?? '');
    const role = String(payload.role ?? 'STUDENT');

    if (!userId || !email) unauthorized('Nieprawidłowy token');

    const name = [firstName, lastName]
        .map((value) => value.trim())
        .filter(Boolean)
        .join(' ')
        .trim();

    return {
        id: userId,
        name: name || email,
        firstName,
        lastName,
        email,
        phone: null,
        bio: null,
        profileUpdatedAt: null,
        pkkNumber: role.trim().toUpperCase() === 'STUDENT' ? null : undefined,
        avatarUrl: mockUserAvatarGetUrl(userId),
        role,
        drivingSchools: [],
        defaultOskId: null,
    };
}

export async function verifyMockAccessToken(
    accessToken: string,
): Promise<BffAuthUserResponse> {
    const { payload } = await jwtVerify(accessToken, SECRET);

    return userFromPayload(payload);
}

export async function refreshMockSession(event: H3Event): Promise<string> {
    const refreshToken = getCookie(event, 'refresh_token');

    if (!refreshToken) unauthorized('Brak refresh token');

    try {
        const { payload } = await jwtVerify(refreshToken, SECRET);

        if (payload.type !== 'refresh' || !payload.userId) {
            unauthorized('Nieprawidłowy refresh token');
        }

        const userId = String(payload.userId);
        const profile = profileForUser(userId);
        const now = Math.floor(Date.now() / 1_000);
        const accessTokenExpiresIn = 60 * 60;
        const accessToken = await new SignJWT({
            userId,
            ...profile,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt(now)
            .setExpirationTime(now + accessTokenExpiresIn)
            .sign(SECRET);

        setAccessTokenCookie(event, accessToken, accessTokenExpiresIn);

        return accessToken;
    } catch {
        clearSessionCookies(event);
        unauthorized('Nieprawidłowy lub wygasły refresh token');
    }
}

export async function resolveMockSession(
    event: H3Event,
): Promise<BffAuthUserResponse> {
    const accessToken = getCookie(event, 'access_token');

    if (accessToken) {
        try {
            return await verifyMockAccessToken(accessToken);
        } catch (error) {
            clearAccessCookie(event);

            if (jwtErrorCode(error) !== 'ERR_JWT_EXPIRED') {
                clearSessionCookies(event);
                unauthorized('Nieprawidłowy lub wygasły token');
            }
        }
    }

    const refreshedAccessToken = await refreshMockSession(event);

    try {
        return await verifyMockAccessToken(refreshedAccessToken);
    } catch {
        clearSessionCookies(event);
        unauthorized('Nieprawidłowy lub wygasły token');
    }
}
