import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref, watch } from 'vue';

const fetchList = vi.fn();
const fetchVehicleById = vi.fn();
const updateVehicle = vi.fn();
const uploadVehiclePhoto = vi.fn();
const navigateTo = vi.fn();

function installVehicleEditPageGlobals(route: {
    query?: Record<string, unknown>;
    params?: Record<string, unknown>;
}): void {
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('watch', watch);
    vi.stubGlobal('onUnmounted', vi.fn());
    vi.stubGlobal('useRoute', () => ({
        query: route.query ?? {},
        params: route.params ?? {},
    }));
    vi.stubGlobal('useVehiclesApi', () => ({
        fetchList,
        fetchVehicleById,
        updateVehicle,
        uploadVehiclePhoto,
        isUpdateLoading: ref(false),
        isPhotoUploadLoading: ref(false),
    }));
    vi.stubGlobal('navigateTo', navigateTo);
}

describe('useVehicleEditPage', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it('does not call vehicle APIs without school and vehicle route context', async () => {
        installVehicleEditPageGlobals({});

        const { useVehicleEditPage } = await import('./useVehicleEditPage');
        const page = useVehicleEditPage();

        await page.handleVehicleSubmit({
            name: 'Toyota Yaris',
            registrationNumber: 'KR12345',
            status: 'AVAILABLE',
        });

        expect(page.schoolId.value).toBeNull();
        expect(page.vehicleId.value).toBeNull();
        expect(page.initialVehicle.value).toBeNull();
        expect(fetchList).not.toHaveBeenCalled();
        expect(fetchVehicleById).not.toHaveBeenCalled();
        expect(updateVehicle).not.toHaveBeenCalled();
        expect(uploadVehiclePhoto).not.toHaveBeenCalled();
        expect(navigateTo).not.toHaveBeenCalled();
    });
});
