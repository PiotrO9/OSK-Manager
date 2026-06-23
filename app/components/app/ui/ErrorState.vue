<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next';

const props = withDefaults(
    defineProps<{
        title?: string;
        description?: string;
    }>(),
    {
        title: 'Nie udało się wczytać danych',
        description: '',
    },
);

const emit = defineEmits<{
    retry: [];
}>();
</script>

<template>
    <div
        class="border-danger-200 bg-danger-50/60 text-danger-900 flex min-h-32 flex-col gap-4 rounded-xl border px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
        role="alert"
    >
        <div class="flex min-w-0 gap-3">
            <div
                class="bg-background/70 flex size-9 shrink-0 items-center justify-center rounded-xl"
                aria-hidden="true"
            >
                <AlertTriangle class="size-5" />
            </div>
            <div class="min-w-0 space-y-1">
                <p class="font-semibold">
                    {{ props.title }}
                </p>
                <p v-if="props.description" class="text-sm leading-relaxed">
                    {{ props.description }}
                </p>
            </div>
        </div>

        <div v-if="$slots.action" class="flex shrink-0 gap-2">
            <slot name="action" />
        </div>
        <UiButton
            v-else
            type="button"
            variant="outline"
            size="sm"
            class="bg-background"
            @click="emit('retry')"
        >
            Ponów
        </UiButton>
    </div>
</template>
