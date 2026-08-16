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
    needsManagerEventSlotValidation,
    parseManagerEventCapacity,
    type ManagerEventEditFormSnapshot,
} from '~/utils/events/managerEventEditForm';
import { isoInstantToDatetimeLocalString } from '~/utils/date/weeklyCalendarDates';

export function useManagerEventEditForm(input: {
    loadedEvent: Ref<InstructorEvent | null>;
    freeWindows: Ref<FreeWindow[]>;
    freeWindowsUnavailable: Ref<boolean>;
}) {
    const formType = ref<'THEORY' | 'DRIVE'>('THEORY');
    const formStartLocal = ref('');
    const formEndLocal = ref('');
    const formVehicleId = ref('');
    const formInstructorId = ref('');
    const formCapacityInput = ref<string | number>('');
    const formError = ref<string | null>(null);

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
    } = useManagerEventEditTimePicker({
        formStartLocal,
        formEndLocal,
        freeWindows: input.freeWindows,
        freeWindowsUnavailable: input.freeWindowsUnavailable,
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

    function needsTimeOrInstructorSlotValidation(): boolean {
        return needsManagerEventSlotValidation(
            baselineSnapshot.value,
            currentSnapshot.value,
        );
    }

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
