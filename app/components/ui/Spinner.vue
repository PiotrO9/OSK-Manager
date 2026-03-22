<script setup lang="ts">
export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'primary' | 'secondary' | 'white';

interface Props {
    ariaLabel?: string;
    size?: SpinnerSize;
    variant?: SpinnerVariant;
    fullScreen?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    ariaLabel: 'Loading...',
    size: 'md',
    variant: 'primary',
    fullScreen: false,
});

const spinnerClass = computed(() => {
    const base = 'flex items-center justify-center';

    if (props.fullScreen) {
        return `${base} fixed inset-0 z-50 bg-white/80 dark:bg-secondary-950/80 backdrop-blur-sm`;
    }

    return base;
});

const svgClass = computed(() => {
    const sizeClasses = {
        sm: 'size-4',
        md: 'size-6',
        lg: 'size-8',
        xl: 'size-12',
    };

    const variantClasses = {
        primary: 'text-primary-500 dark:text-primary-400',
        secondary: 'text-secondary-600 dark:text-secondary-400',
        white: 'text-white',
    };

    return `animate-spin ${sizeClasses[props.size]} ${variantClasses[props.variant]}`;
});
</script>

<template>
    <div
        :aria-label="ariaLabel"
        :class="spinnerClass"
        role="status"
        aria-live="polite"
    >
        <span class="sr-only">{{ ariaLabel }}</span>
        <svg
            :class="svgClass"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
            />
            <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    </div>
</template>
