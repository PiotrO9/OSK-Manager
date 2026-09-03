import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import type {
    FreeWindow,
    InstructorEvent,
    PatchInstructorEventPayload,
} from '~/types/events/instructorEvent';

import { useManagerEventEditFieldSave } from './useManagerEventEditFieldSave';

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
        studentUserIds: ['student-1'],
        studentAttendanceKnown: true,
        students: [
            {
                id: 'profile-1',
                userId: 'student-1',
                firstName: 'Jan',
                lastName: 'Kowalski',
                email: 'jan@example.com',
                phone: null,
            },
        ],
        ...overrides,
    };
}

function setupFieldSave(
    options: {
        loadedEvent?: InstructorEvent | null;
        formType?: 'THEORY' | 'DRIVE';
        formStartLocal?: string;
        formEndLocal?: string;
        formVehicleId?: string;
        formInstructorId?: string;
        formCapacityInput?: string | number;
        freeWindows?: FreeWindow[];
        freeWindowsUnavailable?: boolean;
        updateInstructorEvent?: (
            id: string,
            payload: PatchInstructorEventPayload,
        ) => Promise<InstructorEvent>;
        parseCapacity?: (raw: unknown) => number | null | false;
        localDatetimeToIso?: (local: string) => string | null;
    } = {},
) {
    const loadedEvent = ref<InstructorEvent | null>(
        options.loadedEvent ?? instructorEvent(),
    );
    const formError = ref<string | null>(null);
    const updateInstructorEvent =
        options.updateInstructorEvent ??
        vi.fn().mockResolvedValue(
            instructorEvent({
                instructorId: 'instructor-2',
                startTime: '2026-08-16T10:00:00.000Z',
                endTime: '2026-08-16T11:00:00.000Z',
                vehicleId: 'vehicle-2',
                capacity: 3,
            }),
        );
    const parseCapacity = options.parseCapacity ?? vi.fn(() => 3);
    const localDatetimeToIso =
        options.localDatetimeToIso ??
        vi.fn((local: string) => `${local}:00.000Z`);
    const refreshFreeWindowsFromSlots = vi.fn().mockResolvedValue(undefined);

    const fieldSave = useManagerEventEditFieldSave({
        loadedEvent,
        formType: ref(options.formType ?? 'DRIVE'),
        formStartLocal: ref(options.formStartLocal ?? '2026-08-16T10:00'),
        formEndLocal: ref(options.formEndLocal ?? '2026-08-16T11:00'),
        formVehicleId: ref(options.formVehicleId ?? 'vehicle-2'),
        formInstructorId: ref(options.formInstructorId ?? 'instructor-2'),
        formCapacityInput: ref(options.formCapacityInput ?? '3'),
        formError,
        freeWindows: ref(
            options.freeWindows ?? [
                {
                    startTime: '2026-08-16T09:00:00.000Z',
                    endTime: '2026-08-16T12:00:00.000Z',
                },
            ],
        ),
        freeWindowsUnavailable: ref(options.freeWindowsUnavailable ?? false),
        updateInstructorEvent,
        parseCapacity,
        localDatetimeToIso,
        refreshFreeWindowsFromSlots,
    });

    return {
        fieldSave,
        loadedEvent,
        formError,
        updateInstructorEvent,
        parseCapacity,
        localDatetimeToIso,
        refreshFreeWindowsFromSlots,
    };
}

