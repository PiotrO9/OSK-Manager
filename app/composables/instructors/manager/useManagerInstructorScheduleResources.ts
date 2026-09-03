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

    async function loadVehicles(): Promise<void> {
        const sid = schoolId.value;

        vehiclesError.value = null;
        vehicles.value = [];

        if (!sid) {
            return;
        }

        isVehiclesLoading.value = true;

        try {
            vehicles.value = await fetchVehiclesList(sid);
        } catch (err: unknown) {
            vehiclesError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać listy pojazdów.',
            );
        } finally {
            isVehiclesLoading.value = false;
        }
    }

    async function loadCourses(): Promise<void> {
        const sid = schoolId.value;

        coursesError.value = null;
        courses.value = [];

        if (!sid) {
            return;
        }

        isCoursesLoading.value = true;

        try {
            courses.value = await fetchCoursesList(sid);
        } catch (err: unknown) {
            coursesError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać listy kursów.',
            );
        } finally {
            isCoursesLoading.value = false;
        }
    }

    async function loadResources(): Promise<void> {
        await Promise.all([loadVehicles(), loadCourses()]);
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
