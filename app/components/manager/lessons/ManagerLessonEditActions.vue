<script setup lang="ts">
import { ArrowLeft, LoaderCircle } from 'lucide-vue-next';

defineProps<{
    formId: string;
    canSave: boolean;
    isAvailabilityBlocking: boolean;
    isCheckingAvailability: boolean;
    isSaving: boolean;
}>();

defineEmits<{
    cancel: [];
}>();
</script>

<template>
    <ActionGroup label="Akcje formularza" align="end">
        <UiButton type="button" variant="outline" @click="$emit('cancel')">
            <ArrowLeft class="size-4" aria-hidden="true" />
            Anuluj
        </UiButton>
        <UiButton
            type="submit"
            :form="formId"
            :disabled="!canSave || isAvailabilityBlocking || isSaving"
            :aria-busy="isCheckingAvailability || isSaving"
        >
            <LoaderCircle
                v-if="isCheckingAvailability || isSaving"
                class="size-4 animate-spin"
                aria-hidden="true"
            />
            {{
                isCheckingAvailability
                    ? 'Sprawdzanie terminu...'
                    : isSaving
                      ? 'Zapisywanie...'
                      : 'Zapisz'
            }}
        </UiButton>
    </ActionGroup>
</template>
