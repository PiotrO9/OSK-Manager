import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import type { InstructorEvent } from '~/types/events/instructorEvent';
import type { EventStudentsAvailabilityResponse } from '~/types/events/event';

import { useManagerEventEditParticipantsSave } from './useManagerEventEditParticipantsSave';

function instructorEvent(
    overrides: Partial<InstructorEvent> = {},
): InstructorEvent {
    return {
        id: 'event-1',
        instructorId: 'instructor-1',
        type: 'THEORY',
        startTime: '2026-08-16T08:00:00.000Z',
        endTime: '2026-08-16T09:00:00.000Z',
        vehicleId: null,
        capacity: 2,
        courseId: 'course-1',
        createdAt: '2026-08-15T10:00:00.000Z',
        ...overrides,
    };
}

function setupParticipantsSave(
    options: {
        loadedEvent?: InstructorEvent | null;
        replaceStudentsOnEvent?: (
            id: string,
            studentUserIds: string[],
        ) => Promise<void>;
        checkStudentsAvailability?: () => Promise<EventStudentsAvailabilityResponse>;
    } = {},
) {
    const loadedEvent = ref<InstructorEvent | null>(
        options.loadedEvent ?? instructorEvent(),
    );
    const formError = ref<string | null>(null);
    const replaceStudentsOnEvent =
        options.replaceStudentsOnEvent ?? vi.fn().mockResolvedValue(undefined);
    const checkStudentsAvailability =
        options.checkStudentsAvailability ??
        vi.fn().mockResolvedValue({ available: true, issues: [] });
    const refreshEligibleForCurrentTime = vi.fn().mockResolvedValue(undefined);
    const sortedStudentIds = vi.fn((ids: string[]) => [...ids].sort());
    const draftTheoryStudentUserIds = ref(['student-2', 'student-1']);

    const participantsSave = useManagerEventEditParticipantsSave({
        formStartLocal: ref('2026-08-16T10:00'),
        formEndLocal: ref('2026-08-16T11:00'),
        formError,
        draftTheoryStudentUserIds,
        replaceStudentsOnEvent,
        checkStudentsAvailability,
        refreshEligibleForCurrentTime,
        sortedStudentIds,
        localDatetimeToIso: vi.fn((local: string) => `${local}:00.000Z`),
    });

    return {
        participantsSave,
        loadedEvent,
        formError,
        replaceStudentsOnEvent,
        checkStudentsAvailability,
        refreshEligibleForCurrentTime,
        sortedStudentIds,
        draftTheoryStudentUserIds,
    };
}

describe('useManagerEventEditParticipantsSave', () => {
    it('replaces dirty participants with sorted student ids', async () => {
        const {
            participantsSave,
            replaceStudentsOnEvent,
            checkStudentsAvailability,
            sortedStudentIds,
        } = setupParticipantsSave();

        const result = await participantsSave.replaceDirtyParticipants(
            'event-1',
            false,
        );

        expect(result).toBe(true);
        expect(sortedStudentIds).toHaveBeenCalledWith([
            'student-2',
            'student-1',
        ]);
        expect(checkStudentsAvailability).toHaveBeenCalledWith('event-1', {
            studentIds: ['student-1', 'student-2'],
            startTime: '2026-08-16T10:00:00.000Z',
            endTime: '2026-08-16T11:00:00.000Z',
        });
        expect(replaceStudentsOnEvent).toHaveBeenCalledWith('event-1', [
            'student-1',
            'student-2',
        ]);
    });

    it('blocks replacement and preserves the draft when preflight is unavailable', async () => {
        const {
            participantsSave,
            formError,
            replaceStudentsOnEvent,
            draftTheoryStudentUserIds,
        } = setupParticipantsSave({
            checkStudentsAvailability: vi.fn().mockResolvedValue({
                available: false,
                issues: [
                    {
                        code: 'STUDENT_SCHEDULE_CONFLICT',
                        message: 'Kursant ma konflikt grafiku.',
                    },
                ],
            }),
        });

        const result = await participantsSave.replaceDirtyParticipants(
            'event-1',
            false,
        );

        expect(result).toBe(false);
        expect(replaceStudentsOnEvent).not.toHaveBeenCalled();
        expect(draftTheoryStudentUserIds.value).toEqual([
            'student-2',
            'student-1',
        ]);
        expect(formError.value).toBe('Kursant ma konflikt grafiku.');
    });

    it('refreshes eligibility but preserves the draft after an authoritative PUT conflict', async () => {
        const {
            participantsSave,
            formError,
            refreshEligibleForCurrentTime,
            draftTheoryStudentUserIds,
        } = setupParticipantsSave({
            replaceStudentsOnEvent: vi.fn().mockRejectedValue({
                statusCode: 409,
                message: 'Conflict',
            }),
        });

        await participantsSave.replaceDirtyParticipants('event-1', true);

        expect(refreshEligibleForCurrentTime).toHaveBeenCalledOnce();
        expect(draftTheoryStudentUserIds.value).toEqual([
            'student-2',
            'student-1',
        ]);
        expect(formError.value).toContain('Zmiany bloku zapisane');
    });

    it('sets error without reload for non-conflict failures', async () => {
        const { participantsSave, formError, refreshEligibleForCurrentTime } =
            setupParticipantsSave({
                replaceStudentsOnEvent: vi
                    .fn()
                    .mockRejectedValue(new Error('API unavailable')),
            });

        const result = await participantsSave.replaceDirtyParticipants(
            'event-1',
            false,
        );

        expect(result).toBe(false);
        expect(refreshEligibleForCurrentTime).not.toHaveBeenCalled();
        expect(formError.value).toBe('API unavailable');
    });
});
