<script setup lang="ts">
import { UserPlus } from 'lucide-vue-next';

defineEmits<{
    create: [];
}>();
</script>

<template>
    <PageHeader
        title="Kursanci"
        description="Dane kontaktowe, statusy i przypisania do kursów."
    >
        <template #actions>
            <UiButton
                type="button"
                class="h-11 w-full px-4 sm:h-10 sm:w-auto"
                aria-label="Otwórz formularz dodawania kursanta"
                @click="$emit('create')"
            >
                <UserPlus class="size-4" aria-hidden="true" />
                Dodaj kursanta
            </UiButton>
        </template>
    </PageHeader>
</template>
