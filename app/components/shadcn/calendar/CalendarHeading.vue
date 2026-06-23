<script lang="ts" setup>
import type { CalendarHeadingProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { CalendarHeading, useForwardProps } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = withDefaults(
    defineProps<CalendarHeadingProps & { class?: HTMLAttributes['class'] }>(),
    {
        class: undefined,
    },
);

defineSlots<{
    default: (props: { headingValue: string }) => unknown;
}>();

const delegatedProps = reactiveOmit(props, 'class');

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
    <CalendarHeading
        #default="{ headingValue }"
        data-slot="calendar-heading"
        :class="cn('text-sm font-medium', props.class)"
        v-bind="forwardedProps"
    >
        <slot :heading-value>
            {{ headingValue }}
        </slot>
    </CalendarHeading>
</template>
