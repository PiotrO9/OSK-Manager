import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';

const addToast = vi.fn();
const createInstructorEvent = vi.fn();
const reloadSchedule = vi.fn();
const scrollIntoView = vi.fn();
const isEventSaving = ref(false);
const availabilityStatus = ref('idle');
const availabilityMessage = ref('');
const availabilityResult = ref({
    available: true,
    issues: [],
    policy: { minDurationMinutes: 60, maxDurationMinutes: 120 },
});
const recheckAvailability = vi.fn().mockResolvedValue('available');
let capturedAvailabilityCandidate: { value: unknown } | null = null;
const availabilityOptionsStatus = ref('error');
const availabilityOptionsResult = ref<{
    stepMinutes: number;
    options: Array<{ startTime: string; endTimes: string[] }>;
    availableVehicleIds?: string[];
    policy: { minDurationMinutes: number; maxDurationMinutes: number };
} | null>(null);
let capturedAvailabilityOptionsCandidate: { value: unknown } | null = null;
const targetElement = {
    scrollIntoView,
};

vi.mock('~/composables/schedule/useScheduleAvailabilityCheck', () => ({
    useScheduleAvailabilityCheck: (options: {
        candidate: { value: unknown };
    }) => {
        capturedAvailabilityCandidate = options.candidate;

        return {
            status: availabilityStatus,
            message: availabilityMessage,
            result: availabilityResult,
            recheck: recheckAvailability,
        };
    },
}));

vi.mock('~/composables/schedule/useScheduleAvailabilityOptions', () => ({
    useScheduleAvailabilityOptions: (options: {
        candidate: { value: unknown };
    }) => {
        capturedAvailabilityOptionsCandidate = options.candidate;

        return {
            status: availabilityOptionsStatus,
            result: availabilityOptionsResult,
            reload: vi.fn(),
        };
    },
}));

function installNuxtScheduleEventFormGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('useAppToast', () => ({ addToast }));
    vi.stubGlobal('useInstructorEventsApi', () => ({
        createInstructorEvent,
        isLoading: isEventSaving,
        isDeleteLoading: ref(false),
    }));
    vi.stubGlobal('document', {
        getElementById: vi.fn(() => targetElement),
    });
}

