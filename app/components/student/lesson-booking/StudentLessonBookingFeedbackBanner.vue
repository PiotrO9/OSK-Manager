<script setup lang="ts">
import { CalendarCheck, CircleAlert } from 'lucide-vue-next';

defineProps<{
    message: string;
    tone: 'success' | 'error';
}>();
</script>

<template>
    <div
        class="border-border grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_auto_1fr]"
        :class="
            tone === 'success'
                ? 'bg-muted/30'
                : 'border-destructive/30 bg-destructive/5'
        "
        role="status"
        :aria-live="tone === 'error' ? 'assertive' : 'polite'"
    >
        <span
            class="flex size-9 shrink-0 items-center justify-center rounded-md sm:justify-self-start"
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
        <p class="text-foreground min-w-0 text-sm font-medium sm:text-center">
            {{ message }}
        </p>
        <UiButton
            v-if="tone === 'success'"
            as-child
            size="sm"
            variant="outline"
            class="col-span-2 w-full shrink-0 sm:col-span-1 sm:col-start-3 sm:row-start-1 sm:w-auto sm:justify-self-end"
        >
            <NuxtLink to="/my-lessons">Moje lekcje</NuxtLink>
        </UiButton>
    </div>
</template>
