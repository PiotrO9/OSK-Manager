<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';

defineProps<{
    formId: string;
    canSave: boolean;
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
            :disabled="!canSave || isSaving"
            :aria-busy="isSaving"
        >
            {{ isSaving ? 'Zapisywanie...' : 'Zapisz' }}
        </UiButton>
    </ActionGroup>
</template>
