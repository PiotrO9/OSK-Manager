import { describe, expect, it, vi } from 'vitest';
import type { BffClient } from '~/utils/api/bffClient';
import {
    requestAuthLogin,
    requestAuthLogout,
    requestAuthMe,
    requestAuthProfilePatch,
    requestAuthRefresh,
} from './authSessionApi';

function createBffClientMock(): BffClient {
    return {
        request: vi.fn(),
        requestData: vi.fn(),
    };
}

describe('authSessionApi', () => {
    it('requests auth refresh without retry recursion', async () => {
        const bff = createBffClientMock();

        vi.mocked(bff.requestData).mockResolvedValue({});

        await requestAuthRefresh(bff);

        expect(bff.requestData).toHaveBeenCalledWith('/api/auth/refresh', {
            method: 'POST',
            auth: 'none',
            retryUnauthorized: false,
        });
    });

    it('loads the current auth user', async () => {
        const bff = createBffClientMock();
        const user = {
            id: 'user-1',
            email: 'user@example.com',
            role: 'MANAGER',
        };

        vi.mocked(bff.requestData).mockResolvedValue({ user });

        await expect(requestAuthMe(bff)).resolves.toBe(user);
        expect(bff.requestData).toHaveBeenCalledWith('/api/auth/me', {
            method: 'GET',
            retryUnauthorized: false,
        });
    });

    it('logs in with explicit no-auth transport options', async () => {
        const bff = createBffClientMock();
        const user = {
            id: 'user-1',
            email: 'user@example.com',
            role: 'MANAGER',
        };

        vi.mocked(bff.requestData).mockResolvedValue({ user });

        await expect(
            requestAuthLogin(bff, 'user@example.com', 'secret'),
        ).resolves.toBe(user);
        expect(bff.requestData).toHaveBeenCalledWith('/api/auth/login', {
            method: 'POST',
            auth: 'none',
            retryUnauthorized: false,
            body: {
                email: 'user@example.com',
                password: 'secret',
            },
        });
    });

    it('patches the auth profile without automatic retry', async () => {
        const bff = createBffClientMock();
        const user = {
            id: 'user-1',
            email: 'user@example.com',
            role: 'MANAGER',
        };
        const body = { firstName: 'Anna' };

        vi.mocked(bff.requestData).mockResolvedValue({ user });

        await expect(requestAuthProfilePatch(bff, body)).resolves.toBe(user);
        expect(bff.requestData).toHaveBeenCalledWith('/api/auth/profile', {
            method: 'PATCH',
            body,
            retryUnauthorized: false,
        });
    });

    it('logs out with no-auth transport options', async () => {
        const bff = createBffClientMock();

        vi.mocked(bff.request).mockResolvedValue({});

        await requestAuthLogout(bff);

        expect(bff.request).toHaveBeenCalledWith('/api/auth/logout', {
            method: 'POST',
            auth: 'none',
            retryUnauthorized: false,
        });
    });
});
