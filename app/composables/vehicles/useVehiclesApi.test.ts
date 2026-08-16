import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readonly, ref } from 'vue';

const requestBffData = vi.fn();

function installVehiclesApiGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('readonly', readonly);
    vi.stubGlobal('requestBffData', requestBffData);
}

describe('useVehiclesApi', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        installVehiclesApiGlobals();
        requestBffData.mockImplementation(
            async (_method: string, _path: string, options: unknown) => {
                const normalize = (
                    options as {
                        normalize: (data: unknown) => unknown;
                    }
                ).normalize;

                return normalize({
                    id: 'vehicle-1',
                    name: 'Toyota Yaris',
                    registrationNumber: 'KR12345',
                    status: 'UNAVAILABLE',
                    unavailableUntil: '2026-07-10',
                });
            },
        );
    });

    it('sends temporary unavailable status payload and normalizes response', async () => {
        const { useVehiclesApi } = await import('./useVehiclesApi');
        const api = useVehiclesApi();

        await expect(
            api.updateVehicleStatus(' vehicle-1 ', {
                status: 'UNAVAILABLE',
                unavailableUntil: '2026-07-10',
            }),
        ).resolves.toMatchObject({
            id: 'vehicle-1',
            status: 'UNAVAILABLE',
            unavailableUntil: '2026-07-10',
        });

        expect(requestBffData).toHaveBeenCalledWith(
            'PATCH',
            '/api/vehicles/vehicle-1/status',
            expect.objectContaining({
                body: {
                    status: 'UNAVAILABLE',
                    unavailableUntil: '2026-07-10',
                },
                fallbackMessage: 'Nie udało się zmienić statusu pojazdu.',
            }),
        );
    });
});