describe('useManagerInstructorScheduleEventForm', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        isEventSaving.value = false;
        availabilityStatus.value = 'idle';
        availabilityMessage.value = '';
        availabilityResult.value = {
            available: true,
            issues: [],
            policy: { minDurationMinutes: 60, maxDurationMinutes: 120 },
        };
        recheckAvailability.mockResolvedValue('available');
        capturedAvailabilityCandidate = null;
        availabilityOptionsStatus.value = 'error';
        availabilityOptionsResult.value = null;
        capturedAvailabilityOptionsCandidate = null;
        installNuxtScheduleEventFormGlobals();
    });

    it('focuses event form heading when requested', async () => {
        const { useManagerInstructorScheduleEventForm } =
            await import('./useManagerInstructorScheduleEventForm');
        const data = useManagerInstructorScheduleEventForm({
            instructorId: ref('instructor-1'),
            reloadSchedule,
        });

        data.handleFocusEventForm();

        expect(document.getElementById).toHaveBeenCalledWith(
            'event-block-heading',
        );
        expect(scrollIntoView).toHaveBeenCalledWith({
            behavior: 'smooth',
            block: 'start',
        });
    });

    it('reports missing instructor id before API calls', async () => {
        const { useManagerInstructorScheduleEventForm } =
            await import('./useManagerInstructorScheduleEventForm');
        const data = useManagerInstructorScheduleEventForm({
            instructorId: ref(''),
            reloadSchedule,
        });

        const result = await data.handleSubmitEvent();

        expect(createInstructorEvent).not.toHaveBeenCalled();
        expect(result).toBe(false);
        expect(data.eventFormError.value).toBe(
            'Brak identyfikatora instruktora.',
        );
    });

    it('validates required start and end datetimes', async () => {
        const { useManagerInstructorScheduleEventForm } =
            await import('./useManagerInstructorScheduleEventForm');
        const data = useManagerInstructorScheduleEventForm({
            instructorId: ref('instructor-1'),
            reloadSchedule,
        });

        const result = await data.handleSubmitEvent();

        expect(createInstructorEvent).not.toHaveBeenCalled();
        expect(result).toBe(false);
        expect(data.eventFormError.value).toBe(
            'Podaj poczatek i koniec bloku.',
        );
    });

    it('validates event end after start', async () => {
        const { useManagerInstructorScheduleEventForm } =
            await import('./useManagerInstructorScheduleEventForm');
        const data = useManagerInstructorScheduleEventForm({
            instructorId: ref('instructor-1'),
            reloadSchedule,
        });

        data.eventStartLocal.value = '2026-09-03T10:00';
        data.eventEndLocal.value = '2026-09-03T09:00';
        const result = await data.handleSubmitEvent();

        expect(createInstructorEvent).not.toHaveBeenCalled();
        expect(result).toBe(false);
        expect(data.eventFormError.value).toBe(
            'Koniec musi być pozniej niz poczatek.',
        );
    });

    it('validates minimum event duration', async () => {
        const { useManagerInstructorScheduleEventForm } =
            await import('./useManagerInstructorScheduleEventForm');
        const data = useManagerInstructorScheduleEventForm({
            instructorId: ref('instructor-1'),
            reloadSchedule,
        });

        data.eventStartLocal.value = '2026-09-03T09:00';
        data.eventEndLocal.value = '2026-09-03T09:30';
        const result = await data.handleSubmitEvent();

        expect(createInstructorEvent).not.toHaveBeenCalled();
        expect(result).toBe(false);
        expect(data.eventFormError.value).toBe(
            'Blok musi trwać co najmniej 60 minut.',
        );
    });

    it('requires vehicle for drive events', async () => {
        const { useManagerInstructorScheduleEventForm } =
            await import('./useManagerInstructorScheduleEventForm');
        const data = useManagerInstructorScheduleEventForm({
            instructorId: ref('instructor-1'),
            reloadSchedule,
        });

        data.eventType.value = 'DRIVE';
        data.eventStartLocal.value = '2026-09-03T09:00';
        data.eventEndLocal.value = '2026-09-03T10:00';
        const result = await data.handleSubmitEvent();

        expect(createInstructorEvent).not.toHaveBeenCalled();
        expect(result).toBe(false);
        expect(data.eventFormError.value).toBe('Dla jazdy wybierz pojazd.');
    });

    it('checks an occupied instructor window before a drive vehicle is selected', async () => {
        const { useManagerInstructorScheduleEventForm } =
            await import('./useManagerInstructorScheduleEventForm');
        const data = useManagerInstructorScheduleEventForm({
            instructorId: ref('instructor-1'),
            reloadSchedule,
        });

        data.eventType.value = 'DRIVE';
        data.eventDateLocal.value = '2026-09-26';
        data.eventStartLocal.value = '2026-09-26T09:00';
        data.eventEndLocal.value = '2026-09-26T10:00';

        expect(capturedAvailabilityCandidate?.value).toEqual({
            intent: 'event_create',
            instructorId: 'instructor-1',
            eventType: 'DRIVE',
            date: '2026-09-26',
            startTime: '09:00',
            endTime: '10:00',
        });
        expect(capturedAvailabilityOptionsCandidate?.value).toEqual({
            intent: 'event_create',
            instructorId: 'instructor-1',
            eventType: 'DRIVE',
            date: '2026-09-26',
        });
        expect(data.isEventSubmitReady.value).toBe(false);
    });

    it('loads options for the selected date, instructor and vehicle', async () => {
        const { useManagerInstructorScheduleEventForm } =
            await import('./useManagerInstructorScheduleEventForm');
        const data = useManagerInstructorScheduleEventForm({
            instructorId: ref('instructor-1'),
            reloadSchedule,
        });

        data.eventType.value = 'DRIVE';
        data.eventVehicleId.value = 'vehicle-1';
        data.eventStartLocal.value = '2026-09-26T09:00';
        data.eventEndLocal.value = '2026-09-26T10:00';

        expect(capturedAvailabilityOptionsCandidate?.value).toEqual({
            intent: 'event_create',
            instructorId: 'instructor-1',
            eventType: 'DRIVE',
            date: '2026-09-26',
            vehicleId: 'vehicle-1',
        });
    });

    it('moves the form to the first selectable pair and rejects other pairs', async () => {
        const { useManagerInstructorScheduleEventForm } =
            await import('./useManagerInstructorScheduleEventForm');
        const data = useManagerInstructorScheduleEventForm({
            instructorId: ref('instructor-1'),
            reloadSchedule,
        });

        data.eventStartLocal.value = '2026-09-26T09:00';
        data.eventEndLocal.value = '2026-09-26T10:00';
        availabilityOptionsStatus.value = 'success';
        availabilityOptionsResult.value = {
            stepMinutes: 15,
            options: [{ startTime: '11:00', endTimes: ['12:00', '12:15'] }],
            policy: { minDurationMinutes: 60, maxDurationMinutes: 120 },
        };
        await nextTick();

        expect(data.eventStartLocal.value).toBe('2026-09-26T11:00');
        expect(data.eventEndLocal.value).toBe('2026-09-26T12:00');
        expect(data.availableStartTimes.value).toEqual(['11:00']);
        expect(data.availableEndTimes.value).toEqual(['12:00', '12:15']);
        expect(data.isEventSubmitReady.value).toBe(true);

        data.eventEndLocal.value = '2026-09-26T13:00';
        expect(data.isEventSubmitReady.value).toBe(false);
    });

    it('blocks submission when the selected day has no free slot', async () => {
        const { useManagerInstructorScheduleEventForm } =
            await import('./useManagerInstructorScheduleEventForm');
        const data = useManagerInstructorScheduleEventForm({
            instructorId: ref('instructor-1'),
            reloadSchedule,
        });

        data.eventStartLocal.value = '2026-09-26T09:00';
        data.eventEndLocal.value = '2026-09-26T10:00';
        availabilityOptionsStatus.value = 'success';
        availabilityOptionsResult.value = {
            stepMinutes: 15,
            options: [],
            policy: { minDurationMinutes: 60, maxDurationMinutes: 120 },
        };
        await nextTick();

        expect(data.availableStartTimes.value).toEqual([]);
        expect(data.eventStartLocal.value).toBe('');
        expect(data.eventEndLocal.value).toBe('');
        expect(data.isEventSubmitReady.value).toBe(false);
    });

    it('clears a selected vehicle that has no free slot on the chosen day', async () => {
        const { useManagerInstructorScheduleEventForm } =
            await import('./useManagerInstructorScheduleEventForm');
        const data = useManagerInstructorScheduleEventForm({
            instructorId: ref('instructor-1'),
            reloadSchedule,
        });

        data.eventType.value = 'DRIVE';
        data.eventDateLocal.value = '2026-09-26';
        data.eventVehicleId.value = 'vehicle-1';
        data.eventStartLocal.value = '2026-09-26T09:00';
        data.eventEndLocal.value = '2026-09-26T10:00';
        availabilityOptionsStatus.value = 'success';
        availabilityOptionsResult.value = {
            stepMinutes: 15,
            options: [],
            availableVehicleIds: ['vehicle-2'],
            policy: { minDurationMinutes: 60, maxDurationMinutes: 120 },
        };
        await nextTick();

        expect(data.availableVehicleIds.value).toEqual(['vehicle-2']);
        expect(data.eventVehicleId.value).toBe('');
        expect(data.eventDateLocal.value).toBe('2026-09-26');
        expect(data.eventStartLocal.value).toBe('');
        expect(data.eventEndLocal.value).toBe('');
    });

    it('keeps form values and blocks submit when availability check fails', async () => {
        availabilityStatus.value = 'unavailable';
        availabilityMessage.value =
            'Instruktor nie jest dostępny w tym terminie.';
        recheckAvailability.mockResolvedValue('unavailable');

        const { useManagerInstructorScheduleEventForm } =
            await import('./useManagerInstructorScheduleEventForm');
        const data = useManagerInstructorScheduleEventForm({
            instructorId: ref('instructor-1'),
            reloadSchedule,
        });

        data.eventStartLocal.value = '2026-09-03T09:00';
        data.eventEndLocal.value = '2026-09-03T10:00';

        await expect(data.handleSubmitEvent()).resolves.toBe(false);
        expect(createInstructorEvent).not.toHaveBeenCalled();
        expect(data.eventFormError.value).toBe(
            'Instruktor nie jest dostępny w tym terminie.',
        );
        expect(data.eventStartLocal.value).toBe('2026-09-03T09:00');
    });

    it('ignores submit while event creation is already pending', async () => {
        isEventSaving.value = true;

        const { useManagerInstructorScheduleEventForm } =
            await import('./useManagerInstructorScheduleEventForm');
        const data = useManagerInstructorScheduleEventForm({
            instructorId: ref('instructor-1'),
            reloadSchedule,
        });

        data.eventStartLocal.value = '2026-09-03T09:00';
        data.eventEndLocal.value = '2026-09-03T10:00';
        const result = await data.handleSubmitEvent();

        expect(createInstructorEvent).not.toHaveBeenCalled();
        expect(reloadSchedule).not.toHaveBeenCalled();
        expect(result).toBe(false);
    });

    it('creates theory event with optional course and resets form', async () => {
        createInstructorEvent.mockResolvedValue({ id: 'event-1' });
        reloadSchedule.mockResolvedValue(undefined);

        const { useManagerInstructorScheduleEventForm } =
            await import('./useManagerInstructorScheduleEventForm');
        const data = useManagerInstructorScheduleEventForm({
            instructorId: ref('instructor-1'),
            reloadSchedule,
        });

        data.eventType.value = 'THEORY';
        data.eventStartLocal.value = '2026-09-03T09:00';
        data.eventEndLocal.value = '2026-09-03T10:00';
        data.eventCourseId.value = ' course-1 ';
        const result = await data.handleSubmitEvent();

        expect(createInstructorEvent).toHaveBeenCalledWith({
            instructorId: 'instructor-1',
            type: 'THEORY',
            startTime: expect.stringMatching(/^2026-09-03T/),
            endTime: expect.stringMatching(/^2026-09-03T/),
            courseId: 'course-1',
        });
        expect(addToast).toHaveBeenCalledWith({
            title: 'Zapisano blok czasu',
            description: 'Blok zostal dodany do grafiku.',
            variant: 'success',
        });
        expect(data.eventStartLocal.value).toBe('');
        expect(data.eventEndLocal.value).toBe('');
        expect(data.eventVehicleId.value).toBe('');
        expect(data.eventCourseId.value).toBe('');
        expect(reloadSchedule).toHaveBeenCalledOnce();
        expect(result).toBe(true);
    });

    it('creates drive event with selected vehicle', async () => {
        createInstructorEvent.mockResolvedValue({ id: 'event-1' });
        reloadSchedule.mockResolvedValue(undefined);

        const { useManagerInstructorScheduleEventForm } =
            await import('./useManagerInstructorScheduleEventForm');
        const data = useManagerInstructorScheduleEventForm({
            instructorId: ref('instructor-1'),
            reloadSchedule,
        });

        data.eventType.value = 'DRIVE';
        data.eventStartLocal.value = '2026-09-03T09:00';
        data.eventEndLocal.value = '2026-09-03T10:00';
        data.eventVehicleId.value = ' vehicle-1 ';
        const result = await data.handleSubmitEvent();

        expect(createInstructorEvent).toHaveBeenCalledWith({
            instructorId: 'instructor-1',
            type: 'DRIVE',
            startTime: expect.stringMatching(/^2026-09-03T/),
            endTime: expect.stringMatching(/^2026-09-03T/),
            vehicleId: 'vehicle-1',
        });
        expect(result).toBe(true);
    });

    it('exposes API errors without resetting form', async () => {
        createInstructorEvent.mockRejectedValue(new Error('API down'));

        const { useManagerInstructorScheduleEventForm } =
            await import('./useManagerInstructorScheduleEventForm');
        const data = useManagerInstructorScheduleEventForm({
            instructorId: ref('instructor-1'),
            reloadSchedule,
        });

        data.eventStartLocal.value = '2026-09-03T09:00';
        data.eventEndLocal.value = '2026-09-03T10:00';
        const result = await data.handleSubmitEvent();

        expect(data.eventFormError.value).toBe('API down');
        expect(data.eventStartLocal.value).toBe('2026-09-03T09:00');
        expect(reloadSchedule).not.toHaveBeenCalled();
        expect(result).toBe(false);
    });
});
