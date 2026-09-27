import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref, watch } from 'vue';

const fetchList = vi.fn();
const fetchVehicleById = vi.fn();
const updateVehicle = vi.fn();
const uploadVehiclePhoto = vi.fn();
const navigateTo = vi.fn();
const addToast = vi.fn();

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
    vi.stubGlobal('useAppToast', () => ({ addToast }));
    vi.stubGlobal('navigateTo', navigateTo);
}

function vehicle() {
    return {
        id: 'vehicle-1',
        name: 'Toyota Yaris',
        registrationNumber: 'KR12345',
        status: 'ACTIVE' as const,
        unavailableUntil: null,
        isDefault: false,
        inspectionDate: null,
        insuranceDate: null,
        modelYear: 2020,
        mileageKm: 54_321,
    };
}

describe('useVehicleEditPage', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        vi.clearAllMocks();
        fetchList.mockResolvedValue([]);
        fetchVehicleById.mockResolvedValue(null);
        updateVehicle.mockResolvedValue(vehicle());
        uploadVehiclePhoto.mockResolvedValue('/uploads/vehicles/vehicle-1.jpg');
    });

    it('does not call vehicle APIs without vehicle route context', async () => {
        installVehicleEditPageGlobals({});

        const { useVehicleEditPage } = await import('./useVehicleEditPage');
        const page = useVehicleEditPage();

        await page.handleVehicleSubmit({
            name: 'Toyota Yaris',
            registrationNumber: 'KR12345',
            inspectionDate: null,
            insuranceDate: null,
            modelYear: null,
            mileageKm: null,
        });

        expect(page.vehicleId.value).toBeNull();
        expect(page.initialVehicle.value).toBeNull();
        expect(fetchList).not.toHaveBeenCalled();
        expect(fetchVehicleById).not.toHaveBeenCalled();
        expect(updateVehicle).not.toHaveBeenCalled();
        expect(uploadVehiclePhoto).not.toHaveBeenCalled();
        expect(navigateTo).not.toHaveBeenCalled();
    });

    it('submits vehicle edit payload and returns to vehicle list', async () => {
        installVehicleEditPageGlobals({
            params: { id: ' vehicle-1 ' },
        });
        const payload = {
            name: 'Toyota Yaris',
            registrationNumber: 'KR12345',
            inspectionDate: '2026-08-20',
            insuranceDate: null,
            modelYear: 2020,
            mileageKm: 54_321,
        };

        const { useVehicleEditPage } = await import('./useVehicleEditPage');
        const page = useVehicleEditPage();

        await page.handleVehicleSubmit(payload);

        expect(updateVehicle).toHaveBeenCalledWith('vehicle-1', payload);
        expect(uploadVehiclePhoto).not.toHaveBeenCalled();
        expect(navigateTo).toHaveBeenCalledWith('/vehicles');
    });

    it('loads edit data from the details endpoint without fetching the full list', async () => {
        installVehicleEditPageGlobals({
            params: { id: 'vehicle-1' },
        });
        fetchVehicleById.mockResolvedValue({ ...vehicle(), photoUrl: null });

        const { useVehicleEditPage } = await import('./useVehicleEditPage');
        const page = useVehicleEditPage();

        await vi.waitFor(() => {
            expect(page.initialVehicle.value?.id).toBe('vehicle-1');
        });
        expect(fetchList).not.toHaveBeenCalled();
        expect(fetchVehicleById).toHaveBeenCalledWith('vehicle-1');
    });

    it('keeps a failed photo pending and allows retry after vehicle data is saved', async () => {
        class TestPhotoInput {
            files: Array<{ name: string; size: number; type: string }>;
            value = 'vehicle.jpg';

            constructor() {
                this.files = [
                    {
                        name: 'vehicle.jpg',
                        size: 1024,
                        type: 'image/jpeg',
                    },
                ];
            }
        }

        installVehicleEditPageGlobals({
            params: { id: 'vehicle-1' },
        });
        vi.stubGlobal('HTMLInputElement', TestPhotoInput);
        vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:vehicle-photo');
        vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
        uploadVehiclePhoto
            .mockRejectedValueOnce(new Error('Storage niedostępny.'))
            .mockResolvedValueOnce('/uploads/vehicle.jpg');

        const { useVehicleEditPage } = await import('./useVehicleEditPage');
        const page = useVehicleEditPage();
        const input = new TestPhotoInput();

        page.handlePhotoFileInputChange({
            target: input,
        } as unknown as Event);
        await page.handleVehicleSubmit({
            name: 'Toyota Yaris',
            registrationNumber: 'KR12345',
            inspectionDate: null,
            insuranceDate: null,
            modelYear: 2020,
            mileageKm: 54_321,
        });

        expect(updateVehicle).toHaveBeenCalledOnce();
        expect(page.hasPendingPhoto.value).toBe(true);
        expect(page.canRetryPhotoUpload.value).toBe(true);
        expect(page.photoUploadError.value).toContain(
            'Dane pojazdu zostały zapisane',
        );
        expect(navigateTo).not.toHaveBeenCalled();

        await page.retryPhotoUpload();

        expect(uploadVehiclePhoto).toHaveBeenCalledTimes(2);
        expect(page.hasPendingPhoto.value).toBe(false);
        expect(navigateTo).toHaveBeenCalledWith('/vehicles');
    });
});
