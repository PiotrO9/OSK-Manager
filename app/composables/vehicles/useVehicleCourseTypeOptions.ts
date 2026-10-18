import type { CourseTypeOption } from '~/types/courses/courseType';
import { useCourseTypesApi } from '~/composables/courses/useCourseTypesApi';

export function useVehicleCourseTypeOptions() {
    const { fetchList } = useCourseTypesApi();
    const courseTypeOptions = ref<CourseTypeOption[]>([]);
    const isCourseTypesLoading = shallowRef(false);
    const courseTypesError = shallowRef<string | null>(null);
    let requestSequence = 0;

    async function loadCourseTypes() {
        const sequence = ++requestSequence;

        isCourseTypesLoading.value = true;
        courseTypesError.value = null;

        try {
            const options = await fetchList();

            if (sequence === requestSequence) courseTypeOptions.value = options;
        } catch {
            if (sequence === requestSequence)
                courseTypesError.value =
                    'Nie udało się pobrać kategorii pojazdów.';
        } finally {
            if (sequence === requestSequence)
                isCourseTypesLoading.value = false;
        }
    }

    onMounted(loadCourseTypes);
    onUnmounted(() => {
        requestSequence += 1;
    });

    return {
        courseTypeOptions,
        isCourseTypesLoading,
        courseTypesError,
        loadCourseTypes,
    };
}
