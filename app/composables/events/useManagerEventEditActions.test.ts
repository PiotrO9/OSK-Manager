import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';
import type {
    FreeWindow,
    InstructorEvent,
} from '~/types/events/instructorEvent';

const updateInstructorEvent = vi.fn();
const deleteInstructorEvent = vi.fn();
const replaceStudentsOnEvent = vi.fn();
const addToast = vi.fn();
const navigateTo = vi.fn();

function installNuxtGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('useInstructorEventsApi', () => ({
        updateInstructorEvent,
        deleteInstructorEvent,
        isUpdateLoading: ref(false),
        isDeleteLoading: ref(false),
    }));
    vi.stubGlobal('useEventApi', () => ({
        replaceStudentsOnEvent,
        isReplacing: ref(false),
    }));
    vi.stubGlobal('useAppToast', () => ({ addToast }));
    vi.stubGlobal('navigateTo', navigateTo);
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

function createInput() {
    const loadedEvent = ref<InstructorEvent | null>(instructorEvent());
    const formType = ref<'THEORY' | 'DRIVE'>('DRIVE');
    const formStartLocal = ref('2026-08-16T10:00');
    const formEndLocal = ref('2026-08-16T11:00');
    const formInstructorId = ref('instructor-1');
    const formVehicleId = ref('vehicle-1');

    return {
        eventId: computed(() => 'event-1'),
        schoolId: computed(() => 'school-1'),
        loadedEvent,
        formType,
        formStartLocal,
        formEndLocal,
        formVehicleId,
        formInstructorId,
        formCapacityInput: ref('2'),
        formError: ref<string | null>(null),
        freeWindows: ref<FreeWindow[]>([]),
        freeWindowsUnavailable: ref(false),
        isFormFieldsDirty: computed(() => true),
        isTheoryStudentsDirty: computed(() => false),
        theoryStudentsError: ref<string | null>(null),
        studentAttendanceKnown: computed(() => true),
        capacityForStudentPicker: computed(() => 2),
        draftTheoryStudentUserIds: ref<string[]>([]),
        parseCapacity: vi.fn(() => 2),
        localDatetimeToIso: vi.fn((local: string) => `${local}:00.000Z`),
        needsTimeOrInstructorSlotValidation: vi.fn(() => false),
        refreshFreeWindowsFromSlots: vi.fn().mockResolvedValue(undefined),
        fetchEventById: vi.fn().mockResolvedValue(instructorEvent()),
        applyPrefill: vi.fn(),
        syncFreeWindowsFromEvent: vi.fn(),
        resetStudentDraftFromEvent: vi.fn(),
        refreshEligibleForCurrentTime: vi.fn().mockResolvedValue(undefined),
        loadTheoryEligibleStudents: vi.fn().mockResolvedValue(undefined),
        sortedStudentIds: vi.fn((ids: string[]) => [...ids].sort()),
    };
}

describe('useManagerEventEditActions', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        vi.unstubAllGlobals();
        installNuxtGlobals();
        navigateTo.mockResolvedValue(undefined);
    });

    it('shows a success toast and returns to schedule after saving dirty event fields', async () => {
        updateInstructorEvent.mockResolvedValue({
            instructorId: 'instructor-1',
            type: 'DRIVE',
            startTime: '2026-08-16T10:00:00.000Z',
            endTime: '2026-08-16T11:00:00.000Z',
            vehicleId: 'vehicle-1',
            capacity: 2,
        });
        const input = createInput();
        const { useManagerEventEditActions } =
            await import('./useManagerEventEditActions');
        const actions = useManagerEventEditActions(input);

        await actions.handleSubmit();

        expect(updateInstructorEvent).toHaveBeenCalledWith('event-1', {
            instructorId: 'instructor-1',
            type: 'DRIVE',
            startTime: '2026-08-16T10:00:00.000Z',
            endTime: '2026-08-16T11:00:00.000Z',
            vehicleId: 'vehicle-1',
            capacity: 2,
        });
        expect(addToast).toHaveBeenCalledWith({
            title: 'Zapisano zmiany',
            description: 'Wydarzenie zostało zaktualizowane.',
            variant: 'success',
        });
        expect(navigateTo).toHaveBeenCalledWith({
            path: '/manager/instructors/instructor-1/schedule',
            query: { schoolId: 'school-1' },
        });
    });

    it('shows a success toast and closes the dialog after deleting an event', async () => {
        deleteInstructorEvent.mockResolvedValue(undefined);
        const input = createInput();
        const { useManagerEventEditActions } =
            await import('./useManagerEventEditActions');
        const actions = useManagerEventEditActions(input);

        actions.handleOpenDeleteDialog();
        await actions.handleDeleteDialogConfirm();

        expect(deleteInstructorEvent).toHaveBeenCalledWith('event-1');
        expect(addToast).toHaveBeenCalledWith({
            title: 'Usunięto blok czasu',
            description: 'Blok został usunięty z harmonogramu.',
            variant: 'success',
        });
        expect(actions.deleteDialogOpen.value).toBe(false);
        expect(navigateTo).toHaveBeenCalledWith({
            path: '/manager/instructors/instructor-1/schedule',
            query: { schoolId: 'school-1' },
        });
    });

    it('shows an error toast without hiding the delete dialog when delete fails', async () => {
        deleteInstructorEvent.mockRejectedValue(new Error('API unavailable'));
        const input = createInput();
        const { useManagerEventEditActions } =
            await import('./useManagerEventEditActions');
        const actions = useManagerEventEditActions(input);

        actions.handleOpenDeleteDialog();
        await actions.handleDeleteDialogConfirm();

        expect(addToast).toHaveBeenCalledWith({
            title: 'Nie udało się usunąć wydarzenia',
            description: 'API unavailable',
            variant: 'error',
        });
        expect(actions.deleteDialogOpen.value).toBe(true);
        expect(navigateTo).not.toHaveBeenCalled();
    });
});
