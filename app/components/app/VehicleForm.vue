<script setup lang="ts">
import { useSlots } from 'vue';
import type { Vehicle, VehicleWritePayload } from '~/types/vehicles/vehicle';

const props = defineProps<{
    mode: 'create' | 'edit';
    initialVehicle: Vehicle | null;
    isSaving: boolean;
    apiError: string | null;
    formId?: string;
    hideDefaultActions?: boolean;
    submitLabel?: string;
    savingLabel?: string;
}>();

const emit = defineEmits<{
    submit: [payload: VehicleWritePayload];
}>();

const slots = useSlots();

const nameModel = ref('');
const registrationNumberModel = ref('');
const inspectionDateModel = ref('');
const insuranceDateModel = ref('');
const modelYearModel = ref('');
const mileageKmModel = ref('');
const showNameRequired = ref(false);
const showRegistrationRequired = ref(false);
const showModelYearInvalid = ref(false);
const showMileageKmInvalid = ref(false);

function syncFromProps() {
    if (props.mode === 'edit' && props.initialVehicle) {
        const v = props.initialVehicle;

        nameModel.value = v.name;
        registrationNumberModel.value = v.registrationNumber;
        inspectionDateModel.value = v.inspectionDate ?? '';
        insuranceDateModel.value = v.insuranceDate ?? '';
        modelYearModel.value = v.modelYear != null ? String(v.modelYear) : '';
        mileageKmModel.value = v.mileageKm != null ? String(v.mileageKm) : '';

        return;
    }

    nameModel.value = '';
    registrationNumberModel.value = '';
    inspectionDateModel.value = '';
    insuranceDateModel.value = '';
    modelYearModel.value = '';
    mileageKmModel.value = '';
}

watch(
    () => [props.mode, props.initialVehicle] as const,
    () => {
        showNameRequired.value = false;
        showRegistrationRequired.value = false;
        showModelYearInvalid.value = false;
        showMileageKmInvalid.value = false;
        syncFromProps();
    },
    { immediate: true },
);

function dateInputToPayload(value: string): string | null {
    const t = value.trim();

    return t.length > 0 ? t : null;
}

const MODEL_YEAR_MIN = 1900;
const MODEL_YEAR_MAX = 2100;
const MILEAGE_KM_MAX = 99_999_999;

function formatPlInt(n: number): string {
    return new Intl.NumberFormat('pl-PL').format(n);
}

function numericFieldInputToTrimmedString(
    raw: string | number | null | undefined,
): string {
    if (raw === null || raw === undefined) return '';

    if (typeof raw === 'number') {
        if (!Number.isFinite(raw)) return '';

        return String(Math.trunc(raw));
    }

    return String(raw).trim();
}

function handleSubmit() {
    const nameOk = nameModel.value.trim().length > 0;
    const regOk = registrationNumberModel.value.trim().length > 0;

    showNameRequired.value = !nameOk;
    showRegistrationRequired.value = !regOk;

    if (!nameOk || !regOk) return;

    let modelYearPayload: number | null = null;
    const yearStr = numericFieldInputToTrimmedString(modelYearModel.value);

    if (yearStr.length > 0) {
        const y = parseInt(yearStr, 10);

        if (!Number.isInteger(y) || y < MODEL_YEAR_MIN || y > MODEL_YEAR_MAX) {
            showModelYearInvalid.value = true;

            return;
        }

        modelYearPayload = y;
    }

    showModelYearInvalid.value = false;

    let mileageKmPayload: number | null = null;
    const mileageStr = numericFieldInputToTrimmedString(mileageKmModel.value);

    if (mileageStr.length > 0) {
        const m = parseInt(mileageStr, 10);

        if (!Number.isInteger(m) || m < 0 || m > MILEAGE_KM_MAX) {
            showMileageKmInvalid.value = true;

            return;
        }

        mileageKmPayload = m;
    }

    showMileageKmInvalid.value = false;

    emit('submit', {
        name: nameModel.value.trim(),
        registrationNumber: registrationNumberModel.value.trim(),
        inspectionDate: dateInputToPayload(inspectionDateModel.value),
        insuranceDate: dateInputToPayload(insuranceDateModel.value),
        modelYear: modelYearPayload,
        mileageKm: mileageKmPayload,
    });
}
</script>

