<script setup lang="ts">
import type { CheckboxRootEmits, CheckboxRootProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<
    CheckboxRootProps & { class?: HTMLAttributes['class'] }
>();
const emits = defineEmits<CheckboxRootEmits>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
    <CheckboxRoot
        #default="slotProps"
        data-slot="checkbox"
        v-bind="forwarded"
        :class="
            cn(
                'osk-checkbox peer border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground data-[state=indeterminate]:border-primary focus-visible:border-primary focus-visible:ring-primary/25 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
                props.class,
            )
        "
    >
        <CheckboxIndicator
            force-mount
            data-slot="checkbox-indicator"
            aria-hidden="true"
            class="osk-checkbox-indicator grid place-content-center text-current"
        >
            <slot v-bind="slotProps">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="size-3.5"
                >
                    <path
                        class="osk-checkbox-check"
                        d="m4 12 5 5 11-11"
                        pathLength="1"
                    />
                    <path
                        class="osk-checkbox-mixed"
                        d="M5 12h14"
                        pathLength="1"
                    />
                </svg>
            </slot>
        </CheckboxIndicator>
    </CheckboxRoot>
</template>

<style>
/* Reka renders a fragment; prefixed classes also reach its unscoped button. */
.osk-checkbox {
    transition:
        background-color 500ms ease,
        border-color 500ms ease,
        color 500ms ease,
        box-shadow 150ms ease,
        transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.osk-checkbox:not([data-disabled]):active {
    transform: scale(0.9);
}

/* Keep both paths mounted so interrupted transitions can reverse smoothly. */
.osk-checkbox-indicator {
    opacity: 0;
    transition: opacity 180ms ease;
}

.osk-checkbox-indicator:is(
    [data-state='checked'],
    [data-state='indeterminate']
) {
    opacity: 1;
}

.osk-checkbox-check,
.osk-checkbox-mixed {
    opacity: 0;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    transition:
        stroke-dashoffset 180ms ease-in,
        opacity 180ms ease;
}

.osk-checkbox-indicator[data-state='checked'] .osk-checkbox-check,
.osk-checkbox-indicator[data-state='indeterminate'] .osk-checkbox-mixed {
    opacity: 1;
    stroke-dashoffset: 0;
    transition:
        stroke-dashoffset 300ms cubic-bezier(0.22, 1, 0.36, 1) 60ms,
        opacity 150ms ease 60ms;
}

@media (prefers-reduced-motion: reduce) {
    .osk-checkbox,
    .osk-checkbox-indicator,
    .osk-checkbox-indicator[data-state] .osk-checkbox-check,
    .osk-checkbox-indicator[data-state] .osk-checkbox-mixed {
        transition: none;
    }

    .osk-checkbox:not([data-disabled]):active {
        transform: none;
    }
}
</style>
