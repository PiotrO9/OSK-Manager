import { computed, watch, type Ref } from 'vue';
import type { ManagerInstructorEventType } from '~/types/instructors/managerInstructorSchedule';
import type {
    EventCreateAvailabilityRequest,
    EventCreateAvailabilityOptionsRequest,
} from '~/types/schedule/scheduleAvailability';
import { useScheduleAvailabilityCheck } from '~/composables/schedule/useScheduleAvailabilityCheck';
import { useScheduleAvailabilityOptions } from '~/composables/schedule/useScheduleAvailabilityOptions';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { localDatetimeToIso } from '~/utils/events/managerEventEditForm';

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
    const eventDateLocal = ref('');
    const eventStartLocal = ref('');
    const eventEndLocal = ref('');
    const eventVehicleId = ref('');
    const eventCourseId = ref('');
    const eventFormError = ref<string | null>(null);
    const availabilityCandidate =
        computed<EventCreateAvailabilityRequest | null>(() => {
            const start = eventStartLocal.value.split('T');
            const end = eventEndLocal.value.split('T');
            const date = start[0] ?? '';
            const startTime = start[1] ?? '';
            const endTime = end[1] ?? '';
            const type = eventType.value;
            const vehicleId = eventVehicleId.value.trim();
            const courseId = eventCourseId.value.trim();

            if (
                !instructorId.value ||
                !date ||
                !startTime ||
                !endTime ||
                end[0] !== date
            ) {
                return null;
            }

            return {
                intent: 'event_create',
                instructorId: instructorId.value,
                eventType: type,
                date,
                startTime,
                endTime,
                ...(type === 'DRIVE' && vehicleId ? { vehicleId } : {}),
                ...(type === 'THEORY' && courseId ? { courseId } : {}),
            };
        });
    const availability = useScheduleAvailabilityCheck({
        candidate: availabilityCandidate,
        auto: false,
    });
    const availabilityOptionsCandidate =
        computed<EventCreateAvailabilityOptionsRequest | null>(() => {
            const date =
                eventDateLocal.value ||
                (eventStartLocal.value.split('T')[0] ?? '');
            const type = eventType.value;
            const vehicleId = eventVehicleId.value.trim();
            const courseId = eventCourseId.value.trim();

            if (!instructorId.value || !date) {
                return null;
            }

            return {
                intent: 'event_create',
                instructorId: instructorId.value,
                eventType: type,
                date,
                ...(type === 'DRIVE' && vehicleId ? { vehicleId } : {}),
                ...(type === 'THEORY' && courseId ? { courseId } : {}),
            };
        });
    const availabilityOptions = useScheduleAvailabilityOptions({
        candidate: availabilityOptionsCandidate,
    });
    const availableStartTimes = computed<readonly string[] | undefined>(() =>
        availabilityOptions.status.value === 'success'
            ? (availabilityOptions.result.value?.options.map(
                  (option) => option.startTime,
              ) ?? [])
            : undefined,
    );
    const availableVehicleIds = computed<readonly string[] | undefined>(() =>
        availabilityOptions.status.value === 'success' &&
        eventType.value === 'DRIVE'
            ? availabilityOptions.result.value?.availableVehicleIds
            : undefined,
    );
    const availableEndTimes = computed<readonly string[] | undefined>(() => {
        if (availabilityOptions.status.value !== 'success') return undefined;

        const startTime = eventStartLocal.value.split('T')[1] ?? '';

        return (
            availabilityOptions.result.value?.options.find(
                (option) => option.startTime === startTime,
            )?.endTimes ?? []
        );
    });
    const isAvailabilityOptionsLoading = computed(
        () => availabilityOptions.status.value === 'loading',
    );
    const availabilityOptionsError = computed(() =>
        availabilityOptions.status.value === 'error'
            ? 'Nie udało się pobrać dostępnych godzin. Termin zostanie sprawdzony przy zapisie.'
            : '',
    );
    const isSelectedTimeOptionAvailable = computed(() => {
        if (availabilityOptions.status.value !== 'success') {
            return availabilityOptions.status.value !== 'loading';
        }

        const startTime = eventStartLocal.value.split('T')[1] ?? '';
        const endTime = eventEndLocal.value.split('T')[1] ?? '';
        const option = availabilityOptions.result.value?.options.find(
            (item) => item.startTime === startTime,
        );

        return Boolean(option?.endTimes.includes(endTime));
    });
    const isEventSubmitReady = computed(
        () =>
            availabilityCandidate.value !== null &&
            (eventType.value !== 'DRIVE' ||
                Boolean(eventVehicleId.value.trim())) &&
            isSelectedTimeOptionAvailable.value,
    );
    const eventAvailabilityMessage = computed(() => {
        if (
            eventType.value === 'DRIVE' &&
            !eventVehicleId.value.trim() &&
            availability.status.value === 'available'
        ) {
            return 'Instruktor jest dostępny. Wybierz pojazd, aby dokończyć sprawdzanie.';
        }

        return availability.message.value;
    });
    const eventMinDurationMinutes = computed(
        () =>
            availabilityOptions.result.value?.policy.minDurationMinutes ??
            availability.result.value?.policy.minDurationMinutes ??
            (eventType.value === 'THEORY' ? 45 : 60),
    );

    watch(
        () => availabilityOptions.result.value,
        (next) => {
            if (!next) return;

            const first = next.options[0];

            if (!first) {
                eventStartLocal.value = '';
                eventEndLocal.value = '';

                return;
            }

            const [startDate = '', currentStart = ''] =
                eventStartLocal.value.split('T');
            const date = eventDateLocal.value || startDate;
            const currentEnd = eventEndLocal.value.split('T')[1] ?? '';
            const selected = next.options.find(
                (option) => option.startTime === currentStart,
            );

            if (!selected) {
                const firstEnd = first.endTimes[0];

                if (!firstEnd) return;

                eventStartLocal.value = `${date}T${first.startTime}`;
                eventEndLocal.value = `${date}T${firstEnd}`;

                return;
            }

            if (!selected.endTimes.includes(currentEnd)) {
                const firstEnd = selected.endTimes[0];

                if (!firstEnd) return;

                eventEndLocal.value = `${date}T${firstEnd}`;
            }
        },
    );

    watch(
        [eventType, eventVehicleId, availableVehicleIds],
        ([type, vehicleId, ids]) => {
            if (
                type !== 'DRIVE' ||
                !vehicleId ||
                ids === undefined ||
                ids.includes(vehicleId)
            ) {
                return;
            }

            eventVehicleId.value = '';
            eventStartLocal.value = '';
            eventEndLocal.value = '';
        },
    );

    function resetEventForm(): void {
        eventDateLocal.value = '';
        eventStartLocal.value = '';
        eventEndLocal.value = '';
        eventVehicleId.value = '';
        eventCourseId.value = '';
    }

    function handleFocusEventForm(): void {
        const target = document.getElementById('event-block-heading');

        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async function handleSubmitEvent(): Promise<boolean> {
        if (isEventSaving.value) {
            return false;
        }

        eventFormError.value = null;

        const id = instructorId.value;

        if (!id) {
            eventFormError.value = 'Brak identyfikatora instruktora.';

            return false;
        }

        const startIso = localDatetimeToIso(eventStartLocal.value);
        const endIso = localDatetimeToIso(eventEndLocal.value);

        if (!startIso || !endIso) {
            eventFormError.value = 'Podaj poczatek i koniec bloku.';

            return false;
        }

        const startMs = new Date(startIso).getTime();
        const endMs = new Date(endIso).getTime();

        if (startMs >= endMs) {
            eventFormError.value = 'Koniec musi być pozniej niz poczatek.';

            return false;
        }

        const type = eventType.value;

        if (type === 'DRIVE') {
            const vid = eventVehicleId.value.trim();

            if (!vid) {
                eventFormError.value = 'Dla jazdy wybierz pojazd.';

                return false;
            }
        }

        const availabilityStatus = await availability.recheck();
        const minDurationMinutes = eventMinDurationMinutes.value;

        if (endMs - startMs < minDurationMinutes * 60 * 1000) {
            eventFormError.value = `Blok musi trwać co najmniej ${minDurationMinutes} minut.`;

            return false;
        }

        if (availabilityStatus === 'unavailable') {
            eventFormError.value =
                availability.message.value ||
                'Wybrany termin jest niedostępny.';

            return false;
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

            return true;
        } catch (err: unknown) {
            eventFormError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się utworzyć bloku.',
            );

            return false;
        }
    }

    return {
        eventType,
        eventDateLocal,
        eventStartLocal,
        eventEndLocal,
        eventVehicleId,
        eventCourseId,
        eventFormError,
        isEventSaving,
        eventAvailabilityStatus: availability.status,
        eventAvailabilityMessage,
        isEventSubmitReady,
        eventMinDurationMinutes,
        availableStartTimes,
        availableEndTimes,
        availableVehicleIds,
        isAvailabilityOptionsLoading,
        availabilityOptionsError,
        handleFocusEventForm,
        handleSubmitEvent,
    };
}
