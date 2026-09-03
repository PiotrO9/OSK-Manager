import type { CourseTypeOption } from '~/types/courses/courseType';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { getManagerInstructorGenericCourseTypesErrorMessage } from '~/utils/instructors/managerInstructorDetailsPage';

export function useManagerInstructorDetailsCourseTypes() {
    const {
        fetchList: fetchCourseTypesList,
        isListLoading: isCourseTypesLoading,
    } = useCourseTypesApi();

    const courseTypes = ref<CourseTypeOption[]>([]);
    const courseTypesError = ref<string | null>(null);

    async function loadCourseTypes(): Promise<void> {
        courseTypesError.value = null;

        try {
            courseTypes.value = await fetchCourseTypesList();
        } catch (err: unknown) {
            courseTypes.value = [];
            courseTypesError.value = getApiFetchErrorMessage(
                err,
                getManagerInstructorGenericCourseTypesErrorMessage(),
            );
        }
    }

    return {
        courseTypes,
        courseTypesError,
        isCourseTypesLoading,
        loadCourseTypes,
    };
}
