import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, nextTick, ref, watch, type Ref } from 'vue';
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
const availabilityStatus = ref<'idle' | 'unavailable'>('idle');
const availabilityMessage = ref('');
const recheckAvailability = vi.fn().mockResolvedValue('available');
const useScheduleAvailabilityCheck = vi.fn((_options: unknown) => ({
    status: availabilityStatus,
    message: availabilityMessage,
    recheck: recheckAvailability,
}));

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
    vi.stubGlobal('useScheduleAvailabilityCheck', useScheduleAvailabilityCheck);
}

describe('useManagerLessonBookingDialog', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        vi.resetAllMocks();
        isCreating.value = false;
        isLoadingModalData.value = false;
        modalError.value = null;
        availabilityStatus.value = 'idle';
        availabilityMessage.value = '';
        recheckAvailability.mockResolvedValue('available');
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

    it('does not create a lesson when the preflight reports a conflict', async () => {
        availabilityStatus.value = 'unavailable';
        availabilityMessage.value = 'Pojazd jest zajęty.';
        recheckAvailability.mockResolvedValue('unavailable');
        const dialog = useManagerLessonBookingDialog({
            open: ref(true),
            slotCtx: ref(slotCtx()),
            schoolCourses: ref([course()]),
            emitBooked: vi.fn(),
        });

        dialog.selectedStudentUserId.value = 'student-1';
        dialog.selectedCourseId.value = 'course-1';
        dialog.selectedInstructorId.value = 'instructor-1';
        dialog.selectedVehicleId.value = 'vehicle-1';

        const options = useScheduleAvailabilityCheck.mock.calls[0]?.[0] as {
            candidate: Readonly<Ref<Record<string, string> | null>>;
        };

        expect(options.candidate.value).toEqual({
            intent: 'lesson_create',
            courseId: 'course-1',
            studentId: 'student-1',
            instructorId: 'instructor-1',
            vehicleId: 'vehicle-1',
            date: '2026-08-20',
            startTime: '10:00',
            endTime: '11:30',
        });

        await dialog.handleSubmit();

        expect(recheckAvailability).toHaveBeenCalledOnce();
        expect(createLesson).not.toHaveBeenCalled();
        expect(dialog.formError.value).toBe('Pojazd jest zajęty.');
    });

    it('keeps the completed form open when the final write loses a race', async () => {
        createLesson.mockRejectedValueOnce({ statusCode: 409 });
        loadModalData.mockResolvedValueOnce({
            students: [],
            vehicles: [],
            availableVehicleIds: [],
        });
        fetchInstructorsList.mockResolvedValueOnce([
            {
                id: 'instructor-1',
                firstName: 'Jan',
                lastName: 'Kowalski',
                email: '',
                avatarUrl: null,
                qualifiedCourseTypes: [{ id: 'type-b', code: 'B', name: 'B' }],
            },
        ]);
        loadStudentCoursesWithKind.mockResolvedValueOnce([
            studentCourse('course-1'),
        ]);
        const open = ref(false);
        const emitBooked = vi.fn();
        const dialog = useManagerLessonBookingDialog({
            open,
            slotCtx: ref(slotCtx()),
            schoolCourses: ref([course()]),
            emitBooked,
        });

        open.value = true;
        await nextTick();
        await vi.waitFor(() =>
            expect(fetchInstructorsList).toHaveBeenCalledOnce(),
        );
        await nextTick();
        dialog.selectedStudentUserId.value = 'student-1';
        await nextTick();
        await Promise.resolve();
        dialog.selectedCourseId.value = 'course-1';
        dialog.selectedInstructorId.value = 'instructor-1';
        dialog.selectedVehicleId.value = 'vehicle-1';

        await dialog.handleSubmit();

        expect(open.value).toBe(true);
        expect(emitBooked).not.toHaveBeenCalled();
        expect(dialog.selectedStudentUserId.value).toBe('student-1');
        expect(dialog.selectedCourseId.value).toBe('course-1');
        expect(dialog.selectedInstructorId.value).toBe('instructor-1');
        expect(dialog.selectedVehicleId.value).toBe('vehicle-1');
        expect(dialog.formError.value).toContain('został już zajęty');
    });
});