<template>
    <form
        :id="props.formId"
        class="space-y-5"
        novalidate
        @submit.prevent="handleSubmit"
    >
        <p
            v-if="apiError"
            class="text-destructive text-sm"
            role="alert"
            aria-live="polite"
        >
            {{ apiError }}
        </p>

        <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
                <UiLabel for="vehicle-name">Nazwa</UiLabel>
                <UiInput
                    id="vehicle-name"
                    v-model="nameModel"
                    type="text"
                    name="name"
                    autocomplete="off"
                    :aria-invalid="showNameRequired"
                    :aria-describedby="
                        showNameRequired ? 'vehicle-name-error' : undefined
                    "
                    :disabled="isSaving"
                />
                <p
                    v-if="showNameRequired"
                    id="vehicle-name-error"
                    class="text-destructive text-sm"
                    role="alert"
                >
                    Nazwa jest wymagana.
                </p>
            </div>

            <div class="space-y-2">
                <UiLabel for="vehicle-registration"
                    >Numer rejestracyjny</UiLabel
                >
                <UiInput
                    id="vehicle-registration"
                    v-model="registrationNumberModel"
                    type="text"
                    name="registrationNumber"
                    autocomplete="off"
                    :aria-invalid="showRegistrationRequired"
                    :aria-describedby="
                        showRegistrationRequired
                            ? 'vehicle-registration-error'
                            : undefined
                    "
                    :disabled="isSaving"
                />
                <p
                    v-if="showRegistrationRequired"
                    id="vehicle-registration-error"
                    class="text-destructive text-sm"
                    role="alert"
                >
                    Numer rejestracyjny jest wymagany.
                </p>
            </div>

            <div class="space-y-2">
                <UiLabel for="vehicle-inspection">Data przegladu</UiLabel>
                <UiDatePicker
                    id="vehicle-inspection"
                    v-model="inspectionDateModel"
                    :disabled="isSaving"
                    placeholder="Data przegladu (opcjonalnie)"
                    clearable
                />
            </div>

            <div class="space-y-2">
                <UiLabel for="vehicle-insurance">Data ubezpieczenia</UiLabel>
                <UiDatePicker
                    id="vehicle-insurance"
                    v-model="insuranceDateModel"
                    :disabled="isSaving"
                    placeholder="Data ubezpieczenia (opcjonalnie)"
                    clearable
                />
            </div>

            <div class="space-y-2">
                <UiLabel for="vehicle-model-year"
                    >Rocznik (opcjonalnie)</UiLabel
                >
                <UiInput
                    id="vehicle-model-year"
                    v-model="modelYearModel"
                    type="number"
                    name="modelYear"
                    inputmode="numeric"
                    autocomplete="off"
                    :min="MODEL_YEAR_MIN"
                    :max="MODEL_YEAR_MAX"
                    step="1"
                    :aria-invalid="showModelYearInvalid"
                    :aria-describedby="
                        showModelYearInvalid
                            ? 'vehicle-model-year-error'
                            : undefined
                    "
                    :disabled="isSaving"
                />
                <p
                    v-if="showModelYearInvalid"
                    id="vehicle-model-year-error"
                    class="text-destructive text-sm"
                    role="alert"
                >
                    Podaj rocznik z zakresu {{ MODEL_YEAR_MIN }}-{{
                        MODEL_YEAR_MAX
                    }}
                    lub zostaw puste.
                </p>
            </div>

            <div class="space-y-2">
                <UiLabel for="vehicle-mileage">
                    Przebieg (km, opcjonalnie)
                </UiLabel>
                <UiInput
                    id="vehicle-mileage"
                    v-model="mileageKmModel"
                    type="number"
                    name="mileageKm"
                    inputmode="numeric"
                    autocomplete="off"
                    min="0"
                    :max="MILEAGE_KM_MAX"
                    step="1"
                    :aria-invalid="showMileageKmInvalid"
                    :aria-describedby="
                        showMileageKmInvalid
                            ? 'vehicle-mileage-error'
                            : undefined
                    "
                    :disabled="isSaving"
                />
                <p
                    v-if="showMileageKmInvalid"
                    id="vehicle-mileage-error"
                    class="text-destructive text-sm"
                    role="alert"
                >
                    Podaj przebieg od 0 do {{ formatPlInt(MILEAGE_KM_MAX) }} km
                    lub zostaw puste.
                </p>
            </div>
        </div>

        <div v-if="slots.afterFields" class="space-y-4 pt-1">
            <slot name="afterFields" />
        </div>

        <UiButton
            v-if="!props.hideDefaultActions"
            type="submit"
            class="w-full sm:w-auto"
            :disabled="isSaving"
        >
            {{
                isSaving
                    ? (props.savingLabel ?? 'Zapisywanie...')
                    : (props.submitLabel ?? 'Zapisz')
            }}
        </UiButton>
    </form>
</template>
