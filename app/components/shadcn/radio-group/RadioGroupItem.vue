<script setup lang="ts">
import type { RadioGroupItemProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { CircleIcon } from 'lucide-vue-next';
import { RadioGroupIndicator, RadioGroupItem, useForwardProps } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<
    RadioGroupItemProps & { class?: HTMLAttributes['class'] }
>();

const delegatedProps = reactiveOmit(props, 'class');

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
    <RadioGroupItem
        data-slot="radio-group-item"
        v-bind="forwardedProps"
        :class="
            cn(
                'osk-radio-item border-input text-primary focus-visible:border-primary focus-visible:ring-primary/25 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
                props.class,
            )
        "
    >
        <RadioGroupIndicator
            force-mount
            data-slot="radio-group-indicator"
            aria-hidden="true"
            class="osk-radio-indicator pointer-events-none relative flex items-center justify-center"
        >
            <slot>
                <CircleIcon
                    class="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2"
                />
            </slot>
        </RadioGroupIndicator>
    </RadioGroupItem>
</template>

<style>
/* Reka renders a fragment; prefixed classes also reach its unscoped button. */
.osk-radio-item {
    transition:
        color 150ms ease,
        border-color 150ms ease,
        box-shadow 150ms ease,
        transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

@media (hover: hover) {
    .osk-radio-item:not([data-disabled]):hover {
        transform: scale(1.05);
    }
}

.osk-radio-item:not([data-disabled]):active {
    transform: scale(0.95);
}

/* Keep the indicator mounted so deselection can animate as well. */
.osk-radio-indicator {
    opacity: 0;
    transform: scale(0);
    transition:
        transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
        opacity 150ms ease;
}

.osk-radio-indicator[data-state='checked'] {
    opacity: 1;
    transform: scale(1);
}

@media (prefers-reduced-motion: reduce) {
    .osk-radio-item,
    .osk-radio-indicator {
        transition: none;
    }

    .osk-radio-item:not([data-disabled]):hover,
    .osk-radio-item:not([data-disabled]):active {
        transform: none;
    }
}
</style>
