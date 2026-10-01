<script setup lang="ts">
import { CalendarCheck, CircleAlert } from 'lucide-vue-next';

defineProps<{
    message: string;
    tone: 'success' | 'error';
}>();
</script>

<template>
    <div
        class="border-border flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
        :class="
            tone === 'success'
                ? 'bg-muted/30'
                : 'border-destructive/30 bg-destructive/5'
        "
        role="status"
        :aria-live="tone === 'error' ? 'assertive' : 'polite'"
    >
        <div class="flex min-w-0 items-start gap-3">
            <span
                class="flex size-9 shrink-0 items-center justify-center rounded-md"
                :class="
                    tone === 'success'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-destructive/10 text-destructive'
                "
                aria-hidden="true"
            >
                <CalendarCheck v-if="tone === 'success'" class="size-4" />
                <CircleAlert v-else class="size-4" />
            </span>
            <p class="text-foreground text-sm font-medium">{{ message }}</p>
        </div>
        <UiButton
            v-if="tone === 'success'"
            as-child
            size="sm"
            variant="outline"
            class="shrink-0"
        >
            <NuxtLink to="/my-lessons">Moje lekcje</NuxtLink>
        </UiButton>
    </div>
</template>
