import type { Ref } from 'vue';
import type { FreeWindow, InstructorEvent } from '~/types/instructorEvent';
import {
    getAllowedHoursForDate,
    getAllowedHoursForEnd,
    getAllowedMinutesForDateHour,
    getAllowedMinutesForEndHour,
    getLocalDateBoundsForCalendar,
    suggestDefaultEndLocal,
} from '~/utils/eventEditFreeWindowsPicker';
import {
    buildDatetimeLocal,
    isoDateStringToCalendarDate,
    isoInstantToDatetimeLocalString,
    parseDatetimeLocalParts,
} from '~/utils/weeklyCalendarDates';

const ISO_DATE_LOCAL_RE = /^\d{4}-\d{2}-\d{2}$/;

export function useManagerEventEditForm(input: {
    loadedEvent: Ref<InstructorEvent | null>;
    freeWindows: Ref<FreeWindow[]>;
    freeWindowsUnavailable: Ref<boolean>;
}) {
    const formType = ref<'THEORY' | 'DRIVE'>('THEORY');
    const formStartLocal = ref('');
    const formEndLocal = ref('');
    const formStartDate = ref('');
    const formStartHour = ref(9);
    const formStartMinute = ref(0);
    const formEndDate = ref('');
    const formEndHour = ref(9);
    const formEndMinute = ref(0);
    const fullHourOptions = Array.from({ length: 24 }, (_, i) => i);
    const fullMinuteOptions = Array.from({ length: 60 }, (_, i) => i);
    const formVehicleId = ref('');
    const formInstructorId = ref('');
    const formCapacityInput = ref<string | number>('');
    const formError = ref<string | null>(null);

    function isoToDatetimeLocal(iso: string): string {
        return isoInstantToDatetimeLocalString(iso);
    }

    function localDatetimeToIso(local: string): string | null {
        const t = local.trim();

        if (!t) {
            return null;
        }

        const d = new Date(t);

        if (Number.isNaN(d.getTime())) {
            return null;
        }

        return d.toISOString();
    }

    function isValidLocalDateString(s: string): boolean {
        return ISO_DATE_LOCAL_RE.test(s.trim());
    }

    function hydrateStartSplitFromLocal(): void {
        const p = parseDatetimeLocalParts(formStartLocal.value.trim());

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
        const p = parseDatetimeLocalParts(formEndLocal.value.trim());

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

    function pickerConstraintsEnabled(): boolean {
        return (
            input.freeWindows.value.length > 0 &&
            !input.freeWindowsUnavailable.value
        );
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
            formStartLocal.value.trim(),
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
            formStartLocal.value.trim(),
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
            formStartLocal.value = '';

            return;
        }

        clampStartTimeParts();
        const cd = isoDateStringToCalendarDate(d);

        if (!cd) {
            formStartLocal.value = '';

            return;
        }

        formStartLocal.value = buildDatetimeLocal(
            cd,
            formStartHour.value,
            formStartMinute.value,
        );
    }

    function commitEndLocal(): void {
        const d = formEndDate.value.trim();

        if (!isValidLocalDateString(d)) {
            formEndLocal.value = '';

            return;
        }

        clampEndTimeParts();
        const cd = isoDateStringToCalendarDate(d);

        if (!cd) {
            formEndLocal.value = '';

            return;
        }

        formEndLocal.value = buildDatetimeLocal(
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

    function normalizeCapacityForCompare(
        cap: number | null | undefined,
    ): string {
        if (cap === null || cap === undefined || !Number.isFinite(cap)) {
            return '';
        }

        return String(Math.trunc(cap));
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
        if (raw === null || raw === undefined) {
            return null;
        }

        if (typeof raw === 'number') {
            if (!Number.isFinite(raw)) {
                return null;
            }

            if (raw < 0) {
                return false;
            }

            return Math.trunc(raw);
        }

        const t = String(raw).trim();

        if (t === '') {
            return null;
        }

        const n = Number.parseInt(t, 10);

        if (!Number.isFinite(n) || n < 0) {
            return false;
        }

        return n;
    }

    const baselineSnapshot = computed((): Record<string, string> | null => {
        const ev = input.loadedEvent.value;

        if (!ev) {
            return null;
        }

        return {
            type: ev.type === 'DRIVE' ? 'DRIVE' : 'THEORY',
            start: isoToDatetimeLocal(ev.startTime ?? ''),
            end: isoToDatetimeLocal(ev.endTime ?? ''),
            vehicle: (ev.vehicleId ?? '').trim(),
            capacity: normalizeCapacityForCompare(ev.capacity ?? null),
            instructorId: (ev.instructorId ?? '').trim(),
        };
    });

    const currentSnapshot = computed((): Record<string, string> => {
        const capParsed = parseCapacity(formCapacityInput.value);
        const cap = capParsed === false ? null : capParsed;

        return {
            type: formType.value,
            start: formStartLocal.value,
            end: formEndLocal.value,
            vehicle:
                formType.value === 'DRIVE' ? formVehicleId.value.trim() : '',
            capacity: normalizeCapacityForCompare(cap),
            instructorId: formInstructorId.value.trim(),
        };
    });

    const isFormFieldsDirty = computed((): boolean => {
        const a = baselineSnapshot.value;
        const b = currentSnapshot.value;

        if (!a || !b) {
            return false;
        }

        return JSON.stringify(a) !== JSON.stringify(b);
    });

    function needsTimeOrInstructorSlotValidation(): boolean {
        const a = baselineSnapshot.value;
        const b = currentSnapshot.value;

        if (!a || !b) {
            return false;
        }

        return (
            a.start !== b.start ||
            a.end !== b.end ||
            a.instructorId !== b.instructorId
        );
    }

    const currentFormDate = computed(() => {
        const d = formStartDate.value.trim();

        if (isValidLocalDateString(d)) {
            return d;
        }

        return formStartLocal.value.trim().slice(0, 10);
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

        return formStartLocal.value.trim().slice(0, 10);
    });

    const endDateStr = computed(() => {
        const d = formEndDate.value.trim();

        if (isValidLocalDateString(d)) {
            return d;
        }

        return formEndLocal.value.trim().slice(0, 10);
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
                formStartLocal.value.trim(),
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
                formStartLocal.value.trim(),
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

    watch(formStartLocal, hydrateStartSplitFromLocal);
    watch(formEndLocal, hydrateEndSplitFromLocal);

    watch([formStartLocal, formEndLocal], () => {
        const startIso = localDatetimeToIso(formStartLocal.value);
        const endIso = localDatetimeToIso(formEndLocal.value);

        if (!startIso || !endIso) {
            return;
        }

        const startT = new Date(startIso).getTime();
        const endT = new Date(endIso).getTime();

        if (endT <= startT) {
            const suggested = suggestDefaultEndLocal(
                pickerConstraintsActive.value ? input.freeWindows.value : [],
                formStartLocal.value.trim(),
            );

            formEndLocal.value = suggested ?? formStartLocal.value;
        }
    });

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
        needsTimeOrInstructorSlotValidation,
        handleStartDateChange,
        handleStartHourChange,
        handleStartMinuteChange,
        handleEndDateChange,
        handleEndHourChange,
        handleEndMinuteChange,
    };
}
