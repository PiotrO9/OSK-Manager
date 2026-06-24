<script setup lang="ts">
import { UserPlus } from 'lucide-vue-next';

defineEmits<{
    create: [];
}>();
</script>

<template>
    <PageHeader
        title="Kursanci"
        description="Lista kursantów, filtry OSK i szybkie przypisanie kursu."
    >
        <template #actions>
            <UiButton
                type="button"
                class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                aria-label="Otwórz formularz dodawania kursanta"
                @click="$emit('create')"
            >
                <UserPlus class="mr-2 size-4" aria-hidden="true" />
                Dodaj kursanta
            </UiButton>
        </template>
    </PageHeader>
</template>
