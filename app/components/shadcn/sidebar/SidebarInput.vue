<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';
import { Input } from '@/components/shadcn/input';

const props = defineProps<{
    class?: HTMLAttributes['class'];
}>();
</script>

<template>
    <Input
        control-size="sm"
        data-slot="sidebar-input"
        data-sidebar="input"
        :class="cn('bg-background w-full shadow-none', props.class)"
    >
        <slot />
    </Input>
</template>
