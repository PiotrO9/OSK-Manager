import type { MaybeRefOrGetter } from 'vue';
import {
    normalizeVehicle,
    normalizeVehiclesList,
    type Vehicle,
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

    return {
        isListLoading,
        isCreateLoading,
        isUpdateLoading,
        fetchList,
        createVehicle,
        updateVehicle,
    };
}
