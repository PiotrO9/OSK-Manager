<script setup lang="ts">
interface Props {
    ariaLabel?: string;
    width?: string;
    height?: string;
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
    variant?: 'default' | 'pulse' | 'wave';
}

const props = withDefaults(defineProps<Props>(), {
    ariaLabel: 'Loading...',
    width: '100%',
    height: '1rem',
    rounded: 'md',
    variant: 'pulse',
});

const skeletonClass = computed(() => {
    const base = 'bg-secondary-200 dark:bg-secondary-800';

    const roundedClasses = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
    };

    const variantClasses = {
        default: '',
        pulse: 'animate-pulse',
        wave: 'animate-pulse bg-gradient-to-r from-secondary-200 via-secondary-300 to-secondary-200 dark:from-secondary-800 dark:via-secondary-700 dark:to-secondary-800 bg-[length:200%_100%] animate-[wave_2s_ease-in-out_infinite]',
    };

    return `${base} ${roundedClasses[props.rounded]} ${variantClasses[props.variant]}`;
});

const skeletonStyle = computed(() => {
    return {
        width: props.width,
        height: props.height,
    };
});
</script>

<template>
    <div
        :aria-label="ariaLabel"
        :class="skeletonClass"
        :style="skeletonStyle"
        role="status"
        aria-live="polite"
    >
        <span class="sr-only">{{ ariaLabel }}</span>
    </div>
</template>

<style scoped>
@keyframes wave {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}
</style>
