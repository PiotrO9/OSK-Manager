<script setup lang="ts">
import type { Vehicle } from '~/types/vehicles/vehicle';
import type { VehicleStatusUpdateBody } from '~/composables/vehicles/useVehiclesApi';
import {
    addUtcDaysYmd,
    getUtcTodayYmd,
    isUnavailableUntilSelectable,
} from '~/utils/vehicles/availability';

const props = withDefaults(
    defineProps<{
        vehicle: Vehicle;
        disabled?: boolean;
        busy?: boolean;
        idPrefix: string;
        ariaLabel: string;
    }>(),
    {
        disabled: false,
        busy: false,
    },
);

const emit = defineEmits<{
    statusChange: [payload: VehicleStatusUpdateBody];
}>();

type AvailabilityMode = 'indefinite' | 'date';

const selectedMode = shallowRef<AvailabilityMode>('indefinite');
const customDate = shallowRef('');
const showDateTouched = shallowRef(false);

const isInactive = computed(() => props.vehicle.status === 'UNAVAILABLE');
const isDisabled = computed(() => props.disabled || props.busy);
const minDate = computed(() => getUtcTodayYmd());
const dateErrorId = computed(
    () => `${props.idPrefix}-${props.vehicle.id}-date-error`,
);
const customDateInvalid = computed(
    () =>
        selectedMode.value === 'date' &&
        !isUnavailableUntilSelectable(customDate.value),
);
const showDateError = computed(
    () =>
        selectedMode.value === 'date' &&
        showDateTouched.value &&
        customDateInvalid.value,
);

watch(
    () =>
        [
            props.vehicle.id,
            props.vehicle.status,
            props.vehicle.unavailableUntil,
        ] as const,
    () => {
        selectedMode.value = props.vehicle.unavailableUntil
            ? 'date'
            : 'indefinite';
        customDate.value = props.vehicle.unavailableUntil ?? '';
        showDateTouched.value = false;
    },
    { immediate: true },
);

function handleBaseStatusChange(status: VehicleStatusUpdateBody['status']) {
    if (isDisabled.value) return;

    if (status === 'ACTIVE') {
        emit('statusChange', { status: 'ACTIVE' });

        return;
    }

    selectedMode.value = 'indefinite';
    customDate.value = '';
    showDateTouched.value = false;
    emit('statusChange', { status: 'UNAVAILABLE', unavailableUntil: null });
}

function setIndefinite() {
    if (isDisabled.value) return;

    selectedMode.value = 'indefinite';
    customDate.value = '';
    showDateTouched.value = false;
    emit('statusChange', { status: 'UNAVAILABLE', unavailableUntil: null });
}

function setPreset(days: number) {
    if (isDisabled.value) return;

    const unavailableUntil = addUtcDaysYmd(days);

    selectedMode.value = 'date';
    customDate.value = unavailableUntil;
    showDateTouched.value = false;
    emit('statusChange', {
        status: 'UNAVAILABLE',
        unavailableUntil,
    });
}

function setDateMode() {
    if (isDisabled.value) return;

    selectedMode.value = 'date';
    customDate.value = props.vehicle.unavailableUntil ?? minDate.value;
    showDateTouched.value = false;
}

function saveCustomDate() {
    if (isDisabled.value) return;

    showDateTouched.value = true;

    if (customDateInvalid.value) return;

    emit('statusChange', {
        status: 'UNAVAILABLE',
        unavailableUntil: customDate.value,
    });
}

function handleCustomDateUpdate(value: string) {
    customDate.value = value;
    showDateTouched.value = true;
}
</script>

<template>
    <div class="min-w-0 space-y-2">
        <VehicleStatusControl
            :id="`${idPrefix}-switch-${vehicle.id}`"
            :status="vehicle.status"
            :disabled="isDisabled"
            :busy="busy"
            :aria-label="ariaLabel"
            @status-change="handleBaseStatusChange"
        />

        <div v-if="isInactive" class="space-y-2">
            <div
                class="flex min-w-0 flex-wrap items-center gap-1.5"
                :aria-disabled="isDisabled ? true : undefined"
            >
                <UiButton
                    type="button"
                    size="sm"
                    :variant="
                        selectedMode === 'indefinite' ? 'secondary' : 'outline'
                    "
                    class="h-8 rounded-full px-3 text-xs"
                    :disabled="isDisabled"
                    @click="setIndefinite"
                >
                    Bezterminowo
                </UiButton>
                <UiButton
                    type="button"
                    size="sm"
                    variant="outline"
                    class="h-8 rounded-full px-3 text-xs"
                    :disabled="isDisabled"
                    @click="setPreset(7)"
                >
                    7 dni
                </UiButton>
                <UiButton
                    type="button"
                    size="sm"
                    variant="outline"
                    class="h-8 rounded-full px-3 text-xs"
                    :disabled="isDisabled"
                    @click="setPreset(14)"
                >
                    14 dni
                </UiButton>
                <UiButton
                    type="button"
                    size="sm"
                    :variant="selectedMode === 'date' ? 'secondary' : 'outline'"
                    class="h-8 rounded-full px-3 text-xs"
                    :disabled="isDisabled"
                    @click="setDateMode"
                >
                    Do daty
                </UiButton>
            </div>

            <div
                v-if="selectedMode === 'date'"
                class="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
            >
                <UiDatePicker
                    :id="`${idPrefix}-date-${vehicle.id}`"
                    :model-value="customDate"
                    :disabled="isDisabled"
                    :min="minDate"
                    placeholder="Data powrotu"
                    :aria-invalid="showDateError"
                    :aria-describedby="showDateError ? dateErrorId : undefined"
                    trigger-class="h-9 text-xs"
                    @update:model-value="handleCustomDateUpdate"
                />
                <UiButton
                    type="button"
                    size="sm"
                    class="h-9 rounded-xl"
                    :disabled="isDisabled || customDateInvalid"
                    @click="saveCustomDate"
                >
                    Zapisz
                </UiButton>
                <p
                    v-if="showDateError"
                    :id="dateErrorId"
                    class="text-destructive text-xs sm:col-span-2"
                    role="alert"
                >
                    Wybierz dzisiejszą albo przyszłą datę.
                </p>
            </div>
        </div>
    </div>
</template>
