import type { MaybeRefOrGetter } from 'vue';
import {
    normalizeDrivingSchool,
    normalizeDrivingSchoolsList,
    type DrivingSchool,
} from '~/types/drivingSchool';

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

export function useDrivingSchoolsApi() {
    const baseUrl = () => resolveBffEndpoint('/api/driving-schools');

    const { execute: _execList, isLoading: isListLoading } = useApi<unknown>(
        'GET',
        baseUrl,
    );

    const _createBody = ref<CreateDrivingSchoolBody | null>(null);
    const { execute: _execCreate, isLoading: isCreateLoading } =
        useApi<unknown>('POST', baseUrl, {
            body: _createBody as MaybeRefOrGetter<unknown>,
        });

    const _deleteId = ref<string | null>(null);
    const _deleteUrl = () => {
        const id = _deleteId.value;

        return id ? resolveBffEndpoint(`/api/driving-schools/${id}`) : '';
    };

    const { execute: _execDelete, isLoading: isDeleteLoading } =
        useApi<unknown>('DELETE', _deleteUrl);

    const _updateId = ref<string | null>(null);
    const _updateBody = ref<UpdateDrivingSchoolBody | null>(null);
    const _updateUrl = () => {
        const id = _updateId.value;

        return id ? resolveBffEndpoint(`/api/driving-schools/${id}`) : '';
    };

    const { execute: _execUpdate, isLoading: isUpdateLoading } =
        useApi<unknown>('PATCH', _updateUrl, {
            body: _updateBody as MaybeRefOrGetter<unknown>,
        });

    const _setDefaultId = ref<string | null>(null);
    const _setDefaultUrl = () => {
        const id = _setDefaultId.value;

        return id
            ? resolveBffEndpoint(`/api/driving-schools/${id}/set-default`)
            : '';
    };

    const { execute: _execSetDefault, isLoading: isSetDefaultLoading } =
        useApi<unknown>('PATCH', _setDefaultUrl);

    async function fetchList(): Promise<DrivingSchool[]> {
        const raw = await _execList();

        if (raw === null) throw new Error('Nie udało się pobrać listy OSK.');

        const data = unwrapApiSuccessData<unknown>(raw);

        return normalizeDrivingSchoolsList(data);
    }

    async function create(
        body: CreateDrivingSchoolBody,
    ): Promise<DrivingSchool> {
        _createBody.value = body;

        const raw = await _execCreate();

        if (raw === null) throw new Error('Nie udało się dodać OSK.');

        const data = unwrapApiSuccessData<unknown>(raw);
        const school = normalizeDrivingSchool(data);

        if (!school) throw new Error('Nieprawidłowa odpowiedź serwera.');

        return school;
    }

    async function remove(id: string): Promise<void> {
        _deleteId.value = id;

        try {
            const raw = await _execDelete();

            if (raw === null) throw new Error('Nie udało się usunąć OSK.');
        } finally {
            _deleteId.value = null;
        }
    }

    async function update(
        id: string,
        body: UpdateDrivingSchoolBody,
    ): Promise<DrivingSchool> {
        _updateId.value = id;
        _updateBody.value = body;

        try {
            const raw = await _execUpdate();

            if (raw === null)
                throw new Error('Nie udało się zapisać zmian OSK.');

            const data = unwrapApiSuccessData<unknown>(raw);
            const school = normalizeDrivingSchool(data);

            if (!school) throw new Error('Nieprawidłowa odpowiedź serwera.');

            return school;
        } finally {
            _updateId.value = null;
            _updateBody.value = null;
        }
    }

    async function setAsDefault(id: string): Promise<void> {
        _setDefaultId.value = id;

        try {
            const raw = await _execSetDefault();

            if (raw === null) {
                throw new Error('Nie udało się ustawić domyślnej OSK.');
            }

            if (typeof raw !== 'object' || raw === null) {
                throw new Error('Nieprawidłowa odpowiedź serwera.');
            }

            const envelope = raw as { success?: boolean; error?: string };

            if (
                envelope.success === false &&
                typeof envelope.error === 'string'
            ) {
                throw new Error(envelope.error);
            }

            if (envelope.success !== true) {
                throw new Error('Nieprawidłowa odpowiedź serwera.');
            }
        } finally {
            _setDefaultId.value = null;
        }
    }

    return {
        isListLoading,
        isCreateLoading,
        isDeleteLoading,
        isUpdateLoading,
        isSetDefaultLoading,
        fetchList,
        create,
        remove,
        update,
        setAsDefault,
    };
}
