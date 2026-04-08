import { resolveBffEndpoint } from '~/utils/bffEndpoint';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import { unwrapApiSuccessData } from '~/utils/apiEnvelope';
import { normalizeCoursesList, type CourseListItem } from '~/types/course';

export function useCoursesApi() {
    const _schoolId = ref<string | null>(null);

    const listUrl = () => {
        const id = _schoolId.value;

        return id
            ? resolveBffEndpoint(
                  `/api/courses?schoolId=${encodeURIComponent(id)}`,
              )
            : '';
    };

    const {
        execute: _execList,
        isLoading: isListLoading,
        error: listError,
    } = useApi<unknown>('GET', listUrl);

    async function fetchList(schoolId: string): Promise<CourseListItem[]> {
        _schoolId.value = schoolId;

        const raw = await _execList();

        if (raw === null) {
            const apiErr = listError.value;
            const message = getApiFetchErrorMessage(
                apiErr,
                'Nie udało się pobrać listy kursów.',
            );
            const out = new Error(message) as Error & { statusCode?: number };

            if (
                apiErr !== null &&
                typeof apiErr === 'object' &&
                'statusCode' in apiErr
            ) {
                const code = (apiErr as { statusCode: unknown }).statusCode;

                if (typeof code === 'number') {
                    out.statusCode = code;
                }
            }

            throw out;
        }

        const data = unwrapApiSuccessData<unknown>(raw);

        return normalizeCoursesList(data);
    }

    return {
        isListLoading,
        fetchList,
    };
}
