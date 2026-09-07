import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, nextTick, ref, watch } from 'vue';
import type { CourseListItem } from '~/types/courses/course';
import type {
    LessonBookingSlotContext,
    StudentCourseWithKind,
} from '~/types/lessons/lessonBooking';
import { useManagerLessonBookingDialog } from './useManagerLessonBookingDialog';

const addToast = vi.fn();
const createLesson = vi.fn();
const fetchInstructorsList = vi.fn();
const loadModalData = vi.fn();
const loadStudentCoursesWithKind = vi.fn();
const isCreating = ref(false);
const isLoadingModalData = ref(false);
const modalError = ref<string | null>(null);

function deferred<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
}

function slotCtx(): LessonBookingSlotContext {
    return {
        date: '2026-08-20',
        startTime: '10:00',
        endTime: '11:30',
        schoolId: 'school-1',
        availableInstructors: [
            {
                id: 'instructor-1',
                firstName: 'Jan',
                lastName: 'Kowalski',
            },
        ],
    };
}

function course(): CourseListItem {
    return {
        id: 'course-1',
        name: 'Kurs B',
        category: 'B',
        courseType: {
            id: 'type-b',
            code: 'B',
            name: 'B',
        },
        type: 'PRACTICAL',
        totalHours: 30,
        instructor: null,
    };
}

function studentCourse(id: string): StudentCourseWithKind {
    return {
        id,
        name: `Kurs ${id}`,
        category: 'B',
        status: 'ACTIVE',
        kind: 'PRACTICAL',
    };
}

function installGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('watch', watch);
    vi.stubGlobal('useAppToast', () => ({ addToast }));
    vi.stubGlobal('useLessonBookingApi', () => ({
        createLesson,
        isCreating,
        isLoadingModalData,
        loadModalData,
        loadStudentCoursesWithKind,
        modalError,
    }));
    vi.stubGlobal('useInstructorsApi', () => ({
        fetchList: fetchInstructorsList,
    }));
}

describe('useManagerLessonBookingDialog', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        vi.resetAllMocks();
        isCreating.value = false;
        isLoadingModalData.value = false;
        modalError.value = null;
        installGlobals();
    });

    it('ignores submit while lesson creation is already pending', async () => {
        isCreating.value = true;
        const emitBooked = vi.fn();
        const dialog = useManagerLessonBookingDialog({
            open: ref(true),
            slotCtx: ref(slotCtx()),
            schoolCourses: ref([course()]),
            emitBooked,
        });

        dialog.selectedStudentUserId.value = 'student-1';
        dialog.selectedCourseId.value = 'course-1';
        dialog.selectedInstructorId.value = 'instructor-1';
        dialog.selectedVehicleId.value = 'vehicle-1';

        await dialog.handleSubmit();

        expect(createLesson).not.toHaveBeenCalled();
        expect(emitBooked).not.toHaveBeenCalled();
    });

    it('keeps the latest student courses when selected student changes quickly', async () => {
        const firstCourses = deferred<StudentCourseWithKind[]>();
        const secondCourses = deferred<StudentCourseWithKind[]>();

        loadStudentCoursesWithKind
            .mockReturnValueOnce(firstCourses.promise)
            .mockReturnValueOnce(secondCourses.promise);

        const dialog = useManagerLessonBookingDialog({
            open: ref(true),
            slotCtx: ref(slotCtx()),
            schoolCourses: ref([course()]),
            emitBooked: vi.fn(),
        });

        dialog.selectedStudentUserId.value = 'student-1';
        await nextTick();
        dialog.selectedStudentUserId.value = 'student-2';
        await nextTick();

        secondCourses.resolve([studentCourse('course-2')]);
        await secondCourses.promise;
        await nextTick();

        expect(dialog.filteredCourses.value.map((item) => item.id)).toEqual([
            'course-2',
        ]);

        firstCourses.resolve([studentCourse('course-1')]);
        await firstCourses.promise;
        await nextTick();

        expect(dialog.filteredCourses.value.map((item) => item.id)).toEqual([
            'course-2',
        ]);
    });
});
