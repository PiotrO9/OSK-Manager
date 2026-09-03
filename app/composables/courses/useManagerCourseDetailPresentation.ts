import type { Ref } from 'vue';
import type { LocationQueryValue, RouteLocationRaw } from 'vue-router';
import type { CourseDetail } from '~/types/courses/course';
import {
    buildCourseOverviewItems,
    buildCourseRelatedItems,
    readSchoolIdFromQuery,
} from '~/utils/courses/managerCourseDetailPage';
import type { ManagerCourseInfoItem } from './useManagerCourseDetailPage';

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
        const q = schoolIdFromQuery.value;

        if (q.length > 0) {
            return q;
        }

        const sid = course.value?.schoolId?.trim();

        return sid && sid.length > 0 ? sid : '';
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

        return `Kategoria ${courseCategoryLabel.value} - aktywny kurs`;
    });

    const courseInitials = computed(() => {
        const source =
            course.value?.name?.trim() || course.value?.category || 'K';
        const initials = source
            .split(/\s+/)
            .filter((part) => part.length > 0)
            .slice(0, 2)
            .map((part) => part.charAt(0))
            .join('');

        return initials.length > 0 ? initials.toUpperCase() : 'K';
    });

    const overviewItems = computed<ManagerCourseInfoItem[]>(() => {
        if (!course.value) {
            return [];
        }

        return buildCourseOverviewItems(course.value);
    });

    const relatedItems = computed<ManagerCourseInfoItem[]>(() => {
        if (!course.value) {
            return [];
        }

        return buildCourseRelatedItems({
            course: course.value,
            courseCategoryLabel: courseCategoryLabel.value,
            effectiveSchoolId: effectiveSchoolId.value,
        });
    });

    return {
        schoolIdFromQuery,
        effectiveSchoolId,
        backToCoursesHref,
        createCourseTarget,
        courseTitle,
        courseCategoryLabel,
        courseSubtitle,
        courseInitials,
        overviewItems,
        relatedItems,
    };
}
