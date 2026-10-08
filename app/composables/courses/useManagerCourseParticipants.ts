import type { Ref } from 'vue';
import type { CourseDetail } from '~/types/courses/course';
import type {
    StudentListItem,
    StudentListPage,
} from '~/types/students/student';
import type { StudentsListQuery } from '~/utils/students/studentApiRequests';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

interface UseManagerCourseParticipantsOptions {
    course: Readonly<Ref<CourseDetail | null>>;
    effectiveSchoolId: Readonly<Ref<string>>;
    fetchStudentsList: (params: StudentsListQuery) => Promise<StudentListPage>;
}

const MANAGER_COURSE_PARTICIPANTS_PAGE_SIZE = 8;

export function useManagerCourseParticipants({
    course,
    effectiveSchoolId,
    fetchStudentsList,
}: UseManagerCourseParticipantsOptions) {
    const participants = ref<StudentListItem[]>([]);
    const participantsCurrentPage = shallowRef(1);
    const participantsTotal = shallowRef<number | null>(null);
    const participantsTotalPages = shallowRef(0);
    const participantsLoadError = shallowRef<string | null>(null);
    const isParticipantsLoading = shallowRef(false);
    let fetchSequence = 0;

    const participantsPagination = computed(() => {
        if (
            participantsTotal.value === null ||
            participantsTotalPages.value <= 1
        ) {
            return null;
        }

        return {
            total: participantsTotal.value,
            totalPages: participantsTotalPages.value,
            pageSize: MANAGER_COURSE_PARTICIPANTS_PAGE_SIZE,
        };
    });

    async function loadParticipants(page = participantsCurrentPage.value) {
        const currentCourse = course.value;
        const schoolId = effectiveSchoolId.value.trim();
        const targetPage = Math.max(1, page);

        participantsLoadError.value = null;

        if (!currentCourse || !schoolId) {
            participants.value = [];
            participantsCurrentPage.value = 1;
            participantsTotal.value = null;
            participantsTotalPages.value = 0;

            return;
        }

        const requestSequence = ++fetchSequence;

        isParticipantsLoading.value = true;

        try {
            const page = await fetchStudentsList({
                schoolId,
                courseId: currentCourse.id,
                page: targetPage,
                limit: MANAGER_COURSE_PARTICIPANTS_PAGE_SIZE,
            });

            if (requestSequence !== fetchSequence) {
                return;
            }

            participants.value = page.items;
            participantsCurrentPage.value = page.page;
            participantsTotal.value = page.total;
            participantsTotalPages.value = page.totalPages;
        } catch (err: unknown) {
            if (requestSequence !== fetchSequence) {
                return;
            }

            participants.value = [];
            participantsTotal.value = null;
            participantsTotalPages.value = 0;
            participantsLoadError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać uczestników kursu.',
            );
        } finally {
            if (requestSequence === fetchSequence) {
                isParticipantsLoading.value = false;
            }
        }
    }

    async function loadPreviousParticipantsPage() {
        if (participantsCurrentPage.value <= 1 || isParticipantsLoading.value) {
            return;
        }

        await loadParticipants(participantsCurrentPage.value - 1);
    }

    async function loadNextParticipantsPage() {
        if (
            isParticipantsLoading.value ||
            participantsTotalPages.value <= participantsCurrentPage.value
        ) {
            return;
        }

        await loadParticipants(participantsCurrentPage.value + 1);
    }

    watch(
        () => [course.value?.id ?? '', effectiveSchoolId.value] as const,
        () => {
            participantsCurrentPage.value = 1;
            void loadParticipants(1);
        },
        { immediate: true },
    );

    return {
        participants,
        participantsCurrentPage: readonly(participantsCurrentPage),
        participantsPagination,
        participantsTotal,
        participantsLoadError,
        isParticipantsLoading: readonly(isParticipantsLoading),
        loadParticipants,
        loadPreviousParticipantsPage,
        loadNextParticipantsPage,
    };
}
