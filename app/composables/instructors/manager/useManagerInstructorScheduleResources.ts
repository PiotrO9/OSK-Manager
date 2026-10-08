import type { Ref } from 'vue';
import type { CourseListItem } from '~/types/courses/course';
import type { Vehicle } from '~/types/vehicles/vehicle';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

interface UseManagerInstructorScheduleResourcesOptions {
    schoolId: Ref<string>;
}

export function useManagerInstructorScheduleResources({
    schoolId,
}: UseManagerInstructorScheduleResourcesOptions) {
    const { fetchList: fetchVehiclesList } = useVehiclesApi();
    const { fetchList: fetchCoursesList } = useCoursesApi();

    const vehicles = ref<Vehicle[]>([]);
    const vehiclesError = ref<string | null>(null);
    const isVehiclesLoading = ref(false);

    const courses = ref<CourseListItem[]>([]);
    const coursesError = ref<string | null>(null);
    const isCoursesLoading = ref(false);
    let vehiclesLoadSequence = 0;
    let coursesLoadSequence = 0;
    let loadedSchoolId: string | null = null;

    async function loadVehicles(): Promise<void> {
        const schoolIdSnapshot = schoolId.value;
        const requestSequence = ++vehiclesLoadSequence;

        vehiclesError.value = null;
        vehicles.value = [];

        if (!schoolIdSnapshot) {
            isVehiclesLoading.value = false;

            return;
        }

        isVehiclesLoading.value = true;

        try {
            const items = await fetchVehiclesList(schoolIdSnapshot);

            if (requestSequence !== vehiclesLoadSequence) {
                return;
            }

            vehicles.value = items;
        } catch (err: unknown) {
            if (requestSequence !== vehiclesLoadSequence) {
                return;
            }

            vehiclesError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać listy pojazdów.',
            );
        } finally {
            if (requestSequence === vehiclesLoadSequence) {
                isVehiclesLoading.value = false;
            }
        }
    }

    async function loadCourses(): Promise<void> {
        const schoolIdSnapshot = schoolId.value;
        const requestSequence = ++coursesLoadSequence;

        coursesError.value = null;
        courses.value = [];

        if (!schoolIdSnapshot) {
            isCoursesLoading.value = false;

            return;
        }

        isCoursesLoading.value = true;

        try {
            const items = await fetchCoursesList(schoolIdSnapshot);

            if (requestSequence !== coursesLoadSequence) {
                return;
            }

            courses.value = items;
        } catch (err: unknown) {
            if (requestSequence !== coursesLoadSequence) {
                return;
            }

            coursesError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać listy kursów.',
            );
        } finally {
            if (requestSequence === coursesLoadSequence) {
                isCoursesLoading.value = false;
            }
        }
    }

    async function loadResources(): Promise<void> {
        const schoolIdSnapshot = schoolId.value;

        if (
            schoolIdSnapshot &&
            loadedSchoolId === schoolIdSnapshot &&
            !vehiclesError.value &&
            !coursesError.value
        ) {
            return;
        }

        await Promise.all([loadVehicles(), loadCourses()]);

        if (
            schoolIdSnapshot &&
            schoolId.value === schoolIdSnapshot &&
            !vehiclesError.value &&
            !coursesError.value
        ) {
            loadedSchoolId = schoolIdSnapshot;
        }
    }

    return {
        vehicles,
        vehiclesError,
        isVehiclesLoading,
        courses,
        coursesError,
        isCoursesLoading,
        loadVehicles,
        loadCourses,
        loadResources,
    };
}
