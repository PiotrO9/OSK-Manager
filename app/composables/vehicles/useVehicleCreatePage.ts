import type { DrivingSchool } from '~/types/schools/drivingSchool';
import type { VehicleWritePayload } from '~/types/vehicles/vehicle';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { isVehicleRegistrationConflict } from '~/utils/vehicles/vehicleForm';

export const VEHICLE_CREATE_FORM_ID = 'vehicle-create-form';

export function useVehicleCreatePage() {
    const { addToast } = useAppToast();
    const { fetchDefaultDrivingSchool } = useDrivingSchoolsApi();
    const { createVehicle, isCreateLoading } = useVehiclesApi();

    const apiError = shallowRef<string | null>(null);
    const registrationNumberError = shallowRef<string | null>(null);
    const currentSchool = shallowRef<DrivingSchool | null>(null);
    const schoolContextError = shallowRef<string | null>(null);
    const isSchoolContextLoading = shallowRef(true);
    const isCreateNavigationAllowed = shallowRef(false);
    let schoolRequestId = 0;

    const canSubmit = computed(
        () =>
            currentSchool.value !== null &&
            !isSchoolContextLoading.value &&
            schoolContextError.value === null &&
            !isCreateLoading.value,
    );

    function clearRegistrationNumberError(): void {
        registrationNumberError.value = null;
    }

    async function loadSchoolContext(): Promise<void> {
        const requestId = ++schoolRequestId;

        schoolContextError.value = null;
        isSchoolContextLoading.value = true;
        currentSchool.value = null;

        try {
            const result = await fetchDefaultDrivingSchool();

            if (requestId !== schoolRequestId) return;

            if (result.outcome === 'ok') {
                currentSchool.value = result.school;

                return;
            }

            schoolContextError.value =
                result.outcome === 'not_configured'
                    ? 'Nie ustawiono domyślnej szkoły jazdy.'
                    : 'Nie udało się pobrać domyślnej szkoły jazdy.';
        } catch (err) {
            if (requestId !== schoolRequestId) return;

            schoolContextError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać danych szkoły jazdy.',
            );
        } finally {
            if (requestId === schoolRequestId) {
                isSchoolContextLoading.value = false;
            }
        }
    }

    void loadSchoolContext();

    async function handleVehicleSubmit(
        payload: VehicleWritePayload,
    ): Promise<void> {
        const school = currentSchool.value;

        if (!school || !canSubmit.value) return;

        apiError.value = null;
        registrationNumberError.value = null;

        try {
            await createVehicle({ schoolId: school.id, ...payload });
            isCreateNavigationAllowed.value = true;

            addToast({
                title: 'Pojazd został dodany',
                variant: 'success',
            });

            await navigateTo('/vehicles', { replace: true });
        } catch (err) {
            const message = getApiFetchErrorMessage(
                err,
                'Nie udało się dodać pojazdu.',
            );

            if (isVehicleRegistrationConflict(message)) {
                registrationNumberError.value =
                    'Pojazd z tym numerem rejestracyjnym już istnieje w tej szkole.';

                return;
            }

            apiError.value = message;
            addToast({
                title: 'Nie udało się dodać pojazdu',
                description: message,
                variant: 'error',
            });
        }
    }

    return {
        apiError: readonly(apiError),
        canSubmit,
        clearRegistrationNumberError,
        currentSchool,
        formId: VEHICLE_CREATE_FORM_ID,
        handleVehicleSubmit,
        isCreateLoading,
        isCreateNavigationAllowed: readonly(isCreateNavigationAllowed),
        isSchoolContextLoading: readonly(isSchoolContextLoading),
        loadSchoolContext,
        registrationNumberError: readonly(registrationNumberError),
        schoolContextError: readonly(schoolContextError),
        vehiclesListRoute: '/vehicles',
    };
}
