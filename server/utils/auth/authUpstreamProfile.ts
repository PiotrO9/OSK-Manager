import { createError, type H3Event } from 'h3';
import { upstreamRequest } from '~~/server/utils/upstream/upstreamRequest';
import type { BffAuthUserResponse, ProfilePatchPayload } from './authTypes';

export async function bffUpstreamProfilePatch(
    event: H3Event,
    upstreamBase: string,
    body: ProfilePatchPayload,
): Promise<{ success: true; data: { user: BffAuthUserResponse } }> {
    const { data } = await upstreamRequest<{ user?: BffAuthUserResponse }>(
        event,
        upstreamBase,
        {
            path: '/auth/profile',
            method: 'PATCH',
            body,
            fallbackError: 'Nie udało się zaktualizować profilu',
            clearCookiesOnUnauthorized: 'access',
        },
    );

    if (!data?.user || typeof data.user !== 'object') {
        throw createError({
            statusCode: 502,
            statusMessage: 'Nieprawidłowa odpowiedź serwera',
        });
    }

    return {
        success: true,
        data: { user: data.user },
    };
}

export async function bffUpstreamProfileAvatarUpload(
    event: H3Event,
    upstreamBase: string,
    file: Blob,
    filename: string,
): Promise<{ success: true; data: { photoUrl: string } }> {
    const form = new FormData();

    form.append('file', file, filename);

    const { data } = await upstreamRequest<{ photoUrl?: string }>(
        event,
        upstreamBase,
        {
            path: '/auth/profile/avatar',
            method: 'POST',
            body: form,
            fallbackError: 'Nie udało się przesłać avatara',
            clearCookiesOnUnauthorized: 'access',
        },
    );

    const photoUrl =
        typeof data?.photoUrl === 'string' && data.photoUrl.trim().length > 0
            ? data.photoUrl.trim()
            : '';

    if (!photoUrl) {
        throw createError({
            statusCode: 502,
            statusMessage: 'Nieprawidłowa odpowiedź serwera',
        });
    }

    return {
        success: true,
        data: { photoUrl },
    };
}
