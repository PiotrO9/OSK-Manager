<script setup lang="ts">
import type { Vehicle, VehicleWritePayload } from '~/types/vehicle';

const props = defineProps<{
    mode: 'create' | 'edit';
    initialVehicle: Vehicle | null;
    isSaving: boolean;
    apiError: string | null;
}>();

const emit = defineEmits<{
    submit: [payload: VehicleWritePayload];
}>();

const nameModel = ref('');
const registrationNumberModel = ref('');
const inspectionDateModel = ref('');
const insuranceDateModel = ref('');
const showNameRequired = ref(false);
const showRegistrationRequired = ref(false);

function syncFromProps() {
    if (props.mode === 'edit' && props.initialVehicle) {
        const v = props.initialVehicle;

        nameModel.value = v.name;
        registrationNumberModel.value = v.registrationNumber;
        inspectionDateModel.value = v.inspectionDate ?? '';
        insuranceDateModel.value = v.insuranceDate ?? '';

        return;
    }

    nameModel.value = '';
    registrationNumberModel.value = '';
    inspectionDateModel.value = '';
    insuranceDateModel.value = '';
}

watch(
    () => [props.mode, props.initialVehicle] as const,
    () => {
        showNameRequired.value = false;
        showRegistrationRequired.value = false;
        syncFromProps();
    },
    { immediate: true },
);

function dateInputToPayload(value: string): string | null {
    const t = value.trim();

    return t.length > 0 ? t : null;
}

function handleSubmit() {
    const nameOk = nameModel.value.trim().length > 0;
    const regOk = registrationNumberModel.value.trim().length > 0;

    showNameRequired.value = !nameOk;
    showRegistrationRequired.value = !regOk;

    if (!nameOk || !regOk) return;

    emit('submit', {
        name: nameModel.value.trim(),
        registrationNumber: registrationNumberModel.value.trim(),
        inspectionDate: dateInputToPayload(inspectionDateModel.value),
        insuranceDate: dateInputToPayload(insuranceDateModel.value),
    });
}
</script>

<template>
    <form class="space-y-5" novalidate @submit.prevent="handleSubmit">
        <p
            v-if="apiError"
            class="text-destructive text-sm"
            role="alert"
            aria-live="polite"
        >
            {{ apiError }}
        </p>

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
            <UiLabel for="vehicle-registration">Numer rejestracyjny</UiLabel>
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
            <UiLabel for="vehicle-inspection">Data przeglądu</UiLabel>
            <UiInput
                id="vehicle-inspection"
                v-model="inspectionDateModel"
                type="date"
                name="inspectionDate"
                :disabled="isSaving"
            />
        </div>

        <div class="space-y-2">
            <UiLabel for="vehicle-insurance">Data ubezpieczenia</UiLabel>
            <UiInput
                id="vehicle-insurance"
                v-model="insuranceDateModel"
                type="date"
                name="insuranceDate"
                :disabled="isSaving"
            />
        </div>

        <UiButton type="submit" class="w-full sm:w-auto" :disabled="isSaving">
            {{ isSaving ? 'Zapisywanie…' : 'Zapisz' }}
        </UiButton>
    </form>
</template>
