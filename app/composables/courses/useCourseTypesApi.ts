import {
    normalizeCourseTypesList,
    type CourseTypeOption,
} from '~/types/courses/courseType';

export function useCourseTypesApi() {
    const isListLoading = ref(false);

    async function fetchList(): Promise<CourseTypeOption[]> {
        isListLoading.value = true;

        try {
            return await requestBffData<CourseTypeOption[]>(
                'GET',
                '/api/course-types',
                {
                    fallbackMessage: 'Nie udało się pobrać katalogu kategorii.',
                    normalize: normalizeCourseTypesList,
                },
            );
        } finally {
            isListLoading.value = false;
        }
    }

    return {
        isListLoading: readonly(isListLoading),
        fetchList,
    };
}
