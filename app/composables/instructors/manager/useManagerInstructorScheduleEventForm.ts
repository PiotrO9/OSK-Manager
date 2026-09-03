import type { Ref } from 'vue';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { localDatetimeToIso } from '~/utils/events/managerEventEditForm';
import type { ManagerInstructorEventType } from './useManagerInstructorSchedulePage';

interface UseManagerInstructorScheduleEventFormOptions {
    instructorId: Ref<string>;
    reloadSchedule: () => Promise<void>;
}

export function useManagerInstructorScheduleEventForm({
    instructorId,
    reloadSchedule,
}: UseManagerInstructorScheduleEventFormOptions) {
    const { addToast } = useAppToast();
    const { createInstructorEvent, isLoading: isEventSaving } =
        useInstructorEventsApi();

    const eventType = ref<ManagerInstructorEventType>('THEORY');
    const eventStartLocal = ref('');
    const eventEndLocal = ref('');
    const eventVehicleId = ref('');
    const eventCourseId = ref('');
    const eventFormError = ref<string | null>(null);

    function resetEventForm(): void {
        eventStartLocal.value = '';
        eventEndLocal.value = '';
        eventVehicleId.value = '';
        eventCourseId.value = '';
    }

    function handleFocusEventForm(): void {
        const target = document.getElementById('event-block-heading');

        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async function handleSubmitEvent(): Promise<void> {
        eventFormError.value = null;

        const id = instructorId.value;

        if (!id) {
            eventFormError.value = 'Brak identyfikatora instruktora.';

            return;
        }

        const startIso = localDatetimeToIso(eventStartLocal.value);
        const endIso = localDatetimeToIso(eventEndLocal.value);

        if (!startIso || !endIso) {
            eventFormError.value = 'Podaj poczatek i koniec bloku.';

            return;
        }

        if (new Date(startIso).getTime() >= new Date(endIso).getTime()) {
            eventFormError.value = 'Koniec musi być pozniej niz poczatek.';

            return;
        }

        const type = eventType.value;

        if (type === 'DRIVE') {
            const vid = eventVehicleId.value.trim();

            if (!vid) {
                eventFormError.value =
                    'Dla jazdy wybierz pojazd. Wymagany jest schoolId w adresie strony.';

                return;
            }
        }

        try {
            const cid = eventCourseId.value.trim();

            await createInstructorEvent({
                instructorId: id,
                type,
                startTime: startIso,
                endTime: endIso,
                vehicleId:
                    type === 'DRIVE' ? eventVehicleId.value.trim() : undefined,
                ...(type === 'THEORY' && cid ? { courseId: cid } : {}),
            });

            addToast({
                title: 'Zapisano blok czasu',
                description: 'Blok zostal dodany do grafiku.',
                variant: 'success',
            });

            resetEventForm();

            await reloadSchedule();
        } catch (err: unknown) {
            eventFormError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się utworzyć bloku.',
            );
        }
    }

    return {
        eventType,
        eventStartLocal,
        eventEndLocal,
        eventVehicleId,
        eventCourseId,
        eventFormError,
        isEventSaving,
        handleFocusEventForm,
        handleSubmitEvent,
    };
}
