import {
    normalizeInstructorsList,
    type InstructorListItem,
} from '~/types/instructors/instructor';

export function useInstructorsApi() {
    const isListLoading = ref(false);

    async function fetchList(schoolId: string): Promise<InstructorListItem[]> {
        const id = schoolId.trim();

        if (!id) {
            return [];
        }

        isListLoading.value = true;

        try {
            return await requestBffData<InstructorListItem[]>(
                'GET',
                `/api/instructors?schoolId=${encodeURIComponent(id)}`,
                {
                    fallbackMessage: 'Nie udało się pobrać listy instruktorów.',
                    normalize: normalizeInstructorsList,
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
