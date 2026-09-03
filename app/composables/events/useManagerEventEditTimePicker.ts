import type { Ref } from 'vue';
import type { FreeWindow } from '~/types/events/instructorEvent';
import { localDatetimeToIso } from '~/utils/events/managerEventEditForm';
import {
    getAllowedHoursForDate,
    getAllowedHoursForEnd,
    getAllowedMinutesForDateHour,
    getAllowedMinutesForEndHour,
    getLocalDateBoundsForCalendar,
    suggestDefaultEndLocal,
} from '~/utils/schedule/eventEditFreeWindowsPicker';
import { useManagerEventEditTimeSplit } from './useManagerEventEditTimeSplit';

export function useManagerEventEditTimePicker(input: {
    formStartLocal: Ref<string>;
    formEndLocal: Ref<string>;
    freeWindows: Ref<FreeWindow[]>;
    freeWindowsUnavailable: Ref<boolean>;
}) {
    const {
        formStartDate,
        formStartHour,
        formStartMinute,
        formEndDate,
        formEndHour,
        formEndMinute,
        isValidLocalDateString,
        pickerConstraintsEnabled,
        hydrateStartSplitFromLocal,
        hydrateEndSplitFromLocal,
        handleStartDateChange,
        handleStartHourChange,
        handleStartMinuteChange,
        handleEndDateChange,
        handleEndHourChange,
        handleEndMinuteChange,
    } = useManagerEventEditTimeSplit(input);
    const fullHourOptions = Array.from({ length: 24 }, (_, i) => i);
    const fullMinuteOptions = Array.from({ length: 60 }, (_, i) => i);

    const currentFormDate = computed(() => {
        const d = formStartDate.value.trim();

        if (isValidLocalDateString(d)) {
            return d;
        }

        return input.formStartLocal.value.trim().slice(0, 10);
    });

    const pickerConstraintsActive = computed(pickerConstraintsEnabled);

    const pickerCalendarBounds = computed(() => {
        if (!pickerConstraintsActive.value) {
            return null;
        }

        return getLocalDateBoundsForCalendar(input.freeWindows.value);
    });

    const pickerMinDate = computed(() => pickerCalendarBounds.value?.minDate);
    const pickerMaxDate = computed(() => pickerCalendarBounds.value?.maxDate);

    const startDateStr = computed(() => {
        const d = formStartDate.value.trim();

        if (isValidLocalDateString(d)) {
            return d;
        }

        return input.formStartLocal.value.trim().slice(0, 10);
    });

    const endDateStr = computed(() => {
        const d = formEndDate.value.trim();

        if (isValidLocalDateString(d)) {
            return d;
        }

        return input.formEndLocal.value.trim().slice(0, 10);
    });

    const startHourOptions = computed(() => {
        if (!pickerConstraintsActive.value) {
            return undefined;
        }

        const d = startDateStr.value;

        if (!isValidLocalDateString(d)) {
            return undefined;
        }

        return getAllowedHoursForDate(input.freeWindows.value, d) ?? undefined;
    });

    const startMinuteOptions = computed(() => {
        if (!pickerConstraintsActive.value) {
            return undefined;
        }

        const d = startDateStr.value;

        if (!isValidLocalDateString(d)) {
            return undefined;
        }

        return (
            getAllowedMinutesForDateHour(
                input.freeWindows.value,
                d,
                formStartHour.value,
            ) ?? undefined
        );
    });

    const endHourOptions = computed(() => {
        if (!pickerConstraintsActive.value) {
            return undefined;
        }

        const d = endDateStr.value;

        if (!isValidLocalDateString(d)) {
            return undefined;
        }

        return (
            getAllowedHoursForEnd(
                input.freeWindows.value,
                input.formStartLocal.value.trim(),
                d,
            ) ?? undefined
        );
    });

    const endMinuteOptions = computed(() => {
        if (!pickerConstraintsActive.value) {
            return undefined;
        }

        const d = endDateStr.value;

        if (!isValidLocalDateString(d)) {
            return undefined;
        }

        return (
            getAllowedMinutesForEndHour(
                input.freeWindows.value,
                input.formStartLocal.value.trim(),
                d,
                formEndHour.value,
            ) ?? undefined
        );
    });

    const startHourOptionsResolved = computed(
        () => startHourOptions.value ?? fullHourOptions,
    );
    const startMinuteOptionsResolved = computed(
        () => startMinuteOptions.value ?? fullMinuteOptions,
    );
    const endHourOptionsResolved = computed(
        () => endHourOptions.value ?? fullHourOptions,
    );
    const endMinuteOptionsResolved = computed(
        () => endMinuteOptions.value ?? fullMinuteOptions,
    );

    watch(input.formStartLocal, hydrateStartSplitFromLocal);
    watch(input.formEndLocal, hydrateEndSplitFromLocal);

    watch([input.formStartLocal, input.formEndLocal], () => {
        const startIso = localDatetimeToIso(input.formStartLocal.value);
        const endIso = localDatetimeToIso(input.formEndLocal.value);

        if (!startIso || !endIso) {
            return;
        }

        const startT = new Date(startIso).getTime();
        const endT = new Date(endIso).getTime();

        if (endT <= startT) {
            const suggested = suggestDefaultEndLocal(
                pickerConstraintsActive.value ? input.freeWindows.value : [],
                input.formStartLocal.value.trim(),
            );

            input.formEndLocal.value = suggested ?? input.formStartLocal.value;
        }
    });

    return {
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
        startHourOptionsResolved,
        startMinuteOptionsResolved,
        endHourOptionsResolved,
        endMinuteOptionsResolved,
        handleStartDateChange,
        handleStartHourChange,
        handleStartMinuteChange,
        handleEndDateChange,
        handleEndHourChange,
        handleEndMinuteChange,
    };
}