describe('useManagerEventEditFieldSave', () => {
    it('updates dirty event fields and preserves participant metadata', async () => {
        const { fieldSave, loadedEvent, updateInstructorEvent } =
            setupFieldSave();

        const result = await fieldSave.updateDirtyEventFields('event-1', false);

        expect(result).toBe(true);
        expect(updateInstructorEvent).toHaveBeenCalledWith('event-1', {
            instructorId: 'instructor-2',
            type: 'DRIVE',
            startTime: '2026-08-16T10:00:00.000Z',
            endTime: '2026-08-16T11:00:00.000Z',
            vehicleId: 'vehicle-2',
            capacity: 3,
        });
        expect(loadedEvent.value?.instructorId).toBe('instructor-2');
        expect(loadedEvent.value?.studentUserIds).toEqual(['student-1']);
        expect(loadedEvent.value?.studentAttendanceKnown).toBe(true);
        expect(loadedEvent.value?.students?.[0]?.userId).toBe('student-1');
    });

    it('rejects missing or invalid date ranges before patching', async () => {
        const missingDates = setupFieldSave({
            localDatetimeToIso: vi.fn(() => null),
        });

        expect(
            await missingDates.fieldSave.updateDirtyEventFields(
                'event-1',
                false,
            ),
        ).toBe(false);
        expect(missingDates.formError.value).toBe(
            'Podaj początek i koniec bloku (data i godzina).',
        );
        expect(missingDates.updateInstructorEvent).not.toHaveBeenCalled();

        const reversedDates = setupFieldSave({
            formStartLocal: '2026-08-16T11:00',
            formEndLocal: '2026-08-16T10:00',
        });

        expect(
            await reversedDates.fieldSave.updateDirtyEventFields(
                'event-1',
                false,
            ),
        ).toBe(false);
        expect(reversedDates.formError.value).toBe(
            'Koniec musi być później niż początek.',
        );
        expect(reversedDates.updateInstructorEvent).not.toHaveBeenCalled();
    });

    it('rejects slots outside instructor free windows when slot validation is required', async () => {
        const { fieldSave, formError, updateInstructorEvent } = setupFieldSave({
            freeWindows: [
                {
                    startTime: '2026-08-16T12:00:00.000Z',
                    endTime: '2026-08-16T14:00:00.000Z',
                },
            ],
        });

        const result = await fieldSave.updateDirtyEventFields('event-1', true);

        expect(result).toBe(false);
        expect(formError.value).toBe(
            'Wybrany przedział czasu nie mieści się w wolnym oknie grafiku instruktora.',
        );
        expect(updateInstructorEvent).not.toHaveBeenCalled();
    });

    it('validates drive vehicle, instructor and capacity before patching', async () => {
        const missingVehicle = setupFieldSave({ formVehicleId: '   ' });

        expect(
            await missingVehicle.fieldSave.updateDirtyEventFields(
                'event-1',
                false,
            ),
        ).toBe(false);
        expect(missingVehicle.formError.value).toContain(
            'Dla jazdy wybierz pojazd',
        );

        const missingInstructor = setupFieldSave({ formInstructorId: '   ' });

        expect(
            await missingInstructor.fieldSave.updateDirtyEventFields(
                'event-1',
                false,
            ),
        ).toBe(false);
        expect(missingInstructor.formError.value).toBe('Wybierz instruktora.');

        const invalidCapacity = setupFieldSave({
            parseCapacity: vi.fn(() => false as const),
        });

        expect(
            await invalidCapacity.fieldSave.updateDirtyEventFields(
                'event-1',
                false,
            ),
        ).toBe(false);
        expect(invalidCapacity.formError.value).toBe(
            'Limit miejsc musi być liczbą całkowitą ≥ 0 lub puste (bez limitu).',
        );
    });

    it('refreshes free windows after a successful time or instructor patch', async () => {
        const { fieldSave, refreshFreeWindowsFromSlots } = setupFieldSave();

        const result = await fieldSave.updateDirtyEventFields('event-1', true);

        expect(result).toBe(true);
        expect(refreshFreeWindowsFromSlots).toHaveBeenCalledWith('2026-08-16');
    });

    it('refreshes slots for non-participant patch conflicts', async () => {
        const { fieldSave, formError, refreshFreeWindowsFromSlots } =
            setupFieldSave({
                updateInstructorEvent: vi.fn().mockRejectedValue({
                    statusCode: 409,
                    data: { message: 'Conflict' },
                }),
            });

        const result = await fieldSave.updateDirtyEventFields('event-1', true);

        expect(result).toBe(false);
        expect(refreshFreeWindowsFromSlots).toHaveBeenCalledWith('2026-08-16');
        expect(formError.value).toBe('Conflict');
    });

    it('does not refresh slots for participant patch conflicts', async () => {
        const { fieldSave, refreshFreeWindowsFromSlots } = setupFieldSave({
            updateInstructorEvent: vi.fn().mockRejectedValue({
                statusCode: 409,
                data: { message: 'participant schedules conflict' },
            }),
        });

        const result = await fieldSave.updateDirtyEventFields('event-1', true);

        expect(result).toBe(false);
        expect(refreshFreeWindowsFromSlots).not.toHaveBeenCalled();
    });
});
