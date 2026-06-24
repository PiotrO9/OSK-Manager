import type { StudentRegisterPayload } from '~/components/manager/students/ManagerStudentFormDialog.vue';
import { getApiErrorStatusCode } from '~/utils/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';

const REGISTER_GENERIC_FALLBACK = 'Nie udało się utworzyć konta kursanta.';

function resolveStudentRegisterError(err: unknown): string {
    const status = getApiErrorStatusCode(err);

    if (status === 403) {
        return 'Brak uprawnień do tej operacji.';
    }

    if (status !== undefined && status >= 500) {
        return 'Serwer jest chwilowo niedostępny. Spróbuj ponownie.';
    }

    if (status === 400 || status === 409) {
        return getApiFetchErrorMessage(err, 'Nieprawidłowe dane lub konflikt.');
    }

    return getApiFetchErrorMessage(err, REGISTER_GENERIC_FALLBACK);
}

export function useManagerStudentCreate() {
    const isSaving = ref(false);
    const apiError = ref<string | null>(null);

    async function createStudent(
        payload: StudentRegisterPayload,
    ): Promise<void> {
        if (isSaving.value) {
            return;
        }

        apiError.value = null;
        isSaving.value = true;

        try {
            await requestBffData<unknown>('POST', '/api/auth/register', {
                body: {
                    role: 'STUDENT',
                    email: payload.email,
                    password: payload.password,
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    schoolId: payload.schoolId,
                },
                fallbackMessage: REGISTER_GENERIC_FALLBACK,
            });
        } catch (err) {
            apiError.value = resolveStudentRegisterError(err);

            throw err;
        } finally {
            isSaving.value = false;
        }
    }

    function clearCreateError(): void {
        apiError.value = null;
    }

    return {
        isSaving: readonly(isSaving),
        apiError: readonly(apiError),
        createStudent,
        clearCreateError,
        resolveStudentRegisterError,
    };
}
