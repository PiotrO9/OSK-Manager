import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import type { InstructorEvent } from '~/types/events/instructorEvent';

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
        fetchEventById?: (
            id: string,
            options?: { includeSlots?: boolean },
        ) => Promise<InstructorEvent>;
    } = {},
) {
    const loadedEvent = ref<InstructorEvent | null>(
        options.loadedEvent ?? instructorEvent(),
    );
    const formError = ref<string | null>(null);
    const replaceStudentsOnEvent =
        options.replaceStudentsOnEvent ?? vi.fn().mockResolvedValue(undefined);
    const fetchEventById =
        options.fetchEventById ??
        vi.fn().mockResolvedValue(instructorEvent({ id: 'event-reloaded' }));
    const applyPrefill = vi.fn();
    const syncFreeWindowsFromEvent = vi.fn();
    const resetStudentDraftFromEvent = vi.fn();
    const refreshEligibleForCurrentTime = vi.fn().mockResolvedValue(undefined);
    const loadTheoryEligibleStudents = vi.fn().mockResolvedValue(undefined);
    const sortedStudentIds = vi.fn((ids: string[]) => [...ids].sort());

    const participantsSave = useManagerEventEditParticipantsSave({
        loadedEvent,
        formStartLocal: ref('2026-08-16T10:00'),
        formEndLocal: ref('2026-08-16T11:00'),
        formError,
        draftTheoryStudentUserIds: ref(['student-2', 'student-1']),
        replaceStudentsOnEvent,
        fetchEventById,
        applyPrefill,
        syncFreeWindowsFromEvent,
        resetStudentDraftFromEvent,
        refreshEligibleForCurrentTime,
        loadTheoryEligibleStudents,
        sortedStudentIds,
        localDatetimeToIso: vi.fn((local: string) => `${local}:00.000Z`),
    });

    return {
        participantsSave,
        loadedEvent,
        formError,
        replaceStudentsOnEvent,
        fetchEventById,
        applyPrefill,
        syncFreeWindowsFromEvent,
        resetStudentDraftFromEvent,
        refreshEligibleForCurrentTime,
        loadTheoryEligibleStudents,
        sortedStudentIds,
    };
}

describe('useManagerEventEditParticipantsSave', () => {
    it('replaces dirty participants with sorted student ids', async () => {
        const { participantsSave, replaceStudentsOnEvent, sortedStudentIds } =
            setupParticipantsSave();

        const result = await participantsSave.replaceDirtyParticipants(
            'event-1',
            false,
        );

        expect(result).toBe(true);
        expect(sortedStudentIds).toHaveBeenCalledWith([
            'student-2',
            'student-1',
        ]);
        expect(replaceStudentsOnEvent).toHaveBeenCalledWith('event-1', [
            'student-1',
            'student-2',
        ]);
    });

    it('reloads event and refreshes eligible students after participant conflict', async () => {
        const reloadedEvent = instructorEvent({ id: 'event-reloaded' });
        const {
            participantsSave,
            loadedEvent,
            formError,
            fetchEventById,
            applyPrefill,
            syncFreeWindowsFromEvent,
            resetStudentDraftFromEvent,
            refreshEligibleForCurrentTime,
            loadTheoryEligibleStudents,
        } = setupParticipantsSave({
            replaceStudentsOnEvent: vi
                .fn()
                .mockRejectedValue({ statusCode: 409, message: 'Conflict' }),
            fetchEventById: vi.fn().mockResolvedValue(reloadedEvent),
        });

        const result = await participantsSave.replaceDirtyParticipants(
            'event-1',
            true,
        );

        expect(result).toBe(false);
        expect(fetchEventById).toHaveBeenCalledWith('event-1', {
            includeSlots: true,
        });
        expect(loadedEvent.value).toEqual(reloadedEvent);
        expect(applyPrefill).toHaveBeenCalledWith(reloadedEvent);
        expect(syncFreeWindowsFromEvent).toHaveBeenCalledWith(reloadedEvent);
        expect(resetStudentDraftFromEvent).toHaveBeenCalledWith(reloadedEvent);
        expect(refreshEligibleForCurrentTime).toHaveBeenCalledOnce();
        expect(loadTheoryEligibleStudents).not.toHaveBeenCalled();
        expect(formError.value).toContain('Zmiany bloku zapisane');
    });

    it('falls back to loading theory eligible students when reloaded event is not theory course event', async () => {
        const reloadedEvent = instructorEvent({
            id: 'event-reloaded',
            type: 'DRIVE',
            courseId: undefined,
        });
        const { participantsSave, loadTheoryEligibleStudents } =
            setupParticipantsSave({
                replaceStudentsOnEvent: vi.fn().mockRejectedValue({
                    statusCode: 409,
                    message: 'Conflict',
                }),
                fetchEventById: vi.fn().mockResolvedValue(reloadedEvent),
            });

        await participantsSave.replaceDirtyParticipants('event-1', false);

        expect(loadTheoryEligibleStudents).toHaveBeenCalledOnce();
    });

    it('sets error without reload for non-conflict failures', async () => {
        const { participantsSave, formError, fetchEventById } =
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
        expect(fetchEventById).not.toHaveBeenCalled();
        expect(formError.value).toBe('API unavailable');
    });
});
