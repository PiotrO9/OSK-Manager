import {
    formatCourseKindLabel,
    type CourseDetail,
} from '~/types/courses/course';
import {
    buildCourseCapacityInsight,
    formatCourseInstructorName,
} from '~/utils/courses/managerCourseDetailPage';
import { usePageMeta } from '../core/usePageMeta';
import { useManagerCourseDetailData } from './useManagerCourseDetailData';
import { useManagerCourseDetailPresentation } from './useManagerCourseDetailPresentation';
import {
    MANAGER_COURSE_NO_INSTRUCTOR_VALUE,
    useManagerCourseInstructorAssignment,
} from './useManagerCourseInstructorAssignment';

export type { ManagerCourseInfoItem } from '~/types/courses/managerCourseDetail';

export function useManagerCourseDetailPage() {
    const route = useRoute();
    const { addToast } = useAppToast();
    const { fetchById, isDetailLoading, patchCourse, isPatchLoading } =
        useCoursesApi();
    const { fetchList: fetchInstructorsList } = useInstructorsApi();
    const { fetchList: fetchStudentsList } = useStudentsApi();

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
        overviewItems,
    } = useManagerCourseDetailPresentation({
        course,
        querySchoolId: computed(() => route.query.schoolId),
    });

    const {
        participants,
        participantsCurrentPage,
        participantsPagination,
        participantsTotal,
        participantsLoadError,
        isParticipantsLoading,
        loadParticipants,
        loadPreviousParticipantsPage,
        loadNextParticipantsPage,
    } = useManagerCourseParticipants({
        course,
        effectiveSchoolId,
        fetchStudentsList,
    });

    const capacityInsight = computed(() => {
        if (!course.value) {
            return null;
        }

        return buildCourseCapacityInsight({
            course: course.value,
            participantCount: participantsTotal.value,
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
        currentInstructorProfileId,
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
        currentInstructorProfileId,
        qualifiedInstructors,
        effectiveSchoolId,
        backToCoursesHref,
        createCourseTarget,
        courseTitle,
        courseCategoryLabel,
        courseSubtitle,
        overviewItems,
        participants,
        participantsCurrentPage,
        participantsPagination,
        participantsTotal,
        participantsLoadError,
        isParticipantsLoading,
        capacityInsight,
        isDetailLoading,
        isPatchLoading,
        instructorSaveBlockedReason,
        canSaveInstructorAssignment,
        loadCourse,
        loadInstructors,
        loadParticipants,
        loadPreviousParticipantsPage,
        loadNextParticipantsPage,
        handleInstructorSelectChange,
        handleSaveInstructorAssignment,
        formatInstructorName,
        formatCourseKindLabel,
    };
}
