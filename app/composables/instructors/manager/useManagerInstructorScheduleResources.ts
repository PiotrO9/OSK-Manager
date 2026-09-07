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
    let vehiclesLoadSeq = 0;
    let coursesLoadSeq = 0;

    async function loadVehicles(): Promise<void> {
        const sid = schoolId.value;
        const seq = ++vehiclesLoadSeq;

        vehiclesError.value = null;
        vehicles.value = [];

        if (!sid) {
            isVehiclesLoading.value = false;

            return;
        }

        isVehiclesLoading.value = true;

        try {
            const items = await fetchVehiclesList(sid);

            if (seq !== vehiclesLoadSeq) {
                return;
            }

            vehicles.value = items;
        } catch (err: unknown) {
            if (seq !== vehiclesLoadSeq) {
                return;
            }

            vehiclesError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać listy pojazdów.',
            );
        } finally {
            if (seq === vehiclesLoadSeq) {
                isVehiclesLoading.value = false;
            }
        }
    }

    async function loadCourses(): Promise<void> {
        const sid = schoolId.value;
        const seq = ++coursesLoadSeq;

        coursesError.value = null;
        courses.value = [];

        if (!sid) {
            isCoursesLoading.value = false;

            return;
        }

        isCoursesLoading.value = true;

        try {
            const items = await fetchCoursesList(sid);

            if (seq !== coursesLoadSeq) {
                return;
            }

            courses.value = items;
        } catch (err: unknown) {
            if (seq !== coursesLoadSeq) {
                return;
            }

            coursesError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać listy kursów.',
            );
        } finally {
            if (seq === coursesLoadSeq) {
                isCoursesLoading.value = false;
            }
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
