import type { Ref } from 'vue';
import {
    localDatetimeToIso,
    suggestManagerEventEndLocal,
} from '~/utils/events/managerEventEditForm';
import { useManagerEventEditTimeSplit } from './useManagerEventEditTimeSplit';

export function useManagerEventEditTimePicker(input: {
    formStartLocal: Ref<string>;
    formEndLocal: Ref<string>;
}) {
    const {
        formStartDate,
        formStartHour,
        formStartMinute,
        formEndDate,
        formEndHour,
        formEndMinute,
        isValidLocalDateString,
        hydrateStartSplitFromLocal,
        hydrateEndSplitFromLocal,
        handleDateChange,
        handleStartTimeChange,
        handleEndTimeChange,
    } = useManagerEventEditTimeSplit(input);
    const fullHourOptions = Array.from({ length: 24 }, (_, i) => i);
    const fullMinuteOptions = Array.from({ length: 60 }, (_, i) => i);

    const currentFormDate = computed(() => {
        const date = formStartDate.value.trim();

        return isValidLocalDateString(date)
            ? date
            : input.formStartLocal.value.trim().slice(0, 10);
    });

    watch(input.formStartLocal, hydrateStartSplitFromLocal);
    watch(input.formEndLocal, hydrateEndSplitFromLocal);
    watch([input.formStartLocal, input.formEndLocal], () => {
        const startIso = localDatetimeToIso(input.formStartLocal.value);
        const endIso = localDatetimeToIso(input.formEndLocal.value);

        if (!startIso || !endIso) return;

        if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
            input.formEndLocal.value =
                suggestManagerEventEndLocal(
                    input.formStartLocal.value.trim(),
                ) ?? input.formStartLocal.value;
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
        handleDateChange,
        handleStartTimeChange,
        handleEndTimeChange,
    };
}
