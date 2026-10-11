import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope, ref } from 'vue';
import { useManagerLessonBookingInstructors } from './useManagerLessonBookingInstructors';
import type { InstructorListItem } from '~/types/instructors/instructor';
import type {
    LessonBookingSlotContext,
    StudentCourseWithKind,
} from '~/types/lessons/lessonBooking';

const requestBffData = vi.fn();
const scopes: ReturnType<typeof effectScope>[] = [];

function setup() {
    const options = {
        open: ref(true),
        slotCtx: ref<LessonBookingSlotContext>({
            schoolId: 'school',
            date: '2099-10-16',
            startTime: '09:00',
            endTime: '10:00',
            availableInstructors: [
                { id: 'default', firstName: 'Jan', lastName: 'Test' },
            ],
        }),
        selectedCourse: ref<StudentCourseWithKind | null>({
            id: 'course',
            name: 'Kurs C',
            category: 'C',
            kind: 'EXTRA',
            status: 'ACTIVE',
        }),
        studentId: ref('student'),
        vehicleId: ref('vehicle'),
        schoolInstructors: ref<InstructorListItem[]>(
            ['default', 'substitute', 'busy', 'unqualified'].map((id) => ({
                id,
                firstName: id,
                lastName: 'Test',
                email: '',
                avatarUrl: null,
                qualifiedCourseTypes: [
                    {
                        id: id === 'unqualified' ? 'type-b' : 'type-c',
                        code: id === 'unqualified' ? 'B' : 'C',
                        name: 'Kategoria',
                    },
                ],
            })),
        ),
    };
    const scope = effectScope();

    scopes.push(scope);

    return {
        options,
        result: scope.run(() => useManagerLessonBookingInstructors(options))!,
    };
}

beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
    vi.stubGlobal('requestBffData', requestBffData);
    requestBffData.mockImplementation(async (_method, _path, { body }) => ({
        available: body.instructorId !== 'busy',
        issues:
            body.instructorId === 'busy'
                ? [{ code: 'INSTRUCTOR_BUSY', field: 'instructorId' }]
                : [],
    }));
});
afterEach(() => {
    scopes.splice(0).forEach((scope) => scope.stop());
    vi.useRealTimers();
    vi.unstubAllGlobals();
});

describe('instructors for a new manager booking', () => {
    it('skips the school-wide search when the instructor is fixed by the calendar', async () => {
        const { options, result } = setup();

        options.slotCtx.value.fixedInstructor = {
            id: 'default',
            firstName: 'Jan',
            lastName: 'Test',
        };
        await vi.advanceTimersByTimeAsync(150);
        expect(requestBffData).not.toHaveBeenCalled();
        expect(result.status.value).toBe('idle');
    });

    it('offers free qualified instructors from the whole school, not just the clicked instructor', async () => {
        const { result } = setup();

        await vi.advanceTimersByTimeAsync(150);
        expect(result.instructors.value.map(({ id }) => id)).toEqual([
            'default',
            'substitute',
        ]);
        expect(requestBffData).toHaveBeenCalledTimes(3);
        expect(requestBffData).toHaveBeenCalledWith(
            'POST',
            '/api/schedule/availability-check',
            expect.objectContaining({
                body: {
                    intent: 'lesson_create',
                    instructorId: 'substitute',
                    courseId: 'course',
                    studentId: 'student',
                    vehicleId: 'vehicle',
                    date: '2099-10-16',
                    startTime: '09:00',
                    endTime: '10:00',
                },
            }),
        );
    });

    it('waits for course and vehicle selection and clears options immediately on a change', async () => {
        const { options, result } = setup();

        options.vehicleId.value = '';
        await vi.advanceTimersByTimeAsync(150);
        expect(requestBffData).not.toHaveBeenCalled();
        expect(result.status.value).toBe('idle');
        options.vehicleId.value = 'vehicle';
        await vi.advanceTimersByTimeAsync(150);
        expect(result.instructors.value).toHaveLength(2);
        options.selectedCourse.value = null;
        expect(result.instructors.value).toEqual([]);
    });

    it('ignores stale availability after the vehicle changes', async () => {
        let resolveOld!: (value: unknown) => void;

        requestBffData.mockImplementation((_method, _path, { body }) => {
            if (body.vehicleId === 'vehicle')
                return new Promise((resolve) => {
                    resolveOld = resolve;
                });

            return Promise.resolve({
                available: false,
                issues: [{ code: 'VEHICLE_BUSY', field: 'vehicleId' }],
            });
        });
        const { options, result } = setup();

        options.schoolInstructors.value = options.schoolInstructors.value.slice(
            0,
            1,
        );
        await vi.advanceTimersByTimeAsync(150);
        options.vehicleId.value = 'other-vehicle';
        await vi.advanceTimersByTimeAsync(150);
        resolveOld({ available: true, issues: [] });
        await Promise.resolve();
        await Promise.resolve();
        expect(result.instructors.value).toEqual([]);
        expect(result.message.value).toBe(
            'Wybrany pojazd jest zajęty w tym terminie.',
        );
    });

    it('shows a retryable failure rather than an apparently empty successful list', async () => {
        requestBffData.mockRejectedValue(new Error('offline'));
        const { result } = setup();

        await vi.advanceTimersByTimeAsync(150);
        expect(result.status.value).toBe('error');
        expect(result.instructors.value).toEqual([]);
        requestBffData.mockResolvedValue({ available: true, issues: [] });
        await result.reload();
        expect(result.status.value).toBe('success');
        expect(result.instructors.value).toHaveLength(3);
    });
});
