import type { Ref } from 'vue';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { resolveBffEndpoint } from '~/utils/api/bffEndpoint';
import {
    normalizeVehicle,
    normalizeVehicleDetail,
    normalizeVehiclesList,
    type Vehicle,
    type VehicleDetail,
    type VehicleStatus,
    type VehicleWritePayload,
} from '~/types/vehicles/vehicle';

export type VehicleCreateBody = VehicleWritePayload & { schoolId: string };

export type VehicleUpdateBody = VehicleWritePayload;

export interface VehicleStatusUpdateBody {
    status: VehicleStatus;
    unavailableUntil?: string | null;
}

export function useVehiclesApi() {
    const isListLoading = ref(false);
    const isCreateLoading = ref(false);
    const isUpdateLoading = ref(false);
    const isStatusUpdateLoading = ref(false);
    const isDeleteLoading = ref(false);
    const isSetDefaultLoading = ref(false);
    const isDetailLoading = ref(false);
    const isPhotoUploadLoading = ref(false);
    const deleteError = ref<Error | null>(null);

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

    async function fetchList(schoolId: string): Promise<Vehicle[]> {
        const sid = schoolId.trim();
        const qs = new URLSearchParams({ schoolId: sid });

        return await runWithLoading(isListLoading, () =>
            requestBffData<Vehicle[]>('GET', `/api/vehicles?${qs.toString()}`, {
                fallbackMessage: 'Nie udało się pobrać listy pojazdów.',
                normalize: (data) => normalizeVehiclesList(data),
            }),
        );
    }

    async function createVehicle(body: VehicleCreateBody): Promise<Vehicle> {
        return await runWithLoading(isCreateLoading, () =>
            requestBffData<Vehicle>('POST', '/api/vehicles', {
                body,
                fallbackMessage: 'Nie udało się dodać pojazdu.',
                invalidMessage: 'Nieprawidłowa odpowiedź serwera.',
                normalize: (data) => normalizeVehicle(data, 0),
            }),
        );
    }

    async function updateVehicle(
        id: string,
        body: VehicleUpdateBody,
    ): Promise<Vehicle> {
        const vehicleId = id.trim();

        return await runWithLoading(isUpdateLoading, () =>
            requestBffData<Vehicle>(
                'PATCH',
                `/api/vehicles/${encodeURIComponent(vehicleId)}`,
                {
                    body,
                    fallbackMessage: 'Nie udało się zapisać pojazdu.',
                    invalidMessage: 'Nieprawidłowa odpowiedź serwera.',
                    normalize: (data) => normalizeVehicle(data, 0),
                },
            ),
        );
    }

    async function updateVehicleStatus(
        id: string,
        statusOrBody: VehicleStatus | VehicleStatusUpdateBody,
    ): Promise<Vehicle> {
        const vehicleId = id.trim();
        const body =
            typeof statusOrBody === 'string'
                ? { status: statusOrBody }
                : statusOrBody;

        return await runWithLoading(isStatusUpdateLoading, () =>
            requestBffData<Vehicle>(
                'PATCH',
                `/api/vehicles/${encodeURIComponent(vehicleId)}/status`,
                {
                    body,
                    fallbackMessage: 'Nie udało się zmienić statusu pojazdu.',
                    invalidMessage: 'Nieprawidłowa odpowiedź serwera.',
                    normalize: (data) => normalizeVehicle(data, 0),
                },
            ),
        );
    }

    async function deleteVehicle(id: string): Promise<void> {
        const vehicleId = id.trim();

        deleteError.value = null;

        try {
            await runWithLoading(isDeleteLoading, () =>
                requestBffData<unknown>(
                    'DELETE',
                    `/api/vehicles/${encodeURIComponent(vehicleId)}`,
                    {
                        fallbackMessage: 'Nie udało się usunąć pojazdu.',
                    },
                ),
            );
        } catch (err) {
            deleteError.value =
                err instanceof Error
                    ? err
                    : new Error('Nie udało się usunąć pojazdu.');
            throw err;
        }
    }

    async function setVehicleAsDefault(
        schoolId: string,
        vehicleId: string,
    ): Promise<void> {
        const sid = schoolId.trim();

        await runWithLoading(isSetDefaultLoading, () =>
            requestBffData<unknown>(
                'PATCH',
                `/api/driving-schools/${encodeURIComponent(sid)}/default-vehicle`,
                {
                    body: { vehicleId },
                    fallbackMessage:
                        'Nie udało się ustawić domyślnego pojazdu.',
                },
            ),
        );
    }

    async function fetchVehicleById(id: string): Promise<VehicleDetail> {
        const vehicleId = id.trim();

        return await runWithLoading(isDetailLoading, () =>
            requestBffData<VehicleDetail>(
                'GET',
                `/api/vehicles/${encodeURIComponent(vehicleId)}`,
                {
                    fallbackMessage: 'Nie udało się pobrać pojazdu.',
                    invalidMessage: 'Nieprawidłowa odpowiedź serwera.',
                    normalize: (data) => normalizeVehicleDetail(data, 0),
                },
            ),
        );
    }

    async function uploadVehiclePhoto(id: string, file: File): Promise<string> {
        isPhotoUploadLoading.value = true;

        try {
            const url = resolveBffEndpoint(
                `/api/vehicles/${encodeURIComponent(id)}/photo`,
            );
            const body = new FormData();

            body.append('file', file);

            const raw = await $fetch<{
                success?: boolean;
                data?: { photoUrl?: string };
            }>(url, {
                method: 'POST',
                body,
                credentials: 'include',
            });

            const photoUrl = raw?.data?.photoUrl;

            if (typeof photoUrl !== 'string' || photoUrl.trim().length === 0) {
                throw new Error('Nieprawidłowa odpowiedź serwera.');
            }

            return photoUrl.trim();
        } catch (err) {
            throw new Error(
                getApiFetchErrorMessage(err, 'Nie udało się przesłać zdjęcia.'),
            );
        } finally {
            isPhotoUploadLoading.value = false;
        }
    }

    return {
        isListLoading: readonly(isListLoading),
        isCreateLoading: readonly(isCreateLoading),
        isUpdateLoading: readonly(isUpdateLoading),
        isStatusUpdateLoading: readonly(isStatusUpdateLoading),
        isDeleteLoading: readonly(isDeleteLoading),
        isSetDefaultLoading: readonly(isSetDefaultLoading),
        isDetailLoading: readonly(isDetailLoading),
        isPhotoUploadLoading: readonly(isPhotoUploadLoading),
        deleteError: readonly(deleteError),
        fetchList,
        fetchVehicleById,
        createVehicle,
        updateVehicle,
        updateVehicleStatus,
        deleteVehicle,
        setVehicleAsDefault,
        uploadVehiclePhoto,
    };
}
