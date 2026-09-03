import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';
import type { CourseListItem } from '~/types/courses/course';
import type { StudentListItem } from '~/types/students/student';

const assignToCourse = vi.fn();
const addToast = vi.fn();

function installNuxtCourseAssignmentGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('useStudentsApi', () => ({
        assignToCourse,
    }));
    vi.stubGlobal('useAppToast', () => ({
        addToast,
    }));
}

function course(overrides: Partial<CourseListItem> = {}): CourseListItem {
    return {
        id: 'course-1',
        name: 'Kurs B',
        category: 'B',
        courseType: null,
        type: 'PRACTICAL',
        totalHours: 30,
        instructor: null,
        ...overrides,
    };
}

function student(overrides: Partial<StudentListItem> = {}): StudentListItem {
    return {
        id: 'student-1',
        userId: 'user-1',
        firstName: 'Jan',
        lastName: 'Kowalski',
        email: 'jan@example.com',
        phone: null,
        pkkNumber: null,
        isActive: true,
        createdAt: '2026-09-03T10:00:00.000Z',
        ...overrides,
    };
}

describe('useManagerStudentCourseAssignment', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        installNuxtCourseAssignmentGlobals();
    });

    it('opens assignment dialog and lazily loads courses for active school', async () => {
        const activeSchoolId = ref('school-1');
        const courses = ref<CourseListItem[]>([]);
        const isCoursesLoading = ref(false);
        const loadCoursesForFilter = vi.fn().mockResolvedValue(undefined);
        const loadStudents = vi.fn().mockResolvedValue(undefined);

        const { useManagerStudentCourseAssignment } =
            await import('./useManagerStudentCourseAssignment');
        const assignment = useManagerStudentCourseAssignment({
            activeSchoolId,
            courses,
            isCoursesLoading,
            loadCoursesForFilter,
            loadStudents,
        });

        assignment.handleOpenAssignCourse(student());

        expect(assignment.assignDialogOpen.value).toBe(true);
        expect(assignment.assignTargetDisplayName.value).toBe('Jan Kowalski');
        expect(assignment.assignApiError.value).toBeNull();
        expect(loadCoursesForFilter).toHaveBeenCalledTimes(1);
    });

    it('does not lazily load courses without active school, existing courses, or active loading', async () => {
        const loadCoursesForFilter = vi.fn().mockResolvedValue(undefined);
        const loadStudents = vi.fn().mockResolvedValue(undefined);
        const { useManagerStudentCourseAssignment } =
            await import('./useManagerStudentCourseAssignment');

        useManagerStudentCourseAssignment({
            activeSchoolId: ref(''),
            courses: ref<CourseListItem[]>([]),
            isCoursesLoading: ref(false),
            loadCoursesForFilter,
            loadStudents,
        }).handleOpenAssignCourse(student());

        useManagerStudentCourseAssignment({
            activeSchoolId: ref('school-1'),
            courses: ref<CourseListItem[]>([course()]),
            isCoursesLoading: ref(false),
            loadCoursesForFilter,
            loadStudents,
        }).handleOpenAssignCourse(student());

        useManagerStudentCourseAssignment({
            activeSchoolId: ref('school-1'),
            courses: ref<CourseListItem[]>([]),
            isCoursesLoading: ref(true),
            loadCoursesForFilter,
            loadStudents,
        }).handleOpenAssignCourse(student());

        expect(loadCoursesForFilter).not.toHaveBeenCalled();
    });

    it('clears target and API error when assignment dialog closes', async () => {
        const { useManagerStudentCourseAssignment } =
            await import('./useManagerStudentCourseAssignment');
        const assignment = useManagerStudentCourseAssignment({
            activeSchoolId: ref('school-1'),
            courses: ref<CourseListItem[]>([]),
            isCoursesLoading: ref(false),
            loadCoursesForFilter: vi.fn().mockResolvedValue(undefined),
            loadStudents: vi.fn().mockResolvedValue(undefined),
        });

        assignment.handleOpenAssignCourse(student());
        assignment.assignApiError.value = 'Błąd API';

        assignment.handleAssignDialogOpenChange(false);

        expect(assignment.assignDialogOpen.value).toBe(false);
        expect(assignment.assignTargetDisplayName.value).toBe('');
        expect(assignment.assignApiError.value).toBeNull();
    });

    it('submits assignment, closes dialog, reloads students and shows success toast', async () => {
        assignToCourse.mockResolvedValue({ id: 'participant-1' });
        const loadStudents = vi.fn().mockResolvedValue(undefined);
        const { useManagerStudentCourseAssignment } =
            await import('./useManagerStudentCourseAssignment');
        const assignment = useManagerStudentCourseAssignment({
            activeSchoolId: ref('school-1'),
            courses: ref<CourseListItem[]>([course()]),
            isCoursesLoading: ref(false),
            loadCoursesForFilter: vi.fn().mockResolvedValue(undefined),
            loadStudents,
        });

        assignment.handleOpenAssignCourse(student());
        await assignment.handleAssignCourseSubmit('course-1');

        expect(assignToCourse).toHaveBeenCalledWith({
            userId: 'user-1',
            courseId: 'course-1',
        });
        expect(addToast).toHaveBeenCalledWith({
            title: 'Kursant zapisany na kurs',
            variant: 'success',
        });
        expect(loadStudents).toHaveBeenCalledTimes(1);
        expect(assignment.assignDialogOpen.value).toBe(false);
        expect(assignment.assignTargetDisplayName.value).toBe('');
        expect(assignment.isAssignSaving.value).toBe(false);
    });

    it('skips assignment submit without target or while save is already pending', async () => {
        const { useManagerStudentCourseAssignment } =
            await import('./useManagerStudentCourseAssignment');
        const assignment = useManagerStudentCourseAssignment({
            activeSchoolId: ref('school-1'),
            courses: ref<CourseListItem[]>([course()]),
            isCoursesLoading: ref(false),
            loadCoursesForFilter: vi.fn().mockResolvedValue(undefined),
            loadStudents: vi.fn().mockResolvedValue(undefined),
        });

        await assignment.handleAssignCourseSubmit('course-1');

        assignment.handleOpenAssignCourse(student());
        assignment.isAssignSaving.value = true;
        await assignment.handleAssignCourseSubmit('course-1');

        expect(assignToCourse).not.toHaveBeenCalled();
    });

    it('keeps dialog open and exposes API error on failure', async () => {
        assignToCourse.mockRejectedValue({ statusCode: 409 });
        const loadStudents = vi.fn().mockResolvedValue(undefined);
        const { useManagerStudentCourseAssignment } =
            await import('./useManagerStudentCourseAssignment');
        const assignment = useManagerStudentCourseAssignment({
            activeSchoolId: ref('school-1'),
            courses: ref<CourseListItem[]>([course()]),
            isCoursesLoading: ref(false),
            loadCoursesForFilter: vi.fn().mockResolvedValue(undefined),
            loadStudents,
        });

        assignment.handleOpenAssignCourse(student());
        await assignment.handleAssignCourseSubmit('course-1');

        expect(assignment.assignDialogOpen.value).toBe(true);
        expect(assignment.assignTargetDisplayName.value).toBe('Jan Kowalski');
        expect(assignment.assignApiError.value).toBe(
            'Ten kursant jest już zapisany na wybrany kurs.',
        );
        expect(addToast).toHaveBeenCalledWith({
            title: 'Nie udało się zapisać na kurs',
            description: 'Ten kursant jest już zapisany na wybrany kurs.',
            variant: 'error',
        });
        expect(loadStudents).not.toHaveBeenCalled();
        expect(assignment.isAssignSaving.value).toBe(false);
    });
});
