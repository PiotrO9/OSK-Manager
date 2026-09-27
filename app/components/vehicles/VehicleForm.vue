<script setup lang="ts">
import { useSlots } from 'vue';
import type { Vehicle, VehicleWritePayload } from '~/types/vehicles/vehicle';
import {
    buildVehicleWritePayload,
    normalizeVehicleRegistrationNumber,
    parseOptionalVehicleMileageKm,
    parseOptionalVehicleModelYear,
    vehicleToFormDraft,
    VEHICLE_MILEAGE_KM_MAX,
    VEHICLE_MODEL_YEAR_MAX,
    VEHICLE_MODEL_YEAR_MIN,
} from '~/utils/vehicles/vehicleForm';

const props = defineProps<{
    mode: 'create' | 'edit';
    initialVehicle: Vehicle | null;
    isSaving: boolean;
    apiError: string | null;
    registrationNumberError?: string | null;
    formId?: string;
    hideDefaultActions?: boolean;
    submitLabel?: string;
    savingLabel?: string;
}>();

const emit = defineEmits<{
    submit: [payload: VehicleWritePayload];
    dirtyChange: [isDirty: boolean];
    registrationNumberChange: [];
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
const formElement = useTemplateRef<HTMLFormElement>('formElement');

const currentDraft = computed(() => ({
    name: nameModel.value,
    registrationNumber: registrationNumberModel.value,
    inspectionDate: inspectionDateModel.value,
    insuranceDate: insuranceDateModel.value,
    modelYear: modelYearModel.value,
    mileageKm: mileageKmModel.value,
}));

const initialDraft = computed(() =>
    vehicleToFormDraft(props.mode, props.initialVehicle),
);

const isDirty = computed(
    () =>
        JSON.stringify(currentDraft.value) !==
        JSON.stringify(initialDraft.value),
);

function syncFromProps() {
    const draft = vehicleToFormDraft(props.mode, props.initialVehicle);

    nameModel.value = draft.name;
    registrationNumberModel.value = draft.registrationNumber;
    inspectionDateModel.value = draft.inspectionDate;
    insuranceDateModel.value = draft.insuranceDate;
    modelYearModel.value = draft.modelYear;
    mileageKmModel.value = draft.mileageKm;
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

watch(isDirty, (value) => emit('dirtyChange', value), { immediate: true });

watch(nameModel, (value) => {
    if (value.trim().length > 0) {
        showNameRequired.value = false;
    }
});

watch(registrationNumberModel, (value) => {
    if (value.trim().length > 0) {
        showRegistrationRequired.value = false;
    }

    emit('registrationNumberChange');
});

watch(modelYearModel, (value) => {
    if (parseOptionalVehicleModelYear(value).isValid) {
        showModelYearInvalid.value = false;
    }
});

watch(mileageKmModel, (value) => {
    if (parseOptionalVehicleMileageKm(value).isValid) {
        showMileageKmInvalid.value = false;
    }
});

watch(
    () => props.registrationNumberError,
    async (error) => {
        if (!error) return;

        await nextTick();
        formElement.value
            ?.querySelector<HTMLElement>('#vehicle-registration')
            ?.focus();
    },
);

async function handleSubmit() {
    registrationNumberModel.value = normalizeVehicleRegistrationNumber(
        registrationNumberModel.value,
    );

    const nameOk = nameModel.value.trim().length > 0;
    const regOk = registrationNumberModel.value.trim().length > 0;
    const modelYearResult = parseOptionalVehicleModelYear(modelYearModel.value);
    const mileageKmResult = parseOptionalVehicleMileageKm(mileageKmModel.value);

    showNameRequired.value = !nameOk;
    showRegistrationRequired.value = !regOk;
    showModelYearInvalid.value = !modelYearResult.isValid;
    showMileageKmInvalid.value = !mileageKmResult.isValid;

    if (
        !nameOk ||
        !regOk ||
        !modelYearResult.isValid ||
        !mileageKmResult.isValid
    ) {
        await nextTick();
        formElement.value
            ?.querySelector<HTMLElement>('[aria-invalid="true"]')
            ?.focus();

        return;
    }

    emit(
        'submit',
        buildVehicleWritePayload(
            {
                name: nameModel.value,
                registrationNumber: registrationNumberModel.value,
                inspectionDate: inspectionDateModel.value,
                insuranceDate: insuranceDateModel.value,
                modelYear: modelYearModel.value,
                mileageKm: mileageKmModel.value,
            },
            modelYearResult.value,
            mileageKmResult.value,
        ),
    );
}
</script>

<template>
    <form
        :id="props.formId"
        ref="formElement"
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
            :registration-number-error="props.registrationNumberError"
            :show-model-year-invalid="showModelYearInvalid"
            :show-mileage-km-invalid="showMileageKmInvalid"
            :model-year-min="VEHICLE_MODEL_YEAR_MIN"
            :model-year-max="VEHICLE_MODEL_YEAR_MAX"
            :mileage-km-max="VEHICLE_MILEAGE_KM_MAX"
        />

        <div v-if="slots.afterFields" class="space-y-4 pt-1">
            <slot name="afterFields" />
        </div>

        <UiButton
            v-if="!props.hideDefaultActions"
            type="submit"
            class="w-full sm:w-auto"
            :disabled="isSaving"
            :aria-busy="isSaving"
        >
            {{
                isSaving
                    ? (props.savingLabel ?? 'Zapisywanie…')
                    : (props.submitLabel ?? 'Zapisz')
            }}
        </UiButton>
    </form>
</template>
