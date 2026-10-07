import type { Ref } from 'vue';
import {
    buildDatetimeLocal,
    isoDateStringToCalendarDate,
    parseDatetimeLocalParts,
} from '~/utils/date/weeklyCalendarDates';

const ISO_DATE_LOCAL_RE = /^\d{4}-\d{2}-\d{2}$/;

export function useManagerEventEditTimeSplit(input: {
    formStartLocal: Ref<string>;
    formEndLocal: Ref<string>;
}) {
    const formStartDate = ref('');
    const formStartHour = ref(9);
    const formStartMinute = ref(0);
    const formEndDate = ref('');
    const formEndHour = ref(9);
    const formEndMinute = ref(0);

    function isValidLocalDateString(value: string): boolean {
        return ISO_DATE_LOCAL_RE.test(value.trim());
    }

    function hydrateStartSplitFromLocal(): void {
        const parts = parseDatetimeLocalParts(
            input.formStartLocal.value.trim(),
        );

        if (!parts) {
            formStartDate.value = '';
            formStartHour.value = 9;
            formStartMinute.value = 0;

            return;
        }

        formStartDate.value = `${parts.date.year}-${String(parts.date.month).padStart(2, '0')}-${String(parts.date.day).padStart(2, '0')}`;
        formStartHour.value = parts.hour;
        formStartMinute.value = parts.minute;
    }

    function hydrateEndSplitFromLocal(): void {
        const parts = parseDatetimeLocalParts(input.formEndLocal.value.trim());

        if (!parts) {
            formEndDate.value = '';
            formEndHour.value = 9;
            formEndMinute.value = 0;

            return;
        }

        formEndDate.value = `${parts.date.year}-${String(parts.date.month).padStart(2, '0')}-${String(parts.date.day).padStart(2, '0')}`;
        formEndHour.value = parts.hour;
        formEndMinute.value = parts.minute;
    }

    function commitStartLocal(): void {
        const date = isoDateStringToCalendarDate(formStartDate.value.trim());

        input.formStartLocal.value = date
            ? buildDatetimeLocal(
                  date,
                  formStartHour.value,
                  formStartMinute.value,
              )
            : '';
    }

    function commitEndLocal(): void {
        const date = isoDateStringToCalendarDate(formEndDate.value.trim());

        input.formEndLocal.value = date
            ? buildDatetimeLocal(date, formEndHour.value, formEndMinute.value)
            : '';
    }

    function handleDateChange(value: string): void {
        const date = value.trim();

        if (!isoDateStringToCalendarDate(date)) return;

        formStartDate.value = date;
        formEndDate.value = date;
        commitStartLocal();
        commitEndLocal();
    }

    function handleStartTimeChange(value: string): void {
        const match = /^(\d{2}):(\d{2})$/.exec(value.trim());

        if (!match) return;

        const hour = Number(match[1]);
        const minute = Number(match[2]);

        if (hour > 23 || minute > 59) return;

        formStartHour.value = hour;
        formStartMinute.value = minute;
        commitStartLocal();
    }

    function handleEndTimeChange(value: string): void {
        const match = /^(\d{2}):(\d{2})$/.exec(value.trim());

        if (!match) return;

        const hour = Number(match[1]);
        const minute = Number(match[2]);

        if (hour > 23 || minute > 59) return;

        formEndHour.value = hour;
        formEndMinute.value = minute;
        commitEndLocal();
    }

    return {
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
    };
}
