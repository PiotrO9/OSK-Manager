import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

const addToast = vi.fn();
const createInstructorEvent = vi.fn();
const reloadSchedule = vi.fn();
const scrollIntoView = vi.fn();
const targetElement = {
    scrollIntoView,
};

function installNuxtScheduleEventFormGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('useAppToast', () => ({ addToast }));
    vi.stubGlobal('useInstructorEventsApi', () => ({
        createInstructorEvent,
        isLoading: ref(false),
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

        await data.handleSubmitEvent();

        expect(createInstructorEvent).not.toHaveBeenCalled();
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

        await data.handleSubmitEvent();

        expect(createInstructorEvent).not.toHaveBeenCalled();
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
        await data.handleSubmitEvent();

        expect(createInstructorEvent).not.toHaveBeenCalled();
        expect(data.eventFormError.value).toBe(
            'Koniec musi być pozniej niz poczatek.',
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
        await data.handleSubmitEvent();

        expect(createInstructorEvent).not.toHaveBeenCalled();
        expect(data.eventFormError.value).toBe(
            'Dla jazdy wybierz pojazd. Wymagany jest schoolId w adresie strony.',
        );
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
        await data.handleSubmitEvent();

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
        await data.handleSubmitEvent();

        expect(createInstructorEvent).toHaveBeenCalledWith({
            instructorId: 'instructor-1',
            type: 'DRIVE',
            startTime: expect.stringMatching(/^2026-09-03T/),
            endTime: expect.stringMatching(/^2026-09-03T/),
            vehicleId: 'vehicle-1',
        });
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
        await data.handleSubmitEvent();

        expect(data.eventFormError.value).toBe('API down');
        expect(data.eventStartLocal.value).toBe('2026-09-03T09:00');
        expect(reloadSchedule).not.toHaveBeenCalled();
    });
});
