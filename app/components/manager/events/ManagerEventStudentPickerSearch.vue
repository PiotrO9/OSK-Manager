<script setup lang="ts">
defineProps<{
    disabled: boolean;
}>();

const query = defineModel<string>('query', { required: true });
</script>

<template>
    <div class="space-y-2">
        <label
            class="text-sm leading-none font-medium"
            for="event-student-picker-search"
        >
            Szukaj kursanta
        </label>
        <UiInput
            id="event-student-picker-search"
            v-model="query"
            type="search"
            autocomplete="off"
            :disabled="disabled"
            placeholder="Imię, nazwisko lub e-mail…"
            aria-label="Filtruj listę kursantów"
        />
    </div>
</template>
