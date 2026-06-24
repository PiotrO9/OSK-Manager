<script setup lang="ts">
import { CalendarDays, Save } from 'lucide-vue-next';
import type { HeaderMetaItem } from '~/components/app/ui/types';

defineProps<{
    meta: HeaderMetaItem[];
    lessonDateLabel: string;
    formId: string;
    canSave: boolean;
    isSaving: boolean;
}>();
</script>

<template>
    <PageHeader
        title="Edytuj jazde"
        description="Zmien instruktora, pojazd i termin lekcji bez naruszania przypisanego kursanta."
        eyebrow="Edycja lekcji"
        :meta="meta"
    >
        <template #actions>
            <UiButton
                variant="outline"
                type="button"
                class="bg-background h-10 rounded-xl px-4 font-semibold shadow-sm"
                disabled
                aria-label="Termin lekcji"
            >
                <CalendarDays class="size-4" aria-hidden="true" />
                {{ lessonDateLabel }}
            </UiButton>
            <UiButton
                type="submit"
                :form="formId"
                class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                :disabled="!canSave || isSaving"
            >
                <Save class="size-4" aria-hidden="true" />
                {{ isSaving ? 'Zapisywanie...' : 'Zapisz zmiany' }}
            </UiButton>
        </template>
    </PageHeader>
</template>
