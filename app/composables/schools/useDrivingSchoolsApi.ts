import type { Ref } from 'vue';
import {
    normalizeDrivingSchool,
    normalizeDrivingSchoolsList,
    type DrivingSchool,
} from '~/types/schools/drivingSchool';
import { requestBffData, requestBffSuccess } from '../core/useApi';

export interface CreateDrivingSchoolBody {
    name: string;
    city?: string;
    address?: string;
}

export interface UpdateDrivingSchoolBody {
    name: string;
    city?: string | null;
    address?: string | null;
}

/** Wynik `GET /api/driving-schools/default` rozróżnia brak konfiguracji od błędnej odpowiedzi. */
export type FetchDefaultDrivingSchoolOutcome =
    | { outcome: 'ok'; school: DrivingSchool }
    | { outcome: 'empty_response' }
    | { outcome: 'not_configured' }
    | { outcome: 'unreadable' };

type DefaultDrivingSchoolData = DrivingSchool | null | undefined;

export function useDrivingSchoolsApi() {
    const isListLoading = ref(false);
    const isDefaultLoading = ref(false);
    const isCreateLoading = ref(false);
    const isDeleteLoading = ref(false);
    const isUpdateLoading = ref(false);
    const isSetDefaultLoading = ref(false);

    async function runWithLoading<T>(
        loading: Ref<boolean>,
        request: () => Promise<T>,
    ): Promise<T> {
        loading.value = true;

        try {
            return await request();
        } finally {
            loading.value = false;
        }
    }

    function isTransportError(err: unknown): boolean {
        return (
            err !== null &&
            typeof err === 'object' &&
            ('statusCode' in err || 'data' in err)
        );
    }

    async function fetchDefaultDrivingSchool(): Promise<FetchDefaultDrivingSchoolOutcome> {
        return await runWithLoading(isDefaultLoading, async () => {
            try {
                const data = await requestBffData<DefaultDrivingSchoolData>(
                    'GET',
                    '/api/driving-schools/default',
                    {
                        fallbackMessage: 'Nie udało się pobrać domyślnego OSK.',
                    },
                );

                if (data === null || data === undefined) {
                    return { outcome: 'not_configured' };
                }

                const school = normalizeDrivingSchool(data);

                return school
                    ? { outcome: 'ok', school }
                    : { outcome: 'not_configured' };
            } catch (err) {
                return isTransportError(err)
                    ? { outcome: 'empty_response' }
                    : { outcome: 'unreadable' };
            }
        });
    }

    async function fetchList(): Promise<DrivingSchool[]> {
        return await runWithLoading(isListLoading, () =>
            requestBffData<DrivingSchool[]>('GET', '/api/driving-schools', {
                fallbackMessage: 'Nie udało się pobrać listy OSK.',
                normalize: (data) => normalizeDrivingSchoolsList(data),
            }),
        );
    }

    async function create(
        body: CreateDrivingSchoolBody,
    ): Promise<DrivingSchool> {
        return await runWithLoading(isCreateLoading, () =>
            requestBffData<DrivingSchool>('POST', '/api/driving-schools', {
                body,
                fallbackMessage: 'Nie udało się dodać OSK.',
                invalidMessage: 'Nieprawidłowa odpowiedź serwera.',
                normalize: (data) => normalizeDrivingSchool(data),
            }),
        );
    }

    async function remove(id: string): Promise<void> {
        const schoolId = id.trim();

        await runWithLoading(isDeleteLoading, () =>
            requestBffSuccess(
                'DELETE',
                `/api/driving-schools/${encodeURIComponent(schoolId)}`,
                {
                    fallbackMessage: 'Nie udało się usunąć OSK.',
                },
            ),
        );
    }

    async function update(
        id: string,
        body: UpdateDrivingSchoolBody,
    ): Promise<DrivingSchool> {
        const schoolId = id.trim();

        return await runWithLoading(isUpdateLoading, () =>
            requestBffData<DrivingSchool>(
                'PATCH',
                `/api/driving-schools/${encodeURIComponent(schoolId)}`,
                {
                    body,
                    fallbackMessage: 'Nie udało się zapisać zmian OSK.',
                    invalidMessage: 'Nieprawidłowa odpowiedź serwera.',
                    normalize: (data) => normalizeDrivingSchool(data),
                },
            ),
        );
    }

    async function setAsDefault(id: string): Promise<void> {
        const schoolId = id.trim();

        await runWithLoading(isSetDefaultLoading, async () => {
            await requestBffSuccess(
                'PATCH',
                `/api/driving-schools/${encodeURIComponent(schoolId)}/set-default`,
                {
                    fallbackMessage: 'Nie udało się ustawić domyślnej OSK.',
                },
            );
        });
    }

    return {
        isListLoading: readonly(isListLoading),
        isDefaultLoading: readonly(isDefaultLoading),
        isCreateLoading: readonly(isCreateLoading),
        isDeleteLoading: readonly(isDeleteLoading),
        isUpdateLoading: readonly(isUpdateLoading),
        isSetDefaultLoading: readonly(isSetDefaultLoading),
        fetchDefaultDrivingSchool,
        fetchList,
        create,
        remove,
        update,
        setAsDefault,
    };
}
