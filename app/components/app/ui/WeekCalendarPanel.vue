<script setup lang="ts">
import { CalendarDays } from 'lucide-vue-next';

const props = withDefaults(
    defineProps<{
        title: string;
        description: string;
        headingId: string;
        embedded?: boolean;
        hideHeader?: boolean;
    }>(),
    {
        embedded: false,
        hideHeader: false,
    },
);
</script>

<template>
    <UiCard
        :class="
            props.embedded
                ? 'overflow-hidden rounded-none border-0 shadow-none'
                : 'gap-0 overflow-hidden rounded-xl py-0 shadow-xs'
        "
        :aria-labelledby="props.hideHeader ? undefined : props.headingId"
    >
        <slot v-if="!props.hideHeader" name="header">
            <div
                class="border-border flex flex-col gap-4 border-b p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between"
            >
                <div class="flex min-w-0 gap-3">
                    <div
                        class="bg-primary-50 text-primary-600 flex size-10 shrink-0 items-center justify-center rounded-xl"
                        aria-hidden="true"
                    >
                        <CalendarDays class="size-5" />
                    </div>
                    <div class="min-w-0">
                        <h2
                            :id="props.headingId"
                            class="text-foreground text-lg font-semibold"
                        >
                            {{ props.title }}
                        </h2>
                        <p
                            class="text-muted-foreground mt-1 text-sm leading-relaxed"
                        >
                            {{ props.description }}
                        </p>
                    </div>
                </div>
                <slot name="actions" />
            </div>
        </slot>

        <UiCardContent :class="props.embedded ? 'p-0' : 'space-y-3 p-2 sm:p-3'">
            <slot />
        </UiCardContent>
    </UiCard>
</template>
