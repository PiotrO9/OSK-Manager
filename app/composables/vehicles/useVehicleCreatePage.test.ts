import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, readonly, shallowRef } from 'vue';

const fetchDefaultDrivingSchool = vi.fn();
const createVehicle = vi.fn();
const navigateTo = vi.fn();
const addToast = vi.fn();
const isCreateLoading = shallowRef(false);

function installVehicleCreatePageGlobals(): void {
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('readonly', readonly);
    vi.stubGlobal('shallowRef', shallowRef);
    vi.stubGlobal('useDrivingSchoolsApi', () => ({
        fetchDefaultDrivingSchool,
    }));
    vi.stubGlobal('useVehiclesApi', () => ({
        createVehicle,
        isCreateLoading: readonly(isCreateLoading),
    }));
    vi.stubGlobal('useAppToast', () => ({ addToast }));
    vi.stubGlobal('navigateTo', navigateTo);
}

const school = {
    id: 'school-1',
    name: 'OSK Centrum',
    city: 'Wrocław',
    address: 'ul. Testowa 1',
};

const payload = {
    name: 'Toyota Yaris',
    registrationNumber: 'DW 12345',
    inspectionDate: null,
    insuranceDate: null,
    modelYear: 2022,
    mileageKm: 12_000,
};

describe('useVehicleCreatePage', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        vi.clearAllMocks();
        isCreateLoading.value = false;
        fetchDefaultDrivingSchool.mockResolvedValue({
            outcome: 'ok',
            school,
        });
        createVehicle.mockResolvedValue({
            id: 'vehicle-1',
            ...payload,
            status: 'ACTIVE',
            unavailableUntil: null,
            isDefault: false,
        });
    });

    it('loads and exposes the default school without route context', async () => {
        installVehicleCreatePageGlobals();
        const { useVehicleCreatePage } = await import('./useVehicleCreatePage');
        const page = useVehicleCreatePage();

        await vi.waitFor(() => {
            expect(page.currentSchool.value?.id).toBe('school-1');
        });

        expect(fetchDefaultDrivingSchool).toHaveBeenCalledOnce();
        expect(page.canSubmit.value).toBe(true);
        expect(page.vehiclesListRoute).toBe('/vehicles');
    });

    it('creates a vehicle in the default school and returns to the clean list URL', async () => {
        installVehicleCreatePageGlobals();
        const { useVehicleCreatePage } = await import('./useVehicleCreatePage');
        const page = useVehicleCreatePage();

        await vi.waitFor(() => expect(page.canSubmit.value).toBe(true));
        await page.handleVehicleSubmit(payload);

        expect(createVehicle).toHaveBeenCalledWith({
            schoolId: 'school-1',
            ...payload,
        });
        expect(page.isCreateNavigationAllowed.value).toBe(true);
        expect(addToast).toHaveBeenCalledWith({
            title: 'Pojazd został dodany',
            variant: 'success',
        });
        expect(navigateTo).toHaveBeenCalledWith('/vehicles', {
            replace: true,
        });
    });

    it('maps a registration conflict to the registration field', async () => {
        installVehicleCreatePageGlobals();
        createVehicle.mockRejectedValue(
            new Error('Vehicle registrationNumber already exists (conflict)'),
        );
        const { useVehicleCreatePage } = await import('./useVehicleCreatePage');
        const page = useVehicleCreatePage();

        await vi.waitFor(() => expect(page.canSubmit.value).toBe(true));
        await page.handleVehicleSubmit(payload);

        expect(page.registrationNumberError.value).toBe(
            'Pojazd z tym numerem rejestracyjnym już istnieje w tej szkole.',
        );
        expect(page.apiError.value).toBeNull();
        expect(navigateTo).not.toHaveBeenCalled();

        page.clearRegistrationNumberError();
        expect(page.registrationNumberError.value).toBeNull();
    });

    it('shows a useful toast for a non-field API error', async () => {
        installVehicleCreatePageGlobals();
        createVehicle.mockRejectedValue(new Error('Usługa jest niedostępna.'));
        const { useVehicleCreatePage } = await import('./useVehicleCreatePage');
        const page = useVehicleCreatePage();

        await vi.waitFor(() => expect(page.canSubmit.value).toBe(true));
        await page.handleVehicleSubmit(payload);

        expect(page.apiError.value).toBe('Usługa jest niedostępna.');
        expect(addToast).toHaveBeenCalledWith({
            title: 'Nie udało się dodać pojazdu',
            description: 'Usługa jest niedostępna.',
            variant: 'error',
        });
    });

    it('blocks submission when no default school is configured', async () => {
        fetchDefaultDrivingSchool.mockResolvedValue({
            outcome: 'not_configured',
        });
        installVehicleCreatePageGlobals();
        const { useVehicleCreatePage } = await import('./useVehicleCreatePage');
        const page = useVehicleCreatePage();

        await vi.waitFor(() => {
            expect(page.schoolContextError.value).toBe(
                'Nie ustawiono domyślnej szkoły jazdy.',
            );
        });
        await page.handleVehicleSubmit(payload);

        expect(page.currentSchool.value).toBeNull();
        expect(page.canSubmit.value).toBe(false);
        expect(createVehicle).not.toHaveBeenCalled();
    });

    it('can retry loading the default school after a failure', async () => {
        fetchDefaultDrivingSchool
            .mockResolvedValueOnce({ outcome: 'empty_response' })
            .mockResolvedValueOnce({ outcome: 'ok', school });
        installVehicleCreatePageGlobals();
        const { useVehicleCreatePage } = await import('./useVehicleCreatePage');
        const page = useVehicleCreatePage();

        await vi.waitFor(() => {
            expect(page.schoolContextError.value).toBe(
                'Nie udało się pobrać domyślnej szkoły jazdy.',
            );
        });

        await page.loadSchoolContext();

        expect(page.currentSchool.value?.id).toBe('school-1');
        expect(page.schoolContextError.value).toBeNull();
        expect(page.canSubmit.value).toBe(true);
    });
});
