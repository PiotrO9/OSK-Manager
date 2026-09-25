import type { Ref } from 'vue';
import type {
    FreeWindow,
    InstructorEvent,
} from '~/types/events/instructorEvent';
import { useManagerEventEditTimePicker } from './useManagerEventEditTimePicker';
import {
    buildManagerEventBaselineSnapshot,
    buildManagerEventCurrentSnapshot,
    isManagerEventEditFormDirty,
    localDatetimeToIso,
    parseManagerEventCapacity,
    type ManagerEventEditFormSnapshot,
} from '~/utils/events/managerEventEditForm';
import { isoInstantToDatetimeLocalString } from '~/utils/date/weeklyCalendarDates';
import { useScheduleAvailabilityCheck } from '~/composables/schedule/useScheduleAvailabilityCheck';
import { useScheduleAvailabilityOptions } from '~/composables/schedule/useScheduleAvailabilityOptions';
import type {
    EventEditAvailabilityOptionsRequest,
    EventEditAvailabilityRequest,
} from '~/types/schedule/scheduleAvailability';

function uniqueTimeParts(times: readonly string[], part: 0 | 1): number[] {
    return [
        ...new Set(
            times
                .map((time) => Number(time.split(':')[part]))
                .filter((value) => Number.isInteger(value)),
        ),
    ].sort((a, b) => a - b);
}

