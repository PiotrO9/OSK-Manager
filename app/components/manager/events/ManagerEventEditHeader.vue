<script setup lang="ts">
import { CalendarDays, Plus } from 'lucide-vue-next';

defineProps<{
    dateRangeLabel: string;
    canSave: boolean;
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
                type="button"
                variant="outline"
                class="bg-background h-10 rounded-xl px-4 font-semibold shadow-sm"
                aria-label="Aktualny termin wydarzenia"
            >
                <CalendarDays class="mr-2 size-4" aria-hidden="true" />
                {{ dateRangeLabel }}
            </UiButton>
            <UiButton
                type="submit"
                form="event-edit-form"
                class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                :disabled="!canSave || isSaving || isDeleteLoading"
            >
                <Plus class="mr-2 size-4" aria-hidden="true" />
                {{ isSaving ? 'Zapisywanie...' : 'Zapisz zmiany' }}
            </UiButton>
        </template>
    </PageHeader>
</template>
