import type { Ref } from 'vue';
import type { CourseListItem } from '~/types/courses/course';
import {
    formatStudentDisplayName,
    type StudentListItem,
} from '~/types/students/student';
import { resolveAssignToCourseError } from '~/utils/students/managerStudentsPage';

interface UseManagerStudentCourseAssignmentOptions {
    activeSchoolId: Ref<string>;
    courses: Ref<CourseListItem[]>;
    isCoursesLoading: Ref<boolean>;
    loadCoursesForFilter: () => Promise<void>;
    loadStudents: () => Promise<void>;
}

export function useManagerStudentCourseAssignment({
    activeSchoolId,
    courses,
    isCoursesLoading,
    loadCoursesForFilter,
    loadStudents,
}: UseManagerStudentCourseAssignmentOptions) {
    const { assignToCourse } = useStudentsApi();
    const { addToast } = useAppToast();

    const assignDialogOpen = ref(false);
    const assignTargetStudent = ref<StudentListItem | null>(null);
    const isAssignSaving = ref(false);
    const assignApiError = ref<string | null>(null);

    const assignTargetDisplayName = computed(() => {
        const s = assignTargetStudent.value;

        if (!s) {
            return '';
        }

        return formatStudentDisplayName(s);
    });

    function handleOpenAssignCourse(student: StudentListItem) {
        assignTargetStudent.value = student;
        assignApiError.value = null;
        assignDialogOpen.value = true;

        if (!activeSchoolId.value.trim()) {
            return;
        }

        if (courses.value.length === 0 && !isCoursesLoading.value) {
            void loadCoursesForFilter();
        }
    }

    function handleAssignDialogOpenChange(open: boolean) {
        assignDialogOpen.value = open;

        if (!open) {
            assignTargetStudent.value = null;
            assignApiError.value = null;
        }
    }

    async function handleAssignCourseSubmit(courseId: string) {
        const student = assignTargetStudent.value;

        if (!student || isAssignSaving.value) {
            return;
        }

        assignApiError.value = null;
        isAssignSaving.value = true;

        try {
            await assignToCourse({ userId: student.userId, courseId });

            addToast({
                title: 'Kursant zapisany na kurs',
                variant: 'success',
            });

            assignDialogOpen.value = false;
            assignTargetStudent.value = null;

            await loadStudents();
        } catch (err) {
            const message = resolveAssignToCourseError(err);

            assignApiError.value = message;

            addToast({
                title: 'Nie udało się zapisać na kurs',
                description: message,
                variant: 'error',
            });
        } finally {
            isAssignSaving.value = false;
        }
    }

    return {
        assignDialogOpen,
        assignTargetDisplayName,
        isAssignSaving,
        assignApiError,
        handleOpenAssignCourse,
        handleAssignDialogOpenChange,
        handleAssignCourseSubmit,
    };
}
