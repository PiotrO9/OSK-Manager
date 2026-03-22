<script setup lang="ts">
export type BadgeVariant =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info';

export type BadgeSize = 'sm' | 'md' | 'lg';

interface Props {
    ariaLabel?: string;
    variant?: BadgeVariant;
    size?: BadgeSize;
}

const props = withDefaults(defineProps<Props>(), {
    ariaLabel: 'Znacznik',
    variant: 'primary',
    size: 'md',
});

const badgeClass = computed(() => {
    const base =
        'inline-flex items-center font-semibold rounded-full transition-colors';

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    const variantClasses = {
        primary:
            'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
        secondary:
            'bg-secondary-100 text-secondary-800 dark:bg-secondary-800 dark:text-secondary-200',
        success:
            'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300',
        warning:
            'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300',
        danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-300',
        info: 'bg-info-100 text-info-800 dark:bg-info-900/30 dark:text-info-300',
    };

    return `${base} ${sizeClasses[props.size]} ${variantClasses[props.variant]}`;
});
</script>

<template>
    <span :aria-label="ariaLabel" :class="badgeClass" role="status">
        <slot />
    </span>
</template>
