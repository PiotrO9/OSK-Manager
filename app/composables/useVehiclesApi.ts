import type { MaybeRefOrGetter } from 'vue';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import { resolveBffEndpoint } from '~/utils/bffEndpoint';
import {
    normalizeVehicle,
    normalizeVehicleDetail,
    normalizeVehiclesList,
    type Vehicle,
    type VehicleDetail,
    type VehicleStatus,
    type VehicleWritePayload,
} from '~/types/vehicle';

export type VehicleCreateBody = VehicleWritePayload & { schoolId: string };

export type VehicleUpdateBody = VehicleWritePayload;

export function useVehiclesApi() {
    const _schoolId = ref<string | null>(null);

    const listUrl = () => {
        const id = _schoolId.value;

        return id
            ? resolveBffEndpoint(
                  `/api/vehicles?schoolId=${encodeURIComponent(id)}`,
              )
            : '';
    };

    const { execute: _execList, isLoading: isListLoading } = useApi<unknown>(
        'GET',
        listUrl,
    );

    const createUrl = () => resolveBffEndpoint('/api/vehicles');
    const _createBody = ref<VehicleCreateBody | null>(null);

    const {
        execute: _execCreate,
        isLoading: isCreateLoading,
        error: createError,
    } = useApi<unknown>('POST', createUrl, {
        body: _createBody as MaybeRefOrGetter<unknown>,
    });

    const _updateId = ref<string | null>(null);
    const _updateBody = ref<VehicleUpdateBody | null>(null);
    const _updateUrl = () => {
        const id = _updateId.value;

        return id ? resolveBffEndpoint(`/api/vehicles/${id}`) : '';
    };

    const {
        execute: _execUpdate,
        isLoading: isUpdateLoading,
        error: updateError,
    } = useApi<unknown>('PATCH', _updateUrl, {
        body: _updateBody as MaybeRefOrGetter<unknown>,
    });

    const _statusUpdateId = ref<string | null>(null);
    const _statusUpdateBody = ref<{ status: VehicleStatus } | null>(null);
    const _statusUpdateUrl = () => {
        const id = _statusUpdateId.value;

        return id
            ? resolveBffEndpoint(
                  `/api/vehicles/${encodeURIComponent(id)}/status`,
              )
            : '';
    };

    const {
        execute: _execStatusUpdate,
        isLoading: isStatusUpdateLoading,
        error: statusUpdateError,
    } = useApi<unknown>('PATCH', _statusUpdateUrl, {
        body: _statusUpdateBody as MaybeRefOrGetter<unknown>,
    });

    const _deleteId = ref<string | null>(null);
    const _deleteUrl = () => {
        const id = _deleteId.value;

        return id ? resolveBffEndpoint(`/api/vehicles/${id}`) : '';
    };

    const {
        execute: _execDelete,
        isLoading: isDeleteLoading,
        error: deleteError,
    } = useApi<unknown>('DELETE', _deleteUrl);

    const _setDefaultSchoolId = ref<string | null>(null);
    const _setDefaultBody = ref<{ vehicleId: string } | null>(null);
    const _setDefaultUrl = () => {
        const sid = _setDefaultSchoolId.value;

        return sid
            ? resolveBffEndpoint(
                  `/api/driving-schools/${encodeURIComponent(sid)}/default-vehicle`,
              )
            : '';
    };

    const {
        execute: _execSetDefault,
        isLoading: isSetDefaultLoading,
        error: setDefaultError,
    } = useApi<unknown>('PATCH', _setDefaultUrl, {
        body: _setDefaultBody as MaybeRefOrGetter<unknown>,
    });

    const _detailId = ref<string | null>(null);
    const _detailUrl = () => {
        const id = _detailId.value;

        return id
            ? resolveBffEndpoint(`/api/vehicles/${encodeURIComponent(id)}`)
            : '';
    };

    const {
        execute: _execDetail,
        isLoading: isDetailLoading,
        error: detailError,
    } = useApi<unknown>('GET', _detailUrl);

    const isPhotoUploadLoading = ref(false);

    async function fetchList(schoolId: string): Promise<Vehicle[]> {
        _schoolId.value = schoolId;

        const raw = await _execList();

        if (raw === null) {
            throw new Error('Nie udało się pobrać listy pojazdów.');
        }

        const data = unwrapApiSuccessData<unknown>(raw);

        return normalizeVehiclesList(data);
    }

    async function createVehicle(body: VehicleCreateBody): Promise<Vehicle> {
        _createBody.value = body;

        const raw = await _execCreate();

        if (raw === null) {
            throw new Error(
                getApiFetchErrorMessage(
                    createError.value,
                    'Nie udało się dodać pojazdu.',
                ),
            );
        }

        const data = unwrapApiSuccessData<unknown>(raw);
        const vehicle = normalizeVehicle(data, 0);

        if (!vehicle) {
            throw new Error('Nieprawidłowa odpowiedź serwera.');
        }

        return vehicle;
    }

    async function updateVehicle(
        id: string,
        body: VehicleUpdateBody,
    ): Promise<Vehicle> {
        _updateId.value = id;
        _updateBody.value = body;

        try {
            const raw = await _execUpdate();

            if (raw === null) {
                throw new Error(
                    getApiFetchErrorMessage(
                        updateError.value,
                        'Nie udało się zapisać pojazdu.',
                    ),
                );
            }

            const data = unwrapApiSuccessData<unknown>(raw);
            const vehicle = normalizeVehicle(data, 0);

            if (!vehicle) {
                throw new Error('Nieprawidłowa odpowiedź serwera.');
            }

            return vehicle;
        } finally {
            _updateId.value = null;
            _updateBody.value = null;
        }
    }

    async function updateVehicleStatus(
        id: string,
        status: VehicleStatus,
    ): Promise<Vehicle> {
        _statusUpdateId.value = id;
        _statusUpdateBody.value = { status };

        try {
            const raw = await _execStatusUpdate();

            if (raw === null) {
                throw new Error(
                    getApiFetchErrorMessage(
                        statusUpdateError.value,
                        'Nie udało się zmienić statusu pojazdu.',
                    ),
                );
            }

            const data = unwrapApiSuccessData<unknown>(raw);
            const vehicle = normalizeVehicle(data, 0);

            if (!vehicle) {
                throw new Error('Nieprawid?owa odpowied? serwera.');
            }

            return vehicle;
        } finally {
            _statusUpdateId.value = null;
            _statusUpdateBody.value = null;
        }
    }

    async function deleteVehicle(id: string): Promise<void> {
        _deleteId.value = id;

        try {
            const raw = await _execDelete();

            if (raw === null) {
                const source = deleteError.value;
                const message = getApiFetchErrorMessage(
                    source,
                    'Nie udało się usunąć pojazdu.',
                );
                const err = new Error(message) as Error & {
                    statusCode?: number;
                };

                const statusCode = getApiErrorStatusCode(source);

                if (statusCode !== undefined) {
                    err.statusCode = statusCode;
                }

                throw err;
            }
        } finally {
            _deleteId.value = null;
        }
    }

    async function setVehicleAsDefault(
        schoolId: string,
        vehicleId: string,
    ): Promise<void> {
        _setDefaultSchoolId.value = schoolId;
        _setDefaultBody.value = { vehicleId };

        try {
            const raw = await _execSetDefault();

            if (raw === null) {
                throw new Error(
                    getApiFetchErrorMessage(
                        setDefaultError.value,
                        'Nie udało się ustawić domyślnego pojazdu.',
                    ),
                );
            }

            assertBooleanSuccessEnvelope(raw);
        } finally {
            _setDefaultSchoolId.value = null;
            _setDefaultBody.value = null;
        }
    }

    async function fetchVehicleById(id: string): Promise<VehicleDetail> {
        _detailId.value = id;

        try {
            const raw = await _execDetail();

            if (raw === null) {
                throw new Error(
                    getApiFetchErrorMessage(
                        detailError.value,
                        'Nie udało się pobrać pojazdu.',
                    ),
                );
            }

            const data = unwrapApiSuccessData<unknown>(raw);
            const vehicle = normalizeVehicleDetail(data, 0);

            if (!vehicle) {
                throw new Error('Nieprawidłowa odpowiedź serwera.');
            }

            return vehicle;
        } finally {
            _detailId.value = null;
        }
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
        isListLoading,
        isCreateLoading,
        isUpdateLoading,
        isStatusUpdateLoading,
        isDeleteLoading,
        isSetDefaultLoading,
        isDetailLoading,
        isPhotoUploadLoading,
        deleteError,
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
