<script setup lang="ts">
import type { SelectItemProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { Check } from 'lucide-vue-next';
import {
    SelectItem,
    SelectItemIndicator,
    SelectItemText,
    useForwardProps,
} from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<
    SelectItemProps & { class?: HTMLAttributes['class'] }
>();

const delegatedProps = reactiveOmit(props, 'class');

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
    <SelectItem
        data-slot="select-item"
        v-bind="forwardedProps"
        :class="
            cn(
                'focus:bg-primary-50 focus:text-foreground data-[state=checked]:bg-primary-50 data-[state=checked]:text-primary dark:focus:bg-accent dark:focus:text-accent-foreground dark:data-[state=checked]:bg-accent dark:data-[state=checked]:text-foreground relative flex w-full cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2',
                props.class,
            )
        "
    >
        <span
            class="text-primary absolute right-2 flex size-3.5 items-center justify-center"
        >
            <SelectItemIndicator>
                <slot name="indicator-icon">
                    <Check class="size-4" />
                </slot>
            </SelectItemIndicator>
        </span>

        <SelectItemText>
            <slot />
        </SelectItemText>
    </SelectItem>
</template>
