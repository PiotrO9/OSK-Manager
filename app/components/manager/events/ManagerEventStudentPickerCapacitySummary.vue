<script setup lang="ts">
defineProps<{
    badgeVariant: 'default' | 'secondary' | 'destructive';
    badgeLabel: string;
    capacityNumber: number | null;
    remainingSlots: number | null;
}>();
</script>

<template>
    <div class="flex flex-wrap items-center gap-2" role="status">
        <UiBadge :variant="badgeVariant">
            {{ badgeLabel }}
        </UiBadge>
        <span
            v-if="remainingSlots !== null && remainingSlots > 0"
            class="text-muted-foreground text-xs"
        >
            Pozostało miejsc: {{ remainingSlots }}
        </span>
    </div>

    <p
        v-if="capacityNumber === 0"
        class="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
        role="alert"
    >
        Limit miejsc wynosi 0 — nie można wybrać kursantów.
    </p>
</template>
