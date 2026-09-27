<script setup lang="ts">
import { LoaderCircle, Save } from 'lucide-vue-next';

defineProps<{
    formId: string;
    canSave: boolean;
    isAvailabilityBlocking: boolean;
    isCheckingAvailability: boolean;
    isSaving: boolean;
}>();
</script>

<template>
    <PageHeader
        title="Edytuj jazde"
        description="Zmien instruktora, pojazd i termin lekcji bez naruszania przypisanego kursanta."
        eyebrow="Edycja lekcji"
    >
        <template #actions>
            <UiButton
                type="submit"
                :form="formId"
                class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                :disabled="!canSave || isAvailabilityBlocking || isSaving"
            >
                <LoaderCircle
                    v-if="isCheckingAvailability || isSaving"
                    class="size-4 animate-spin"
                    aria-hidden="true"
                />
                <Save v-else class="size-4" aria-hidden="true" />
                {{
                    isCheckingAvailability
                        ? 'Sprawdzanie terminu...'
                        : isSaving
                          ? 'Zapisywanie...'
                          : 'Zapisz zmiany'
                }}
            </UiButton>
        </template>
    </PageHeader>
</template>
