import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, nextTick, ref, watch } from 'vue';
import type { InstructorEvent } from '~/types/events/instructorEvent';
import { useScheduleAvailabilityOptions } from '~/composables/schedule/useScheduleAvailabilityOptions';
import type { ScheduleAvailabilityOptionsResult } from '~/types/schedule/scheduleAvailability';

vi.mock('~/composables/schedule/useScheduleAvailabilityOptions', () => ({
    useScheduleAvailabilityOptions: vi.fn(),
}));

const optionsStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle');
const optionsResult = ref<ScheduleAvailabilityOptionsResult | null>(null);

function installVueGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('watch', watch);
}

function instructorEvent(
    overrides: Partial<InstructorEvent> = {},
): InstructorEvent {
    return {
        id: 'event-1',
        instructorId: 'instructor-1',
        type: 'DRIVE',
        startTime: '2026-08-16T08:00:00.000Z',
        endTime: '2026-08-16T09:00:00.000Z',
        vehicleId: 'vehicle-1',
        capacity: 2,
        createdAt: '2026-08-15T10:00:00.000Z',
        ...overrides,
    };
}

describe('useManagerEventEditForm', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        installVueGlobals();
        optionsStatus.value = 'idle';
        optionsResult.value = null;
        vi.mocked(useScheduleAvailabilityOptions).mockReturnValue({
            status: optionsStatus,
            result: optionsResult,
            reload: vi.fn(),
        });
    });

    it('keeps a prefilled event clean and marks instructor changes as dirty', async () => {
        const loadedEvent = ref<InstructorEvent | null>(null);
        const { useManagerEventEditForm } =
            await import('./useManagerEventEditForm');
        const form = useManagerEventEditForm({ loadedEvent });
        const event = instructorEvent();

        loadedEvent.value = event;
        form.applyPrefill(event);

        expect(form.currentSnapshot.value).toEqual(form.baselineSnapshot.value);
        expect(form.isFormFieldsDirty.value).toBe(false);

        form.formInstructorId.value = 'instructor-2';

        expect(form.isFormFieldsDirty.value).toBe(true);
    });

    it('uses availability options and retains a valid prefilled time', async () => {
        const loadedEvent = ref<InstructorEvent | null>(instructorEvent());
        const { useManagerEventEditForm } =
            await import('./useManagerEventEditForm');
        const form = useManagerEventEditForm({ loadedEvent });

        form.applyPrefill(loadedEvent.value!);
        const originalStart = form.formStartLocal.value;
        const originalEnd = form.formEndLocal.value;
        const startTime = originalStart.slice(11, 16);
        const endTime = originalEnd.slice(11, 16);

        optionsStatus.value = 'success';
        optionsResult.value = {
            stepMinutes: 15,
            policy: { minDurationMinutes: 60, maxDurationMinutes: 180 },
            options: [{ startTime, endTimes: [endTime, '12:00'] }],
            availableVehicleIds: ['vehicle-1'],
        };
        await nextTick();

        expect(form.formStartLocal.value).toBe(originalStart);
        expect(form.formEndLocal.value).toBe(originalEnd);
        expect(form.availableStartTimes.value).toEqual([startTime]);
        expect(form.availableEndTimes.value).toEqual([endTime, '12:00']);
        expect(form.availableVehicleIds.value).toEqual(['vehicle-1']);

        form.handleEndTimeChange('12:00');
        expect(form.formEndLocal.value).toBe(
            `${originalStart.slice(0, 10)}T12:00`,
        );
    });

    it('selects the first available pair when the prefilled time is missing', async () => {
        const loadedEvent = ref<InstructorEvent | null>(instructorEvent());
        const { useManagerEventEditForm } =
            await import('./useManagerEventEditForm');
        const form = useManagerEventEditForm({ loadedEvent });

        form.applyPrefill(loadedEvent.value!);
        const date = form.formStartLocal.value.slice(0, 10);

        optionsStatus.value = 'success';
        optionsResult.value = {
            stepMinutes: 15,
            policy: { minDurationMinutes: 60, maxDurationMinutes: 180 },
            options: [{ startTime: '13:15', endTimes: ['14:15'] }],
            availableVehicleIds: [],
        };
        await nextTick();

        expect(form.formStartLocal.value).toBe(`${date}T13:15`);
        expect(form.formEndLocal.value).toBe(`${date}T14:15`);
        expect(form.availableStartTimes.value).toEqual(['13:15']);
    });

    it('shows empty options and keeps unrestricted fallback on fetch error', async () => {
        const loadedEvent = ref<InstructorEvent | null>(instructorEvent());
        const { useManagerEventEditForm } =
            await import('./useManagerEventEditForm');
        const form = useManagerEventEditForm({ loadedEvent });

        form.applyPrefill(loadedEvent.value!);
        const originalStart = form.formStartLocal.value;

        optionsStatus.value = 'success';
        optionsResult.value = {
            stepMinutes: 15,
            policy: { minDurationMinutes: 60, maxDurationMinutes: 180 },
            options: [],
            availableVehicleIds: [],
        };
        await nextTick();
        expect(form.availableStartTimes.value).toEqual([]);
        expect(form.startHourOptionsResolved.value).toEqual([]);
        expect(form.formStartLocal.value).toBe(originalStart);

        optionsStatus.value = 'error';
        optionsResult.value = null;
        expect(form.availableStartTimes.value).toBeUndefined();
        expect(form.startHourOptionsResolved.value).toHaveLength(24);
        expect(form.endMinuteOptionsResolved.value).toHaveLength(60);
        expect(form.availabilityOptionsError.value).toContain('przy zapisie');

        form.handleDateChange('2026-08-17');
        form.handleStartTimeChange('15:30');
        expect(form.formStartLocal.value).toBe('2026-08-17T15:30');
    });
});
