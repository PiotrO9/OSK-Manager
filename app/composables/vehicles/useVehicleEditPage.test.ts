import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref, watch } from 'vue';

const fetchList = vi.fn();
const fetchVehicleById = vi.fn();
const updateVehicle = vi.fn();
const uploadVehiclePhoto = vi.fn();
const navigateTo = vi.fn();
const addToast = vi.fn();

class TestPhotoInput {
    private selectedFiles: File[] = [];
    private selectedValue = '';

    get files(): File[] {
        return this.selectedFiles;
    }

    get value(): string {
        return this.selectedValue;
    }

    set value(value: string) {
        this.selectedValue = value;

        if (value === '') {
            this.selectedFiles = [];
        }
    }

    select(file: File): void {
        this.selectedFiles = [file];
        this.selectedValue = file.name;
    }
}

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
        uploadVehiclePhoto.mockResolvedValue({
            photoUrl: '/uploads/vehicles/vehicle-1.jpg',
            updatedAt: '2026-10-08T12:32:00.000Z',
        });
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
        installVehicleEditPageGlobals({
            params: { id: 'vehicle-1' },
        });
        vi.stubGlobal('HTMLInputElement', TestPhotoInput);
        vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:vehicle-photo');
        vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
        uploadVehiclePhoto
            .mockRejectedValueOnce(new Error('Storage niedostępny.'))
            .mockResolvedValueOnce({
                photoUrl: '/uploads/vehicle.jpg',
                updatedAt: '2026-10-08T12:32:00.000Z',
            });

        const { useVehicleEditPage } = await import('./useVehicleEditPage');
        const page = useVehicleEditPage();
        const input = new TestPhotoInput();
        const photo = new File(['photo'], 'vehicle.jpg', {
            type: 'image/jpeg',
        });

        input.select(photo);

        page.handlePhotoFileInputChange({
            target: input,
        } as unknown as Event);
        expect(page.hasPendingPhoto.value).toBe(true);
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
        expect(uploadVehiclePhoto).toHaveBeenNthCalledWith(
            1,
            'vehicle-1',
            photo,
        );
        expect(uploadVehiclePhoto).toHaveBeenNthCalledWith(
            2,
            'vehicle-1',
            photo,
        );
        expect(page.hasPendingPhoto.value).toBe(false);
        expect(page.initialVehicle.value?.updatedAt).toBe(
            '2026-10-08T12:32:00.000Z',
        );
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:vehicle-photo');
        expect(navigateTo).toHaveBeenCalledWith('/vehicles');
    });

    it('uploads the second file selected through the same input', async () => {
        installVehicleEditPageGlobals({ params: { id: 'vehicle-1' } });
        vi.stubGlobal('HTMLInputElement', TestPhotoInput);
        const createUrl = vi
            .spyOn(URL, 'createObjectURL')
            .mockReturnValueOnce('blob:first')
            .mockReturnValueOnce('blob:second');
        const revokeUrl = vi
            .spyOn(URL, 'revokeObjectURL')
            .mockImplementation(() => undefined);
        const { useVehicleEditPage } = await import('./useVehicleEditPage');
        const page = useVehicleEditPage();
        const input = new TestPhotoInput();
        const first = new File(['first'], 'first.jpg', { type: 'image/jpeg' });
        const second = new File(['second'], 'second.png', {
            type: 'image/png',
        });

        input.select(first);
        page.handlePhotoFileInputChange({ target: input } as unknown as Event);
        expect(page.hasPendingPhoto.value).toBe(true);

        input.select(second);
        page.handlePhotoFileInputChange({ target: input } as unknown as Event);
        expect(page.hasPendingPhoto.value).toBe(true);
        expect(input.files).toHaveLength(0);
        expect(page.pendingPhotoFileName.value).toBe('second.png');
        expect(page.previewPhotoSrc.value).toBe('blob:second');
        expect(revokeUrl).toHaveBeenCalledWith('blob:first');

        await page.handleVehicleSubmit({
            name: 'Toyota Yaris',
            registrationNumber: 'KR12345',
            inspectionDate: null,
            insuranceDate: null,
            modelYear: 2020,
            mileageKm: 54_321,
        });

        expect(uploadVehiclePhoto).toHaveBeenCalledExactlyOnceWith(
            'vehicle-1',
            second,
        );
        expect(createUrl).toHaveBeenCalledTimes(2);
        expect(revokeUrl).toHaveBeenCalledWith('blob:second');
        expect(page.hasPendingPhoto.value).toBe(false);
    });

    it('accepts a valid photo after invalid type and size selections', async () => {
        installVehicleEditPageGlobals({ params: { id: 'vehicle-1' } });
        vi.stubGlobal('HTMLInputElement', TestPhotoInput);
        const createUrl = vi
            .spyOn(URL, 'createObjectURL')
            .mockReturnValue('blob:valid');

        vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
        const { useVehicleEditPage } = await import('./useVehicleEditPage');
        const page = useVehicleEditPage();
        const input = new TestPhotoInput();

        input.select(
            new File(['invalid'], 'invalid.txt', { type: 'text/plain' }),
        );
        page.handlePhotoFileInputChange({ target: input } as unknown as Event);
        expect(page.photoUploadError.value).toBe(
            'Wybierz plik JPEG, PNG lub WebP.',
        );
        expect(input.files).toHaveLength(0);
        expect(page.hasPendingPhoto.value).toBe(false);

        input.select(
            new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', {
                type: 'image/png',
            }),
        );
        page.handlePhotoFileInputChange({ target: input } as unknown as Event);
        expect(page.photoUploadError.value).toBe(
            'Plik jest za duży. Maksymalny rozmiar to 5 MB.',
        );
        expect(input.files).toHaveLength(0);
        expect(createUrl).not.toHaveBeenCalled();

        const valid = new File(['valid'], 'valid.webp', {
            type: 'image/webp',
        });

        input.select(valid);
        page.handlePhotoFileInputChange({ target: input } as unknown as Event);
        expect(page.photoUploadError.value).toBeNull();
        expect(page.hasPendingPhoto.value).toBe(true);
        expect(page.pendingPhotoFileName.value).toBe('valid.webp');
        expect(page.previewPhotoSrc.value).toBe('blob:valid');
        expect(createUrl).toHaveBeenCalledExactlyOnceWith(valid);
    });

    it('allows the same photo to be selected again and revokes its previews', async () => {
        installVehicleEditPageGlobals({ params: { id: 'vehicle-1' } });
        vi.stubGlobal('HTMLInputElement', TestPhotoInput);
        vi.spyOn(URL, 'createObjectURL')
            .mockReturnValueOnce('blob:first')
            .mockReturnValueOnce('blob:again');
        const revokeUrl = vi
            .spyOn(URL, 'revokeObjectURL')
            .mockImplementation(() => undefined);
        const { useVehicleEditPage } = await import('./useVehicleEditPage');
        const page = useVehicleEditPage();
        const input = new TestPhotoInput();
        const photo = new File(['same'], 'same.jpg', { type: 'image/jpeg' });

        input.select(photo);
        page.handlePhotoFileInputChange({ target: input } as unknown as Event);
        expect(input.files).toHaveLength(0);

        input.select(photo);
        page.handlePhotoFileInputChange({ target: input } as unknown as Event);
        expect(page.hasPendingPhoto.value).toBe(true);
        expect(page.previewPhotoSrc.value).toBe('blob:again');
        expect(revokeUrl).toHaveBeenCalledWith('blob:first');

        page.clearPendingPhoto();
        expect(page.hasPendingPhoto.value).toBe(false);
        expect(page.pendingPhotoFileName.value).toBe('Nie wybrano pliku');
        expect(revokeUrl).toHaveBeenCalledWith('blob:again');
    });

    it('releases the pending preview when the edit page unmounts', async () => {
        installVehicleEditPageGlobals({ params: { id: 'vehicle-1' } });
        vi.stubGlobal('HTMLInputElement', TestPhotoInput);
        const unmountCallbacks: Array<() => void> = [];

        vi.stubGlobal('onUnmounted', (callback: () => void) => {
            unmountCallbacks.push(callback);
        });
        vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:pending');
        const revokeUrl = vi
            .spyOn(URL, 'revokeObjectURL')
            .mockImplementation(() => undefined);
        const { useVehicleEditPage } = await import('./useVehicleEditPage');
        const page = useVehicleEditPage();
        const input = new TestPhotoInput();

        input.select(new File(['photo'], 'photo.jpg', { type: 'image/jpeg' }));
        page.handlePhotoFileInputChange({ target: input } as unknown as Event);
        expect(page.hasPendingPhoto.value).toBe(true);

        expect(unmountCallbacks).toHaveLength(1);
        unmountCallbacks[0]!();
        expect(revokeUrl).toHaveBeenCalledExactlyOnceWith('blob:pending');
    });
});
