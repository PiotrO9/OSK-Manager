<script setup lang="ts">
defineProps<{
    disabled: boolean;
}>();

const query = defineModel<string>('query', { required: true });

const fieldClass =
    'border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60';
</script>

<template>
    <div class="space-y-2">
        <label
            class="text-sm leading-none font-medium"
            for="event-student-picker-search"
        >
            Szukaj kursanta
        </label>
        <input
            id="event-student-picker-search"
            v-model="query"
            type="search"
            autocomplete="off"
            :disabled="disabled"
            :class="fieldClass"
            placeholder="Imię, nazwisko lub e-mail…"
            aria-label="Filtruj listę kursantów"
        />
    </div>
</template>
