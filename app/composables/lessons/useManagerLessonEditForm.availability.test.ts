import { afterEach, describe, expect, it, vi } from 'vitest';
import { computed, nextTick, ref, watch } from 'vue';
import type { ManagerLessonDetail } from '~/types/lessons/managerLesson';
import { useManagerLessonEditForm } from './useManagerLessonEditForm';
import { useScheduleAvailabilityOptions } from '~/composables/schedule/useScheduleAvailabilityOptions';

vi.mock('~/composables/schedule/useScheduleAvailabilityOptions', () => ({
    useScheduleAvailabilityOptions: vi.fn(),
}));

vi.mock('~/composables/schedule/useScheduleAvailabilityCheck', async () => {
    const { ref } = await import('vue');

    return {
        useScheduleAvailabilityCheck: () => ({
            result: ref(null),
            status: ref('idle'),
            message: ref(''),
            recheck: vi.fn(),
        }),
    };
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
});

describe('lesson edit day without free hours', () => {
    it('keeps the original hours when only the vehicle changes on a now-closed day', async () => {
        vi.stubGlobal('ref', ref);
        vi.stubGlobal('computed', computed);
        vi.stubGlobal('watch', watch);
        const optionsResult = ref<{
            options: { startTime: string; endTimes: string[] }[];
            policy: { minDurationMinutes: number };
        } | null>(null);

        vi.mocked(useScheduleAvailabilityOptions).mockReturnValue({
            result: optionsResult,
            status: ref('success'),
            reload: vi.fn(),
        } as unknown as ReturnType<typeof useScheduleAvailabilityOptions>);

        const lesson = {
            id: 'lesson-1',
            courseId: 'course-1',
            studentId: 'student-1',
            instructorId: 'instructor-1',
            vehicleId: 'vehicle-1',
            lessonType: 'PRACTICE',
            startTime: '2026-09-30T07:00:00.000Z',
            endTime: '2026-09-30T08:00:00.000Z',
            status: 'SCHEDULED',
        } satisfies ManagerLessonDetail;
        const form = useManagerLessonEditForm(
            ref(lesson),
            ref({ id: 'instructor-1', name: 'Jan Kowalski' }),
        );

        form.applyPrefill(lesson);
        form.formVehicleId.value = 'vehicle-2';
        optionsResult.value = {
            options: [],
            policy: { minDurationMinutes: 60 },
        };
        await nextTick();

        expect(form.formStartLocal.value).toBe('2026-09-30T09:00');
        expect(form.formEndLocal.value).toBe('2026-09-30T10:00');
        expect(form.isFormComplete.value).toBe(true);
    });

    it('keeps the selected date when availability options are empty', async () => {
        vi.stubGlobal('ref', ref);
        vi.stubGlobal('computed', computed);
        vi.stubGlobal('watch', watch);
        const optionsResult = ref<{
            options: { startTime: string; endTimes: string[] }[];
            policy: { minDurationMinutes: number };
        } | null>(null);

        vi.mocked(useScheduleAvailabilityOptions).mockReturnValue({
            result: optionsResult,
            status: ref('success'),
            reload: vi.fn(),
        } as unknown as ReturnType<typeof useScheduleAvailabilityOptions>);

        const lesson = {
            id: 'lesson-1',
            courseId: 'course-1',
            studentId: 'student-1',
            instructorId: 'instructor-1',
            vehicleId: 'vehicle-1',
            lessonType: 'PRACTICE',
            startTime: '2026-09-30T07:00:00.000Z',
            endTime: '2026-09-30T08:00:00.000Z',
            status: 'SCHEDULED',
        } satisfies ManagerLessonDetail;
        const form = useManagerLessonEditForm(
            ref(lesson),
            ref({ id: 'instructor-1', name: 'Jan Kowalski' }),
        );

        form.applyPrefill(lesson);
        form.formStartLocal.value = '2026-10-01T09:00';
        form.formEndLocal.value = '2026-10-01T10:00';
        form.formVehicleId.value = 'vehicle-1';

        // The API reports no free hours for the newly selected day.
        optionsResult.value = {
            options: [],
            policy: { minDurationMinutes: 60 },
        };
        await nextTick();

        expect(form.formStartLocal.value).toBe('2026-10-01T');
        expect(form.formEndLocal.value).toBe('2026-10-01T');
        expect(form.isFormComplete.value).toBe(false);
    });

    it('does not silently select the first time when the previous time is unavailable', async () => {
        vi.stubGlobal('ref', ref);
        vi.stubGlobal('computed', computed);
        vi.stubGlobal('watch', watch);
        const optionsResult = ref<{
            options: { startTime: string; endTimes: string[] }[];
            policy: { minDurationMinutes: number };
        } | null>(null);

        vi.mocked(useScheduleAvailabilityOptions).mockReturnValue({
            result: optionsResult,
            status: ref('success'),
            reload: vi.fn(),
        } as unknown as ReturnType<typeof useScheduleAvailabilityOptions>);

        const lesson = {
            id: 'lesson-1',
            courseId: 'course-1',
            studentId: 'student-1',
            instructorId: 'instructor-1',
            vehicleId: 'vehicle-1',
            lessonType: 'PRACTICE',
            startTime: '2026-09-30T07:00:00.000Z',
            endTime: '2026-09-30T08:00:00.000Z',
            status: 'SCHEDULED',
        } satisfies ManagerLessonDetail;
        const form = useManagerLessonEditForm(
            ref(lesson),
            ref({ id: 'instructor-1', name: 'Jan Kowalski' }),
        );

        form.applyPrefill(lesson);
        form.formStartLocal.value = '2026-10-01T09:00';
        form.formEndLocal.value = '2026-10-01T10:00';
        form.formVehicleId.value = 'vehicle-1';

        optionsResult.value = {
            options: [{ startTime: '11:00', endTimes: ['12:00'] }],
            policy: { minDurationMinutes: 60 },
        };
        await nextTick();

        expect(form.formStartLocal.value).toBe('2026-10-01T');
        expect(form.formEndLocal.value).toBe('2026-10-01T');
        expect(form.isFormComplete.value).toBe(false);
    });

    it('suggests another day without choosing its hours', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-09-27T10:00:00.000Z'));
        vi.stubGlobal('ref', ref);
        vi.stubGlobal('computed', computed);
        vi.stubGlobal('watch', watch);
        const requestBffData = vi.fn().mockResolvedValue({
            options: [{ startTime: '11:00', endTimes: ['12:00'] }],
            policy: { minDurationMinutes: 60, maxDurationMinutes: 120 },
            stepMinutes: 15,
        });

        vi.stubGlobal('requestBffData', requestBffData);
        const optionsResult = ref<{
            options: { startTime: string; endTimes: string[] }[];
            policy: { minDurationMinutes: number };
        } | null>(null);

        vi.mocked(useScheduleAvailabilityOptions).mockReturnValue({
            result: optionsResult,
            status: ref('success'),
            reload: vi.fn(),
        } as unknown as ReturnType<typeof useScheduleAvailabilityOptions>);

        const lesson = {
            id: 'lesson-1',
            courseId: 'course-1',
            studentId: 'student-1',
            instructorId: 'instructor-1',
            vehicleId: 'vehicle-1',
            lessonType: 'PRACTICE',
            startTime: '2026-09-30T07:00:00.000Z',
            endTime: '2026-09-30T08:00:00.000Z',
            status: 'SCHEDULED',
            bookingMaxDaysAhead: 30,
        } satisfies ManagerLessonDetail;
        const form = useManagerLessonEditForm(
            ref(lesson),
            ref({ id: 'instructor-1', name: 'Jan Kowalski' }),
        );

        form.applyPrefill(lesson);
        form.formStartLocal.value = '2026-10-01T';
        form.formEndLocal.value = '2026-10-01T';
        form.formVehicleId.value = 'vehicle-1';
        await nextTick();

        await form.findNextAvailableDay();

        expect(requestBffData.mock.calls[0]?.[2]?.body).toMatchObject({
            date: '2026-10-02',
            instructorId: 'instructor-1',
            vehicleId: 'vehicle-1',
        });
        expect(form.nextAvailableDay.value).toEqual({
            date: '2026-10-02',
            startTime: '11:00',
        });
        expect(form.formStartLocal.value).toBe('2026-10-01T');
        expect(form.formEndLocal.value).toBe('2026-10-01T');
    });
});
