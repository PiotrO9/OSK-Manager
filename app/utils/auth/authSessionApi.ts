import type { BffClient } from '~/utils/api/bffClient';

const AUTH_PATH = '/api/auth';

/**
 * `GET /auth/me` (whitelist) oraz ewentualny starszy kształt z `POST /auth/login` na BE.
 */
export interface BackendUserResponse {
    id: string;
    email: string;
    role: string;
    name?: string;
    avatarUrl?: string | null;
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    bio?: string | null;
    profileUpdatedAt?: string | null;
    pkkNumber?: string | null;
    drivingSchools?: unknown;
    defaultOskId?: string | null;
}

interface AuthUserResponse {
    user: BackendUserResponse;
}

export async function requestAuthRefresh(bff: BffClient): Promise<void> {
    await bff.requestData<object>(`${AUTH_PATH}/refresh`, {
        method: 'POST',
        auth: 'none',
        retryUnauthorized: false,
    });
}

export async function requestAuthMe(
    bff: BffClient,
): Promise<BackendUserResponse> {
    const data = await bff.requestData<AuthUserResponse>(`${AUTH_PATH}/me`, {
        method: 'GET',
        retryUnauthorized: false,
    });

    return data.user;
}

export async function requestAuthLogin(
    bff: BffClient,
    email: string,
    password: string,
): Promise<BackendUserResponse> {
    const data = await bff.requestData<AuthUserResponse>(`${AUTH_PATH}/login`, {
        method: 'POST',
        auth: 'none',
        retryUnauthorized: false,
        body: { email, password },
    });

    return data.user;
}

export async function requestAuthProfilePatch(
    bff: BffClient,
    body: Record<string, string | null>,
): Promise<BackendUserResponse> {
    const data = await bff.requestData<AuthUserResponse>(
        `${AUTH_PATH}/profile`,
        {
            method: 'PATCH',
            body,
            retryUnauthorized: false,
        },
    );

    return data.user;
}

export async function requestAuthLogout(bff: BffClient): Promise<void> {
    await bff.request(`${AUTH_PATH}/logout`, {
        method: 'POST',
        auth: 'none',
        retryUnauthorized: false,
    });
}
