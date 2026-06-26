import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { requestBffData as requestBffDataType } from './useApi';

vi.mock('~/utils/api/apiFetchErrorMessage', async () => {
    return await vi.importActual('~/utils/api/apiFetchErrorMessage');
});

vi.mock('~/utils/api/apiEnvelope', async () => {
    return await vi.importActual('~/utils/api/apiEnvelope');
});

let requestBffData: typeof requestBffDataType;

describe('requestBffData', () => {
    beforeAll(async () => {
        ({ requestBffData } = await import('./useApi'));
    });

    beforeEach(() => {
        vi.unstubAllGlobals();
        vi.stubGlobal('useRequestURL', () => ({
            origin: 'http://localhost:3000',
        }));
    });

    it('unwraps successful BFF envelopes', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            success: true,
            data: { item: { id: 'abc' } },
        });

        vi.stubGlobal('$fetch', fetchMock);

        await expect(
            requestBffData<{ item: { id: string } }>('GET', '/api/items/abc', {
                fallbackMessage: 'Could not load data.',
            }),
        ).resolves.toEqual({ item: { id: 'abc' } });
        expect(fetchMock).toHaveBeenCalledWith(
            'http://localhost:3000/api/items/abc',
            expect.objectContaining({ method: 'GET' }),
        );
    });

    it('throws the invalid message when normalize rejects payload', async () => {
        vi.stubGlobal(
            '$fetch',
            vi.fn().mockResolvedValue({
                success: true,
                data: { item: null },
            }),
        );

        await expect(
            requestBffData<{ id: string }>('GET', '/api/items/abc', {
                fallbackMessage: 'Could not load data.',
                invalidMessage: 'Invalid server response.',
                normalize: (data) => {
                    const raw = data as { item?: unknown };

                    return raw.item && typeof raw.item === 'object'
                        ? (raw.item as { id: string })
                        : null;
                },
            }),
        ).rejects.toThrow('Invalid server response.');
    });

    it('uses HTTP error data.message before fallback message', async () => {
        const err = Object.assign(new Error('Fetch failed'), {
            statusCode: 409,
            data: { message: 'Slot is already taken.' },
        });

        vi.stubGlobal('$fetch', vi.fn().mockRejectedValue(err));

        await expect(
            requestBffData('GET', '/api/items/abc', {
                fallbackMessage: 'Could not load data.',
            }),
        ).rejects.toMatchObject({
            message: 'Slot is already taken.',
            statusCode: 409,
            data: { message: 'Slot is already taken.' },
        });
    });

    it('passes request body for non-GET requests', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            success: true,
            data: { item: { id: 'created' } },
        });

        vi.stubGlobal('$fetch', fetchMock);

        await expect(
            requestBffData<{ item: { id: string } }>('POST', '/api/items', {
                body: { name: 'New item' },
                fallbackMessage: 'Could not save data.',
            }),
        ).resolves.toEqual({ item: { id: 'created' } });

        expect(fetchMock).toHaveBeenCalledWith(
            'http://localhost:3000/api/items',
            expect.objectContaining({
                method: 'POST',
                body: { name: 'New item' },
            }),
        );
    });

    it('returns normalized payloads', async () => {
        vi.stubGlobal(
            '$fetch',
            vi.fn().mockResolvedValue({
                success: true,
                data: { item: { id: 'abc', ignored: true } },
            }),
        );

        await expect(
            requestBffData<{ id: string }>('GET', '/api/items/abc', {
                fallbackMessage: 'Could not load data.',
                normalize: (data) => {
                    const item = (data as { item?: unknown }).item;

                    return item && typeof item === 'object'
                        ? { id: String((item as { id: unknown }).id) }
                        : null;
                },
            }),
        ).resolves.toEqual({ id: 'abc' });
    });

    it('uses fallback message when HTTP error has no response message', async () => {
        const err = Object.assign(new Error(''), {
            statusCode: 500,
            data: {},
        });

        vi.stubGlobal('$fetch', vi.fn().mockRejectedValue(err));

        await expect(
            requestBffData('GET', '/api/items/abc', {
                fallbackMessage: 'Could not load data.',
            }),
        ).rejects.toMatchObject({
            message: 'Could not load data.',
            statusCode: 500,
            data: {},
        });
    });
});
