import type { Ref } from 'vue';
import type { LocationQueryValue, RouteLocationRaw } from 'vue-router';
import type { CourseDetail } from '~/types/courses/course';
import type { ManagerCourseInfoItem } from '~/types/courses/managerCourseDetail';
import {
    buildCourseOverviewItems,
    readSchoolIdFromQuery,
} from '~/utils/courses/managerCourseDetailPage';
interface UseManagerCourseDetailPresentationOptions {
    course: Readonly<Ref<CourseDetail | null>>;
    querySchoolId: Readonly<
        Ref<LocationQueryValue | LocationQueryValue[] | undefined>
    >;
}

export function useManagerCourseDetailPresentation({
    course,
    querySchoolId,
}: UseManagerCourseDetailPresentationOptions) {
    const schoolIdFromQuery = computed(() => {
        return readSchoolIdFromQuery(querySchoolId.value);
    });

    const effectiveSchoolId = computed(() => {
        const sid = course.value?.schoolId?.trim();

        if (sid && sid.length > 0) {
            return sid;
        }

        const q = schoolIdFromQuery.value;

        return q.length > 0 ? q : '';
    });

    const backToCoursesHref = computed<RouteLocationRaw>(() => {
        if (!effectiveSchoolId.value) {
            return '/manager/courses';
        }

        return {
            path: '/manager/courses',
            query: { schoolId: effectiveSchoolId.value },
        };
    });

    const createCourseTarget = computed<RouteLocationRaw>(() => ({
        path: '/manager/courses/new',
        query: effectiveSchoolId.value
            ? { schoolId: effectiveSchoolId.value }
            : {},
    }));

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
        schoolIdFromQuery,
        effectiveSchoolId,
        backToCoursesHref,
        createCourseTarget,
        courseTitle,
        courseCategoryLabel,
        courseSubtitle,
        overviewItems,
    };
}
