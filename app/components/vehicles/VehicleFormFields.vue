<script setup lang="ts">
defineProps<{
    isSaving: boolean;
    showNameRequired: boolean;
    showRegistrationRequired: boolean;
    showModelYearInvalid: boolean;
    showMileageKmInvalid: boolean;
    modelYearMin: number;
    modelYearMax: number;
    mileageKmMax: number;
}>();

const nameModel = defineModel<string>('name', { required: true });
const registrationNumberModel = defineModel<string>('registrationNumber', {
    required: true,
});
const inspectionDateModel = defineModel<string>('inspectionDate', {
    required: true,
});
const insuranceDateModel = defineModel<string>('insuranceDate', {
    required: true,
});
const modelYearModel = defineModel<string>('modelYear', { required: true });
const mileageKmModel = defineModel<string>('mileageKm', { required: true });

function formatPlInt(n: number): string {
    return new Intl.NumberFormat('pl-PL').format(n);
}
</script>

<template>
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
            <UiLabel for="vehicle-model-year">Rocznik (opcjonalnie)</UiLabel>
            <UiInput
                id="vehicle-model-year"
                v-model="modelYearModel"
                type="number"
                name="modelYear"
                inputmode="numeric"
                autocomplete="off"
                :min="modelYearMin"
                :max="modelYearMax"
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
                Podaj rocznik z zakresu {{ modelYearMin }}-{{ modelYearMax }}
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
                :max="mileageKmMax"
                step="1"
                :aria-invalid="showMileageKmInvalid"
                :aria-describedby="
                    showMileageKmInvalid ? 'vehicle-mileage-error' : undefined
                "
                :disabled="isSaving"
            />
            <p
                v-if="showMileageKmInvalid"
                id="vehicle-mileage-error"
                class="text-destructive text-sm"
                role="alert"
            >
                Podaj przebieg od 0 do {{ formatPlInt(mileageKmMax) }} km lub
                zostaw puste.
            </p>
        </div>
    </div>
</template>
