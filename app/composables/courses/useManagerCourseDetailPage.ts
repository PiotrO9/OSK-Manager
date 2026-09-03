import type { RouteLocationRaw } from 'vue-router';
import {
    formatCourseKindLabel,
    type CourseDetail,
} from '~/types/courses/course';
import {
    buildCourseOverviewItems,
    buildCourseRelatedItems,
    formatCourseInstructorName,
    getRouteIdString,
    readSchoolIdFromQuery,
    resolveCourseDetailError,
} from '~/utils/courses/managerCourseDetailPage';
import { usePageMeta } from '../core/usePageMeta';
import {
    MANAGER_COURSE_NO_INSTRUCTOR_VALUE,
    useManagerCourseInstructorAssignment,
} from './useManagerCourseInstructorAssignment';

export interface ManagerCourseInfoItem {
    label: string;
    description: string;
    badge: string;
    tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
}

export function useManagerCourseDetailPage() {
    const route = useRoute();
    const { addToast } = useAppToast();
    const { fetchById, isDetailLoading, patchCourse, isPatchLoading } =
        useCoursesApi();
    const { fetchList: fetchInstructorsList } = useInstructorsApi();

    const course = ref<CourseDetail | null>(null);
    const loadError = shallowRef<string | null>(null);
    let fetchSeq = 0;

    const schoolIdFromQuery = computed(() => {
        return readSchoolIdFromQuery(route.query.schoolId);
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
        () => course.value?.name?.trim() || 'Szczeg�y kursu',
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

    usePageMeta({
        title: () => courseTitle.value,
        description: () => 'Dane kursu i przypisanie instruktora.',
    });

    function formatInstructorName(c: CourseDetail): string {
        return formatCourseInstructorName(c);
    }

    const {
        instructors,
        instructorsLoadError,
        isInstructorsLoading,
        selectedInstructorProfileId,
        qualifiedInstructors,
        instructorSaveBlockedReason,
        canSaveInstructorAssignment,
        loadInstructors,
        resetInstructorSelection,
        syncInstructorSelectionFromCourse,
        handleInstructorSelectChange,
        handleSaveInstructorAssignment,
    } = useManagerCourseInstructorAssignment({
        course,
        effectiveSchoolId,
        isPatchLoading,
        getRouteCourseId: () => route.params.id,
        fetchInstructorsList,
        patchCourse,
        addToast,
    });

    async function loadCourse(rawId: unknown) {
        loadError.value = null;

        const id = getRouteIdString(rawId);

        if (!id) {
            course.value = null;
            loadError.value = 'Nie znaleziono kursu.';

            return;
        }

        const seq = ++fetchSeq;

        course.value = null;
        resetInstructorSelection();

        try {
            const data = await fetchById(id);

            if (seq !== fetchSeq) {
                return;
            }

            course.value = data;
            syncInstructorSelectionFromCourse();
        } catch (err: unknown) {
            if (seq !== fetchSeq) {
                return;
            }

            course.value = null;
            loadError.value = resolveCourseDetailError(err);
        }
    }

    watch(
        () => route.params.id,
        async (id) => {
            await loadCourse(id);
        },
        { immediate: true },
    );

    return {
        NO_INSTRUCTOR_VALUE: MANAGER_COURSE_NO_INSTRUCTOR_VALUE,
        route,
        course,
        loadError,
        instructors,
        instructorsLoadError,
        isInstructorsLoading,
        selectedInstructorProfileId,
        qualifiedInstructors,
        effectiveSchoolId,
        backToCoursesHref,
        createCourseTarget,
        courseTitle,
        courseCategoryLabel,
        courseSubtitle,
        courseInitials,
        overviewItems,
        relatedItems,
        isDetailLoading,
        isPatchLoading,
        instructorSaveBlockedReason,
        canSaveInstructorAssignment,
        loadCourse,
        loadInstructors,
        handleInstructorSelectChange,
        handleSaveInstructorAssignment,
        formatInstructorName,
        formatCourseKindLabel,
    };
}
