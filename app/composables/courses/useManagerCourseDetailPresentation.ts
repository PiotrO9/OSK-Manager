import { appPaths } from '~~/shared/routing/appPaths';
import type { Ref } from 'vue';
import type { RouteLocationRaw } from 'vue-router';
import type { CourseDetail } from '~/types/courses/course';
import type { ManagerCourseInfoItem } from '~/types/courses/managerCourseDetail';
import { buildCourseOverviewItems } from '~/utils/courses/managerCourseDetailPage';
interface UseManagerCourseDetailPresentationOptions {
    course: Readonly<Ref<CourseDetail | null>>;
}

export function useManagerCourseDetailPresentation({
    course,
}: UseManagerCourseDetailPresentationOptions) {
    const effectiveSchoolId = computed(
        () => course.value?.schoolId?.trim() ?? '',
    );

    const backToCoursesHref = computed<RouteLocationRaw>(() =>
        appPaths.managerCourses(),
    );
    const createCourseTarget = computed<RouteLocationRaw>(() =>
        appPaths.managerCourseNew(),
    );

    const courseTitle = computed(
        () => course.value?.name?.trim() || 'Szczegóły kursu',
    );

    const courseCategoryLabel = computed(() => {
        const category = course.value?.courseType?.name?.trim();

        if (category) {
            return category;
        }

        return course.value?.category?.trim() || '--';
    });

    const courseSubtitle = computed(() => {
        if (!course.value) {
            return 'Parametry kursu, kursanci, godziny i ustawienia.';
        }

        return `${courseCategoryLabel.value} - aktywny kurs`;
    });

    const overviewItems = computed<ManagerCourseInfoItem[]>(() => {
        if (!course.value) {
            return [];
        }

        return buildCourseOverviewItems(course.value);
    });

    return {
        effectiveSchoolId,
        backToCoursesHref,
        createCourseTarget,
        courseTitle,
        courseCategoryLabel,
        courseSubtitle,
        overviewItems,
    };
}
