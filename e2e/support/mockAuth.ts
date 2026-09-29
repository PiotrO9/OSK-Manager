import type { BrowserContext } from '@playwright/test';
import { SignJWT } from 'jose';

export type MockAuthRole = 'MANAGER' | 'INSTRUCTOR' | 'STUDENT';

interface MockAuthProfile {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
}

const MOCK_PROFILE_BY_ROLE: Record<MockAuthRole, MockAuthProfile> = {
    MANAGER: {
        userId: '3',
        email: 'manager001@post.pl',
        firstName: 'Jan',
        lastName: 'Kierownik',
    },
    INSTRUCTOR: {
        userId: '4',
        email: 'instructor001@post.pl',
        firstName: 'Jan',
        lastName: 'Instruktor',
    },
    STUDENT: {
        userId: '1',
        email: 'student001@post.pl',
        firstName: 'Kamil',
        lastName: 'Kursant',
    },
};

function mockJwtSecret(): Uint8Array {
    return new TextEncoder().encode(
        process.env.E2E_MOCK_JWT_SECRET || 'osk-manager-e2e-mock-secret',
    );
}

async function signAccessToken(
    role: MockAuthRole,
    expiration: string | number,
): Promise<string> {
    const profile = MOCK_PROFILE_BY_ROLE[role];

    return new SignJWT({
        ...profile,
        role,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiration)
        .sign(mockJwtSecret());
}

async function signRefreshToken(role: MockAuthRole): Promise<string> {
    const profile = MOCK_PROFILE_BY_ROLE[role];

    return new SignJWT({
        userId: profile.userId,
        type: 'refresh',
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(mockJwtSecret());
}

export async function authenticateMockUser(
    context: BrowserContext,
    baseURL: string,
    role: MockAuthRole,
): Promise<void> {
    const accessToken = await signAccessToken(role, '1h');

    await context.addCookies([
        {
            name: 'access_token',
            value: accessToken,
            url: baseURL,
            httpOnly: true,
            sameSite: 'Strict',
        },
    ]);
}

export async function authenticateMockUserThroughRefresh(
    context: BrowserContext,
    baseURL: string,
    role: MockAuthRole,
): Promise<void> {
    const expiredAccessToken = await signAccessToken(
        role,
        Math.floor(Date.now() / 1_000) - 60,
    );
    const refreshToken = await signRefreshToken(role);

    await context.addCookies([
        {
            name: 'access_token',
            value: expiredAccessToken,
            url: baseURL,
            httpOnly: true,
            sameSite: 'Strict',
        },
        {
            name: 'refresh_token',
            value: refreshToken,
            url: baseURL,
            httpOnly: true,
            sameSite: 'Strict',
        },
    ]);
}

export async function authenticateMockUserWithInvalidRefresh(
    context: BrowserContext,
    baseURL: string,
    role: MockAuthRole,
): Promise<void> {
    const expiredAccessToken = await signAccessToken(
        role,
        Math.floor(Date.now() / 1_000) - 60,
    );

    await context.addCookies([
        {
            name: 'access_token',
            value: expiredAccessToken,
            url: baseURL,
            httpOnly: true,
            sameSite: 'Strict',
        },
        {
            name: 'refresh_token',
            value: 'invalid-refresh-token',
            url: baseURL,
            httpOnly: true,
            sameSite: 'Strict',
        },
    ]);
}
