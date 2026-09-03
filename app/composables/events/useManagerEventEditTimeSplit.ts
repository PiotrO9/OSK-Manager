import type { Ref } from 'vue';
import type { FreeWindow } from '~/types/events/instructorEvent';
import {
    getAllowedHoursForDate,
    getAllowedHoursForEnd,
    getAllowedMinutesForDateHour,
    getAllowedMinutesForEndHour,
} from '~/utils/schedule/eventEditFreeWindowsPicker';
import {
    buildDatetimeLocal,
    isoDateStringToCalendarDate,
    parseDatetimeLocalParts,
} from '~/utils/date/weeklyCalendarDates';

const ISO_DATE_LOCAL_RE = /^\d{4}-\d{2}-\d{2}$/;

interface UseManagerEventEditTimeSplitInput {
    formStartLocal: Ref<string>;
    formEndLocal: Ref<string>;
    freeWindows: Ref<FreeWindow[]>;
    freeWindowsUnavailable: Ref<boolean>;
}

export function useManagerEventEditTimeSplit(
    input: UseManagerEventEditTimeSplitInput,
) {
    const formStartDate = ref('');
    const formStartHour = ref(9);
    const formStartMinute = ref(0);
    const formEndDate = ref('');
    const formEndHour = ref(9);
    const formEndMinute = ref(0);

    function isValidLocalDateString(s: string): boolean {
        return ISO_DATE_LOCAL_RE.test(s.trim());
    }

    function pickerConstraintsEnabled(): boolean {
        return (
            input.freeWindows.value.length > 0 &&
            !input.freeWindowsUnavailable.value
        );
    }

    function hydrateStartSplitFromLocal(): void {
        const p = parseDatetimeLocalParts(input.formStartLocal.value.trim());

        if (!p) {
            formStartDate.value = '';
            formStartHour.value = 9;
            formStartMinute.value = 0;

            return;
        }

        formStartDate.value = `${p.date.year}-${String(p.date.month).padStart(2, '0')}-${String(p.date.day).padStart(2, '0')}`;
        formStartHour.value = p.hour;
        formStartMinute.value = p.minute;
    }

    function hydrateEndSplitFromLocal(): void {
        const p = parseDatetimeLocalParts(input.formEndLocal.value.trim());

        if (!p) {
            formEndDate.value = '';
            formEndHour.value = 9;
            formEndMinute.value = 0;

            return;
        }

        formEndDate.value = `${p.date.year}-${String(p.date.month).padStart(2, '0')}-${String(p.date.day).padStart(2, '0')}`;
        formEndHour.value = p.hour;
        formEndMinute.value = p.minute;
    }

    function clampStartTimeParts(): void {
        const d = formStartDate.value.trim();

        if (!isValidLocalDateString(d) || !pickerConstraintsEnabled()) {
            return;
        }

        const hAllowed = getAllowedHoursForDate(input.freeWindows.value, d);

        if (hAllowed && hAllowed.length > 0) {
            let h = formStartHour.value;

            if (!hAllowed.includes(h)) {
                h = hAllowed[0] ?? h;
                formStartHour.value = h;
            }
        }

        const mAllowed = getAllowedMinutesForDateHour(
            input.freeWindows.value,
            d,
            formStartHour.value,
        );

        if (mAllowed && mAllowed.length > 0) {
            let mi = formStartMinute.value;

            if (!mAllowed.includes(mi)) {
                mi = mAllowed[0] ?? mi;
                formStartMinute.value = mi;
            }
        }
    }

    function clampEndTimeParts(): void {
        const d = formEndDate.value.trim();

        if (!isValidLocalDateString(d) || !pickerConstraintsEnabled()) {
            return;
        }

        const hAllowed = getAllowedHoursForEnd(
            input.freeWindows.value,
            input.formStartLocal.value.trim(),
            d,
        );

        if (hAllowed && hAllowed.length > 0) {
            let h = formEndHour.value;

            if (!hAllowed.includes(h)) {
                h = hAllowed[0] ?? h;
                formEndHour.value = h;
            }
        }

        const mAllowed = getAllowedMinutesForEndHour(
            input.freeWindows.value,
            input.formStartLocal.value.trim(),
            d,
            formEndHour.value,
        );

        if (mAllowed && mAllowed.length > 0) {
            let mi = formEndMinute.value;

            if (!mAllowed.includes(mi)) {
                mi = mAllowed[0] ?? mi;
                formEndMinute.value = mi;
            }
        }
    }

    function commitStartLocal(): void {
        const d = formStartDate.value.trim();

        if (!isValidLocalDateString(d)) {
            input.formStartLocal.value = '';

            return;
        }

        clampStartTimeParts();
        const cd = isoDateStringToCalendarDate(d);

        if (!cd) {
            input.formStartLocal.value = '';

            return;
        }

        input.formStartLocal.value = buildDatetimeLocal(
            cd,
            formStartHour.value,
            formStartMinute.value,
        );
    }

    function commitEndLocal(): void {
        const d = formEndDate.value.trim();

        if (!isValidLocalDateString(d)) {
            input.formEndLocal.value = '';

            return;
        }

        clampEndTimeParts();
        const cd = isoDateStringToCalendarDate(d);

        if (!cd) {
            input.formEndLocal.value = '';

            return;
        }

        input.formEndLocal.value = buildDatetimeLocal(
            cd,
            formEndHour.value,
            formEndMinute.value,
        );
    }

    function handleStartDateChange(event: Event): void {
        formStartDate.value = (event.target as HTMLInputElement).value.trim();
        clampStartTimeParts();
        commitStartLocal();
    }

    function handleStartHourChange(event: Event): void {
        const h = Number.parseInt(
            (event.target as HTMLSelectElement).value,
            10,
        );

        if (!Number.isFinite(h) || h < 0 || h > 23) {
            return;
        }

        formStartHour.value = h;
        clampStartTimeParts();
        commitStartLocal();
    }

    function handleStartMinuteChange(event: Event): void {
        const m = Number.parseInt(
            (event.target as HTMLSelectElement).value,
            10,
        );

        if (!Number.isFinite(m) || m < 0 || m > 59) {
            return;
        }

        formStartMinute.value = m;
        commitStartLocal();
    }

    function handleEndDateChange(event: Event): void {
        formEndDate.value = (event.target as HTMLInputElement).value.trim();
        clampEndTimeParts();
        commitEndLocal();
    }

    function handleEndHourChange(event: Event): void {
        const h = Number.parseInt(
            (event.target as HTMLSelectElement).value,
            10,
        );

        if (!Number.isFinite(h) || h < 0 || h > 23) {
            return;
        }

        formEndHour.value = h;
        clampEndTimeParts();
        commitEndLocal();
    }

    function handleEndMinuteChange(event: Event): void {
        const m = Number.parseInt(
            (event.target as HTMLSelectElement).value,
            10,
        );

        if (!Number.isFinite(m) || m < 0 || m > 59) {
            return;
        }

        formEndMinute.value = m;
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
        pickerConstraintsEnabled,
        hydrateStartSplitFromLocal,
        hydrateEndSplitFromLocal,
        handleStartDateChange,
        handleStartHourChange,
        handleStartMinuteChange,
        handleEndDateChange,
        handleEndHourChange,
        handleEndMinuteChange,
    };
}
