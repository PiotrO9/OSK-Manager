<script setup lang="ts">
import { ArrowLeft, LoaderCircle } from 'lucide-vue-next';

defineProps<{
    formId: string;
    canSave: boolean;
    isAvailabilityBlocking: boolean;
    isCheckingAvailability: boolean;
    isSaving: boolean;
    canCancelLesson: boolean;
    isCancellingLesson: boolean;
}>();

defineEmits<{
    back: [];
    requestCancelLesson: [];
}>();
</script>

<template>
    <ActionGroup label="Akcje formularza" align="end">
        <UiButton type="button" variant="outline" @click="$emit('back')">
            <ArrowLeft class="size-4" aria-hidden="true" />
            Wróć
        </UiButton>
        <UiButton
            v-if="canCancelLesson"
            type="button"
            variant="destructive"
            :disabled="isSaving || isCancellingLesson"
            @click="$emit('requestCancelLesson')"
        >
            Anuluj rezerwację
        </UiButton>
        <UiButton
            type="submit"
            :form="formId"
            :disabled="
                !canSave ||
                isAvailabilityBlocking ||
                isSaving ||
                isCancellingLesson
            "
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
