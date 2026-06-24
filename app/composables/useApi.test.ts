import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { requestBffData as requestBffDataType } from './useApi';

vi.mock('~/utils/apiFetchErrorMessage', async () => {
    return await import('../utils/apiFetchErrorMessage');
});

vi.mock('~/utils/apiEnvelope', async () => {
    return await import('../utils/apiEnvelope');
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
                fallbackMessage: 'Nie udało się pobrać danych.',
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
                fallbackMessage: 'Nie udało się pobrać danych.',
                invalidMessage: 'Nieprawidłowa odpowiedź serwera.',
                normalize: (data) => {
                    const raw = data as { item?: unknown };

                    return raw.item && typeof raw.item === 'object'
                        ? (raw.item as { id: string })
                        : null;
                },
            }),
        ).rejects.toThrow('Nieprawidłowa odpowiedź serwera.');
    });

    it('uses HTTP error data.message before fallback message', async () => {
        const err = Object.assign(new Error('Fetch failed'), {
            statusCode: 409,
            data: { message: 'Termin jest już zajęty.' },
        });

        vi.stubGlobal('$fetch', vi.fn().mockRejectedValue(err));

        await expect(
            requestBffData('GET', '/api/items/abc', {
                fallbackMessage: 'Nie udało się pobrać danych.',
            }),
        ).rejects.toMatchObject({
            message: 'Termin jest już zajęty.',
            statusCode: 409,
            data: { message: 'Termin jest już zajęty.' },
        });
    });
});
