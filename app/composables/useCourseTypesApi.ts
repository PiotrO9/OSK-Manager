import {
    normalizeCourseTypesList,
    type CourseTypeOption,
} from '~/types/courseType';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import { unwrapApiSuccessData } from '~/utils/apiEnvelope';
import { resolveBffEndpoint } from '~/utils/bffEndpoint';

export function useCourseTypesApi() {
    const {
        execute: _execList,
        isLoading: isListLoading,
        error: listError,
    } = useApi<unknown>('GET', () => resolveBffEndpoint('/api/course-types'));

    async function fetchList(): Promise<CourseTypeOption[]> {
        const raw = await _execList();

        if (raw === null) {
            throw new Error(
                getApiFetchErrorMessage(
                    listError.value,
                    'Nie udało się pobrać katalogu kategorii.',
                ),
            );
        }

        const data = unwrapApiSuccessData<unknown>(raw);

        return normalizeCourseTypesList(data);
    }

    return {
        isListLoading,
        fetchList,
    };
}
