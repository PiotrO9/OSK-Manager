<script setup lang="ts">
export type EventsViewMode = 'grid' | 'list';

defineProps<{
    disabled?: boolean;
}>();

const model = defineModel<EventsViewMode>({ required: true });
</script>

<template>
    <div
        v-if="!disabled"
        class="border-border bg-muted/30 flex rounded-xl border p-1"
        role="group"
        aria-label="Tryb widoku wydarzeń"
    >
        <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
            :class="
                model === 'grid'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
            "
            :aria-pressed="model === 'grid'"
            @click="model = 'grid'"
        >
            Harmonogram
        </button>
        <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
            :class="
                model === 'list'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
            "
            :aria-pressed="model === 'list'"
            @click="model = 'list'"
        >
            Lista
        </button>
    </div>
</template>
