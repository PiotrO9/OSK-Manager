<script setup lang="ts">
import UiDatePicker from '~/components/shadcn/date-picker/DatePicker.vue';
import { normalizeVehicleRegistrationNumber } from '~/utils/vehicles/vehicleForm';

defineProps<{
    isSaving: boolean;
    showNameRequired: boolean;
    showRegistrationRequired: boolean;
    registrationNumberError?: string | null;
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

function normalizeRegistrationNumber(): void {
    registrationNumberModel.value = normalizeVehicleRegistrationNumber(
        registrationNumberModel.value,
    );
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
                maxlength="100"
                placeholder="np. Hyundai i20"
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
                maxlength="20"
                placeholder="np. DW 00001"
                spellcheck="false"
                :aria-invalid="
                    showRegistrationRequired || Boolean(registrationNumberError)
                "
                :aria-describedby="
                    showRegistrationRequired
                        ? 'vehicle-registration-error'
                        : registrationNumberError
                          ? 'vehicle-registration-api-error'
                          : undefined
                "
                :disabled="isSaving"
                @blur="normalizeRegistrationNumber"
            />
            <p
                v-if="showRegistrationRequired"
                id="vehicle-registration-error"
                class="text-destructive text-sm"
                role="alert"
            >
                Numer rejestracyjny jest wymagany.
            </p>
            <p
                v-else-if="registrationNumberError"
                id="vehicle-registration-api-error"
                class="text-destructive text-sm"
                role="alert"
            >
                {{ registrationNumberError }}
            </p>
        </div>

        <div class="space-y-2">
            <UiLabel for="vehicle-inspection">
                Badanie techniczne ważne do
            </UiLabel>
            <UiDatePicker
                id="vehicle-inspection"
                v-model="inspectionDateModel"
                :disabled="isSaving"
                placeholder="Wybierz datę…"
                clearable
            />
        </div>

        <div class="space-y-2">
            <UiLabel for="vehicle-insurance">
                Ubezpieczenie OC ważne do
            </UiLabel>
            <UiDatePicker
                id="vehicle-insurance"
                v-model="insuranceDateModel"
                :disabled="isSaving"
                placeholder="Wybierz datę…"
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
