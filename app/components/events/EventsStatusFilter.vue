<script setup lang="ts">
defineProps<{
    options: readonly string[];
    selected: string;
    labelForOption: (option: string) => string;
}>();

defineEmits<{
    select: [option: string];
}>();
</script>

<template>
    <div
        class="flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Filtruj po statusie"
    >
        <span class="text-muted-foreground text-sm font-medium">Status</span>
        <button
            v-for="opt in options"
            :key="opt"
            type="button"
            class="focus-visible:ring-ring rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
            :class="
                selected === opt
                    ? 'border-sky-200 bg-sky-50 text-sky-700'
                    : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground'
            "
            :aria-pressed="selected === opt"
            @click="$emit('select', opt)"
        >
            {{ labelForOption(opt) }}
        </button>
    </div>
</template>