export function useManagerEventEditForm(input: {
    loadedEvent: Ref<InstructorEvent | null>;
}) {
    const formType = ref<'THEORY' | 'DRIVE'>('THEORY');
    const formStartLocal = ref('');
    const formEndLocal = ref('');
    const formVehicleId = ref('');
    const formInstructorId = ref('');
    const formCapacityInput = ref<string | number>('');
    const formError = ref<string | null>(null);
    // The availability-options response is the only remote source of picker
    // constraints. Empty legacy windows keep the split-field helper neutral.
    const freeWindows = ref<FreeWindow[]>([]);
    const freeWindowsUnavailable = ref(false);

    const {
        formStartDate,
        formStartHour,
        formStartMinute,
        formEndDate,
        formEndHour,
        formEndMinute,
        fullHourOptions,
        fullMinuteOptions,
        currentFormDate,
        pickerConstraintsActive,
        pickerMinDate,
        pickerMaxDate,
        startHourOptionsResolved: freeWindowStartHourOptions,
        startMinuteOptionsResolved: freeWindowStartMinuteOptions,
        endHourOptionsResolved: freeWindowEndHourOptions,
        endMinuteOptionsResolved: freeWindowEndMinuteOptions,
        handleStartDateChange,
        handleStartHourChange,
        handleStartMinuteChange,
        handleEndDateChange,
        handleEndHourChange,
        handleEndMinuteChange,
    } = useManagerEventEditTimePicker({
        formStartLocal,
        formEndLocal,
        freeWindows,
        freeWindowsUnavailable,
    });

    function isoToDatetimeLocal(iso: string): string {
        return isoInstantToDatetimeLocalString(iso);
    }

    function applyPrefill(ev: InstructorEvent): void {
        formType.value = ev.type === 'DRIVE' ? 'DRIVE' : 'THEORY';
        formStartLocal.value = isoToDatetimeLocal(ev.startTime ?? '');
        formEndLocal.value = isoToDatetimeLocal(ev.endTime ?? '');
        formVehicleId.value = ev.vehicleId?.trim() ? ev.vehicleId : '';
        formInstructorId.value = (ev.instructorId ?? '').trim();
        formCapacityInput.value =
            ev.capacity !== undefined && ev.capacity !== null
                ? ev.capacity
                : '';
        formError.value = null;
    }

    function parseCapacity(raw: unknown): number | null | false {
        return parseManagerEventCapacity(raw);
    }

    const baselineSnapshot = computed(
        (): ManagerEventEditFormSnapshot | null => {
            const ev = input.loadedEvent.value;

            if (!ev) {
                return null;
            }

            return buildManagerEventBaselineSnapshot(ev);
        },
    );

    const currentSnapshot = computed(
        (): ManagerEventEditFormSnapshot =>
            buildManagerEventCurrentSnapshot({
                type: formType.value,
                startLocal: formStartLocal.value,
                endLocal: formEndLocal.value,
                vehicleId: formVehicleId.value,
                capacityInput: formCapacityInput.value,
                instructorId: formInstructorId.value.trim(),
            }),
    );

    const isFormFieldsDirty = computed((): boolean => {
        return isManagerEventEditFormDirty(
            baselineSnapshot.value,
            currentSnapshot.value,
        );
    });

    const availabilityCandidate = computed<EventEditAvailabilityRequest | null>(
        () => {
            const event = input.loadedEvent.value;
            const baseline = baselineSnapshot.value;
            const current = currentSnapshot.value;
            const [startDate = '', startTime = ''] =
                formStartLocal.value.split('T');
            const [endDate = '', endTime = ''] = formEndLocal.value.split('T');
            const instructorId = formInstructorId.value.trim();
            const vehicleId = formVehicleId.value.trim();
            const scheduleChanged = Boolean(
                baseline &&
                (baseline.start !== current.start ||
                    baseline.end !== current.end ||
                    baseline.instructorId !== current.instructorId ||
                    baseline.vehicle !== current.vehicle),
            );

            if (
                !event ||
                !scheduleChanged ||
                !startDate ||
                !startTime ||
                !endTime ||
                endDate !== startDate ||
                !instructorId ||
                (current.type === 'DRIVE' && !vehicleId)
            ) {
                return null;
            }

            return {
                intent: 'event_edit',
                eventId: event.id,
                instructorId,
                date: startDate,
                startTime,
                endTime,
                ...(current.type === 'DRIVE' ? { vehicleId } : {}),
            };
        },
    );
    const availability = useScheduleAvailabilityCheck({
        candidate: availabilityCandidate,
        auto: false,
    });
    const availabilityOptionsCandidate =
        computed<EventEditAvailabilityOptionsRequest | null>(() => {
            const event = input.loadedEvent.value;
            const date = currentFormDate.value.trim();
            const instructorId = formInstructorId.value.trim();
            const vehicleId = formVehicleId.value.trim();

            if (!event || !date || !instructorId) return null;

            return {
                intent: 'event_edit',
                eventId: event.id,
                instructorId,
                date,
                ...(formType.value === 'DRIVE' && vehicleId
                    ? { vehicleId }
                    : {}),
            };
        });
    const availabilityOptions = useScheduleAvailabilityOptions({
        candidate: availabilityOptionsCandidate,
    });
    const availableVehicleIds = computed<readonly string[] | undefined>(() =>
        availabilityOptions.status.value === 'success' &&
        formType.value === 'DRIVE'
            ? availabilityOptions.result.value?.availableVehicleIds
            : undefined,
    );
    const optionStarts = computed(
        () => availabilityOptions.result.value?.options ?? [],
    );
    const selectedStartOption = computed(() => {
        const value = `${String(formStartHour.value).padStart(2, '0')}:${String(formStartMinute.value).padStart(2, '0')}`;

        return optionStarts.value.find((option) => option.startTime === value);
    });
    const optionStartHours = computed(() =>
        uniqueTimeParts(
            optionStarts.value.map((option) => option.startTime),
            0,
        ),
    );
    const optionStartMinutes = computed(() =>
        uniqueTimeParts(
            optionStarts.value
                .map((option) => option.startTime)
                .filter(
                    (time) => Number(time.slice(0, 2)) === formStartHour.value,
                ),
            1,
        ),
    );
    const optionEndHours = computed(() =>
        uniqueTimeParts(selectedStartOption.value?.endTimes ?? [], 0),
    );
    const optionEndMinutes = computed(() =>
        uniqueTimeParts(
            (selectedStartOption.value?.endTimes ?? []).filter(
                (time) => Number(time.slice(0, 2)) === formEndHour.value,
            ),
            1,
        ),
    );
    const optionsReady = computed(
        () => availabilityOptions.status.value === 'success',
    );
    const startHourOptionsResolved = computed(() =>
        optionsReady.value
            ? optionStartHours.value
            : freeWindowStartHourOptions.value,
    );
    const startMinuteOptionsResolved = computed(() =>
        optionsReady.value
            ? optionStartMinutes.value
            : freeWindowStartMinuteOptions.value,
    );
    const endHourOptionsResolved = computed(() =>
        optionsReady.value
            ? optionEndHours.value
            : freeWindowEndHourOptions.value,
    );
    const endMinuteOptionsResolved = computed(() =>
        optionsReady.value
            ? optionEndMinutes.value
            : freeWindowEndMinuteOptions.value,
    );
    const isAvailabilityOptionsLoading = computed(
        () => availabilityOptions.status.value === 'loading',
    );
    const availabilityOptionsError = computed(() =>
        availabilityOptions.status.value === 'error'
            ? 'Nie udało się pobrać dostępnych godzin. Termin zostanie sprawdzony przy zapisie.'
            : '',
    );

    watch(
        () => availabilityOptions.result.value,
        (next) => {
            if (!next || (formType.value === 'DRIVE' && !formVehicleId.value)) {
                return;
            }

            const first = next.options[0];

            if (!first) return;

            const date = availabilityOptionsCandidate.value?.date ?? '';
            const currentStart = formStartLocal.value.split('T')[1] ?? '';
            const currentEnd = formEndLocal.value.split('T')[1] ?? '';
            const selected = next.options.find(
                (option) => option.startTime === currentStart,
            );

            if (!selected) {
                const firstEnd = first.endTimes[0];

                if (!firstEnd) return;

                formStartLocal.value = `${date}T${first.startTime}`;
                formEndLocal.value = `${date}T${firstEnd}`;

                return;
            }

            if (!selected.endTimes.includes(currentEnd)) {
                const firstEnd = selected.endTimes[0];

                if (firstEnd) formEndLocal.value = `${date}T${firstEnd}`;
            }
        },
    );

    return {
        formType,
        formStartLocal,
        formEndLocal,
        formStartDate,
        formStartHour,
        formStartMinute,
        formEndDate,
        formEndHour,
        formEndMinute,
        formVehicleId,
        formInstructorId,
        formCapacityInput,
        formError,
        fullHourOptions,
        fullMinuteOptions,
        currentSnapshot,
        baselineSnapshot,
        isFormFieldsDirty,
        currentFormDate,
        pickerConstraintsActive,
        pickerMinDate,
        pickerMaxDate,
        startHourOptionsResolved,
        startMinuteOptionsResolved,
        endHourOptionsResolved,
        endMinuteOptionsResolved,
        applyPrefill,
        parseCapacity,
        localDatetimeToIso,
        eventAvailabilityStatus: availability.status,
        eventAvailabilityMessage: availability.message,
        availableVehicleIds,
        isAvailabilityOptionsLoading,
        availabilityOptionsError,
        recheckEventAvailability: availability.recheck,
        handleStartDateChange,
        handleStartHourChange,
        handleStartMinuteChange,
        handleEndDateChange,
        handleEndHourChange,
        handleEndMinuteChange,
    };
}
