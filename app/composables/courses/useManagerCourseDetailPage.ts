import {
    formatCourseKindLabel,
    type CourseDetail,
} from '~/types/courses/course';
import {
    formatCourseInstructorName,
    getRouteIdString,
    resolveCourseDetailError,
} from '~/utils/courses/managerCourseDetailPage';
import { usePageMeta } from '../core/usePageMeta';
import { useManagerCourseDetailPresentation } from './useManagerCourseDetailPresentation';
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

    const {
        effectiveSchoolId,
        backToCoursesHref,
        createCourseTarget,
        courseTitle,
        courseCategoryLabel,
        courseSubtitle,
        courseInitials,
        overviewItems,
        relatedItems,
    } = useManagerCourseDetailPresentation({
        course,
        querySchoolId: computed(() => route.query.schoolId),
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
