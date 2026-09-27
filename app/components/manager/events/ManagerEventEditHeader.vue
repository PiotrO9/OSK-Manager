<script setup lang="ts">
import { Plus } from 'lucide-vue-next';

defineProps<{
    canSave: boolean;
    isAvailabilityBlocking: boolean;
    isSaving: boolean;
    isDeleteLoading: boolean;
}>();
</script>

<template>
    <PageHeader
        title="Edytuj wydarzenie"
        description="Zmień termin, instruktora, kursantów i status wydarzenia."
    >
        <template #actions>
            <UiButton
                type="submit"
                form="event-edit-form"
                class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                :disabled="
                    !canSave ||
                    isAvailabilityBlocking ||
                    isSaving ||
                    isDeleteLoading
                "
            >
                <Plus class="mr-2 size-4" aria-hidden="true" />
                {{ isSaving ? 'Zapisywanie...' : 'Zapisz zmiany' }}
            </UiButton>
        </template>
    </PageHeader>
</template>
