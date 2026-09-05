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

        <VehicleFormFields
            v-model:name="nameModel"
            v-model:registration-number="registrationNumberModel"
            v-model:inspection-date="inspectionDateModel"
            v-model:insurance-date="insuranceDateModel"
            v-model:model-year="modelYearModel"
            v-model:mileage-km="mileageKmModel"
            :is-saving="isSaving"
            :show-name-required="showNameRequired"
            :show-registration-required="showRegistrationRequired"
            :show-model-year-invalid="showModelYearInvalid"
            :show-mileage-km-invalid="showMileageKmInvalid"
            :model-year-min="MODEL_YEAR_MIN"
            :model-year-max="MODEL_YEAR_MAX"
            :mileage-km-max="MILEAGE_KM_MAX"
        />

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
