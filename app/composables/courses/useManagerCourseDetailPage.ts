import {
    formatCourseKindLabel,
    type CourseDetail,
} from '~/types/courses/course';
import { formatCourseInstructorName } from '~/utils/courses/managerCourseDetailPage';
import { usePageMeta } from '../core/usePageMeta';
import { useManagerCourseDetailData } from './useManagerCourseDetailData';
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

    const { course, loadError, loadCourse } = useManagerCourseDetailData({
        fetchById,
    });

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

    watch(
        () => route.params.id,
        async (id) => {
            await loadCourse(id, {
                beforeLoad: resetInstructorSelection,
                afterLoad: syncInstructorSelectionFromCourse,
            });
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
