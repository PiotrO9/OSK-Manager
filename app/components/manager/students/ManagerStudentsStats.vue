<script setup lang="ts">
withDefaults(
    defineProps<{
        totalStudentsCount: number;
        isUnavailable?: boolean;
    }>(),
    { isUnavailable: false },
);
</script>

<template>
    <div
        class="border-border bg-muted/20 border-b px-4 py-3 sm:px-5"
        aria-label="Podsumowanie listy kursantów"
    >
        <dl class="flex items-baseline gap-2 text-sm">
            <dt class="text-muted-foreground">Wyniki</dt>
            <dd class="text-foreground font-bold tabular-nums">
                {{ isUnavailable ? '—' : totalStudentsCount }}
            </dd>
        </dl>
    </div>
</template>
