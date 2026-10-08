import type { CourseDetail } from '~/types/courses/course';
import {
    getRouteIdString,
    resolveCourseDetailError,
} from '~/utils/courses/managerCourseDetailPage';

interface UseManagerCourseDetailDataOptions {
    fetchById: (id: string) => Promise<CourseDetail>;
}

interface LoadCourseHooks {
    beforeLoad?: () => void;
    afterLoad?: (course: CourseDetail) => void;
}

export function useManagerCourseDetailData({
    fetchById,
}: UseManagerCourseDetailDataOptions) {
    const course = ref<CourseDetail | null>(null);
    const loadError = shallowRef<string | null>(null);
    let fetchSequence = 0;

    async function loadCourse(rawId: unknown, hooks: LoadCourseHooks = {}) {
        loadError.value = null;

        const id = getRouteIdString(rawId);

        if (!id) {
            course.value = null;
            loadError.value = 'Nie znaleziono kursu.';

            return;
        }

        const requestSequence = ++fetchSequence;

        course.value = null;
        hooks.beforeLoad?.();

        try {
            const data = await fetchById(id);

            if (requestSequence !== fetchSequence) {
                return;
            }

            course.value = data;
            hooks.afterLoad?.(data);
        } catch (err: unknown) {
            if (requestSequence !== fetchSequence) {
                return;
            }

            course.value = null;
            loadError.value = resolveCourseDetailError(err);
        }
    }

    return {
        course,
        loadError,
        loadCourse,
    };
}
