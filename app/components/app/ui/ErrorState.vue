<script setup lang="ts">
import { AlertTriangle } from '@lucide/vue';

const props = withDefaults(
    defineProps<{
        title?: string;
        description?: string;
        centered?: boolean;
    }>(),
    {
        title: 'Nie udało się wczytać danych',
        description: '',
        centered: true,
    },
);

const emit = defineEmits<{
    retry: [];
}>();
</script>

<template>
    <div
        class="border-danger-200 bg-danger-50/60 text-danger-900 dark:border-danger-500/40 dark:bg-danger-500/10 dark:text-danger-300 flex rounded-lg border"
        :class="
            props.centered
                ? 'min-h-36 flex-col items-center justify-center px-6 py-6 text-center'
                : 'min-h-32 flex-col gap-4 px-5 py-4 sm:flex-row sm:items-start sm:justify-between'
        "
        role="alert"
    >
        <div
            class="flex min-w-0"
            :class="props.centered ? 'flex-col items-center gap-4' : 'gap-3'"
        >
            <div
                class="bg-background/70 flex shrink-0 items-center justify-center rounded-lg"
                :class="props.centered ? 'size-10' : 'size-9'"
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

        <div
            v-if="$slots.action"
            class="flex shrink-0 gap-2"
            :class="props.centered ? 'mt-4 flex-wrap justify-center' : ''"
        >
            <slot name="action" />
        </div>
        <UiButton
            v-else
            type="button"
            variant="outline"
            size="sm"
            class="bg-background"
            :class="props.centered ? 'mt-4' : ''"
            @click="emit('retry')"
        >
            Ponów
        </UiButton>
    </div>
</template>
